package com.dps.library.repository;

import com.dps.library.entity.Loan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    Page<Loan> findByUserId(Long userId, Pageable pageable);
    Page<Loan> findByUserIdAndStatus(Long userId, String status, Pageable pageable);
    List<Loan> findByUserIdAndStatus(Long userId, String status);
    long countByUserIdAndStatus(Long userId, String status);

    Page<Loan> findByStatus(String status, Pageable pageable);
    long countByStatus(String status);

    Optional<Loan> findFirstByBookIdAndUserIdAndStatus(Long bookId, Long userId, String status);

    List<Loan> findByStatusAndDueDateBefore(String status, LocalDate date);

    List<Loan> findByStatusAndDueDate(String status, LocalDate date);

    List<Loan> findByStatusAndDueDateBetween(String status, LocalDate startDate, LocalDate endDate);

    @Query("SELECT l FROM Loan l WHERE " +
           "(:status IS NULL OR l.status = :status) AND " +
           "(:userId IS NULL OR l.user.id = :userId) AND " +
           "(:bookId IS NULL OR l.book.id = :bookId) AND " +
           "(:query IS NULL OR LOWER(l.book.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(l.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(l.user.studentId) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Loan> searchLoans(@Param("status") String status,
                           @Param("userId") Long userId,
                           @Param("bookId") Long bookId,
                           @Param("query") String query,
                           Pageable pageable);

    @Query("SELECT l.book.id, l.book.title, COUNT(l) as cnt FROM Loan l GROUP BY l.book.id, l.book.title ORDER BY cnt DESC")
    List<Object[]> findMostBorrowedBooks(Pageable pageable);

    @Query("SELECT l.user.id, l.user.fullName, l.user.studentId, COUNT(l) as cnt FROM Loan l GROUP BY l.user.id, l.user.fullName, l.user.studentId ORDER BY cnt DESC")
    List<Object[]> findMostActiveBorrowers(Pageable pageable);
}

