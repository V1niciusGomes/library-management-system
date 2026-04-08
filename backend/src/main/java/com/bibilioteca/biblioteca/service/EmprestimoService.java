package com.bibilioteca.biblioteca.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bibilioteca.biblioteca.dto.EmprestimoRequestDto;
import com.bibilioteca.biblioteca.dto.EmprestimoResponseDto;
import com.bibilioteca.biblioteca.model.Emprestimo;
import com.bibilioteca.biblioteca.model.EmprestimoStatus;
import com.bibilioteca.biblioteca.model.Livro;
import com.bibilioteca.biblioteca.model.Usuario;
import com.bibilioteca.biblioteca.repository.EmprestimoRepository;
import com.bibilioteca.biblioteca.repository.LivroRepository;

@Service
public class EmprestimoService {

    private static final int DIAS_PADRAO_EMPRESTIMO = 7;

    private final EmprestimoRepository emprestimoRepository;
    private final LivroService livroService;
    private final UsuarioService usuarioService;
    private final LivroRepository livroRepository;

    public EmprestimoService(
            EmprestimoRepository emprestimoRepository,
            LivroService livroService,
            UsuarioService usuarioService,
            LivroRepository livroRepository
    ) {
        this.emprestimoRepository = emprestimoRepository;
        this.livroService = livroService;
        this.usuarioService = usuarioService;
        this.livroRepository = livroRepository;
    }

    public List<EmprestimoResponseDto> listarTodos() {
        return emprestimoRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<EmprestimoResponseDto> listarAtivos() {
        return emprestimoRepository.findByStatus(EmprestimoStatus.ATIVO).stream().map(this::toResponse).toList();
    }

    @Transactional
    public EmprestimoResponseDto emprestar(EmprestimoRequestDto request) {
        Livro livro = livroService.obterLivro(request.getLivroId());
        Usuario usuario = usuarioService.obterUsuario(request.getUsuarioId());

        if (livro.getQuantidadeDisponivel() <= 0) {
            throw new BusinessException("Livro indisponivel para emprestimo.");
        }

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setLivro(livro);
        emprestimo.setUsuario(usuario);
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataPrevistaDevolucao(LocalDate.now().plusDays(diasEmprestimo(request)));
        emprestimo.setStatus(EmprestimoStatus.ATIVO);

        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        livroRepository.save(livro);

        return toResponse(emprestimoRepository.save(emprestimo));
    }

    @Transactional
    public EmprestimoResponseDto devolver(Long id) {
        Emprestimo emprestimo = obterEmprestimo(id);
        if (emprestimo.getStatus() == EmprestimoStatus.DEVOLVIDO) {
            throw new BusinessException("Este emprestimo ja foi devolvido.");
        }

        emprestimo.setStatus(EmprestimoStatus.DEVOLVIDO);
        emprestimo.setDataDevolucao(LocalDate.now());

        Livro livro = emprestimo.getLivro();
        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + 1);
        livroRepository.save(livro);

        return toResponse(emprestimoRepository.save(emprestimo));
    }

    public long totalEmprestimos() {
        return emprestimoRepository.count();
    }

    public long emprestimosAtivos() {
        return emprestimoRepository.countByStatus(EmprestimoStatus.ATIVO);
    }

    private int diasEmprestimo(EmprestimoRequestDto request) {
        if (request.getDiasEmprestimo() == null || request.getDiasEmprestimo() <= 0) {
            return DIAS_PADRAO_EMPRESTIMO;
        }
        return request.getDiasEmprestimo();
    }

    private Emprestimo obterEmprestimo(Long id) {
        return emprestimoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emprestimo nao encontrado."));
    }

    private EmprestimoResponseDto toResponse(Emprestimo emprestimo) {
        EmprestimoResponseDto dto = new EmprestimoResponseDto();
        dto.setId(emprestimo.getId());
        dto.setLivroId(emprestimo.getLivro().getId());
        dto.setLivroTitulo(emprestimo.getLivro().getTitulo());
        dto.setUsuarioId(emprestimo.getUsuario().getId());
        dto.setUsuarioNome(emprestimo.getUsuario().getNome());
        dto.setDataEmprestimo(emprestimo.getDataEmprestimo());
        dto.setDataPrevistaDevolucao(emprestimo.getDataPrevistaDevolucao());
        dto.setDataDevolucao(emprestimo.getDataDevolucao());
        dto.setStatus(emprestimo.getStatus());
        return dto;
    }
}
