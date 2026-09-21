package com.dps.library.repository;

import com.dps.library.entity.BookRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRequestRepository extends JpaRepository<BookRequest, Long> {
    Page<BookRequest> findByUserId(Long userId, Pageable pageable);
    Page<BookRequest> findByStatus(String status, Pageable pageable);
    long countByStatus(String status);

    @Query("SELECT r FROM BookRequest r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:userId IS NULL OR r.user.id = :userId) AND " +
           "(:query IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.author) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<BookRequest> searchRequests(@Param("status") String status,
                                     @Param("userId") Long userId,
                                     @Param("query") String query,
                                     Pageable pageable);
}

