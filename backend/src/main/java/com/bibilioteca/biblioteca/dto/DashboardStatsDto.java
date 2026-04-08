package com.bibilioteca.biblioteca.dto;

public class DashboardStatsDto {

    private long totalLivros;
    private long totalUsuarios;
    private long emprestimosAtivos;
    private long totalEmprestimos;
    private long livrosDisponiveis;

    public long getTotalLivros() {
        return totalLivros;
    }

    public void setTotalLivros(long totalLivros) {
        this.totalLivros = totalLivros;
    }

    public long getTotalUsuarios() {
        return totalUsuarios;
    }

    public void setTotalUsuarios(long totalUsuarios) {
        this.totalUsuarios = totalUsuarios;
    }

    public long getEmprestimosAtivos() {
        return emprestimosAtivos;
    }

    public void setEmprestimosAtivos(long emprestimosAtivos) {
        this.emprestimosAtivos = emprestimosAtivos;
    }

    public long getTotalEmprestimos() {
        return totalEmprestimos;
    }

    public void setTotalEmprestimos(long totalEmprestimos) {
        this.totalEmprestimos = totalEmprestimos;
    }

    public long getLivrosDisponiveis() {
        return livrosDisponiveis;
    }

    public void setLivrosDisponiveis(long livrosDisponiveis) {
        this.livrosDisponiveis = livrosDisponiveis;
    }
}
