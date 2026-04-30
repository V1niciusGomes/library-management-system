/**
 * Excecao usada para erros de regra de negocio que devem voltar para a API de forma controlada.
 */
package com.bibilioteca.biblioteca.service;

public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
