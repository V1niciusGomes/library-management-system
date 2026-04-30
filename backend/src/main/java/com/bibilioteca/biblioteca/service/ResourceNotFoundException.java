/**
 * Excecao lancada quando um recurso esperado nao existe no banco ou na consulta.
 */
package com.bibilioteca.biblioteca.service;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
