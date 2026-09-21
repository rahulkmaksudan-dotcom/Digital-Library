package com.dps.library.repository;

import com.dps.library.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<AuditLog> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:entity IS NULL OR a.entity = :entity) AND " +
           "(:query IS NULL OR LOWER(a.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.userEmail) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<AuditLog> searchLogs(@Param("action") String action,
                              @Param("entity") String entity,
                              @Param("query") String query,
                              Pageable pageable);
}

