package com.dps.library.service;

import com.dps.library.dto.FineDto;
import com.dps.library.dto.PagedResponse;
import com.dps.library.entity.Fine;
import com.dps.library.entity.Loan;
import com.dps.library.entity.User;
import com.dps.library.exception.BadRequestException;
import com.dps.library.exception.ResourceNotFoundException;
import com.dps.library.repository.FineRepository;
import com.dps.library.repository.LoanRepository;
import com.dps.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FineService {

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SettingService settingService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationService notificationService;

    public BigDecimal getFinePerDay() {
        return settingService.getDecimalSetting("fine_per_day", new BigDecimal("2.00"));
    }

    public BigDecimal calculateOverdueFine(LocalDate dueDate, LocalDate returnDate) {
        LocalDate endDate = (returnDate != null) ? returnDate : LocalDate.now();
        if (endDate.isAfter(dueDate)) {
            long days = ChronoUnit.DAYS.between(dueDate, endDate);
            BigDecimal rate = getFinePerDay();
            return rate.multiply(BigDecimal.valueOf(days));
        }
        return BigDecimal.ZERO;
    }

    @Transactional
    public Fine recordOrUpdateFineForLoan(Loan loan) {
        LocalDate endDate = (loan.getReturnDate() != null) ? loan.getReturnDate() : LocalDate.now();
        if (!endDate.isAfter(loan.getDueDate())) {
            return null;
        }

        int daysOverdue = (int) ChronoUnit.DAYS.between(loan.getDueDate(), endDate);
        BigDecimal amount = getFinePerDay().multiply(BigDecimal.valueOf(daysOverdue));

        Fine fine = fineRepository.findByLoanId(loan.getId()).orElseGet(() -> {
            Fine f = new Fine();
            f.setLoan(loan);
            f.setUser(loan.getUser());
            return f;
        });

        fine.setDaysOverdue(daysOverdue);
        fine.setAmount(amount);
        if ("PAID".equals(fine.getStatus()) && loan.getReturnDate() == null) {
            // Already paid previously but still unreturned
        } else if (!"PAID".equals(fine.getStatus()) && !"WAIVED".equals(fine.getStatus())) {
            fine.setStatus("PENDING");
        }

        return fineRepository.save(fine);
    }

    public PagedResponse<FineDto> getUserFines(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Fine> finePage = fineRepository.findByUserId(userId, pageable);

        List<FineDto> dtos = finePage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return new PagedResponse<>(dtos, finePage.getNumber(), finePage.getSize(),
            finePage.getTotalElements(), finePage.getTotalPages(), finePage.isLast());
    }

    public PagedResponse<FineDto> searchFines(String status, Long userId, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Fine> finePage = fineRepository.searchFines(
            (status != null && !status.isEmpty()) ? status : null,
            userId,
            (query != null && !query.isEmpty()) ? query : null,
            pageable
        );

        List<FineDto> dtos = finePage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return new PagedResponse<>(dtos, finePage.getNumber(), finePage.getSize(),
            finePage.getTotalElements(), finePage.getTotalPages(), finePage.isLast());
    }

    @Transactional
    public FineDto payFine(Long fineId, String paymentMethod, Long staffId, String staffEmail) {
        Fine fine = fineRepository.findById(fineId)
            .orElseThrow(() -> new ResourceNotFoundException("Fine record not found with id: " + fineId));

        if ("PAID".equalsIgnoreCase(fine.getStatus())) {
            throw new BadRequestException("This fine has already been paid");
        }

        fine.setStatus("PAID");
        fine.setPaymentMethod(paymentMethod != null ? paymentMethod : "CASH");
        fine.setPaidAt(LocalDateTime.now());
        Fine saved = fineRepository.save(fine);

        // Update loan fine amount
        Loan loan = fine.getLoan();
        loan.setFineAmount(saved.getAmount());
        loanRepository.save(loan);

        notificationService.createNotification(
            fine.getUser().getId(),
            "Fine Paid Successfully",
            "Your fine of Rs. " + saved.getAmount() + " for \"" + loan.getBook().getTitle() + "\" has been recorded as paid via " + fine.getPaymentMethod() + ".",
            "SUCCESS",
            "/student/fines"
        );

        auditLogService.log(staffId, staffEmail, "FINE_PAID", "Fine",
            String.valueOf(saved.getId()), "Collected fine Rs. " + saved.getAmount() + " from " + fine.getUser().getEmail(), "127.0.0.1");

        return mapToDto(saved);
    }

    @Transactional
    public FineDto waiveFine(Long fineId, Long adminId, String adminEmail, String reason) {
        Fine fine = fineRepository.findById(fineId)
            .orElseThrow(() -> new ResourceNotFoundException("Fine record not found with id: " + fineId));

        fine.setStatus("WAIVED");
        fine.setPaymentMethod("WAIVED_BY_ADMIN");
        fine.setPaidAt(LocalDateTime.now());
        Fine saved = fineRepository.save(fine);

        notificationService.createNotification(
            fine.getUser().getId(),
            "Fine Waived",
            "Your fine of Rs. " + saved.getAmount() + " for \"" + fine.getLoan().getBook().getTitle() + "\" was waived by the library administration.",
            "INFO",
            "/student/fines"
        );

        auditLogService.log(adminId, adminEmail, "FINE_WAIVED", "Fine",
            String.valueOf(saved.getId()), "Waived fine Rs. " + saved.getAmount() + " for user " + fine.getUser().getEmail() + ". Reason: " + reason, "127.0.0.1");

        return mapToDto(saved);
    }

    public BigDecimal getUserPendingFinesSum(Long userId) {
        return fineRepository.sumPendingFinesByUserId(userId);
    }

    public FineDto mapToDto(Fine f) {
        FineDto dto = new FineDto();
        dto.setId(f.getId());
        dto.setLoanId(f.getLoan().getId());
        dto.setUserId(f.getUser().getId());
        dto.setUserName(f.getUser().getFullName());
        dto.setStudentId(f.getUser().getStudentId());
        dto.setBookTitle(f.getLoan().getBook().getTitle());
        dto.setAmount(f.getAmount());
        dto.setDaysOverdue(f.getDaysOverdue());
        dto.setStatus(f.getStatus());
        dto.setPaymentMethod(f.getPaymentMethod());
        dto.setPaidAt(f.getPaidAt());
        dto.setCreatedAt(f.getCreatedAt());
        return dto;
    }
}

