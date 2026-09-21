package com.dps.library.controller;

import com.dps.library.dto.*;
import com.dps.library.security.UserPrincipal;
import com.dps.library.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/loans")
@Tag(name = "Loans", description = "Endpoints for library book circulation, issue, return, and loan tracking")
public class LoanController {

    @Autowired
    private LoanService loanService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Search Loans (Staff)", description = "Staff can filter all book loans across the college")
    public ResponseEntity<ApiResponse<PagedResponse<LoanDto>>> searchLoans(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<LoanDto> result = loanService.searchLoans(status, userId, bookId, query, page, size);
        return ResponseEntity.ok(ApiResponse.success("Loans retrieved", result));
    }

    @GetMapping("/my-loans")
    @Operation(summary = "Get Current User's Active Loans", description = "Student/Faculty current active book borrowings")
    public ResponseEntity<ApiResponse<PagedResponse<LoanDto>>> getMyActiveLoans(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<LoanDto> result = loanService.getUserLoans(currentUser.getId(), "ACTIVE", page, size);
        return ResponseEntity.ok(ApiResponse.success("Active loans retrieved", result));
    }

    @GetMapping("/my-history")
    @Operation(summary = "Get Complete Borrowing History", description = "All past and present book loans of the student")
    public ResponseEntity<ApiResponse<PagedResponse<LoanDto>>> getMyHistory(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<LoanDto> result = loanService.getUserLoans(currentUser.getId(), status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Borrowing history retrieved", result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Loan by ID")
    public ResponseEntity<ApiResponse<LoanDto>> getLoanById(@PathVariable Long id) {
        LoanDto loan = loanService.getLoanById(id);
        return ResponseEntity.ok(ApiResponse.success("Loan retrieved", loan));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Issue Book", description = "Staff issues a book to a student with 10-day period")
    public ResponseEntity<ApiResponse<LoanDto>> issueBook(
            @Valid @RequestBody IssueBookRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        LoanDto loan = loanService.issueBook(request, currentUser.getId(), currentUser.getEmail());
        return new ResponseEntity<>(ApiResponse.success("Book issued successfully", loan), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Return Book", description = "Staff records book deposit, recalculates fines and releases reservations")
    public ResponseEntity<ApiResponse<LoanDto>> returnBook(
            @PathVariable Long id,
            @RequestBody(required = false) ReturnBookRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        LoanDto loan = loanService.returnBook(id, request, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Book returned successfully", loan));
    }
}

