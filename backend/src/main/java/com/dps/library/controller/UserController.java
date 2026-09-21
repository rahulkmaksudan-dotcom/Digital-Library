package com.dps.library.controller;

import com.dps.library.dto.ApiResponse;
import com.dps.library.dto.PagedResponse;
import com.dps.library.dto.UserDto;
import com.dps.library.security.UserPrincipal;
import com.dps.library.service.UserService;
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
@RequestMapping("/api/v1/users")
@Tag(name = "Users Management", description = "Endpoints for managing student, faculty, and staff user accounts")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Search Users")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> searchUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<UserDto> result = userService.searchUsers(role, department, query, page, size);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get User by ID")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved", user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create User (Admin Only)")
    public ResponseEntity<ApiResponse<UserDto>> createUser(
            @Valid @RequestBody UserDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        UserDto created = userService.createUser(dto, currentUser.getId(), currentUser.getEmail());
        return new ResponseEntity<>(ApiResponse.success("User created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update User (Admin Only)")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        UserDto updated = userService.updateUser(id, dto, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate/Deactivate User Account")
    public ResponseEntity<ApiResponse<Void>> toggleUserActive(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        userService.toggleUserActive(id, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("User status toggled successfully"));
    }
}

