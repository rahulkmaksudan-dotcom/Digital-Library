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
           "(:subjectPattern IS NULL OR LOWER(r.subject) LIKE :subjectPattern) AND " +
           "(:resourceType IS NULL OR r.resourceType = :resourceType) AND " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:queryPattern IS NULL OR LOWER(r.title) LIKE :queryPattern " +
           "OR LOWER(r.description) LIKE :queryPattern " +
           "OR LOWER(r.subject) LIKE :queryPattern)")
    Page<DigitalResource> searchResources(@Param("status") String status,
                                          @Param("department") String department,
                                          @Param("semester") Integer semester,
                                          @Param("subjectPattern") String subjectPattern,
                                          @Param("resourceType") String resourceType,
                                          @Param("category") String category,
                                          @Param("queryPattern") String queryPattern,
                                          Pageable pageable);

    @Query("SELECT DISTINCT r.department FROM DigitalResource r WHERE r.department IS NOT NULL")
    List<String> findDistinctDepartments();

    @Query("SELECT DISTINCT r.subject FROM DigitalResource r WHERE r.subject IS NOT NULL")
    List<String> findDistinctSubjects();
}

