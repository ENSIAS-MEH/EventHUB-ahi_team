package com.billetterie.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name="event-service", url="http://localhost:8082")
public interface EventClient {
    @PutMapping("/api/events/{id}/decrement")
    void decrementPlaces(@PathVariable Long id);
}
