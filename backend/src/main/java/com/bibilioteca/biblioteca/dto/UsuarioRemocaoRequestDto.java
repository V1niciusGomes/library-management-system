/**
 * Modelo usado para remover usuarios em lote a partir de seus identificadores.
 */
package com.bibilioteca.biblioteca.dto;

public class UsuarioRemocaoRequestDto {

    private Long usuarioId;

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
}
