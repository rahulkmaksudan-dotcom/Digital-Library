package com.dps.library.service;

import com.dps.library.dto.BookRequestDto;
import com.dps.library.dto.PagedResponse;
import com.dps.library.entity.BookRequest;
import com.dps.library.entity.User;
import com.dps.library.exception.ResourceNotFoundException;
import com.dps.library.repository.BookRequestRepository;
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
import java.util.stream.Collectors;

@Service
public class BookRequestService {

    @Autowired
    private BookRequestRepository bookRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public BookRequestDto createRequest(BookRequestDto dto, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        BookRequest request = new BookRequest();
        request.setUser(user);
        request.setTitle(dto.getTitle().trim());
        request.setAuthor(dto.getAuthor());
        request.setIsbn(dto.getIsbn());
        request.setReason(dto.getReason());
        request.setStatus("PENDING");

        BookRequest saved = bookRequestRepository.save(request);

        notificationService.createNotification(
            userId,
            "Book Request Submitted",
            "Your request for \"" + saved.getTitle() + "\" has been received and queued for review.",
            "INFO",
            "/student/requests"
        );

        return mapToDto(saved);
    }

    public PagedResponse<BookRequestDto> getUserRequests(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BookRequest> reqPage = bookRequestRepository.findByUserId(userId, pageable);

        List<BookRequestDto> dtos = reqPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return new PagedResponse<>(dtos, reqPage.getNumber(), reqPage.getSize(),
            reqPage.getTotalElements(), reqPage.getTotalPages(), reqPage.isLast());
    }

    public PagedResponse<BookRequestDto> searchRequests(String status, Long userId, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BookRequest> reqPage = bookRequestRepository.searchRequests(
            (status != null && !status.isEmpty()) ? status : null,
            userId,
            (query != null && !query.isEmpty()) ? query : null,
            pageable
        );

        List<BookRequestDto> dtos = reqPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return new PagedResponse<>(dtos, reqPage.getNumber(), reqPage.getSize(),
            reqPage.getTotalElements(), reqPage.getTotalPages(), reqPage.isLast());
    }

    @Transactional
    public BookRequestDto updateRequestStatus(Long requestId, String status, String adminComment, Long staffId, String staffEmail) {
        BookRequest request = bookRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Book request not found with id: " + requestId));

        request.setStatus(status.toUpperCase());
        if (adminComment != null) {
            request.setAdminComment(adminComment);
        }
        request.setUpdatedAt(LocalDateTime.now());

        BookRequest saved = bookRequestRepository.save(request);

        String notifMsg = "Your book request for \"" + saved.getTitle() + "\" status is now: " + saved.getStatus();
        if (adminComment != null && !adminComment.isBlank()) {
            notifMsg += ". Note: " + adminComment;
        }

        notificationService.createNotification(
            saved.getUser().getId(),
            "Book Request Update: " + saved.getStatus(),
            notifMsg,
            "INFO",
            "/student/requests"
        );

        auditLogService.log(staffId, staffEmail, "REQUEST_STATUS_UPDATED", "BookRequest",
            String.valueOf(saved.getId()), "Updated request status to " + saved.getStatus() + " for " + saved.getTitle(), "127.0.0.1");

        return mapToDto(saved);
    }

    public BookRequestDto mapToDto(BookRequest r) {
        BookRequestDto dto = new BookRequestDto();
        dto.setId(r.getId());
        dto.setUserId(r.getUser().getId());
        dto.setUserName(r.getUser().getFullName());
        dto.setStudentId(r.getUser().getStudentId());
        dto.setTitle(r.getTitle());
        dto.setAuthor(r.getAuthor());
        dto.setIsbn(r.getIsbn());
        dto.setReason(r.getReason());
        dto.setStatus(r.getStatus());
        dto.setAdminComment(r.getAdminComment());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }
}

