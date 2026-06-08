package com.billetterie.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    // clé de 64+ caractères requise par HMAC-SHA512
    private static final String SECRET =
        "eventhub-super-secret-jwt-key-2024-XXXXXXXXXXXXXXXXXXXXXXXXXX-test-padding";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
    }

    @Test
    void generateToken_ReturnsNonNullToken() {
        String token = jwtService.generateToken(1L, "ROLE_CLIENT");

        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void generateToken_ReturnsDifferentTokens_ForDifferentUsers() {
        String token1 = jwtService.generateToken(1L, "ROLE_CLIENT");
        String token2 = jwtService.generateToken(2L, "ROLE_CLIENT");

        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    void generateToken_ReturnsDifferentTokens_ForDifferentRoles() {
        String tokenClient    = jwtService.generateToken(1L, "ROLE_CLIENT");
        String tokenAnnonceur = jwtService.generateToken(1L, "ROLE_ANNONCEUR");
        String tokenAdmin     = jwtService.generateToken(1L, "ROLE_ADMIN");

        assertThat(tokenClient).isNotEqualTo(tokenAnnonceur);
        assertThat(tokenClient).isNotEqualTo(tokenAdmin);
    }

    @Test
    void generateToken_HasThreeJwtParts() {
        String token = jwtService.generateToken(1L, "ROLE_CLIENT");

        // Un JWT valide a 3 parties séparées par des points
        String[] parts = token.split("\\.");
        assertThat(parts).hasSize(3);
    }

    @Test
    void generateToken_IsConsistentForSameInput() {
        // Deux tokens générés immédiatement ne sont pas forcément identiques (timestamps)
        // mais doivent avoir le même format
        String token1 = jwtService.generateToken(1L, "ROLE_CLIENT");
        String token2 = jwtService.generateToken(1L, "ROLE_CLIENT");

        assertThat(token1.split("\\.")).hasSize(3);
        assertThat(token2.split("\\.")).hasSize(3);
    }
}
