package com.example.bookshelf.service;

import com.example.bookshelf.model.Book;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Holds all books in memory. No database — data resets when the app restarts.
 * CopyOnWriteArrayList is used instead of a plain ArrayList so the list is
 * safe to read/write from multiple requests at once without extra locking code.
 */
@Service
public class BookService {

    private final List<Book> books = new CopyOnWriteArrayList<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    private static final List<String> VALID_GENRES = List.of(
            "Fiction", "Non-fiction", "Sci-Fi", "Biography", "Mystery", "Other"
    );

    public List<Book> getAllBooks() {
        List<Book> sorted = new ArrayList<>(books);
        sorted.sort(Comparator.comparing(Book::getDateAdded).reversed());
        return sorted;
    }

    public Book addBook(String title, String author, String genre, String imageData,
                         String startedDate, String finishedDate, Integer rating) {
        String safeTitle = (title == null || title.isBlank()) ? "Untitled" : title.trim();
        String safeAuthor = (author == null) ? "" : author.trim();
        String safeGenre = (genre == null || !VALID_GENRES.contains(genre)) ? "Other" : genre;
        Integer safeRating = (rating == null) ? 0 : Math.max(0, Math.min(5, rating));
        String safeStarted = (startedDate == null || startedDate.isBlank()) ? null : startedDate;
        String safeFinished = (finishedDate == null || finishedDate.isBlank()) ? null : finishedDate;

        Book book = new Book(idCounter.getAndIncrement(), safeTitle, safeAuthor, safeGenre, imageData,
                safeStarted, safeFinished, safeRating, LocalDateTime.now());
        books.add(book);
        return book;
    }

    public void removeBook(Long id) {
        boolean removed = books.removeIf(book -> book.getId().equals(id));
        if (!removed) {
            throw new NoSuchElementException("No book found with id " + id);
        }
    }
}
