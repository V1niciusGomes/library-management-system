/**
 * Expõe operacoes de cadastro, consulta, atualizacao e remocao de livros do acervo.
 */
package com.bibilioteca.biblioteca.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bibilioteca.biblioteca.dto.LivroRemocaoRequestDto;
import com.bibilioteca.biblioteca.dto.LivroRequestDto;
import com.bibilioteca.biblioteca.dto.LivroResponseDto;
import com.bibilioteca.biblioteca.service.LivroService;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    private final LivroService livroService;

    public LivroController(LivroService livroService) {
        this.livroService = livroService;
    }

    @GetMapping
    public List<LivroResponseDto> listar() {
        return livroService.listar();
    }

    @GetMapping("/{id}")
    public LivroResponseDto buscarPorId(@PathVariable Long id) {
        return livroService.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<LivroResponseDto> criar(@RequestBody LivroRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(livroService.criar(request));
    }

    @PutMapping("/{id}")
    public LivroResponseDto atualizar(@PathVariable Long id, @RequestBody LivroRequestDto request) {
        return livroService.atualizar(id, request);
    }

    @PostMapping("/remocao-lote")
    public ResponseEntity<Void> removerEmLote(@RequestBody List<LivroRemocaoRequestDto> request) {
        livroService.removerEmLote(request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id, @RequestParam(defaultValue = "1") Integer quantidade) {
        livroService.remover(id, quantidade);
        return ResponseEntity.noContent().build();
    }
}
