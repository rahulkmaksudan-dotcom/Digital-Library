package com.dps.library.service;

import com.dps.library.dto.BookDto;
import com.dps.library.entity.Author;
import com.dps.library.entity.Book;
import com.dps.library.entity.Category;
import com.dps.library.repository.AuthorRepository;
import com.dps.library.repository.BookRepository;
import com.dps.library.repository.CategoryRepository;
import com.dps.library.repository.LoanRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private AuthorRepository authorRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private BookService bookService;

    @Test
    @DisplayName("Should reuse an existing author when the supplied name matches ignoring case and spaces")
    void shouldReuseExistingAuthorWhenNameMatchesIgnoringCaseAndWhitespace() {
        String authorName = " thomas h. cormen ";
        Author existingAuthor = new Author(1L, "Thomas H. Cormen", "", "American");
        Category category = new Category();
        category.setId(5L);
        category.setName("Computer Science & Engineering");

        when(bookRepository.existsByIsbn("978-0000000001")).thenReturn(false);
        when(authorRepository.findByNameIgnoreCase("thomas h. cormen")).thenReturn(Optional.of(existingAuthor));
        when(categoryRepository.findByNameIgnoreCase("Computer Science & Engineering")).thenReturn(Optional.of(category));
        when(bookRepository.save(any(Book.class))).thenAnswer(invocation -> {
            Book savedBook = invocation.getArgument(0);
            savedBook.setId(77L);
            return savedBook;
        });

        BookDto dto = new BookDto();
        dto.setIsbn("978-0000000001");
        dto.setTitle("Introduction to Algorithms");
        dto.setAuthorName(authorName);
        dto.setCategoryName("Computer Science & Engineering");
        dto.setPublisher("MIT Press");
        dto.setPublicationYear(2024);
        dto.setEdition("1st");
        dto.setLanguage("English");
        dto.setTotalCopies(2);
        dto.setAvailableCopies(2);
        dto.setLocation("CSE-101");
        dto.setShelfNumber("A-1");
        dto.setBookType("PHYSICAL");
        dto.setDigitalAvailable(false);

        BookDto result = bookService.createBook(dto, 3L, "faculty1@dpslibrary.edu");

        assertEquals("Thomas H. Cormen", result.getAuthorName());
        verify(authorRepository, never()).save(any(Author.class));
    }
}
