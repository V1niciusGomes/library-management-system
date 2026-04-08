package com.bibilioteca.biblioteca.service;

import java.util.List;

import org.springframework.stereotype.Service;

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

    public void remover(Long id) {
        Livro livro = obterLivro(id);

        if (emprestimoRepository.existsByLivro_Id(id)) {
            throw new BusinessException("Nao e possivel excluir livro com emprestimos vinculados.");
        }

        livroRepository.delete(livro);
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
