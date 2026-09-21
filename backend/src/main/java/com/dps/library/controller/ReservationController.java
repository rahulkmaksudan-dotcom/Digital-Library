package com.dps.library.controller;

import com.dps.library.dto.ApiResponse;
import com.dps.library.dto.PagedResponse;
import com.dps.library.dto.ReservationDto;
import com.dps.library.security.UserPrincipal;
import com.dps.library.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reservations")
@Tag(name = "Reservations", description = "Endpoints for reserving unavailable books and queue management")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Search Reservations (Staff)")
    public ResponseEntity<ApiResponse<PagedResponse<ReservationDto>>> searchReservations(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<ReservationDto> result = reservationService.searchReservations(status, userId, query, page, size);
        return ResponseEntity.ok(ApiResponse.success("Reservations retrieved", result));
    }

    @GetMapping("/my-reservations")
    @Operation(summary = "Get Current User's Reservations")
    public ResponseEntity<ApiResponse<PagedResponse<ReservationDto>>> getMyReservations(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<ReservationDto> result = reservationService.getUserReservations(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("My reservations retrieved", result));
    }

    @PostMapping("/{bookId}")
    @Operation(summary = "Reserve Book", description = "Student places a hold reservation on a book")
    public ResponseEntity<ApiResponse<ReservationDto>> createReservation(
            @PathVariable Long bookId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ReservationDto reservation = reservationService.createReservation(bookId, currentUser.getId());
        return new ResponseEntity<>(ApiResponse.success("Reservation placed successfully", reservation), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel Reservation")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole()) || "LIBRARIAN".equalsIgnoreCase(currentUser.getRole());
        reservationService.cancelReservation(id, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled successfully"));
    }
}

