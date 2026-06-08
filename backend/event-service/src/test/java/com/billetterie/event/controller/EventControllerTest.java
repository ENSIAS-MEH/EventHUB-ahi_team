package com.billetterie.event.controller;

import com.billetterie.event.model.Event;
import com.billetterie.event.model.TicketCategory;
import com.billetterie.event.repository.EventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = EventController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = com.billetterie.event.config.SecurityConfig.class
    )
)
@AutoConfigureMockMvc(addFilters = false)
class EventControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean EventRepository repo;
    @MockBean com.billetterie.event.security.JwtFilter jwtFilter;

    private Event makeEvent(Long id, String titre, String statut, String date) {
        Event e = new Event();
        e.setId(id); e.setTitre(titre); e.setStatut(statut); e.setDate(date);
        e.setAnnonceurId(1L); e.setPrix(100.0); e.setPlacesDisponibles(50);
        return e;
    }

    // ─── GET /api/events ──────────────────────────────────────────────────────

    @Test
    void getAll_ReturnsOnlyValideFutureEvents() throws Exception {
        String tomorrow = LocalDate.now().plusDays(1).toString();
        String yesterday = LocalDate.now().minusDays(1).toString();

        Event future  = makeEvent(1L, "Concert futur",  "VALIDE", tomorrow);
        Event past    = makeEvent(2L, "Concert passé",  "VALIDE", yesterday);

        when(repo.findByStatut("VALIDE")).thenReturn(List.of(future, past));

        mockMvc.perform(get("/api/events"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].titre").value("Concert futur"));
    }

    @Test
    void getAll_ReturnsEmpty_WhenNoValideEvents() throws Exception {
        when(repo.findByStatut("VALIDE")).thenReturn(List.of());

        mockMvc.perform(get("/api/events"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getAll_ExcludesEnAttenteAndRefuseEvents() throws Exception {
        String tomorrow = LocalDate.now().plusDays(1).toString();
        Event enAttente = makeEvent(1L, "En attente", "EN_ATTENTE", tomorrow);
        Event refuse    = makeEvent(2L, "Refusé",     "REFUSE",     tomorrow);

        when(repo.findByStatut("VALIDE")).thenReturn(List.of());

        mockMvc.perform(get("/api/events"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    // ─── GET /api/events/{id} ─────────────────────────────────────────────────

    @Test
    void getById_ReturnsEvent_WhenExists() throws Exception {
        Event e = makeEvent(1L, "Théâtre", "VALIDE", "2026-12-01");
        when(repo.findById(1L)).thenReturn(Optional.of(e));

        mockMvc.perform(get("/api/events/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.titre").value("Théâtre"))
            .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getById_ThrowsException_WhenNotFound() throws Exception {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/events/99"))
            .andExpect(status().is5xxServerError());
    }

    // ─── GET /api/events/annonceur/{id} ──────────────────────────────────────

    @Test
    void getByAnnonceur_ReturnsEventsOfAnnonceur() throws Exception {
        Event e1 = makeEvent(1L, "Event 1", "VALIDE", "2026-12-01");
        Event e2 = makeEvent(2L, "Event 2", "EN_ATTENTE", "2026-11-01");
        when(repo.findByAnnonceurId(1L)).thenReturn(List.of(e1, e2));

        mockMvc.perform(get("/api/events/annonceur/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getByAnnonceur_ReturnsEmpty_WhenNoEvents() throws Exception {
        when(repo.findByAnnonceurId(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/events/annonceur/99"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    // ─── POST /api/events ─────────────────────────────────────────────────────

    @Test
    void create_SavesEventAndReturnsIt() throws Exception {
        Event input = makeEvent(null, "Nouveau Concert", "EN_ATTENTE", "2026-12-01");
        Event saved = makeEvent(1L,   "Nouveau Concert", "EN_ATTENTE", "2026-12-01");

        when(repo.save(any())).thenReturn(saved);

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(input)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.titre").value("Nouveau Concert"));
    }

    @Test
    void create_LinksCategoriesToEvent_BeforeSave() throws Exception {
        TicketCategory cat = new TicketCategory();
        cat.setNom("VIP"); cat.setPrix(200.0); cat.setPlacesDisponibles(10);

        Event input = makeEvent(null, "Concert", "EN_ATTENTE", "2026-12-01");
        input.setCategories(List.of(cat));

        Event saved = makeEvent(1L, "Concert", "EN_ATTENTE", "2026-12-01");
        when(repo.save(any())).thenReturn(saved);

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(input)))
            .andExpect(status().isOk());

        verify(repo).save(argThat(e ->
            e.getCategories() != null &&
            e.getCategories().stream().allMatch(c -> c.getEvent() == e)
        ));
    }

    // ─── DELETE /api/events/{id} ──────────────────────────────────────────────

    @Test
    void delete_CallsRepositoryDeleteById() throws Exception {
        doNothing().when(repo).deleteById(1L);

        mockMvc.perform(delete("/api/events/1"))
            .andExpect(status().isOk());

        verify(repo).deleteById(1L);
    }

    // ─── PUT /api/events/{id}/decrement ──────────────────────────────────────

    @Test
    void decrement_ReducesPlacesDisponibles() throws Exception {
        Event e = makeEvent(1L, "Concert", "VALIDE", "2026-12-01");
        e.setPlacesDisponibles(10);
        when(repo.findById(1L)).thenReturn(Optional.of(e));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/events/1/decrement").param("count", "3"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.placesDisponibles").value(7));
    }

    @Test
    void decrement_NeverGoesBelowZero() throws Exception {
        Event e = makeEvent(1L, "Concert", "VALIDE", "2026-12-01");
        e.setPlacesDisponibles(2);
        when(repo.findById(1L)).thenReturn(Optional.of(e));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/events/1/decrement").param("count", "5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.placesDisponibles").value(0));
    }

    @Test
    void decrement_DefaultsToOne_WhenCountNotProvided() throws Exception {
        Event e = makeEvent(1L, "Concert", "VALIDE", "2026-12-01");
        e.setPlacesDisponibles(10);
        when(repo.findById(1L)).thenReturn(Optional.of(e));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/events/1/decrement"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.placesDisponibles").value(9));
    }
}
