/**
 * Acesso ao banco para operacoes de leitura e persistencia de livros.
 */
package com.bibilioteca.biblioteca.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bibilioteca.biblioteca.model.Livro;

public interface LivroRepository extends JpaRepository<Livro, Long> {
    boolean existsByIsbn(String isbn);
}
