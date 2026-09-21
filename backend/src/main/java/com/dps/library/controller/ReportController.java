package com.dps.library.controller;

import com.dps.library.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports & CSV Exports", description = "Endpoints for downloading administrative CSV reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/export/books")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Export Books Inventory CSV")
    public ResponseEntity<byte[]> exportBooks() throws IOException {
        byte[] csv = reportService.exportBooksCsv();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"books_inventory.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }

    @GetMapping("/export/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export Users Directory CSV")
    public ResponseEntity<byte[]> exportUsers() throws IOException {
        byte[] csv = reportService.exportUsersCsv();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"users_directory.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }

    @GetMapping("/export/loans")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Export Circulation Loans CSV")
    public ResponseEntity<byte[]> exportLoans() throws IOException {
        byte[] csv = reportService.exportLoansCsv();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"loans_report.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }

    @GetMapping("/export/fines")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Export Fines Report CSV")
    public ResponseEntity<byte[]> exportFines() throws IOException {
        byte[] csv = reportService.exportFinesCsv();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fines_report.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }
}

