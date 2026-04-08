package com.bibilioteca.biblioteca.dto;

public class AuthLoginResponseDto {

    private String token;
    private String username;

    public AuthLoginResponseDto(String token, String username) {
        this.token = token;
        this.username = username;
    }

    public String getToken() {
        return token;
    }

    public String getUsername() {
        return username;
    }
}
