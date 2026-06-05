package com.billetterie.auth.service;

import com.billetterie.auth.dto.AuthResponse;
import com.billetterie.auth.dto.LoginRequest;
import com.billetterie.auth.dto.RegisterRequest;
import com.billetterie.auth.dto.UpdateProfileRequest;
import com.billetterie.auth.entity.User;
import com.billetterie.auth.repository.UserRepository;
import com.billetterie.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé : " + request.getEmail());
        }

        User user = User.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : "ROLE_CLIENT")
                .telephone(request.getTelephone())
                .age(request.getAge())
                .build();

        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Identifiants invalides"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Identifiants invalides");
        }

        String token = jwtService.generateToken(user.getId(), user.getRole());
        return new AuthResponse("Connexion réussie", user.getId(), user.getNom(), user.getEmail(), user.getRole(), token);
    }

    public Optional<AuthResponse> findById(Long id) {
        return userRepository.findById(id)
                .map(u -> new AuthResponse("OK", u.getId(), u.getNom(), u.getEmail(), u.getRole(), null));
    }

    public AuthResponse updateProfile(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        if (request.getNom() != null && !request.getNom().isBlank())
            user.setNom(request.getNom());
        if (request.getTelephone() != null && !request.getTelephone().isBlank())
            user.setTelephone(request.getTelephone());
        if (request.getAge() != null)
            user.setAge(request.getAge());

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null ||
                !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Mot de passe actuel incorrect");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);
        return new AuthResponse("Profil mis à jour", user.getId(), user.getNom(), user.getEmail(), user.getRole(), null);
    }
}
