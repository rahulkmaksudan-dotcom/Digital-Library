package com.dps.library.service;

import com.dps.library.dto.BookDto;
import com.dps.library.dto.PagedResponse;
import com.dps.library.entity.Book;
import com.dps.library.entity.Favorite;
import com.dps.library.entity.User;
import com.dps.library.exception.ResourceNotFoundException;
import com.dps.library.repository.BookRepository;
import com.dps.library.repository.FavoriteRepository;
import com.dps.library.repository.UserRepository;
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
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookService bookService;

    @Transactional
    public void addFavorite(Long userId, Long bookId) {
        if (!favoriteRepository.existsByUserIdAndBookId(userId, bookId)) {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

            Favorite favorite = new Favorite(user, book);
            favoriteRepository.save(favorite);
        }
    }

    @Transactional
    public void removeFavorite(Long userId, Long bookId) {
        favoriteRepository.findByUserIdAndBookId(userId, bookId)
            .ifPresent(favoriteRepository::delete);
    }

    public boolean isFavorite(Long userId, Long bookId) {
        return favoriteRepository.existsByUserIdAndBookId(userId, bookId);
    }

    public PagedResponse<BookDto> getUserFavorites(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Favorite> favPage = favoriteRepository.findByUserId(userId, pageable);

        List<BookDto> dtos = favPage.getContent().stream()
            .map(f -> bookService.mapToDto(f.getBook()))
            .collect(Collectors.toList());

        return new PagedResponse<>(dtos, favPage.getNumber(), favPage.getSize(),
            favPage.getTotalElements(), favPage.getTotalPages(), favPage.isLast());
    }
}

