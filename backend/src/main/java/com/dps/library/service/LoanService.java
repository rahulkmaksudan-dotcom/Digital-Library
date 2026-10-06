package com.dps.library.service;

import com.dps.library.dto.IssueBookRequest;
import com.dps.library.dto.LoanDto;
import com.dps.library.dto.PagedResponse;
import com.dps.library.dto.ReturnBookRequest;
import com.dps.library.entity.Book;
import com.dps.library.entity.Loan;
import com.dps.library.entity.User;
import com.dps.library.exception.BadRequestException;
import com.dps.library.exception.ResourceNotFoundException;
import com.dps.library.repository.BookRepository;
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
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FineService fineService;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SettingService settingService;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public LoanDto issueBook(IssueBookRequest request, Long staffId, String staffEmail) {
        User student = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        if (!student.getActive()) {
            throw new BadRequestException("Student account is inactive and cannot borrow books.");
        }

        Book book = bookRepository.findById(request.getBookId())
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + request.getBookId()));

        // Business Rule: Check available copies > 0
        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("No available copies for \"" + book.getTitle() + "\". Please place a reservation instead.");
        }

        // Business Rule: Check maximum active loans limit
        int maxLoans = settingService.getIntSetting("max_active_loans", 4);
        long currentActiveLoans = loanRepository.countByUserIdAndStatus(student.getId(), "ACTIVE");
        if (currentActiveLoans >= maxLoans) {
            throw new BadRequestException("Borrower has reached the maximum limit of " + maxLoans + " active book loans.");
        }

        // Check if student already has this specific book active
        if (loanRepository.findFirstByBookIdAndUserIdAndStatus(book.getId(), student.getId(), "ACTIVE").isPresent()) {
            throw new BadRequestException("Borrower already has an active loan for this book.");
        }

        User staff = (staffId != null) ? userRepository.findById(staffId).orElse(null) : null;

        int loanDays = (request.getLoanDays() != null && request.getLoanDays() > 0)
            ? request.getLoanDays()
            : settingService.getIntSetting("loan_period_days", 10);

        LocalDate issueDate = (request.getIssueDate() != null) ? request.getIssueDate() : LocalDate.now();
        LocalDate dueDate = issueDate.plusDays(loanDays);

        Loan loan = new Loan();
        loan.setUser(student);
        loan.setBook(book);
        loan.setIssueDate(issueDate);
        loan.setDueDate(dueDate);
        loan.setStatus("ACTIVE");
        loan.setIssuedBy(staff);
        loan.setNotes(request.getNotes());
        loan.setFineAmount(BigDecimal.ZERO);

        Loan savedLoan = loanRepository.save(loan);

        // Atomic decrease available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        if (book.getAvailableCopies() == 0) {
            book.setStatus("UNAVAILABLE");
        }
        bookRepository.save(book);

        // In-app notification
        notificationService.createNotification(
            student.getId(),
            "Book Issued: " + book.getTitle(),
            "You have borrowed \"" + book.getTitle() + "\" (10-day period). Due Date: " + dueDate.toString() + ".",
            "SUCCESS",
            "/student/loans"
        );

        auditLogService.log(staffId, staffEmail, "BOOK_ISSUED", "Loan",
            String.valueOf(savedLoan.getId()), "Issued \"" + book.getTitle() + "\" to " + student.getFullName() + " (" + student.getEmail() + ")", "127.0.0.1");

        return mapToDto(savedLoan);
    }

    @Transactional
    public LoanDto returnBook(Long loanId, ReturnBookRequest request, Long staffId, String staffEmail) {
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));

        if ("RETURNED".equalsIgnoreCase(loan.getStatus())) {
            throw new BadRequestException("This book has already been marked as returned.");
        }

        LocalDate returnDate = LocalDate.now();
        loan.setReturnDate(returnDate);
        loan.setStatus("RETURNED");

        User staff = (staffId != null) ? userRepository.findById(staffId).orElse(null) : null;
        loan.setReturnedTo(staff);

        if (request != null && request.getNotes() != null) {
            loan.setNotes((loan.getNotes() != null ? loan.getNotes() + " | " : "") + request.getNotes());
        }

        // Calculate and record fine if overdue
        if (returnDate.isAfter(loan.getDueDate())) {
            fineService.recordOrUpdateFineForLoan(loan);
        }

        Loan savedLoan = loanRepository.save(loan);

        // Atomic increase available copies
        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        book.setStatus("AVAILABLE");
        bookRepository.save(book);

        // Trigger next reservation in queue
        reservationService.processNextEligibleReservation(book.getId());

        notificationService.createNotification(
            loan.getUser().getId(),
            "Book Returned: " + book.getTitle(),
            "Thank you! \"" + book.getTitle() + "\" was successfully returned on " + returnDate.toString() + ".",
            "SUCCESS",
            "/student/borrowing-history"
        );

        auditLogService.log(staffId, staffEmail, "BOOK_RETURNED", "Loan",
            String.valueOf(savedLoan.getId()), "Processed return of \"" + book.getTitle() + "\" from " + loan.getUser().getEmail(), "127.0.0.1");

        return mapToDto(savedLoan);
    }

    public PagedResponse<LoanDto> getUserLoans(Long userId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "issueDate"));
        Page<Loan> loanPage;

        if (status != null && !status.isEmpty()) {
            loanPage = loanRepository.findByUserIdAndStatus(userId, status, pageable);
        } else {
            loanPage = loanRepository.findByUserId(userId, pageable);
        }

        List<LoanDto> dtos = loanPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return new PagedResponse<>(dtos, loanPage.getNumber(), loanPage.getSize(),
            loanPage.getTotalElements(), loanPage.getTotalPages(), loanPage.isLast());
    }

    public PagedResponse<LoanDto> searchLoans(String status, Long userId, Long bookId, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "issueDate"));
        String queryPattern = (query != null && !query.trim().isEmpty())
            ? "%" + query.trim().toLowerCase() + "%"
            : null;
        Page<Loan> loanPage = loanRepository.searchLoans(
            (status != null && !status.isEmpty()) ? status : null,
            userId,
            bookId,
            queryPattern,
            pageable
        );

        List<LoanDto> dtos = loanPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return new PagedResponse<>(dtos, loanPage.getNumber(), loanPage.getSize(),
            loanPage.getTotalElements(), loanPage.getTotalPages(), loanPage.isLast());
    }

    public LoanDto getLoanById(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));
        return mapToDto(loan);
    }

    @Transactional
    public LoanDto requestLoan(IssueBookRequest request, Long studentId, String studentEmail) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + studentId));

        if (!student.getActive()) {
            throw new BadRequestException("Student account is inactive and cannot request book loans.");
        }

        Book book = bookRepository.findById(request.getBookId())
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + request.getBookId()));

        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("No copies of \"" + book.getTitle() + "\" are currently available to borrow. Please place a reservation instead.");
        }

        // Check if student already has a pending request or active loan for this book
        java.util.Optional<Loan> existing = loanRepository.findFirstByBookIdAndUserIdAndStatusIn(
            book.getId(), student.getId(), java.util.List.of("PENDING", "ACTIVE")
        );
        if (existing.isPresent()) {
            if ("PENDING".equalsIgnoreCase(existing.get().getStatus())) {
                throw new BadRequestException("You already have a pending borrow request for \"" + book.getTitle() + "\". Awaiting librarian/faculty approval.");
            } else {
                throw new BadRequestException("You already have an active loan for \"" + book.getTitle() + "\".");
            }
        }

        int maxLoans = settingService.getIntSetting("max_active_loans", 4);
        long currentActiveLoans = loanRepository.countByUserIdAndStatus(student.getId(), "ACTIVE");
        if (currentActiveLoans >= maxLoans) {
            throw new BadRequestException("Borrower has reached the maximum limit of " + maxLoans + " active book loans.");
        }

        int loanDays = (request.getLoanDays() != null && request.getLoanDays() > 0)
            ? request.getLoanDays()
            : settingService.getIntSetting("loan_period_days", 10);

        LocalDate issueDate = LocalDate.now();
        LocalDate dueDate = issueDate.plusDays(loanDays);

        Loan loan = new Loan();
        loan.setUser(student);
        loan.setBook(book);
        loan.setIssueDate(issueDate);
        loan.setDueDate(dueDate);
        loan.setStatus("PENDING");
        loan.setFineAmount(BigDecimal.ZERO);
        loan.setNotes(request.getNotes() != null && !request.getNotes().trim().isEmpty()
            ? request.getNotes().trim()
            : "Borrow request submitted by student");

        Loan saved = loanRepository.save(loan);

        notificationService.createNotification(
            student.getId(),
            "Borrow Request Submitted: " + book.getTitle(),
            "Your borrow request for \"" + book.getTitle() + "\" has been submitted. Awaiting approval from the Library Committee / Librarian.",
            "INFO",
            "/student/my-books"
        );

        auditLogService.log(student.getId(), studentEmail, "BORROW_REQUESTED", "Loan",
            String.valueOf(saved.getId()), "Submitted borrow request for \"" + book.getTitle() + "\"", "127.0.0.1");

        return mapToDto(saved);
    }

    @Transactional
    public LoanDto grantLoan(Long loanId, Long staffId, String staffEmail) {
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));

        if (!"PENDING".equalsIgnoreCase(loan.getStatus())) {
            throw new BadRequestException("Only pending borrow requests can be granted. Current status is " + loan.getStatus());
        }

        Book book = loan.getBook();
        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("Cannot grant loan: No available copies for \"" + book.getTitle() + "\".");
        }

        User staff = (staffId != null) ? userRepository.findById(staffId).orElse(null) : null;
        LocalDate now = LocalDate.now();

        loan.setStatus("ACTIVE");
        loan.setIssueDate(now);
        loan.setDueDate(now.plusDays(10));
        loan.setIssuedBy(staff);
        String approvalNote = "Approved by " + (staff != null ? staff.getFullName() : staffEmail);
        loan.setNotes(loan.getNotes() != null ? loan.getNotes() + " | " + approvalNote : approvalNote);

        Loan saved = loanRepository.save(loan);

        // Atomic decrease available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        if (book.getAvailableCopies() == 0) {
            book.setStatus("UNAVAILABLE");
        }
        bookRepository.save(book);

        notificationService.createNotification(
            loan.getUser().getId(),
            "Borrow Request Approved: " + book.getTitle(),
            "Your request to borrow \"" + book.getTitle() + "\" has been approved! Due Date: " + loan.getDueDate().toString() + ". Please collect the book from the circulation desk.",
            "SUCCESS",
            "/student/my-books"
        );

        auditLogService.log(staffId, staffEmail, "LOAN_GRANTED", "Loan",
            String.valueOf(saved.getId()), "Approved loan of \"" + book.getTitle() + "\" to " + loan.getUser().getFullName(), "127.0.0.1");

        return mapToDto(saved);
    }

    @Transactional
    public LoanDto revokeLoan(Long loanId, String reason, Long staffId, String staffEmail) {
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));

        if ("RETURNED".equalsIgnoreCase(loan.getStatus()) || "REVOKED".equalsIgnoreCase(loan.getStatus())) {
            throw new BadRequestException("Loan is already " + loan.getStatus().toLowerCase() + ".");
        }

        String note = (reason != null && !reason.trim().isEmpty()) ? reason.trim() : "Revoked by library staff";
        User staff = (staffId != null) ? userRepository.findById(staffId).orElse(null) : null;

        if ("PENDING".equalsIgnoreCase(loan.getStatus())) {
            loan.setStatus("REVOKED");
            loan.setNotes((loan.getNotes() != null ? loan.getNotes() + " | " : "") + "Revoked: " + note);
            Loan saved = loanRepository.save(loan);

            notificationService.createNotification(
                loan.getUser().getId(),
                "Borrow Request Declined: " + loan.getBook().getTitle(),
                "Your borrow request for \"" + loan.getBook().getTitle() + "\" was not approved. Reason: " + note,
                "WARNING",
                "/student/borrowing-history"
            );

            auditLogService.log(staffId, staffEmail, "LOAN_REQUEST_REVOKED", "Loan",
                String.valueOf(saved.getId()), "Revoked borrow request for \"" + loan.getBook().getTitle() + "\" of " + loan.getUser().getEmail(), "127.0.0.1");

            return mapToDto(saved);
        } else {
            // ACTIVE loan revocation
            loan.setStatus("REVOKED");
            loan.setReturnDate(LocalDate.now());
            loan.setReturnedTo(staff);
            loan.setNotes((loan.getNotes() != null ? loan.getNotes() + " | " : "") + "Revoked: " + note);
            Loan saved = loanRepository.save(loan);

            Book book = loan.getBook();
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            book.setStatus("AVAILABLE");
            bookRepository.save(book);

            reservationService.processNextEligibleReservation(book.getId());

            notificationService.createNotification(
                loan.getUser().getId(),
                "Active Loan Revoked: " + book.getTitle(),
                "Your loan for \"" + book.getTitle() + "\" has been revoked by library administration. Reason: " + note,
                "WARNING",
                "/student/borrowing-history"
            );

            auditLogService.log(staffId, staffEmail, "LOAN_ACTIVE_REVOKED", "Loan",
                String.valueOf(saved.getId()), "Revoked active loan for \"" + book.getTitle() + "\" of " + loan.getUser().getEmail(), "127.0.0.1");

            return mapToDto(saved);
        }
    }

    public PagedResponse<LoanDto> getPendingRequests(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Loan> loanPage = loanRepository.findByStatusOrderByCreatedAtDesc("PENDING", pageable);
        List<LoanDto> dtos = loanPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
        return new PagedResponse<>(dtos, loanPage.getNumber(), loanPage.getSize(),
            loanPage.getTotalElements(), loanPage.getTotalPages(), loanPage.isLast());
    }

    public PagedResponse<LoanDto> getUserPendingRequests(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Loan> loanPage = loanRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "PENDING", pageable);
        List<LoanDto> dtos = loanPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
        return new PagedResponse<>(dtos, loanPage.getNumber(), loanPage.getSize(),
            loanPage.getTotalElements(), loanPage.getTotalPages(), loanPage.isLast());
    }

    public LoanDto checkUserBookLoanStatus(Long userId, Long bookId) {
        return loanRepository.findFirstByBookIdAndUserIdAndStatusIn(bookId, userId, java.util.List.of("PENDING", "ACTIVE"))
            .map(this::mapToDto)
            .orElse(null);
    }

    public LoanDto mapToDto(Loan l) {
        LoanDto dto = new LoanDto();
        dto.setId(l.getId());
        dto.setUserId(l.getUser().getId());
        dto.setUserName(l.getUser().getFullName());
        dto.setUserEmail(l.getUser().getEmail());
        dto.setStudentId(l.getUser().getStudentId());
        dto.setUserDepartment(l.getUser().getDepartment());
        dto.setUserPhone(l.getUser().getPhone());

        dto.setBookId(l.getBook().getId());
        dto.setBookTitle(l.getBook().getTitle());
        dto.setBookIsbn(l.getBook().getIsbn());
        dto.setBookCover(l.getBook().getCoverImage());
        dto.setAuthorName(l.getBook().getAuthorName());
        dto.setCategoryName(l.getBook().getCategoryName());
        dto.setShelfNumber(l.getBook().getShelfNumber());
        dto.setLocation(l.getBook().getLocation());
        dto.setAvailableCopies(l.getBook().getAvailableCopies());
        dto.setTotalCopies(l.getBook().getTotalCopies());

        dto.setIssueDate(l.getIssueDate());
        dto.setDueDate(l.getDueDate());
        dto.setReturnDate(l.getReturnDate());
        dto.setStatus(l.getStatus());
        dto.setFineAmount(l.getFineAmount());

        LocalDate endDate = (l.getReturnDate() != null) ? l.getReturnDate() : LocalDate.now();
        if (l.getDueDate() != null && endDate.isAfter(l.getDueDate())) {
            dto.setDaysOverdue(ChronoUnit.DAYS.between(l.getDueDate(), endDate));
        } else {
            dto.setDaysOverdue(0L);
        }

        if (l.getIssuedBy() != null) {
            dto.setIssuedByName(l.getIssuedBy().getFullName());
        }
        if (l.getReturnedTo() != null) {
            dto.setReturnedToName(l.getReturnedTo().getFullName());
        }
        dto.setNotes(l.getNotes());
        dto.setCreatedAt(l.getCreatedAt());
        return dto;
    }
}

