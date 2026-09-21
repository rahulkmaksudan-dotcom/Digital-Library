package com.dps.library.repository;

import com.dps.library.entity.Fine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {
    Page<Fine> findByUserId(Long userId, Pageable pageable);
    List<Fine> findByUserIdAndStatus(Long userId, String status);
    Page<Fine> findByStatus(String status, Pageable pageable);
    Optional<Fine> findByLoanId(Long loanId);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM Fine f WHERE f.user.id = :userId AND f.status = 'PENDING'")
    BigDecimal sumPendingFinesByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM Fine f WHERE f.status = 'PENDING'")
    BigDecimal sumTotalPendingFines();

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM Fine f WHERE f.status = 'PAID'")
    BigDecimal sumTotalCollectedFines();

    @Query("SELECT f FROM Fine f WHERE " +
           "(:status IS NULL OR f.status = :status) AND " +
           "(:userId IS NULL OR f.user.id = :userId) AND " +
           "(:query IS NULL OR LOWER(f.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(f.user.studentId) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(f.loan.book.title) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Fine> searchFines(@Param("status") String status,
                           @Param("userId") Long userId,
                           @Param("query") String query,
                           Pageable pageable);
}

