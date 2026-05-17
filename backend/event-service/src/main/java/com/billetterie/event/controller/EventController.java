package com.billetterie.event.controller;

import com.billetterie.event.model.Event;
import com.billetterie.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins="*")
public class EventController {
    private final EventRepository repo;

    @GetMapping
    public List<Event> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Event getById(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @GetMapping("/annonceur/{annonceurId}")
    public List<Event> getByAnnonceur(@PathVariable Long annonceurId) {
        return repo.findByAnnonceurId(annonceurId);
    }

    @PostMapping
    public Event create(@RequestBody Event e) { return repo.save(e); }

    @PutMapping("/{id}")
    public Event update(@PathVariable Long id, @RequestBody Event e) {
        e.setId(id); return repo.save(e);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { repo.deleteById(id); }

    @PutMapping("/{id}/decrement")
    public Event decrement(@PathVariable Long id, @RequestParam(defaultValue = "1") Integer count) {
        Event e = repo.findById(id).orElseThrow();
        int currentPlaces = e.getPlacesDisponibles() == null ? 0 : e.getPlacesDisponibles();
        int decrementBy = count == null || count < 1 ? 1 : count;
        e.setPlacesDisponibles(Math.max(0, currentPlaces - decrementBy));
        return repo.save(e);
    }
}
