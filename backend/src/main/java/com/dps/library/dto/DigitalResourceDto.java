package com.dps.library.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class DigitalResourceDto {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private String category;
    private String subject;
    private Integer semester;
    private String department;
    private String academicYear;
    private String resourceType = "NOTES"; // NOTES, SYLLABUS, QUESTION_PAPER, LAB_MANUAL, STUDY_MATERIAL, EBOOK
    private Long uploadedById;
    private String uploadedByName;
    private Long approvedById;
    private String approvedByName;
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED
    private Integer downloadsCount = 0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DigitalResourceDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public Long getUploadedById() { return uploadedById; }
    public void setUploadedById(Long uploadedById) { this.uploadedById = uploadedById; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public Long getApprovedById() { return approvedById; }
    public void setApprovedById(Long approvedById) { this.approvedById = approvedById; }

    public String getApprovedByName() { return approvedByName; }
    public void setApprovedByName(String approvedByName) { this.approvedByName = approvedByName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getDownloadsCount() { return downloadsCount; }
    public void setDownloadsCount(Integer downloadsCount) { this.downloadsCount = downloadsCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

