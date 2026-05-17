package com.billetterie.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name="event-service", url="${event.service.url}")
public interface EventClient {
    @PutMapping("/api/events/{id}/decrement")
    void decrementPlaces(@PathVariable Long id, @RequestParam int nombre);
}
