/**
 * Representa a solicitacao de remocao parcial ou total de unidades de um livro.
 */
package com.bibilioteca.biblioteca.dto;

public class LivroRemocaoRequestDto {

    private Long livroId;
    private Integer quantidade;

    public Long getLivroId() {
        return livroId;
    }

    public void setLivroId(Long livroId) {
        this.livroId = livroId;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }
}
