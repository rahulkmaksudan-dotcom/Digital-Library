package com.dps.library.service;

import com.dps.library.dto.BookDto;
import com.dps.library.dto.PagedResponse;
import com.dps.library.entity.Author;
import com.dps.library.entity.Book;
import com.dps.library.entity.Category;
import com.dps.library.exception.BadRequestException;
import com.dps.library.exception.ResourceNotFoundException;
import com.dps.library.repository.AuthorRepository;
import com.dps.library.repository.BookRepository;
import com.dps.library.repository.CategoryRepository;
import com.dps.library.repository.LoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private AuditLogService auditLogService;

    public PagedResponse<BookDto> searchBooks(String query, Long categoryId, Long authorId, String language,
                                              String bookType, String status, Boolean digitalOnly, Boolean availableOnly,
                                              String sortBy, String direction, int page, int size) {
        Sort sort = Sort.by(
            "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC,
            (sortBy != null && !sortBy.isEmpty()) ? sortBy : "id"
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Book> booksPage = bookRepository.searchBooks(
            (query != null && !query.trim().isEmpty()) ? query.trim() : null,
            categoryId,
            authorId,
            (language != null && !language.trim().isEmpty()) ? language.trim() : null,
            (bookType != null && !bookType.trim().isEmpty()) ? bookType.trim() : null,
            (status != null && !status.trim().isEmpty()) ? status.trim() : null,
            digitalOnly,
            availableOnly,
            pageable
        );

        List<BookDto> dtos = booksPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return new PagedResponse<>(
            dtos,
            booksPage.getNumber(),
            booksPage.getSize(),
            booksPage.getTotalElements(),
            booksPage.getTotalPages(),
            booksPage.isLast()
        );
    }

    public BookDto getBookById(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return mapToDto(book);
    }

    public List<BookDto> getFeaturedBooks() {
        return bookRepository.findTop6ByOrderByCreatedAtDesc().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public BookDto createBook(BookDto dto, Long adminId, String adminEmail) {
        if (bookRepository.existsByIsbn(dto.getIsbn())) {
            throw new BadRequestException("Book with ISBN " + dto.getIsbn() + " already exists.");
        }

        Book book = new Book();
        mapFromDto(dto, book);

        if (dto.getAvailableCopies() == null) {
            book.setAvailableCopies(dto.getTotalCopies());
        }

        book.setStatus(book.getAvailableCopies() > 0 ? "AVAILABLE" : "UNAVAILABLE");

        Book saved = bookRepository.save(book);

        auditLogService.log(adminId, adminEmail, "BOOK_CREATED", "Book",
            String.valueOf(saved.getId()), "Created book: " + saved.getTitle() + " (ISBN: " + saved.getIsbn() + ")", "127.0.0.1");

        return mapToDto(saved);
    }

    @Transactional
    public BookDto updateBook(Long id, BookDto dto, Long adminId, String adminEmail) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        if (!book.getIsbn().equals(dto.getIsbn()) && bookRepository.existsByIsbn(dto.getIsbn())) {
            throw new BadRequestException("Another book with ISBN " + dto.getIsbn() + " already exists.");
        }

        mapFromDto(dto, book);
        book.setStatus(book.getAvailableCopies() > 0 ? "AVAILABLE" : "UNAVAILABLE");

        Book updated = bookRepository.save(book);

        auditLogService.log(adminId, adminEmail, "BOOK_UPDATED", "Book",
            String.valueOf(updated.getId()), "Updated book: " + updated.getTitle(), "127.0.0.1");

        return mapToDto(updated);
    }

    @Transactional
    public void deleteBook(Long id, Long adminId, String adminEmail) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        // Check if there are active loans
        if (loanRepository.countByUserIdAndStatus(book.getId(), "ACTIVE") > 0) {
            throw new BadRequestException("Cannot delete book while active loans exist. Archive it instead.");
        }

        bookRepository.delete(book);

        auditLogService.log(adminId, adminEmail, "BOOK_DELETED", "Book",
            String.valueOf(id), "Deleted book: " + book.getTitle(), "127.0.0.1");
    }

    public BookDto mapToDto(Book book) {
        BookDto dto = new BookDto();
        dto.setId(book.getId());
        dto.setIsbn(book.getIsbn());
        dto.setTitle(book.getTitle());
        dto.setSubtitle(book.getSubtitle());
        if (book.getAuthor() != null) {
            dto.setAuthorId(book.getAuthor().getId());
        }
        dto.setAuthorName(book.getAuthorName());
        if (book.getCategory() != null) {
            dto.setCategoryId(book.getCategory().getId());
        }
        dto.setCategoryName(book.getCategoryName());
        dto.setPublisher(book.getPublisher());
        dto.setPublicationYear(book.getPublicationYear());
        dto.setEdition(book.getEdition());
        dto.setLanguage(book.getLanguage());
        dto.setDescription(book.getDescription());
        dto.setCoverImage(book.getCoverImage());
        dto.setTotalCopies(book.getTotalCopies());
        dto.setAvailableCopies(book.getAvailableCopies());
        dto.setLocation(book.getLocation());
        dto.setShelfNumber(book.getShelfNumber());
        dto.setBookType(book.getBookType());
        dto.setDigitalAvailable(book.getDigitalAvailable());
        dto.setDigitalFile(book.getDigitalFile());
        dto.setStatus(book.getStatus());
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());
        return dto;
    }

    private void mapFromDto(BookDto dto, Book book) {
        book.setIsbn(dto.getIsbn().trim());
        book.setTitle(dto.getTitle().trim());
        book.setSubtitle(dto.getSubtitle());
        book.setAuthorName(dto.getAuthorName().trim());

        if (dto.getAuthorId() != null) {
            authorRepository.findById(dto.getAuthorId()).ifPresent(book::setAuthor);
        } else if (dto.getAuthorName() != null) {
            Author author = authorRepository.findByName(dto.getAuthorName())
                .orElseGet(() -> authorRepository.save(new Author(null, dto.getAuthorName(), "", "Unknown")));
            book.setAuthor(author);
        }

        if (dto.getCategoryId() != null) {
            categoryRepository.findById(dto.getCategoryId()).ifPresent(book::setCategory);
        } else if (dto.getCategoryName() != null) {
            categoryRepository.findByName(dto.getCategoryName()).ifPresent(book::setCategory);
        }

        book.setCategoryName(dto.getCategoryName());
        book.setPublisher(dto.getPublisher());
        book.setPublicationYear(dto.getPublicationYear());
        book.setEdition(dto.getEdition());
        book.setLanguage(dto.getLanguage() != null ? dto.getLanguage() : "English");
        book.setDescription(dto.getDescription());
        book.setCoverImage(dto.getCoverImage());
        book.setTotalCopies(dto.getTotalCopies());
        if (dto.getAvailableCopies() != null) {
            book.setAvailableCopies(dto.getAvailableCopies());
        }
        book.setLocation(dto.getLocation());
        book.setShelfNumber(dto.getShelfNumber());
        book.setBookType(dto.getBookType() != null ? dto.getBookType() : "PHYSICAL");
        book.setDigitalAvailable(dto.getDigitalAvailable() != null ? dto.getDigitalAvailable() : false);
        book.setDigitalFile(dto.getDigitalFile());
    }
}

