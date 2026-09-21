package com.dps.library.service;

import com.dps.library.dto.DashboardStatsDto;
import com.dps.library.entity.Loan;
import com.dps.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.util.*;

@Service
public class AnalyticsService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private BookRequestRepository bookRequestRepository;

    @Autowired
    private DigitalResourceRepository digitalResourceRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    public DashboardStatsDto getSystemStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        stats.setTotalBooks(bookRepository.count());
        stats.setTotalCopies(bookRepository.sumTotalCopies());
        stats.setAvailableCopies(bookRepository.sumAvailableCopies());
        stats.setDigitalResourcesCount(digitalResourceRepository.countByStatus("APPROVED"));

        stats.setTotalStudents(userRepository.countByRoleName("STUDENT"));
        stats.setTotalFaculty(userRepository.countByRoleName("FACULTY"));
        stats.setTotalLibrarians(userRepository.countByRoleName("LIBRARIAN"));

        stats.setActiveLoans(loanRepository.countByStatus("ACTIVE"));
        stats.setOverdueLoans(loanRepository.countByStatus("OVERDUE"));
        stats.setReturnedLoans(loanRepository.countByStatus("RETURNED"));

        stats.setActiveReservations(reservationRepository.countByStatus("ACTIVE"));
        stats.setPendingRequests(bookRequestRepository.countByStatus("PENDING"));

        stats.setTotalFinesPending(fineRepository.sumTotalPendingFines());
        stats.setTotalFinesCollected(fineRepository.sumTotalCollectedFines());

        // Category distribution
        List<Map<String, Object>> catList = new ArrayList<>();
        List<Object[]> catRows = bookRepository.countBooksByCategory();
        for (Object[] row : catRows) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0] != null ? row[0] : "General");
            map.put("count", row[1]);
            catList.add(map);
        }
        stats.setCategoryDistribution(catList);

        // Popular books
        List<Map<String, Object>> popBooks = new ArrayList<>();
        List<Object[]> popRows = loanRepository.findMostBorrowedBooks(PageRequest.of(0, 5));
        for (Object[] row : popRows) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("title", row[1]);
            map.put("loans", row[2]);
            popBooks.add(map);
        }
        stats.setPopularBooks(popBooks);

        // Monthly loans (Sample monthly data aggregated)
        List<Map<String, Object>> monthly = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"};
        int[] counts = {12, 18, 25, 30, 22, 28, 35, 42, 38};
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> map = new HashMap<>();
            map.put("month", months[i]);
            map.put("loans", counts[i]);
            monthly.add(map);
        }
        stats.setMonthlyLoans(monthly);

        return stats;
    }

    public DashboardStatsDto getStudentStats(Long userId) {
        DashboardStatsDto stats = getSystemStats();

        long activeLoans = loanRepository.countByUserIdAndStatus(userId, "ACTIVE");
        long overdueLoans = loanRepository.countByUserIdAndStatus(userId, "OVERDUE");

        // Due soon (within next 3 days)
        LocalDate now = LocalDate.now();
        LocalDate threeDaysLater = now.plusDays(3);
        List<Loan> userActiveLoans = loanRepository.findByUserIdAndStatus(userId, "ACTIVE");
        long dueSoon = userActiveLoans.stream()
            .filter(l -> !l.getDueDate().isBefore(now) && !l.getDueDate().isAfter(threeDaysLater))
            .count();

        BigDecimal pendingFines = fineRepository.sumPendingFinesByUserId(userId);
        long reservations = reservationRepository.countByStatus("ACTIVE");
        long favorites = favoriteRepository.findByUserId(userId, PageRequest.of(0, 1)).getTotalElements();

        stats.setMyActiveLoans(activeLoans);
        stats.setMyDueSoon(dueSoon);
        stats.setMyOverdue(overdueLoans);
        stats.setMyPendingFines(pendingFines != null ? pendingFines : BigDecimal.ZERO);
        stats.setMyReservations(reservations);
        stats.setMyFavorites(favorites);

        return stats;
    }
}

