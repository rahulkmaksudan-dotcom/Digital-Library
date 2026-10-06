package com.dps.library.repository;

import com.dps.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByIsbn(String isbn);
    boolean existsByIsbn(String isbn);

    long countByStatus(String status);
    long countByDigitalAvailableTrue();

    @Query("SELECT COALESCE(SUM(b.totalCopies), 0) FROM Book b")
    long sumTotalCopies();

    @Query("SELECT COALESCE(SUM(b.availableCopies), 0) FROM Book b")
    long sumAvailableCopies();

    List<Book> findTop6ByOrderByCreatedAtDesc();

    @Query("SELECT b FROM Book b LEFT JOIN b.category c LEFT JOIN b.author a WHERE " +
           "(:queryPattern IS NULL OR " +
           "LOWER(b.title) LIKE :queryPattern OR " +
           "LOWER(b.authorName) LIKE :queryPattern OR " +
           "LOWER(b.isbn) LIKE :queryPattern OR " +
           "LOWER(b.publisher) LIKE :queryPattern OR " +
           "LOWER(b.description) LIKE :queryPattern) AND " +
           "(:categoryId IS NULL OR c.id = :categoryId) AND " +
           "(:authorId IS NULL OR a.id = :authorId) AND " +
           "(:language IS NULL OR b.language = :language) AND " +
           "(:bookType IS NULL OR b.bookType = :bookType) AND " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:digitalOnly IS NULL OR b.digitalAvailable = :digitalOnly) AND " +
           "(:availableOnly IS NULL OR :availableOnly = false OR b.availableCopies > 0)")
    Page<Book> searchBooks(@Param("queryPattern") String queryPattern,
                           @Param("categoryId") Long categoryId,
                           @Param("authorId") Long authorId,
                           @Param("language") String language,
                           @Param("bookType") String bookType,
                           @Param("status") String status,
                           @Param("digitalOnly") Boolean digitalOnly,
                           @Param("availableOnly") Boolean availableOnly,
                           Pageable pageable);

    @Query("SELECT b.categoryName, COUNT(b) FROM Book b GROUP BY b.categoryName")
    List<Object[]> countBooksByCategory();
}
