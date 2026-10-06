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
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN', 'FACULTY')")
    @Operation(summary = "Search Loans (Staff)", description = "Authorized staff and faculty can review all loan records across the college")
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
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Issue or Borrow Book", description = "Staff and faculty can issue books to any student/faculty. Students can self-borrow books.")
    public ResponseEntity<ApiResponse<LoanDto>> issueBook(
            @Valid @RequestBody IssueBookRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        boolean isStaffOrFaculty = currentUser.getAuthorities().stream().anyMatch(a ->
            a.getAuthority().equals("ROLE_ADMIN") ||
            a.getAuthority().equals("ROLE_LIBRARIAN") ||
            a.getAuthority().equals("ROLE_FACULTY")
        );

        if (!isStaffOrFaculty || request.getUserId() == null) {
            // Students can only borrow books for themselves, or default to current user if omitted
            request.setUserId(currentUser.getId());
        }

        LoanDto loan = loanService.issueBook(request, currentUser.getId(), currentUser.getEmail());
        return new ResponseEntity<>(ApiResponse.success("Book issued successfully", loan), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Return Book", description = "Staff, faculty, and borrowers can return books and release reservations")
    public ResponseEntity<ApiResponse<LoanDto>> returnBook(
            @PathVariable Long id,
            @RequestBody(required = false) ReturnBookRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        LoanDto loan = loanService.returnBook(id, request, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Book returned successfully", loan));
    }

    @PostMapping("/request")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Request to Borrow Book", description = "Patrons and students submit a borrow request for librarian/faculty approval")
    public ResponseEntity<ApiResponse<LoanDto>> requestLoan(
            @Valid @RequestBody IssueBookRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        request.setUserId(currentUser.getId());
        LoanDto loan = loanService.requestLoan(request, currentUser.getId(), currentUser.getEmail());
        return new ResponseEntity<>(ApiResponse.success("Borrow request submitted successfully. Awaiting approval.", loan), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/grant")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN', 'FACULTY')")
    @Operation(summary = "Grant Loan Permission", description = "Admin, librarian, or faculty grants borrow request permission")
    public ResponseEntity<ApiResponse<LoanDto>> grantLoan(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        LoanDto loan = loanService.grantLoan(id, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Loan permission granted and book issued successfully", loan));
    }

    @PostMapping("/{id}/revoke")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN', 'FACULTY')")
    @Operation(summary = "Revoke Loan or Request", description = "Admin, librarian, or faculty revokes a pending borrow request or active loan")
    public ResponseEntity<ApiResponse<LoanDto>> revokeLoan(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String reason = (body != null) ? body.get("reason") : null;
        LoanDto loan = loanService.revokeLoan(id, reason, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Loan revoked successfully", loan));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN', 'FACULTY')")
    @Operation(summary = "Get Pending Borrow Requests", description = "Staff/Faculty review all pending book borrow requests with book and student details")
    public ResponseEntity<ApiResponse<PagedResponse<LoanDto>>> getPendingRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PagedResponse<LoanDto> result = loanService.getPendingRequests(page, size);
        return ResponseEntity.ok(ApiResponse.success("Pending borrow requests retrieved", result));
    }

    @GetMapping("/my-pending")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get Current User's Pending Borrow Requests")
    public ResponseEntity<ApiResponse<PagedResponse<LoanDto>>> getMyPendingRequests(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<LoanDto> result = loanService.getUserPendingRequests(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("My pending requests retrieved", result));
    }

    @GetMapping("/check-book/{bookId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check current user loan status for a book")
    public ResponseEntity<ApiResponse<LoanDto>> checkUserBookStatus(
            @PathVariable Long bookId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        LoanDto status = loanService.checkUserBookLoanStatus(currentUser.getId(), bookId);
        return ResponseEntity.ok(ApiResponse.success("Book loan status retrieved", status));
    }
}

