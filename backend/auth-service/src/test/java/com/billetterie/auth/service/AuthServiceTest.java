package com.billetterie.auth.service;

import com.billetterie.auth.dto.*;
import com.billetterie.auth.entity.User;
import com.billetterie.auth.repository.UserRepository;
import com.billetterie.auth.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @InjectMocks AuthService authService;

    // ─── register ────────────────────────────────────────────────────────────

    @Test
    void register_Success_WhenEmailNotTaken() {
        RegisterRequest req = new RegisterRequest();
        req.setNom("Anas"); req.setEmail("anas@eventhub.com");
        req.setPassword("pass123"); req.setTelephone("0600000000"); req.setAge(25);

        when(userRepository.existsByEmail("anas@eventhub.com")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("hashed");

        authService.register(req);

        verify(userRepository).save(argThat(u ->
            "Anas".equals(u.getNom()) &&
            "anas@eventhub.com".equals(u.getEmail()) &&
            "hashed".equals(u.getPassword())
        ));
    }

    @Test
    void register_AssignsRoleClient_WhenRoleIsNull() {
        RegisterRequest req = new RegisterRequest();
        req.setNom("Anas"); req.setEmail("anas@eventhub.com"); req.setPassword("pass123");

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");

        authService.register(req);

        verify(userRepository).save(argThat(u -> "ROLE_CLIENT".equals(u.getRole())));
    }

    @Test
    void register_UsesProvidedRole_WhenRoleIsSet() {
        RegisterRequest req = new RegisterRequest();
        req.setNom("Hafsa"); req.setEmail("hafsa@eventhub.com");
        req.setPassword("pass"); req.setRole("ROLE_ANNONCEUR");

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");

        authService.register(req);

        verify(userRepository).save(argThat(u -> "ROLE_ANNONCEUR".equals(u.getRole())));
    }

    @Test
    void register_ThrowsIllegalArgument_WhenEmailAlreadyExists() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("anas@eventhub.com");

        when(userRepository.existsByEmail("anas@eventhub.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Email déjà utilisé");

        verify(userRepository, never()).save(any());
    }

    // ─── login ───────────────────────────────────────────────────────────────

    @Test
    void login_ReturnsTokenAndUserInfo_WhenCredentialsCorrect() {
        User user = User.builder()
            .id(1L).nom("Anas").email("anas@eventhub.com")
            .password("hashed").role("ROLE_CLIENT").build();
        LoginRequest req = new LoginRequest();
        req.setEmail("anas@eventhub.com"); req.setPassword("pass123");

        when(userRepository.findByEmail("anas@eventhub.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass123", "hashed")).thenReturn(true);
        when(jwtService.generateToken(1L, "ROLE_CLIENT")).thenReturn("jwt-token");

        AuthResponse response = authService.login(req);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getNom()).isEqualTo("Anas");
        assertThat(response.getEmail()).isEqualTo("anas@eventhub.com");
        assertThat(response.getRole()).isEqualTo("ROLE_CLIENT");
    }

    @Test
    void login_ThrowsBadCredentials_WhenEmailNotFound() {
        LoginRequest req = new LoginRequest();
        req.setEmail("inconnu@eventhub.com"); req.setPassword("pass");

        when(userRepository.findByEmail("inconnu@eventhub.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
            .isInstanceOf(BadCredentialsException.class)
            .hasMessageContaining("Identifiants invalides");
    }

    @Test
    void login_ThrowsBadCredentials_WhenPasswordWrong() {
        User user = User.builder()
            .id(1L).email("anas@eventhub.com").password("hashed").role("ROLE_CLIENT").build();
        LoginRequest req = new LoginRequest();
        req.setEmail("anas@eventhub.com"); req.setPassword("mauvais");

        when(userRepository.findByEmail("anas@eventhub.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("mauvais", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
            .isInstanceOf(BadCredentialsException.class);

        verify(jwtService, never()).generateToken(any(), any());
    }

    // ─── findById ────────────────────────────────────────────────────────────

    @Test
    void findById_ReturnsAuthResponse_WhenUserExists() {
        User user = User.builder()
            .id(1L).nom("Anas").email("anas@eventhub.com").role("ROLE_CLIENT").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Optional<AuthResponse> result = authService.findById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getNom()).isEqualTo("Anas");
        assertThat(result.get().getEmail()).isEqualTo("anas@eventhub.com");
        assertThat(result.get().getToken()).isNull();
    }

    @Test
    void findById_ReturnsEmpty_WhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<AuthResponse> result = authService.findById(99L);

        assertThat(result).isEmpty();
    }

    // ─── updateProfile ───────────────────────────────────────────────────────

    @Test
    void updateProfile_UpdatesNom_WhenProvided() {
        User user = User.builder()
            .id(1L).nom("Ancien").email("anas@eventhub.com").role("ROLE_CLIENT").build();
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setNom("Nouveau");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        AuthResponse response = authService.updateProfile(1L, req);

        assertThat(response.getNom()).isEqualTo("Nouveau");
        verify(userRepository).save(argThat(u -> "Nouveau".equals(u.getNom())));
    }

    @Test
    void updateProfile_UpdatesTelephone_WhenProvided() {
        User user = User.builder()
            .id(1L).nom("Anas").email("anas@eventhub.com").role("ROLE_CLIENT")
            .telephone("0600000000").build();
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setTelephone("0611111111");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        authService.updateProfile(1L, req);

        verify(userRepository).save(argThat(u -> "0611111111".equals(u.getTelephone())));
    }

    @Test
    void updateProfile_ChangesPassword_WhenCurrentPasswordCorrect() {
        User user = User.builder()
            .id(1L).nom("Anas").email("anas@eventhub.com")
            .password("oldHashed").role("ROLE_CLIENT").build();
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setCurrentPassword("oldPass"); req.setNewPassword("newPass");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPass", "oldHashed")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("newHashed");

        authService.updateProfile(1L, req);

        verify(userRepository).save(argThat(u -> "newHashed".equals(u.getPassword())));
    }

    @Test
    void updateProfile_ThrowsException_WhenCurrentPasswordWrong() {
        User user = User.builder()
            .id(1L).nom("Anas").email("anas@eventhub.com")
            .password("oldHashed").role("ROLE_CLIENT").build();
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setCurrentPassword("mauvais"); req.setNewPassword("newPass");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("mauvais", "oldHashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.updateProfile(1L, req))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Mot de passe actuel incorrect");
    }

    @Test
    void updateProfile_ThrowsException_WhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.updateProfile(99L, new UpdateProfileRequest()))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Utilisateur introuvable");
    }

    @Test
    void updateProfile_DoesNotChangePassword_WhenNewPasswordBlank() {
        User user = User.builder()
            .id(1L).nom("Anas").email("anas@eventhub.com")
            .password("oldHashed").role("ROLE_CLIENT").build();
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setNom("NouveauNom");
        req.setNewPassword("");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        authService.updateProfile(1L, req);

        verify(passwordEncoder, never()).encode(any());
        verify(userRepository).save(argThat(u -> "oldHashed".equals(u.getPassword())));
    }
}
