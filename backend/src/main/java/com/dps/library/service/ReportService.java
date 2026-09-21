package com.dps.library.service;

import com.dps.library.entity.*;
import com.dps.library.repository.*;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public byte[] exportBooksCsv() throws IOException {
        List<Book> books = bookRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                    "ID", "ISBN", "Title", "Author", "Category", "Publisher", "Year",
                    "Total Copies", "Available Copies", "Shelf Number", "Book Type", "Status"
                ).build())) {

            for (Book b : books) {
                printer.printRecord(
                    b.getId(),
                    b.getIsbn(),
                    b.getTitle(),
                    b.getAuthorName(),
                    b.getCategoryName(),
                    b.getPublisher(),
                    b.getPublicationYear(),
                    b.getTotalCopies(),
                    b.getAvailableCopies(),
                    b.getShelfNumber(),
                    b.getBookType(),
                    b.getStatus()
                );
            }
        }
        return out.toByteArray();
    }

    public byte[] exportUsersCsv() throws IOException {
        List<User> users = userRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                    "ID", "Student/Employee ID", "Full Name", "Email", "Phone",
                    "Department", "Course", "Semester", "Role", "Active"
                ).build())) {

            for (User u : users) {
                printer.printRecord(
                    u.getId(),
                    u.getStudentId(),
                    u.getFullName(),
                    u.getEmail(),
                    u.getPhone(),
                    u.getDepartment(),
                    u.getCourse(),
                    u.getSemester(),
                    u.getRole().getName(),
                    u.getActive()
                );
            }
        }
        return out.toByteArray();
    }

    public byte[] exportLoansCsv() throws IOException {
        List<Loan> loans = loanRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                    "Loan ID", "Borrower Name", "Student ID", "Book Title", "ISBN",
                    "Issue Date", "Due Date", "Return Date", "Status", "Fine Amount"
                ).build())) {

            for (Loan l : loans) {
                printer.printRecord(
                    l.getId(),
                    l.getUser().getFullName(),
                    l.getUser().getStudentId(),
                    l.getBook().getTitle(),
                    l.getBook().getIsbn(),
                    l.getIssueDate(),
                    l.getDueDate(),
                    l.getReturnDate(),
                    l.getStatus(),
                    l.getFineAmount()
                );
            }
        }
        return out.toByteArray();
    }

    public byte[] exportFinesCsv() throws IOException {
        List<Fine> fines = fineRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                    "Fine ID", "Student Name", "Student ID", "Book Title",
                    "Amount (INR)", "Days Overdue", "Status", "Payment Method", "Paid At"
                ).build())) {

            for (Fine f : fines) {
                printer.printRecord(
                    f.getId(),
                    f.getUser().getFullName(),
                    f.getUser().getStudentId(),
                    f.getLoan().getBook().getTitle(),
                    f.getAmount(),
                    f.getDaysOverdue(),
                    f.getStatus(),
                    f.getPaymentMethod(),
                    f.getPaidAt()
                );
            }
        }
        return out.toByteArray();
    }
}

