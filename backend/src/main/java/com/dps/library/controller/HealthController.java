package com.dps.library.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now().toString(),
            "project", "DIGITAL LIBRARY MANAGEMENT SYSTEM",
            "institution", "Thakur Shree DPS College of Engineering and Management",
            "team", List.of("Ashish Yadav", "Rahul Yadav", "Priyanshu Yadav")
        ));
    }
}

