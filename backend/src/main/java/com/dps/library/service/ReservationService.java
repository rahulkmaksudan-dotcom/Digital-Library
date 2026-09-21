package com.dps.library.service;

import com.dps.library.dto.PagedResponse;
import com.dps.library.dto.ReservationDto;
import com.dps.library.entity.Book;
import com.dps.library.entity.Reservation;
import com.dps.library.entity.User;
import com.dps.library.exception.BadRequestException;
import com.dps.library.exception.ResourceNotFoundException;
import com.dps.library.exception.UnauthorizedException;
import com.dps.library.repository.BookRepository;
import com.dps.library.repository.ReservationRepository;
import com.dps.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SettingService settingService;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public ReservationDto createReservation(Long bookId, Long userId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if student already has an active reservation for this book
        if (reservationRepository.existsByBookIdAndUserIdAndStatus(bookId, userId, "ACTIVE")) {
            throw new BadRequestException("You already have an active reservation for \"" + book.getTitle() + "\"");
        }

        int expiryDays = settingService.getIntSetting("reservation_expiry_days", 3);

        Reservation reservation = new Reservation();
        reservation.setBook(book);
        reservation.setUser(user);
        reservation.setReservationDate(LocalDateTime.now());
        reservation.setExpiryDate(LocalDateTime.now().plusDays(expiryDays));
        reservation.setStatus("ACTIVE");

        Reservation saved = reservationRepository.save(reservation);

        notificationService.createNotification(
            userId,
            "Reservation Placed",
            "You have reserved \"" + book.getTitle() + "\". You will be notified immediately when a copy is returned.",
            "RESERVATION",
            "/student/reservations"
        );

        auditLogService.log(userId, user.getEmail(), "BOOK_RESERVED", "Reservation",
            String.valueOf(saved.getId()), "Reserved book: " + book.getTitle(), "127.0.0.1");

        return mapToDto(saved);
    }

    @Transactional
    public void cancelReservation(Long reservationId, Long userId, boolean isAdmin) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        if (!isAdmin && !reservation.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to cancel this reservation");
        }

        reservation.setStatus("CANCELLED");
        reservationRepository.save(reservation);

        notificationService.createNotification(
            reservation.getUser().getId(),
            "Reservation Cancelled",
            "Your reservation for \"" + reservation.getBook().getTitle() + "\" has been cancelled.",
            "INFO",
            "/student/reservations"
        );
    }

    public PagedResponse<ReservationDto> getUserReservations(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reservationDate"));
        Page<Reservation> resPage = reservationRepository.findByUserId(userId, pageable);

        List<ReservationDto> dtos = resPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return new PagedResponse<>(dtos, resPage.getNumber(), resPage.getSize(),
            resPage.getTotalElements(), resPage.getTotalPages(), resPage.isLast());
    }

    public PagedResponse<ReservationDto> searchReservations(String status, Long userId, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reservationDate"));
        Page<Reservation> resPage = reservationRepository.searchReservations(
            (status != null && !status.isEmpty()) ? status : null,
            userId,
            (query != null && !query.isEmpty()) ? query : null,
            pageable
        );

        List<ReservationDto> dtos = resPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return new PagedResponse<>(dtos, resPage.getNumber(), resPage.getSize(),
            resPage.getTotalElements(), resPage.getTotalPages(), resPage.isLast());
    }

    /**
     * Process next reservation when a copy becomes available
     */
    @Transactional
    public void processNextEligibleReservation(Long bookId) {
        Optional<Reservation> nextRes = reservationRepository.findFirstByBookIdAndStatusOrderByReservationDateAsc(bookId, "ACTIVE");
        if (nextRes.isPresent()) {
            Reservation reservation = nextRes.get();
            int expiryDays = settingService.getIntSetting("reservation_expiry_days", 3);
            reservation.setNotifiedAt(LocalDateTime.now());
            reservation.setExpiryDate(LocalDateTime.now().plusDays(expiryDays));
            reservationRepository.save(reservation);

            notificationService.createNotification(
                reservation.getUser().getId(),
                "Reserved Book Available for Pickup!",
                "Great news! \"" + reservation.getBook().getTitle() + "\" is now available at the library desk. Please collect it within " + expiryDays + " days.",
                "RESERVATION_AVAILABLE",
                "/student/reservations"
            );
        }
    }

    public ReservationDto mapToDto(Reservation r) {
        ReservationDto dto = new ReservationDto();
        dto.setId(r.getId());
        dto.setBookId(r.getBook().getId());
        dto.setBookTitle(r.getBook().getTitle());
        dto.setBookIsbn(r.getBook().getIsbn());
        dto.setBookCover(r.getBook().getCoverImage());
        dto.setUserId(r.getUser().getId());
        dto.setUserName(r.getUser().getFullName());
        dto.setStudentId(r.getUser().getStudentId());
        dto.setReservationDate(r.getReservationDate());
        dto.setExpiryDate(r.getExpiryDate());
        dto.setStatus(r.getStatus());
        dto.setNotifiedAt(r.getNotifiedAt());
        return dto;
    }
}

