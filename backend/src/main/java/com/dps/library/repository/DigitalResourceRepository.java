package com.dps.library.repository;

import com.dps.library.entity.DigitalResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DigitalResourceRepository extends JpaRepository<DigitalResource, Long> {
    Page<DigitalResource> findByStatus(String status, Pageable pageable);
    long countByStatus(String status);
    List<DigitalResource> findTop6ByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT r FROM DigitalResource r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:department IS NULL OR r.department = :department) AND " +
           "(:semester IS NULL OR r.semester = :semester) AND " +
           "(:subject IS NULL OR LOWER(r.subject) LIKE LOWER(CONCAT('%', :subject, '%'))) AND " +
           "(:resourceType IS NULL OR r.resourceType = :resourceType) AND " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:query IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.subject) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<DigitalResource> searchResources(@Param("status") String status,
                                          @Param("department") String department,
                                          @Param("semester") Integer semester,
                                          @Param("subject") String subject,
                                          @Param("resourceType") String resourceType,
                                          @Param("category") String category,
                                          @Param("query") String query,
                                          Pageable pageable);

    @Query("SELECT DISTINCT r.department FROM DigitalResource r WHERE r.department IS NOT NULL")
    List<String> findDistinctDepartments();

    @Query("SELECT DISTINCT r.subject FROM DigitalResource r WHERE r.subject IS NOT NULL")
    List<String> findDistinctSubjects();
}

