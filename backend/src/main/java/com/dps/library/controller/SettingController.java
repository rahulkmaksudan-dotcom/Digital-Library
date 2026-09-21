package com.dps.library.controller;

import com.dps.library.dto.ApiResponse;
import com.dps.library.dto.SettingDto;
import com.dps.library.service.SettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
@Tag(name = "Settings", description = "Endpoints for dynamic library configurations (loan period, fines, etc.)")
public class SettingController {

    @Autowired
    private SettingService settingService;

    @GetMapping("/public")
    @Operation(summary = "Public Settings (Institution, Library Name, Loan Policy)")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPublicSettings() {
        return ResponseEntity.ok(ApiResponse.success("Public settings retrieved", settingService.getPublicSettings()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get All System Settings (Admin Only)")
    public ResponseEntity<ApiResponse<List<SettingDto>>> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.success("All settings retrieved", settingService.getAllSettings()));
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update Setting (Admin Only)")
    public ResponseEntity<ApiResponse<SettingDto>> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {

        String value = body.get("value");
        String description = body.get("description");
        SettingDto updated = settingService.updateSetting(key, value, description);
        return ResponseEntity.ok(ApiResponse.success("Setting updated successfully", updated));
    }
}

