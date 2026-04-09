package com.bibilioteca.biblioteca.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bibilioteca.biblioteca.dto.LivroRemocaoRequestDto;
import com.bibilioteca.biblioteca.dto.LivroRequestDto;
import com.bibilioteca.biblioteca.dto.LivroResponseDto;
import com.bibilioteca.biblioteca.model.Livro;
import com.bibilioteca.biblioteca.repository.EmprestimoRepository;
import com.bibilioteca.biblioteca.repository.LivroRepository;

@Service
public class LivroService {

    private final LivroRepository livroRepository;
    private final EmprestimoRepository emprestimoRepository;

    public LivroService(LivroRepository livroRepository, EmprestimoRepository emprestimoRepository) {
        this.livroRepository = livroRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    public List<LivroResponseDto> listar() {
        return livroRepository.findAll().stream().map(this::toResponse).toList();
    }

    public LivroResponseDto buscarPorId(Long id) {
        Livro livro = obterLivro(id);
        return toResponse(livro);
    }

    public LivroResponseDto criar(LivroRequestDto request) {
        if (livroRepository.existsByIsbn(request.getIsbn())) {
            throw new BusinessException("Ja existe livro cadastrado com esse ISBN.");
        }

        Livro livro = new Livro();
        aplicarCampos(livro, request);
        livro.setQuantidadeDisponivel(request.getQuantidadeTotal());

        return toResponse(livroRepository.save(livro));
    }

    public LivroResponseDto atualizar(Long id, LivroRequestDto request) {
        Livro livro = obterLivro(id);

        if (!livro.getIsbn().equals(request.getIsbn()) && livroRepository.existsByIsbn(request.getIsbn())) {
            throw new BusinessException("Ja existe livro cadastrado com esse ISBN.");
        }

        int emprestados = livro.getQuantidadeTotal() - livro.getQuantidadeDisponivel();
        aplicarCampos(livro, request);
        if (request.getQuantidadeTotal() < emprestados) {
            throw new BusinessException("Quantidade total nao pode ser menor que os livros emprestados.");
        }
        livro.setQuantidadeDisponivel(request.getQuantidadeTotal() - emprestados);

        return toResponse(livroRepository.save(livro));
    }

    @Transactional
    public void remover(Long id, Integer quantidade) {
        int quantidadeExclusao = quantidade == null ? 1 : quantidade;
        if (quantidadeExclusao <= 0) {
            throw new BusinessException("Quantidade para exclusao deve ser maior que zero.");
        }

        Livro livro = obterLivro(id);

        int disponivel = livro.getQuantidadeDisponivel() == null ? 0 : livro.getQuantidadeDisponivel();
        if (disponivel <= 0) {
            throw new BusinessException("Nao ha exemplares em estoque para excluir.");
        }
        if (quantidadeExclusao > disponivel) {
            throw new BusinessException("Quantidade para exclusao maior que o estoque disponivel.");
        }

        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - quantidadeExclusao);
        livro.setQuantidadeTotal(livro.getQuantidadeTotal() - quantidadeExclusao);

        if (livro.getQuantidadeTotal() == 0 && !emprestimoRepository.existsByLivro_Id(id)) {
            livroRepository.delete(livro);
            return;
        }

        livroRepository.save(livro);
    }

    @Transactional
    public void removerEmLote(List<LivroRemocaoRequestDto> request) {
        if (request == null || request.isEmpty()) {
            throw new BusinessException("Informe ao menos um livro para exclusao em lote.");
        }

        Map<Long, Integer> remocoesPorLivro = new HashMap<>();
        for (LivroRemocaoRequestDto item : request) {
            if (item == null || item.getLivroId() == null) {
                throw new BusinessException("Livro invalido na remocao em lote.");
            }
            int quantidade = item.getQuantidade() == null ? 1 : item.getQuantidade();
            if (quantidade <= 0) {
                throw new BusinessException("Quantidade para exclusao deve ser maior que zero.");
            }
            remocoesPorLivro.merge(item.getLivroId(), quantidade, Integer::sum);
        }

        for (Map.Entry<Long, Integer> entry : remocoesPorLivro.entrySet()) {
            remover(entry.getKey(), entry.getValue());
        }
    }

    public Livro obterLivro(Long id) {
        return livroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livro nao encontrado."));
    }

    private void aplicarCampos(Livro livro, LivroRequestDto request) {
        if (request.getQuantidadeTotal() == null || request.getQuantidadeTotal() < 0) {
            throw new BusinessException("Quantidade total deve ser maior ou igual a zero.");
        }

        livro.setTitulo(request.getTitulo());
        livro.setAutor(request.getAutor());
        livro.setIsbn(request.getIsbn());
        livro.setCategoria(request.getCategoria());
        livro.setSinopse(request.getSinopse());
        livro.setAnoPublicacao(request.getAnoPublicacao());
        livro.setQuantidadeTotal(request.getQuantidadeTotal());
    }

    private LivroResponseDto toResponse(Livro livro) {
        LivroResponseDto dto = new LivroResponseDto();
        dto.setId(livro.getId());
        dto.setTitulo(livro.getTitulo());
        dto.setAutor(livro.getAutor());
        dto.setIsbn(livro.getIsbn());
        dto.setCategoria(livro.getCategoria());
        dto.setSinopse(livro.getSinopse());
        dto.setAnoPublicacao(livro.getAnoPublicacao());
        dto.setQuantidadeTotal(livro.getQuantidadeTotal());
        dto.setQuantidadeDisponivel(livro.getQuantidadeDisponivel());
        return dto;
    }
}
