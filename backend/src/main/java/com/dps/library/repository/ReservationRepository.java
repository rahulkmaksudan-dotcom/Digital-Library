package com.dps.library.repository;

import com.dps.library.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Page<Reservation> findByUserId(Long userId, Pageable pageable);
    List<Reservation> findByUserIdAndStatus(Long userId, String status);
    Page<Reservation> findByStatus(String status, Pageable pageable);
    long countByStatus(String status);

    boolean existsByBookIdAndUserIdAndStatus(Long bookId, Long userId, String status);

    Optional<Reservation> findFirstByBookIdAndStatusOrderByReservationDateAsc(Long bookId, String status);

    List<Reservation> findByStatusAndExpiryDateBefore(String status, LocalDateTime date);

    @Query("SELECT r FROM Reservation r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:userId IS NULL OR r.user.id = :userId) AND " +
           "(:query IS NULL OR LOWER(r.book.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Reservation> searchReservations(@Param("status") String status,
                                         @Param("userId") Long userId,
                                         @Param("query") String query,
                                         Pageable pageable);
}

