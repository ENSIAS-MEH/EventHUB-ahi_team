package com.billetterie.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "event-service", url = "${EVENT_SERVICE_URL:http://event-service:8082}")
public interface EventClient {
    @PutMapping("/api/events/{id}/decrement")
    void decrementPlaces(@PathVariable("id") Long id, @RequestParam("count") Integer count);
}
