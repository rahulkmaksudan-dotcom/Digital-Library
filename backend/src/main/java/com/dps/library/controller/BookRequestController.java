package com.dps.library.controller;

import com.dps.library.dto.ApiResponse;
import com.dps.library.dto.BookRequestDto;
import com.dps.library.dto.PagedResponse;
import com.dps.library.security.UserPrincipal;
import com.dps.library.service.BookRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/book-requests")
@Tag(name = "Book Requests", description = "Endpoints for students requesting unavailable titles and procurement tracking")
public class BookRequestController {

    @Autowired
    private BookRequestService bookRequestService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Search Book Requests (Staff)")
    public ResponseEntity<ApiResponse<PagedResponse<BookRequestDto>>> searchRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<BookRequestDto> result = bookRequestService.searchRequests(status, userId, query, page, size);
        return ResponseEntity.ok(ApiResponse.success("Book requests retrieved", result));
    }

    @GetMapping("/my-requests")
    @Operation(summary = "Get Current User's Book Requests")
    public ResponseEntity<ApiResponse<PagedResponse<BookRequestDto>>> getMyRequests(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<BookRequestDto> result = bookRequestService.getUserRequests(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("My book requests retrieved", result));
    }

    @PostMapping
    @Operation(summary = "Submit Book Request")
    public ResponseEntity<ApiResponse<BookRequestDto>> createRequest(
            @Valid @RequestBody BookRequestDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        BookRequestDto created = bookRequestService.createRequest(dto, currentUser.getId());
        return new ResponseEntity<>(ApiResponse.success("Request submitted successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Update Request Status (Staff)")
    public ResponseEntity<ApiResponse<BookRequestDto>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String status = body.get("status");
        String adminComment = body.get("adminComment");
        BookRequestDto updated = bookRequestService.updateRequestStatus(id, status, adminComment, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Request status updated", updated));
    }
}

