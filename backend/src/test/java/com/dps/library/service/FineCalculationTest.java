package com.dps.library.service;

import com.dps.library.repository.FineRepository;
import com.dps.library.repository.LoanRepository;
import com.dps.library.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FineCalculationTest {

    @Mock
    private SettingService settingService;

    @Mock
    private FineRepository fineRepository;

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private FineService fineService;

    @Test
    @DisplayName("Should correctly calculate fine for 5 days overdue at 2.00 per day")
    void testFineCalculationOverdue() {
        when(settingService.getDecimalSetting("fine_per_day", new BigDecimal("2.00")))
            .thenReturn(new BigDecimal("2.00"));

        LocalDate dueDate = LocalDate.now().minusDays(5);
        LocalDate returnDate = LocalDate.now();

        BigDecimal fine = fineService.calculateOverdueFine(dueDate, returnDate);

        // 5 days * 2.00 = 10.00
        assertEquals(0, new BigDecimal("10.00").compareTo(fine));
    }

    @Test
    @DisplayName("Should return 0 fine when book is returned on or before due date")
    void testFineCalculationOnTime() {
        LocalDate dueDate = LocalDate.now().plusDays(2);
        LocalDate returnDate = LocalDate.now();

        BigDecimal fine = fineService.calculateOverdueFine(dueDate, returnDate);

        assertEquals(BigDecimal.ZERO, fine);
    }
}

