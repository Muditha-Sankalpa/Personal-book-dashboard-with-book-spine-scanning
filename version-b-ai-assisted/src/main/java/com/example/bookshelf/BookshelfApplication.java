package com.example.bookshelf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the AI-assisted Bookshelf application (Version B).
 *
 * This app has no database — books are kept in memory for the lifetime
 * of the running application, which is intentional for this project's
 * scope (see report, Task 2 notes on design decisions).
 */
@SpringBootApplication
public class BookshelfApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookshelfApplication.class, args);
    }
}
