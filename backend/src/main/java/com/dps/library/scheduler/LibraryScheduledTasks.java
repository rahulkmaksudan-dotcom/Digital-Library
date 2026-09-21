package com.dps.library.scheduler;

import com.dps.library.entity.Loan;
import com.dps.library.entity.Reservation;
import com.dps.library.repository.LoanRepository;
import com.dps.library.repository.ReservationRepository;
import com.dps.library.service.FineService;
import com.dps.library.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class LibraryScheduledTasks {

    private static final Logger logger = LoggerFactory.getLogger(LibraryScheduledTasks.class);

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private FineService fineService;

    /**
     * Run daily at 1:00 AM (or every 6 hours) to check for upcoming and overdue books
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void processDailyDueAndOverdueAlerts() {
        logger.info("Executing scheduled task: Checking due dates and overdue fines...");
        LocalDate today = LocalDate.now();

        // 1. Alert 3 days before due date
        LocalDate threeDaysBefore = today.plusDays(3);
        List<Loan> dueIn3Days = loanRepository.findByStatusAndDueDate("ACTIVE", threeDaysBefore);
        for (Loan loan : dueIn3Days) {
            notificationService.createNotification(
                loan.getUser().getId(),
                "Reminder: Book Due in 3 Days",
                "Your loan for \"" + loan.getBook().getTitle() + "\" is due on " + loan.getDueDate() + ". Please return or renew on time.",
                "DUE_REMINDER",
                "/student/loans"
            );
        }

        // 2. Alert 1 day before due date
        LocalDate oneDayBefore = today.plusDays(1);
        List<Loan> dueTomorrow = loanRepository.findByStatusAndDueDate("ACTIVE", oneDayBefore);
        for (Loan loan : dueTomorrow) {
            notificationService.createNotification(
                loan.getUser().getId(),
                "URGENT: Book Due Tomorrow",
                "Your loan for \"" + loan.getBook().getTitle() + "\" is due tomorrow (" + loan.getDueDate() + "). Avoid late fines.",
                "WARNING",
                "/student/loans"
            );
        }

        // 3. Alert on due date
        List<Loan> dueToday = loanRepository.findByStatusAndDueDate("ACTIVE", today);
        for (Loan loan : dueToday) {
            notificationService.createNotification(
                loan.getUser().getId(),
                "Book Due Today",
                "Today is the due date for \"" + loan.getBook().getTitle() + "\". Please deposit the book at the library circulation desk today.",
                "WARNING",
                "/student/loans"
            );
        }

        // 4. Check all loans past due date
        List<Loan> pastDueLoans = loanRepository.findByStatusAndDueDateBefore("ACTIVE", today);
        for (Loan loan : pastDueLoans) {
            loan.setStatus("OVERDUE");
            fineService.recordOrUpdateFineForLoan(loan);
            loanRepository.save(loan);

            notificationService.createNotification(
                loan.getUser().getId(),
                "OVERDUE NOTICE: Action Required",
                "Your loan for \"" + loan.getBook().getTitle() + "\" is overdue. Late fines are currently accruing at Rs. " + fineService.getFinePerDay() + " per day.",
                "OVERDUE",
                "/student/fines"
            );
        }

        // 5. Expire reservations past their expiry date
        List<Reservation> expiredReservations = reservationRepository.findByStatusAndExpiryDateBefore("ACTIVE", LocalDateTime.now());
        for (Reservation res : expiredReservations) {
            res.setStatus("EXPIRED");
            reservationRepository.save(res);

            notificationService.createNotification(
                res.getUser().getId(),
                "Reservation Expired",
                "Your reservation hold period for \"" + res.getBook().getTitle() + "\" has expired.",
                "INFO",
                "/student/reservations"
            );
        }

        logger.info("Scheduled task finished successfully.");
    }
}

