package com.karaoke.backend.web;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/")
    Map<String, Object> index() {
        return Map.of(
                "service", "karaoke-backend",
                "status", "UP",
                "apiBase", "/api",
                "endpoints", List.of(
                        "/api/health",
                        "/api/auth/login",
                        "/api/customers",
                        "/api/rooms",
                        "/api/menu-items",
                        "/api/orders",
                        "/api/reports/summary"
                )
        );
    }

    @GetMapping("/api/health")
    Map<String, Object> health() {
        return Map.of("status", "UP", "service", "karaoke-backend", "timestamp", Instant.now());
    }
}
