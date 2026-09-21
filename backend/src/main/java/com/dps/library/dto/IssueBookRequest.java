package com.dps.library.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class IssueBookRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Book ID is required")
    private Long bookId;

    private LocalDate issueDate;
    private Integer loanDays; // default 10 days if null
    private String notes;

    public IssueBookRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public Integer getLoanDays() { return loanDays; }
    public void setLoanDays(Integer loanDays) { this.loanDays = loanDays; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

