package com.billetterie.event.repository;

import com.billetterie.event.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByAnnonceurId(Long annonceurId);
    List<Event> findByStatut(String statut);
}
