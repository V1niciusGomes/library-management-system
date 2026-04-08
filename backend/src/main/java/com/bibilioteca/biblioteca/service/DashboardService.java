package com.bibilioteca.biblioteca.service;

import org.springframework.stereotype.Service;

import com.bibilioteca.biblioteca.dto.DashboardStatsDto;
import com.bibilioteca.biblioteca.model.Livro;
import com.bibilioteca.biblioteca.repository.LivroRepository;
import com.bibilioteca.biblioteca.repository.UsuarioRepository;

@Service
public class DashboardService {

    private final LivroRepository livroRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmprestimoService emprestimoService;

    public DashboardService(
            LivroRepository livroRepository,
            UsuarioRepository usuarioRepository,
            EmprestimoService emprestimoService
    ) {
        this.livroRepository = livroRepository;
        this.usuarioRepository = usuarioRepository;
        this.emprestimoService = emprestimoService;
    }

    public DashboardStatsDto estatisticas() {
        DashboardStatsDto dto = new DashboardStatsDto();
        dto.setTotalLivros(livroRepository.count());
        dto.setTotalUsuarios(usuarioRepository.count());
        dto.setEmprestimosAtivos(emprestimoService.emprestimosAtivos());
        dto.setTotalEmprestimos(emprestimoService.totalEmprestimos());

        long disponiveis = livroRepository.findAll().stream()
                .map(Livro::getQuantidadeDisponivel)
                .filter(valor -> valor != null && valor > 0)
                .count();
        dto.setLivrosDisponiveis(disponiveis);

        return dto;
    }
}
