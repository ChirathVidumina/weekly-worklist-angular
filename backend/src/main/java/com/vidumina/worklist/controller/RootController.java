package com.vidumina.worklist.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@Tag(name = "Root / Health", description = "Application health and entrypoint status")
public class RootController {

    @GetMapping("/")
    @Operation(summary = "Service Health & Discovery", description = "Returns API status and endpoint discovery URLs")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "application", "Weekly Worklist Management API",
                "version", "1.0.0",
                "timestamp", Instant.now().toString(),
                "documentation", "/swagger-ui.html",
                "apiPrefix", "/api/v1",
                "endpoints", Map.of(
                        "tasks", "/api/v1/tasks",
                        "categories", "/api/v1/categories"
                )
        ));
    }
}
