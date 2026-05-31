package com.billetterie.booking.controller;

import com.billetterie.booking.client.EventClient;
import com.billetterie.booking.model.Booking;
import com.billetterie.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingRepository repo;
    private final EventClient eventClient;

    @PostMapping
    public Booking create(@RequestBody Booking b) {
        b.setStatut("EN_ATTENTE_PAIEMENT");
        b.setDateReservation(LocalDateTime.now());
        Booking saved = repo.save(b);
        eventClient.decrementPlaces(b.getEventId(), b.getNombrePlaces());
        return saved;
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getByUser(@PathVariable Long userId) {
        return repo.findByUserId(userId);
    }

    @GetMapping("/event/{eventId}")
    public List<Booking> getByEvent(@PathVariable Long eventId) {
        return repo.findByEventId(eventId);
    }

    @GetMapping
    public List<Booking> getAll() { return repo.findAll(); }

    @PutMapping("/{id}/confirmer")
    public Booking confirmer(@PathVariable Long id) {
        Booking b = repo.findById(id).orElseThrow();
        b.setStatut("CONFIRMEE");
        return repo.save(b);
    }

    @PutMapping("/{id}/annuler")
    public Booking annuler(@PathVariable Long id) {
        Booking b = repo.findById(id).orElseThrow();
        b.setStatut("ANNULEE");
        return repo.save(b);
    }
}
