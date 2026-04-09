package com.bibilioteca.biblioteca.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bibilioteca.biblioteca.dto.UsuarioRemocaoRequestDto;
import com.bibilioteca.biblioteca.dto.UsuarioRequestDto;
import com.bibilioteca.biblioteca.dto.UsuarioResponseDto;
import com.bibilioteca.biblioteca.model.Usuario;
import com.bibilioteca.biblioteca.repository.EmprestimoRepository;
import com.bibilioteca.biblioteca.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EmprestimoRepository emprestimoRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, EmprestimoRepository emprestimoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    public List<UsuarioResponseDto> listar() {
        return usuarioRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UsuarioResponseDto buscarPorId(Long id) {
        return toResponse(obterUsuario(id));
    }

    public UsuarioResponseDto criar(UsuarioRequestDto request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email ja cadastrado.");
        }

        if (usuarioRepository.existsByDocumento(request.getDocumento())) {
            throw new BusinessException("Documento ja cadastrado.");
        }

        Usuario usuario = new Usuario();
        aplicarCampos(usuario, request);

        return toResponse(usuarioRepository.save(usuario));
    }

    public UsuarioResponseDto atualizar(Long id, UsuarioRequestDto request) {
        Usuario usuario = obterUsuario(id);

        if (!usuario.getEmail().equals(request.getEmail()) && usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email ja cadastrado.");
        }

        if (!usuario.getDocumento().equals(request.getDocumento())
                && usuarioRepository.existsByDocumento(request.getDocumento())) {
            throw new BusinessException("Documento ja cadastrado.");
        }

        aplicarCampos(usuario, request);
        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public void remover(Long id) {
        Usuario usuario = obterUsuario(id);

        if (emprestimoRepository.existsByUsuario_Id(id)) {
            throw new BusinessException("Nao e possivel excluir usuario com emprestimos vinculados.");
        }

        usuarioRepository.delete(usuario);
    }

    @Transactional
    public void removerEmLote(List<UsuarioRemocaoRequestDto> request) {
        if (request == null || request.isEmpty()) {
            throw new BusinessException("Informe ao menos um usuario para exclusao em lote.");
        }

        for (UsuarioRemocaoRequestDto item : request) {
            if (item == null || item.getUsuarioId() == null) {
                throw new BusinessException("Usuario invalido na remocao em lote.");
            }
            if (emprestimoRepository.existsByUsuario_Id(item.getUsuarioId())) {
                throw new BusinessException("Nao e possivel excluir usuario com emprestimos vinculados.");
            }
        }

        for (UsuarioRemocaoRequestDto item : request) {
            usuarioRepository.delete(obterUsuario(item.getUsuarioId()));
        }
    }

    public Usuario obterUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado."));
    }

    private void aplicarCampos(Usuario usuario, UsuarioRequestDto request) {
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setDocumento(request.getDocumento());
        usuario.setTelefone(request.getTelefone());
    }

    private UsuarioResponseDto toResponse(Usuario usuario) {
        UsuarioResponseDto dto = new UsuarioResponseDto();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setDocumento(usuario.getDocumento());
        dto.setTelefone(usuario.getTelefone());
        dto.setDataCadastro(usuario.getDataCadastro());
        return dto;
    }
}
