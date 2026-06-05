package com.billetterie.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserAdminResponse {
    private Long id;
    private String nom;
    private String email;
    private String role;
    private String telephone;
    private Integer age;
    private boolean enabled;
}
