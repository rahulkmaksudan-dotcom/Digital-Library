package com.dps.library.controller;

import com.dps.library.dto.ApiResponse;
import com.dps.library.dto.BookDto;
import com.dps.library.dto.PagedResponse;
import com.dps.library.security.UserPrincipal;
import com.dps.library.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/favorites")
@Tag(name = "Favorites", description = "Endpoints for student book wishlists")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @GetMapping
    @Operation(summary = "Get User Favorites")
    public ResponseEntity<ApiResponse<PagedResponse<BookDto>>> getMyFavorites(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        PagedResponse<BookDto> result = favoriteService.getUserFavorites(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Favorites retrieved", result));
    }

    @PostMapping("/{bookId}")
    @Operation(summary = "Add Book to Favorites")
    public ResponseEntity<ApiResponse<Void>> addFavorite(
            @PathVariable Long bookId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        favoriteService.addFavorite(currentUser.getId(), bookId);
        return ResponseEntity.ok(ApiResponse.success("Book added to favorites"));
    }

    @DeleteMapping("/{bookId}")
    @Operation(summary = "Remove Book from Favorites")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @PathVariable Long bookId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        favoriteService.removeFavorite(currentUser.getId(), bookId);
        return ResponseEntity.ok(ApiResponse.success("Book removed from favorites"));
    }

    @GetMapping("/check/{bookId}")
    @Operation(summary = "Check Favorite Status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkFavorite(
            @PathVariable Long bookId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        boolean isFav = favoriteService.isFavorite(currentUser.getId(), bookId);
        return ResponseEntity.ok(ApiResponse.success("Favorite status", Map.of("isFavorite", isFav)));
    }
}

