package com.bibilioteca.biblioteca.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bibilioteca.biblioteca.model.Emprestimo;
import com.bibilioteca.biblioteca.model.EmprestimoStatus;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {
    List<Emprestimo> findByStatus(EmprestimoStatus status);

    long countByStatus(EmprestimoStatus status);
}
