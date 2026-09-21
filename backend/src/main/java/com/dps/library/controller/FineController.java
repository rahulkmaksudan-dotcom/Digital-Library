package com.dps.library.controller;

import com.dps.library.dto.ApiResponse;
import com.dps.library.dto.FineDto;
import com.dps.library.dto.PagedResponse;
import com.dps.library.security.UserPrincipal;
import com.dps.library.service.FineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/fines")
@Tag(name = "Fines", description = "Endpoints for library overdue fine management, collection, and waivers")
public class FineController {

    @Autowired
    private FineService fineService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Search Fines (Staff)")
    public ResponseEntity<ApiResponse<PagedResponse<FineDto>>> searchFines(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<FineDto> result = fineService.searchFines(status, userId, query, page, size);
        return ResponseEntity.ok(ApiResponse.success("Fines retrieved", result));
    }

    @GetMapping("/my-fines")
    @Operation(summary = "Get Current User's Fines")
    public ResponseEntity<ApiResponse<PagedResponse<FineDto>>> getMyFines(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<FineDto> result = fineService.getUserFines(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("My fines retrieved", result));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Collect Fine Payment")
    public ResponseEntity<ApiResponse<FineDto>> payFine(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String paymentMethod = (body != null && body.containsKey("paymentMethod")) ? body.get("paymentMethod") : "CASH";
        FineDto fine = fineService.payFine(id, paymentMethod, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Fine payment recorded", fine));
    }

    @PostMapping("/{id}/waive")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Waive Fine (Admin Only)")
    public ResponseEntity<ApiResponse<FineDto>> waiveFine(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Administrative Waiver";
        FineDto fine = fineService.waiveFine(id, currentUser.getId(), currentUser.getEmail(), reason);
        return ResponseEntity.ok(ApiResponse.success("Fine waived successfully", fine));
    }
}

