package com.dps.library.controller;

import com.dps.library.dto.ApiResponse;
import com.dps.library.entity.Author;
import com.dps.library.exception.BadRequestException;
import com.dps.library.exception.ResourceNotFoundException;
import com.dps.library.repository.AuthorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/authors")
@Tag(name = "Authors", description = "Endpoints for authors directory and catalog linkage")
public class AuthorController {

    @Autowired
    private AuthorRepository authorRepository;

    @GetMapping
    @Operation(summary = "Get All Authors")
    public ResponseEntity<ApiResponse<List<Author>>> getAllAuthors() {
        return ResponseEntity.ok(ApiResponse.success("Authors retrieved", authorRepository.findAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Author by ID")
    public ResponseEntity<ApiResponse<Author>> getAuthorById(@PathVariable Long id) {
        Author author = authorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success("Author retrieved", author));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Create Author")
    public ResponseEntity<ApiResponse<Author>> createAuthor(@RequestBody Author author) {
        if (authorRepository.existsByName(author.getName())) {
            throw new BadRequestException("Author already exists: " + author.getName());
        }
        Author saved = authorRepository.save(author);
        return new ResponseEntity<>(ApiResponse.success("Author created", saved), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Update Author")
    public ResponseEntity<ApiResponse<Author>> updateAuthor(@PathVariable Long id, @RequestBody Author author) {
        Author existing = authorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + id));

        existing.setName(author.getName());
        existing.setBiography(author.getBiography());
        existing.setNationality(author.getNationality());
        Author saved = authorRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success("Author updated", saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Author")
    public ResponseEntity<ApiResponse<Void>> deleteAuthor(@PathVariable Long id) {
        authorRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Author deleted"));
    }
}

