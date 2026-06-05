package com.billetterie.auth.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String nom;
    private String telephone;
    private Integer age;
    private String currentPassword;
    private String newPassword;
}
