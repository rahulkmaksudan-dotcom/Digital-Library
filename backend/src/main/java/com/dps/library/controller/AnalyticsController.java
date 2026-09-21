package com.dps.library.controller;

import com.dps.library.dto.ApiResponse;
import com.dps.library.dto.DashboardStatsDto;
import com.dps.library.security.UserPrincipal;
import com.dps.library.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@Tag(name = "Analytics", description = "Endpoints for library statistics, KPIs, and visual charts")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/overview")
    @Operation(summary = "Homepage Live Statistics", description = "Public counts for total books, digital resources, students, and loans issued")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPublicOverview() {
        DashboardStatsDto stats = analyticsService.getSystemStats();
        Map<String, Object> map = new HashMap<>();
        map.put("totalBooks", stats.getTotalBooks());
        map.put("totalCopies", stats.getTotalCopies());
        map.put("digitalResources", stats.getDigitalResourcesCount());
        map.put("registeredStudents", stats.getTotalStudents());
        map.put("totalLoansIssued", stats.getActiveLoans() + stats.getReturnedLoans());
        return ResponseEntity.ok(ApiResponse.success("Overview stats", map));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Staff Dashboard Analytics", description = "Comprehensive metrics, category breakdowns, and monthly loan counts")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = analyticsService.getSystemStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats", stats));
    }

    @GetMapping("/student")
    @Operation(summary = "Student Dashboard Analytics", description = "Personalized borrowing stats, due soon count, fines, and activity")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStudentDashboardStats(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        DashboardStatsDto stats = analyticsService.getStudentStats(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Student stats", stats));
    }
}

