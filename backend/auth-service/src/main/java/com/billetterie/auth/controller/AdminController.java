package com.billetterie.auth.controller;

import com.billetterie.auth.dto.UserAdminResponse;
import com.billetterie.auth.entity.User;
import com.billetterie.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private static final Set<String> VALID_ROLES = Set.of("ROLE_CLIENT", "ROLE_ORGANIZER", "ROLE_ADMIN");

    private final UserRepository userRepository;

    @GetMapping("/users")
    public List<UserAdminResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserAdminResponse(u.getId(), u.getNom(), u.getEmail(), u.getRole(), u.getTelephone(), u.getAge(), u.isEnabled()))
                .collect(Collectors.toList());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        String newRole = body.get("role");
        if (newRole == null || !VALID_ROLES.contains(newRole)) {
            return ResponseEntity.badRequest().body("Rôle invalide. Valeurs acceptées : " + VALID_ROLES);
        }
        user.setRole(newRole);
        userRepository.save(user);
        return ResponseEntity.ok("Rôle mis à jour : " + newRole);
    }

    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<?> toggleUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return ResponseEntity.ok(user.isEnabled() ? "Compte activé" : "Compte désactivé");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("Utilisateur supprimé");
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long total = userRepository.count();
        Map<String, Long> byRole = userRepository.findAll().stream()
                .collect(Collectors.groupingBy(User::getRole, Collectors.counting()));
        return ResponseEntity.ok(Map.of("total", total, "byRole", byRole));
    }
}
