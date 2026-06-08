package com.billetterie.auth.controller;

import com.billetterie.auth.dto.*;
import com.billetterie.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = AuthController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = com.billetterie.auth.config.SecurityConfig.class
    )
)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean AuthService authService;
    @MockBean com.billetterie.auth.security.JwtFilter jwtFilter;

    // ─── POST /api/auth/register ──────────────────────────────────────────────

    @Test
    void register_Returns201_WhenSuccess() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setNom("Anas"); req.setEmail("anas@eventhub.com"); req.setPassword("pass123");

        doNothing().when(authService).register(any());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(content().string("Compte créé avec succès"));
    }

    @Test
    void register_Returns409_WhenEmailAlreadyExists() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("anas@eventhub.com"); req.setPassword("pass");

        doThrow(new IllegalArgumentException("Email déjà utilisé : anas@eventhub.com"))
            .when(authService).register(any());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isConflict())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("Email déjà utilisé")));
    }

    // ─── POST /api/auth/login ─────────────────────────────────────────────────

    @Test
    void login_Returns200WithToken_WhenCredentialsCorrect() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("anas@eventhub.com"); req.setPassword("pass123");

        AuthResponse response = new AuthResponse("Connexion réussie", 1L, "Anas",
            "anas@eventhub.com", "ROLE_CLIENT", "jwt-token");

        when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value("jwt-token"))
            .andExpect(jsonPath("$.nom").value("Anas"))
            .andExpect(jsonPath("$.role").value("ROLE_CLIENT"));
    }

    @Test
    void login_Returns401_WhenCredentialsWrong() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("anas@eventhub.com"); req.setPassword("mauvais");

        when(authService.login(any()))
            .thenThrow(new BadCredentialsException("Identifiants invalides"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isUnauthorized());
    }

    // ─── GET /api/auth/users/{id} ─────────────────────────────────────────────

    @Test
    void getUser_Returns200_WhenUserExists() throws Exception {
        AuthResponse response = new AuthResponse("OK", 1L, "Anas",
            "anas@eventhub.com", "ROLE_CLIENT", null);

        when(authService.findById(1L)).thenReturn(Optional.of(response));

        mockMvc.perform(get("/api/auth/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nom").value("Anas"))
            .andExpect(jsonPath("$.email").value("anas@eventhub.com"));
    }

    @Test
    void getUser_Returns404_WhenUserNotFound() throws Exception {
        when(authService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/auth/users/99"))
            .andExpect(status().isNotFound());
    }

    // ─── PUT /api/auth/users/{id}/profile ────────────────────────────────────

    @Test
    void updateProfile_Returns200_WhenSuccess() throws Exception {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setNom("NouveauNom");

        AuthResponse response = new AuthResponse("Profil mis à jour", 1L, "NouveauNom",
            "anas@eventhub.com", "ROLE_CLIENT", null);

        when(authService.updateProfile(eq(1L), any())).thenReturn(response);

        mockMvc.perform(put("/api/auth/users/1/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nom").value("NouveauNom"));
    }

    @Test
    void updateProfile_Returns400_WhenPasswordWrong() throws Exception {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setCurrentPassword("mauvais"); req.setNewPassword("nouveau");

        when(authService.updateProfile(eq(1L), any()))
            .thenThrow(new IllegalArgumentException("Mot de passe actuel incorrect"));

        mockMvc.perform(put("/api/auth/users/1/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string(
                org.hamcrest.Matchers.containsString("Mot de passe actuel incorrect")));
    }
}
