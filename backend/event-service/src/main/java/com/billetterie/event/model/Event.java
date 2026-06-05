package com.billetterie.event.model;

import jakarta.persistence.*;
import lombok.Data;

@Data @Entity @Table(name="events")
public class Event {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private Long annonceurId;
    private String titre;
    private String description;
    private String categorie;
    private String lieu;
    private String date;
    private Double prix;
    private Integer placesDisponibles;
    private String imageUrl;
    private String statut = "EN_ATTENTE";
}
