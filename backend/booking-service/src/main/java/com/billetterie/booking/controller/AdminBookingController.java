package com.billetterie.booking.controller;

import com.billetterie.booking.model.Booking;
import com.billetterie.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingRepository bookingRepository;

    @GetMapping
    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        List<Booking> all = bookingRepository.findAll();
        long total = all.size();
        long confirmees = all.stream().filter(b -> "CONFIRMEE".equals(b.getStatut())).count();
        long annulees = all.stream().filter(b -> "ANNULEE".equals(b.getStatut())).count();
        long enAttente = all.stream().filter(b -> "EN_ATTENTE_PAIEMENT".equals(b.getStatut())).count();
        double chiffreAffaires = all.stream()
                .filter(b -> "CONFIRMEE".equals(b.getStatut()) && b.getPrixUnitaire() != null)
                .mapToDouble(b -> b.getPrixUnitaire() * b.getNombrePlaces())
                .sum();
        return ResponseEntity.ok(Map.of(
                "total", total,
                "confirmees", confirmees,
                "annulees", annulees,
                "enAttente", enAttente,
                "chiffreAffaires", chiffreAffaires
        ));
    }
}
