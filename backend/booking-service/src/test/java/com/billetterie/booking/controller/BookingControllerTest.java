package com.billetterie.booking.controller;

import com.billetterie.booking.client.EventClient;
import com.billetterie.booking.model.Booking;
import com.billetterie.booking.repository.BookingRepository;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = BookingController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = com.billetterie.booking.config.SecurityConfig.class
    )
)
@AutoConfigureMockMvc(addFilters = false)
class BookingControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean BookingRepository repo;
    @MockBean EventClient eventClient;
    @MockBean com.billetterie.booking.security.JwtFilter jwtFilter;

    private Booking makeBooking(Long id, Long userId, Long eventId, String statut) {
        Booking b = new Booking();
        b.setId(id); b.setUserId(userId); b.setEventId(eventId);
        b.setNombrePlaces(2); b.setPrixUnitaire(150.0);
        b.setCategorieNom("Standard"); b.setStatut(statut);
        b.setDateReservation(LocalDateTime.now());
        return b;
    }

    // ─── POST /api/bookings ───────────────────────────────────────────────────

    @Test
    void create_SetsStatutEnAttentePaiement_AndSaves() throws Exception {
        Booking input = makeBooking(null, 1L, 10L, null);
        Booking saved = makeBooking(1L,   1L, 10L, "EN_ATTENTE_PAIEMENT");

        when(repo.save(any())).thenReturn(saved);

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(input)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.statut").value("EN_ATTENTE_PAIEMENT"));

        verify(repo).save(argThat(b -> "EN_ATTENTE_PAIEMENT".equals(b.getStatut())));
    }

    @Test
    void create_SetsDateReservation_Automatically() throws Exception {
        Booking input = makeBooking(null, 1L, 10L, null);
        Booking saved = makeBooking(1L,   1L, 10L, "EN_ATTENTE_PAIEMENT");

        when(repo.save(any())).thenReturn(saved);

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(input)))
            .andExpect(status().isOk());

        verify(repo).save(argThat(b -> b.getDateReservation() != null));
    }

    // ─── GET /api/bookings/user/{userId} ─────────────────────────────────────

    @Test
    void getByUser_ReturnsBookingsForUser() throws Exception {
        Booking b1 = makeBooking(1L, 1L, 10L, "CONFIRMEE");
        Booking b2 = makeBooking(2L, 1L, 11L, "EN_ATTENTE_PAIEMENT");
        when(repo.findByUserId(1L)).thenReturn(List.of(b1, b2));

        mockMvc.perform(get("/api/bookings/user/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].userId").value(1))
            .andExpect(jsonPath("$[1].userId").value(1));
    }

    @Test
    void getByUser_ReturnsEmpty_WhenNoBookings() throws Exception {
        when(repo.findByUserId(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/bookings/user/99"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    // ─── GET /api/bookings/event/{eventId} ───────────────────────────────────

    @Test
    void getByEvent_ReturnsBookingsForEvent() throws Exception {
        Booking b1 = makeBooking(1L, 1L, 10L, "CONFIRMEE");
        Booking b2 = makeBooking(2L, 2L, 10L, "CONFIRMEE");
        when(repo.findByEventId(10L)).thenReturn(List.of(b1, b2));

        mockMvc.perform(get("/api/bookings/event/10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2));
    }

    // ─── GET /api/bookings ────────────────────────────────────────────────────

    @Test
    void getAll_ReturnsAllBookings() throws Exception {
        Booking b1 = makeBooking(1L, 1L, 10L, "CONFIRMEE");
        Booking b2 = makeBooking(2L, 2L, 11L, "ANNULEE");
        when(repo.findAll()).thenReturn(List.of(b1, b2));

        mockMvc.perform(get("/api/bookings"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2));
    }

    // ─── PUT /api/bookings/{id}/confirmer ────────────────────────────────────

    @Test
    void confirmer_SetsStatutConfirmee_WhenEnAttentePaiement() throws Exception {
        Booking b = makeBooking(1L, 1L, 10L, "EN_ATTENTE_PAIEMENT");
        when(repo.findById(1L)).thenReturn(Optional.of(b));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/bookings/1/confirmer"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.statut").value("CONFIRMEE"));
    }

    @Test
    void confirmer_CallsEventClientDecrement_AfterSave() throws Exception {
        Booking b = makeBooking(1L, 1L, 10L, "EN_ATTENTE_PAIEMENT");
        b.setNombrePlaces(3);
        when(repo.findById(1L)).thenReturn(Optional.of(b));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/bookings/1/confirmer"))
            .andExpect(status().isOk());

        verify(eventClient).decrementPlaces(10L, 3);
    }

    @Test
    void confirmer_DoesNotChangeStatut_WhenAlreadyConfirmee() throws Exception {
        Booking b = makeBooking(1L, 1L, 10L, "CONFIRMEE");
        when(repo.findById(1L)).thenReturn(Optional.of(b));

        mockMvc.perform(put("/api/bookings/1/confirmer"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.statut").value("CONFIRMEE"));

        verify(repo, never()).save(any());
        verify(eventClient, never()).decrementPlaces(any(), any());
    }

    @Test
    void confirmer_DoesNotChangeStatut_WhenAnnulee() throws Exception {
        Booking b = makeBooking(1L, 1L, 10L, "ANNULEE");
        when(repo.findById(1L)).thenReturn(Optional.of(b));

        mockMvc.perform(put("/api/bookings/1/confirmer"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.statut").value("ANNULEE"));

        verify(repo, never()).save(any());
    }

    @Test
    void confirmer_RemainsConfirmee_WhenEventClientFails() throws Exception {
        Booking b = makeBooking(1L, 1L, 10L, "EN_ATTENTE_PAIEMENT");
        when(repo.findById(1L)).thenReturn(Optional.of(b));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        doThrow(new RuntimeException("event-service indisponible"))
            .when(eventClient).decrementPlaces(any(), any());

        mockMvc.perform(put("/api/bookings/1/confirmer"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.statut").value("CONFIRMEE"));
    }

    // ─── PUT /api/bookings/{id}/annuler ──────────────────────────────────────

    @Test
    void annuler_SetsStatutAnnulee() throws Exception {
        Booking b = makeBooking(1L, 1L, 10L, "EN_ATTENTE_PAIEMENT");
        when(repo.findById(1L)).thenReturn(Optional.of(b));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/bookings/1/annuler"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.statut").value("ANNULEE"));
    }

    @Test
    void annuler_CanCancelConfirmedBooking() throws Exception {
        Booking b = makeBooking(1L, 1L, 10L, "CONFIRMEE");
        when(repo.findById(1L)).thenReturn(Optional.of(b));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/bookings/1/annuler"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.statut").value("ANNULEE"));

        verify(repo).save(argThat(saved -> "ANNULEE".equals(saved.getStatut())));
    }
}
