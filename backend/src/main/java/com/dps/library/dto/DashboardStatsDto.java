package com.dps.library.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private long totalBooks;
    private long totalCopies;
    private long availableCopies;
    private long digitalResourcesCount;
    private long totalStudents;
    private long totalFaculty;
    private long totalLibrarians;
    private long activeLoans;
    private long overdueLoans;
    private long returnedLoans;
    private long activeReservations;
    private long pendingRequests;
    private BigDecimal totalFinesPending;
    private BigDecimal totalFinesCollected;

    // Student personal stats (when requested for student dashboard)
    private Long myActiveLoans;
    private Long myDueSoon;
    private Long myOverdue;
    private BigDecimal myPendingFines;
    private Long myReservations;
    private Long myFavorites;

    // Charts / Visual metrics
    private List<Map<String, Object>> categoryDistribution;
    private List<Map<String, Object>> monthlyLoans;
    private List<Map<String, Object>> popularBooks;

    public DashboardStatsDto() {}

    public long getTotalBooks() { return totalBooks; }
    public void setTotalBooks(long totalBooks) { this.totalBooks = totalBooks; }

    public long getTotalCopies() { return totalCopies; }
    public void setTotalCopies(long totalCopies) { this.totalCopies = totalCopies; }

    public long getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(long availableCopies) { this.availableCopies = availableCopies; }

    public long getDigitalResourcesCount() { return digitalResourcesCount; }
    public void setDigitalResourcesCount(long digitalResourcesCount) { this.digitalResourcesCount = digitalResourcesCount; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalFaculty() { return totalFaculty; }
    public void setTotalFaculty(long totalFaculty) { this.totalFaculty = totalFaculty; }

    public long getTotalLibrarians() { return totalLibrarians; }
    public void setTotalLibrarians(long totalLibrarians) { this.totalLibrarians = totalLibrarians; }

    public long getActiveLoans() { return activeLoans; }
    public void setActiveLoans(long activeLoans) { this.activeLoans = activeLoans; }

    public long getOverdueLoans() { return overdueLoans; }
    public void setOverdueLoans(long overdueLoans) { this.overdueLoans = overdueLoans; }

    public long getReturnedLoans() { return returnedLoans; }
    public void setReturnedLoans(long returnedLoans) { this.returnedLoans = returnedLoans; }

    public long getActiveReservations() { return activeReservations; }
    public void setActiveReservations(long activeReservations) { this.activeReservations = activeReservations; }

    public long getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(long pendingRequests) { this.pendingRequests = pendingRequests; }

    public BigDecimal getTotalFinesPending() { return totalFinesPending; }
    public void setTotalFinesPending(BigDecimal totalFinesPending) { this.totalFinesPending = totalFinesPending; }

    public BigDecimal getTotalFinesCollected() { return totalFinesCollected; }
    public void setTotalFinesCollected(BigDecimal totalFinesCollected) { this.totalFinesCollected = totalFinesCollected; }

    public Long getMyActiveLoans() { return myActiveLoans; }
    public void setMyActiveLoans(Long myActiveLoans) { this.myActiveLoans = myActiveLoans; }

    public Long getMyDueSoon() { return myDueSoon; }
    public void setMyDueSoon(Long myDueSoon) { this.myDueSoon = myDueSoon; }

    public Long getMyOverdue() { return myOverdue; }
    public void setMyOverdue(Long myOverdue) { this.myOverdue = myOverdue; }

    public BigDecimal getMyPendingFines() { return myPendingFines; }
    public void setMyPendingFines(BigDecimal myPendingFines) { this.myPendingFines = myPendingFines; }

    public Long getMyReservations() { return myReservations; }
    public void setMyReservations(Long myReservations) { this.myReservations = myReservations; }

    public Long getMyFavorites() { return myFavorites; }
    public void setMyFavorites(Long myFavorites) { this.myFavorites = myFavorites; }

    public List<Map<String, Object>> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(List<Map<String, Object>> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

    public List<Map<String, Object>> getMonthlyLoans() { return monthlyLoans; }
    public void setMonthlyLoans(List<Map<String, Object>> monthlyLoans) { this.monthlyLoans = monthlyLoans; }

    public List<Map<String, Object>> getPopularBooks() { return popularBooks; }
    public void setPopularBooks(List<Map<String, Object>> popularBooks) { this.popularBooks = popularBooks; }
}

