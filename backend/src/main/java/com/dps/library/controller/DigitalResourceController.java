package com.dps.library.controller;

import com.dps.library.dto.ApiResponse;
import com.dps.library.dto.DigitalResourceDto;
import com.dps.library.dto.PagedResponse;
import com.dps.library.security.UserPrincipal;
import com.dps.library.service.DigitalResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/resources")
@Tag(name = "Digital Resources", description = "Endpoints for digital academic materials (notes, syllabus, question papers, lab manuals)")
public class DigitalResourceController {

    @Autowired
    private DigitalResourceService resourceService;

    @GetMapping("/public")
    @Operation(summary = "Search Approved Resources (Public & Students)")
    public ResponseEntity<ApiResponse<PagedResponse<DigitalResourceDto>>> getPublicResources(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        PagedResponse<DigitalResourceDto> result = resourceService.searchResources(
            "APPROVED", department, semester, subject, resourceType, category, query, page, size
        );
        return ResponseEntity.ok(ApiResponse.success("Approved resources retrieved", result));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Search All Resources (Staff)")
    public ResponseEntity<ApiResponse<PagedResponse<DigitalResourceDto>>> getAllResources(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        PagedResponse<DigitalResourceDto> result = resourceService.searchResources(
            status, department, semester, subject, resourceType, category, query, page, size
        );
        return ResponseEntity.ok(ApiResponse.success("Resources retrieved", result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Resource Details")
    public ResponseEntity<ApiResponse<DigitalResourceDto>> getResourceById(@PathVariable Long id) {
        DigitalResourceDto resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(ApiResponse.success("Resource retrieved", resource));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload Academic Resource")
    public ResponseEntity<ApiResponse<DigitalResourceDto>> uploadResource(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "semester", required = false) Integer semester,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "academicYear", required = false) String academicYear,
            @RequestParam(value = "resourceType", required = false) String resourceType,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        boolean isStaff = currentUser != null &&
            ("ADMIN".equalsIgnoreCase(currentUser.getRole()) || "LIBRARIAN".equalsIgnoreCase(currentUser.getRole()));

        DigitalResourceDto dto = resourceService.uploadResource(
            file, title, description, category, subject, semester,
            department, academicYear, resourceType,
            currentUser != null ? currentUser.getId() : null,
            isStaff
        );

        return new ResponseEntity<>(ApiResponse.success("Resource uploaded successfully", dto), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Approve or Reject Resource")
    public ResponseEntity<ApiResponse<DigitalResourceDto>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String status = body.get("status");
        DigitalResourceDto updated = resourceService.approveOrRejectResource(
            id, status, currentUser.getId(), currentUser.getEmail()
        );
        return ResponseEntity.ok(ApiResponse.success("Resource status updated", updated));
    }

    @GetMapping("/download/{fileName:.+}")
    @Operation(summary = "Download Resource File", description = "Secure streaming endpoint validating path traversal and file headers")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        Resource resource = resourceService.getFileForDownload(fileName);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (Exception ex) {
            // default fallback
        }
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
            .body(resource);
    }

    @GetMapping("/departments")
    @Operation(summary = "Get Academic Departments")
    public ResponseEntity<ApiResponse<List<String>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.success("Departments retrieved", resourceService.getDepartments()));
    }

    @GetMapping("/subjects")
    @Operation(summary = "Get Academic Subjects")
    public ResponseEntity<ApiResponse<List<String>>> getSubjects() {
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved", resourceService.getSubjects()));
    }
}

