package com.dps.library.service;

import com.dps.library.dto.DigitalResourceDto;
import com.dps.library.dto.PagedResponse;
import com.dps.library.entity.DigitalResource;
import com.dps.library.entity.User;
import com.dps.library.exception.BadRequestException;
import com.dps.library.exception.ResourceNotFoundException;
import com.dps.library.repository.DigitalResourceRepository;
import com.dps.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DigitalResourceService {

    @Autowired
    private DigitalResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    public PagedResponse<DigitalResourceDto> searchResources(String status, String department, Integer semester,
                                                             String subject, String resourceType, String category,
                                                             String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<DigitalResource> resourcePage = resourceRepository.searchResources(
            (status != null && !status.isEmpty()) ? status : null,
            (department != null && !department.isEmpty()) ? department : null,
            semester,
            (subject != null && !subject.isEmpty()) ? subject : null,
            (resourceType != null && !resourceType.isEmpty()) ? resourceType : null,
            (category != null && !category.isEmpty()) ? category : null,
            (query != null && !query.isEmpty()) ? query : null,
            pageable
        );

        List<DigitalResourceDto> dtos = resourcePage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return new PagedResponse<>(dtos, resourcePage.getNumber(), resourcePage.getSize(),
            resourcePage.getTotalElements(), resourcePage.getTotalPages(), resourcePage.isLast());
    }

    public List<DigitalResourceDto> getRecentApprovedResources() {
        return resourceRepository.findTop6ByStatusOrderByCreatedAtDesc("APPROVED").stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public DigitalResourceDto getResourceById(Long id) {
        DigitalResource resource = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Digital resource not found with id: " + id));
        return mapToDto(resource);
    }

    @Transactional
    public DigitalResourceDto uploadResource(MultipartFile file, String title, String description,
                                             String category, String subject, Integer semester,
                                             String department, String academicYear, String resourceType,
                                             Long uploaderId, boolean autoApprove) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        String storedFilename = fileStorageService.storeFile(file);
        User uploader = (uploaderId != null) ? userRepository.findById(uploaderId).orElse(null) : null;

        DigitalResource res = new DigitalResource();
        res.setTitle(title.trim());
        res.setDescription(description);
        res.setFileName(storedFilename);
        res.setFileUrl("/api/v1/resources/download/" + storedFilename);
        res.setFileType(file.getContentType());
        res.setFileSize(file.getSize());
        res.setCategory(category);
        res.setSubject(subject);
        res.setSemester(semester);
        res.setDepartment(department);
        res.setAcademicYear(academicYear);
        res.setResourceType(resourceType != null ? resourceType.toUpperCase() : "NOTES");
        res.setUploadedBy(uploader);

        if (autoApprove) {
            res.setStatus("APPROVED");
            res.setApprovedBy(uploader);
        } else {
            res.setStatus("PENDING");
        }

        DigitalResource saved = resourceRepository.save(res);

        if (uploader != null) {
            auditLogService.log(uploader.getId(), uploader.getEmail(), "RESOURCE_UPLOADED", "DigitalResource",
                String.valueOf(saved.getId()), "Uploaded resource: " + saved.getTitle(), "127.0.0.1");
        }

        return mapToDto(saved);
    }

    @Transactional
    public DigitalResourceDto approveOrRejectResource(Long id, String status, Long staffId, String staffEmail) {
        DigitalResource res = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        res.setStatus(status.toUpperCase());
        User approver = userRepository.findById(staffId).orElse(null);
        res.setApprovedBy(approver);
        res.setUpdatedAt(LocalDateTime.now());

        DigitalResource saved = resourceRepository.save(res);

        if (res.getUploadedBy() != null) {
            notificationService.createNotification(
                res.getUploadedBy().getId(),
                "Resource Status: " + saved.getStatus(),
                "Your uploaded resource \"" + saved.getTitle() + "\" has been " + saved.getStatus().toLowerCase() + ".",
                "INFO",
                "/resources"
            );
        }

        auditLogService.log(staffId, staffEmail, "RESOURCE_" + status.toUpperCase(), "DigitalResource",
            String.valueOf(saved.getId()), status.toUpperCase() + " resource: " + saved.getTitle(), "127.0.0.1");

        return mapToDto(saved);
    }

    @Transactional
    public Resource getFileForDownload(String fileName) {
        // Find resource if exists and increment downloads
        // Also allow direct sample files
        resourceRepository.findAll().stream()
            .filter(r -> r.getFileName().equalsIgnoreCase(fileName))
            .findFirst()
            .ifPresent(r -> {
                r.setDownloadsCount(r.getDownloadsCount() + 1);
                resourceRepository.save(r);
            });

        return fileStorageService.loadFileAsResource(fileName);
    }

    public List<String> getDepartments() {
        return resourceRepository.findDistinctDepartments();
    }

    public List<String> getSubjects() {
        return resourceRepository.findDistinctSubjects();
    }

    public DigitalResourceDto mapToDto(DigitalResource r) {
        DigitalResourceDto dto = new DigitalResourceDto();
        dto.setId(r.getId());
        dto.setTitle(r.getTitle());
        dto.setDescription(r.getDescription());
        dto.setFileName(r.getFileName());
        dto.setFileUrl(r.getFileUrl());
        dto.setFileType(r.getFileType());
        dto.setFileSize(r.getFileSize());
        dto.setCategory(r.getCategory());
        dto.setSubject(r.getSubject());
        dto.setSemester(r.getSemester());
        dto.setDepartment(r.getDepartment());
        dto.setAcademicYear(r.getAcademicYear());
        dto.setResourceType(r.getResourceType());
        if (r.getUploadedBy() != null) {
            dto.setUploadedById(r.getUploadedBy().getId());
            dto.setUploadedByName(r.getUploadedBy().getFullName());
        }
        if (r.getApprovedBy() != null) {
            dto.setApprovedById(r.getApprovedBy().getId());
            dto.setApprovedByName(r.getApprovedBy().getFullName());
        }
        dto.setStatus(r.getStatus());
        dto.setDownloadsCount(r.getDownloadsCount());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }
}

