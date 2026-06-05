package com.billetterie.booking.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name="bookings")
public class Booking {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private Long eventId;
    private Integer nombrePlaces;
    private Double prixUnitaire;
    private String statut;
    private LocalDateTime dateReservation;
}
