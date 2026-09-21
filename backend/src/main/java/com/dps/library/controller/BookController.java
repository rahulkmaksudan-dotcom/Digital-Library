package com.dps.library.controller;

import com.dps.library.dto.ApiResponse;
import com.dps.library.dto.BookDto;
import com.dps.library.dto.PagedResponse;
import com.dps.library.security.UserPrincipal;
import com.dps.library.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
@Tag(name = "Books", description = "Endpoints for book catalog, search, and inventory management")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    @Operation(summary = "Search & Filter Books", description = "Public catalog search with multiple filters, sorting, and pagination")
    public ResponseEntity<ApiResponse<PagedResponse<BookDto>>> searchBooks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String bookType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean digitalOnly,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        PagedResponse<BookDto> result = bookService.searchBooks(
            query, categoryId, authorId, language, bookType, status,
            digitalOnly, availableOnly, sortBy, direction, page, size
        );
        return ResponseEntity.ok(ApiResponse.success("Books retrieved successfully", result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Book Details", description = "Retrieves complete book metadata, shelf location, and copy availability")
    public ResponseEntity<ApiResponse<BookDto>> getBookById(@PathVariable Long id) {
        BookDto book = bookService.getBookById(id);
        return ResponseEntity.ok(ApiResponse.success("Book details retrieved", book));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get Featured Books", description = "Returns featured and recently added books for the homepage")
    public ResponseEntity<ApiResponse<List<BookDto>>> getFeaturedBooks() {
        List<BookDto> featured = bookService.getFeaturedBooks();
        return ResponseEntity.ok(ApiResponse.success("Featured books retrieved", featured));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Add New Book", description = "Librarian or Admin adds a new title to the inventory")
    public ResponseEntity<ApiResponse<BookDto>> createBook(
            @Valid @RequestBody BookDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        BookDto created = bookService.createBook(dto, currentUser.getId(), currentUser.getEmail());
        return new ResponseEntity<>(ApiResponse.success("Book added successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Update Book", description = "Modify book metadata, copies, or status")
    public ResponseEntity<ApiResponse<BookDto>> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        BookDto updated = bookService.updateBook(id, dto, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Book", description = "Remove book from catalog (only if no active loans)")
    public ResponseEntity<ApiResponse<Void>> deleteBook(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        bookService.deleteBook(id, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully"));
    }
}

