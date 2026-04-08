package com.bibilioteca.biblioteca.dto;

public class EmprestimoRequestDto {

    private Long livroId;
    private Long usuarioId;
    private Integer diasEmprestimo;

    public Long getLivroId() {
        return livroId;
    }

    public void setLivroId(Long livroId) {
        this.livroId = livroId;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Integer getDiasEmprestimo() {
        return diasEmprestimo;
    }

    public void setDiasEmprestimo(Integer diasEmprestimo) {
        this.diasEmprestimo = diasEmprestimo;
    }
}
