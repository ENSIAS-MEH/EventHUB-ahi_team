package com.billetterie.event.controller;

import com.billetterie.event.model.Event;
import com.billetterie.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventRepository repo;

    @GetMapping
    public List<Event> getAll() {
        String today = LocalDate.now().toString();
        return repo.findByStatut("VALIDE").stream()
                .filter(e -> e.getDate() != null && e.getDate().compareTo(today) >= 0)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public Event getById(@PathVariable("id") Long id) {
        return repo.findById(id).orElseThrow();
    }

    @GetMapping("/annonceur/{annonceurId}")
    public List<Event> getByAnnonceur(@PathVariable("annonceurId") Long annonceurId) {
        return repo.findByAnnonceurId(annonceurId);
    }

    @PostMapping
    public Event create(@RequestBody Event e) { return repo.save(e); }

    @PutMapping("/{id}")
    public Event update(@PathVariable("id") Long id, @RequestBody Event e) {
        e.setId(id); return repo.save(e);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id) { repo.deleteById(id); }

    @PutMapping("/{id}/decrement")
    public Event decrement(@PathVariable("id") Long id, @RequestParam(value = "count", defaultValue = "1") Integer count) {
        Event e = repo.findById(id).orElseThrow();
        int currentPlaces = e.getPlacesDisponibles() == null ? 0 : e.getPlacesDisponibles();
        int decrementBy = count == null || count < 1 ? 1 : count;
        e.setPlacesDisponibles(Math.max(0, currentPlaces - decrementBy));
        return repo.save(e);
    }
}
