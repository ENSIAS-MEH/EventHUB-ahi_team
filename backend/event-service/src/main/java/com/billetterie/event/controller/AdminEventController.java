package com.billetterie.event.controller;

import com.billetterie.event.model.Event;
import com.billetterie.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
public class AdminEventController {

    private final EventRepository eventRepository;

    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<?> valider(@PathVariable Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement introuvable"));
        event.setStatut("VALIDE");
        eventRepository.save(event);
        return ResponseEntity.ok("Événement validé");
    }

    @PutMapping("/{id}/refuser")
    public ResponseEntity<?> refuser(@PathVariable Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement introuvable"));
        event.setStatut("REFUSE");
        eventRepository.save(event);
        return ResponseEntity.ok("Événement refusé");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!eventRepository.existsById(id)) return ResponseEntity.notFound().build();
        eventRepository.deleteById(id);
        return ResponseEntity.ok("Événement supprimé");
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        long total = eventRepository.count();
        long valides = eventRepository.findAll().stream().filter(e -> "VALIDE".equals(e.getStatut())).count();
        long enAttente = eventRepository.findAll().stream().filter(e -> "EN_ATTENTE".equals(e.getStatut())).count();
        long refuses = eventRepository.findAll().stream().filter(e -> "REFUSE".equals(e.getStatut())).count();
        return ResponseEntity.ok(Map.of("total", total, "valides", valides, "enAttente", enAttente, "refuses", refuses));
    }
}
