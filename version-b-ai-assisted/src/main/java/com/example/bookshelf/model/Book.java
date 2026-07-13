package com.example.bookshelf.model;

import java.time.LocalDateTime;

/**
 * Represents a single book on the shelf.
 *
 * imageData holds the cropped spine photo as a base64 data URL
 * (e.g. "data:image/png;base64,....") so it can be stored and
 * re-rendered directly by the frontend without a database or
 * file storage system.
 */
public class Book {

    private Long id;
    private String title;
    private String author;
    private String genre;
    private String imageData;
    private String startedDate;
    private String finishedDate;
    private Integer rating;
    private LocalDateTime dateAdded;

    public Book() {
    }

    public Book(Long id, String title, String author, String genre, String imageData,
                String startedDate, String finishedDate, Integer rating, LocalDateTime dateAdded) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.imageData = imageData;
        this.startedDate = startedDate;
        this.finishedDate = finishedDate;
        this.rating = rating;
        this.dateAdded = dateAdded;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getStartedDate() {
        return startedDate;
    }

    public void setStartedDate(String startedDate) {
        this.startedDate = startedDate;
    }

    public String getFinishedDate() {
        return finishedDate;
    }

    public void setFinishedDate(String finishedDate) {
        this.finishedDate = finishedDate;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }

    public LocalDateTime getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(LocalDateTime dateAdded) {
        this.dateAdded = dateAdded;
    }
}
