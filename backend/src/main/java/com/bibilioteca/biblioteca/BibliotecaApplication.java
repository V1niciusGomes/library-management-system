/**
 * Ponto de entrada da aplicacao Spring Boot; sobe o contexto e inicializa a API da biblioteca.
 */
package com.bibilioteca.biblioteca;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BibliotecaApplication {

	public static void main(String[] args) {
		SpringApplication.run(BibliotecaApplication.class, args);
	}

}
