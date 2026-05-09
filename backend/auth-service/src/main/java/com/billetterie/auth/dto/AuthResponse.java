package com.billetterie.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String message;
    private Long userId;
    private String nom;
    private String email;
    private String role;
}
