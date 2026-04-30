/**
 * Expõe o endpoint de login do admin e devolve o token usado nas chamadas protegidas.
 */
package com.bibilioteca.biblioteca.controller;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bibilioteca.biblioteca.dto.AuthLoginRequestDto;
import com.bibilioteca.biblioteca.dto.AuthLoginResponseDto;
import com.bibilioteca.biblioteca.service.BusinessException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    @PostMapping("/login")
    public ResponseEntity<AuthLoginResponseDto> login(@RequestBody AuthLoginRequestDto request) {
        if (!adminUsername.equals(request.getUsername()) || !adminPassword.equals(request.getPassword())) {
            throw new BusinessException("Credenciais invalidas.");
        }

        String rawToken = request.getUsername() + ":" + request.getPassword();
        String basicToken = "Basic " + Base64.getEncoder().encodeToString(rawToken.getBytes(StandardCharsets.UTF_8));

        return ResponseEntity.status(HttpStatus.OK)
                .body(new AuthLoginResponseDto(basicToken, request.getUsername()));
    }
}
