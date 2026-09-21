package com.dps.library.service;

import com.dps.library.dto.IssueBookRequest;
import com.dps.library.dto.LoanDto;
import com.dps.library.dto.ReturnBookRequest;
import com.dps.library.entity.Book;
import com.dps.library.entity.Loan;
import com.dps.library.entity.Role;
import com.dps.library.entity.User;
import com.dps.library.exception.BadRequestException;
import com.dps.library.repository.BookRepository;
import com.dps.library.repository.LoanRepository;
import com.dps.library.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LoanServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FineService fineService;

    @Mock
    private ReservationService reservationService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private SettingService settingService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private LoanService loanService;

    private User student;
    private User staff;
    private Book book;

    @BeforeEach
    void setUp() {
        Role studentRole = new Role(4L, "STUDENT", "Student role");
        student = new User();
        student.setId(10L);
        student.setEmail("student1@dpslibrary.edu");
        student.setFullName("Ashish Yadav");
        student.setStudentId("DPS2023CS001");
        student.setRole(studentRole);
        student.setActive(true);

        Role staffRole = new Role(2L, "LIBRARIAN", "Librarian role");
        staff = new User();
        staff.setId(2L);
        staff.setEmail("librarian@dpslibrary.edu");
        staff.setFullName("Sunita Verma");
        staff.setRole(staffRole);
        staff.setActive(true);

        book = new Book();
        book.setId(1L);
        book.setIsbn("978-0262033848");
        book.setTitle("Introduction to Algorithms");
        book.setAuthorName("Thomas H. Cormen");
        book.setTotalCopies(5);
        book.setAvailableCopies(5);
        book.setStatus("AVAILABLE");
    }

    @Test
    @DisplayName("Should issue book with default 10-day period and decrease available copies")
    void testIssueBookSuccess() {
        IssueBookRequest request = new IssueBookRequest();
        request.setUserId(student.getId());
        request.setBookId(book.getId());

        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(bookRepository.findById(book.getId())).thenReturn(Optional.of(book));
        when(settingService.getIntSetting("max_active_loans", 4)).thenReturn(4);
        when(loanRepository.countByUserIdAndStatus(student.getId(), "ACTIVE")).thenReturn(0L);
        when(loanRepository.findFirstByBookIdAndUserIdAndStatus(book.getId(), student.getId(), "ACTIVE")).thenReturn(Optional.empty());
        when(settingService.getIntSetting("loan_period_days", 10)).thenReturn(10);
        when(userRepository.findById(staff.getId())).thenReturn(Optional.of(staff));

        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> {
            Loan l = invocation.getArgument(0);
            l.setId(100L);
            return l;
        });

        LoanDto result = loanService.issueBook(request, staff.getId(), staff.getEmail());

        assertNotNull(result);
        assertEquals("ACTIVE", result.getStatus());
        assertEquals(LocalDate.now(), result.getIssueDate());
        assertEquals(LocalDate.now().plusDays(10), result.getDueDate());
        assertEquals(4, book.getAvailableCopies()); // Decremented by 1

        verify(bookRepository).save(book);
        verify(notificationService).createNotification(eq(student.getId()), anyString(), anyString(), eq("SUCCESS"), anyString());
    }

    @Test
    @DisplayName("Should prevent issuing book when available copies is zero")
    void testIssueBookFailsWhenZeroCopies() {
        book.setAvailableCopies(0);
        book.setStatus("UNAVAILABLE");

        IssueBookRequest request = new IssueBookRequest();
        request.setUserId(student.getId());
        request.setBookId(book.getId());

        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(bookRepository.findById(book.getId())).thenReturn(Optional.of(book));

        assertThrows(BadRequestException.class, () -> {
            loanService.issueBook(request, staff.getId(), staff.getEmail());
        });

        verify(loanRepository, never()).save(any(Loan.class));
    }

    @Test
    @DisplayName("Should return book, increment available copies and trigger reservation queue")
    void testReturnBookSuccess() {
        Loan loan = new Loan();
        loan.setId(50L);
        loan.setUser(student);
        loan.setBook(book);
        loan.setIssueDate(LocalDate.now().minusDays(5));
        loan.setDueDate(LocalDate.now().plusDays(5));
        loan.setStatus("ACTIVE");
        book.setAvailableCopies(4);

        when(loanRepository.findById(50L)).thenReturn(Optional.of(loan));
        when(userRepository.findById(staff.getId())).thenReturn(Optional.of(staff));
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LoanDto returned = loanService.returnBook(50L, new ReturnBookRequest("Good condition"), staff.getId(), staff.getEmail());

        assertNotNull(returned);
        assertEquals("RETURNED", returned.getStatus());
        assertEquals(LocalDate.now(), returned.getReturnDate());
        assertEquals(5, book.getAvailableCopies()); // Incremented back

        verify(reservationService).processNextEligibleReservation(book.getId());
        verify(notificationService).createNotification(eq(student.getId()), anyString(), anyString(), eq("SUCCESS"), anyString());
    }
}

