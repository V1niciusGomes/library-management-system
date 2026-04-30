/**
 * Gerencia os endpoints de usuarios, permitindo criar, listar, editar e remover cadastros.
 */
package com.bibilioteca.biblioteca.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bibilioteca.biblioteca.dto.UsuarioRemocaoRequestDto;
import com.bibilioteca.biblioteca.dto.UsuarioRequestDto;
import com.bibilioteca.biblioteca.dto.UsuarioResponseDto;
import com.bibilioteca.biblioteca.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<UsuarioResponseDto> listar() {
        return usuarioService.listar();
    }

    @GetMapping("/{id}")
    public UsuarioResponseDto buscarPorId(@PathVariable Long id) {
        return usuarioService.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDto> criar(@RequestBody UsuarioRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.criar(request));
    }

    @PutMapping("/{id}")
    public UsuarioResponseDto atualizar(@PathVariable Long id, @RequestBody UsuarioRequestDto request) {
        return usuarioService.atualizar(id, request);
    }

    @PostMapping("/remocao-lote")
    public ResponseEntity<Void> removerEmLote(@RequestBody List<UsuarioRemocaoRequestDto> request) {
        usuarioService.removerEmLote(request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        usuarioService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
