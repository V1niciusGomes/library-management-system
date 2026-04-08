package com.bibilioteca.biblioteca.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bibilioteca.biblioteca.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    boolean existsByEmail(String email);
    boolean existsByDocumento(String documento);
}
