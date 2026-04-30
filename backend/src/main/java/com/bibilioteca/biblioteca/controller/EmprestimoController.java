/**
 * Controla o ciclo de emprestimos, consultas de ativos, historico e registro de devolucao.
 */
package com.bibilioteca.biblioteca.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bibilioteca.biblioteca.dto.EmprestimoRequestDto;
import com.bibilioteca.biblioteca.dto.EmprestimoResponseDto;
import com.bibilioteca.biblioteca.service.EmprestimoService;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final EmprestimoService emprestimoService;

    public EmprestimoController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    @GetMapping
    public List<EmprestimoResponseDto> listarTodos() {
        return emprestimoService.listarTodos();
    }

    @GetMapping("/ativos")
    public List<EmprestimoResponseDto> listarAtivos() {
        return emprestimoService.listarAtivos();
    }

    @PostMapping
    public ResponseEntity<EmprestimoResponseDto> emprestar(@RequestBody EmprestimoRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimoService.emprestar(request));
    }

    @PostMapping("/{id}/devolucao")
    public EmprestimoResponseDto devolver(@PathVariable Long id) {
        return emprestimoService.devolver(id);
    }
}
