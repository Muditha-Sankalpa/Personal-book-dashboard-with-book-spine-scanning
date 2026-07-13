package com.example.bookshelf.model;

import jakarta.validation.constraints.NotBlank;

/**
 * Incoming payload for POST /api/books.
 * title is optional (defaults to "Untitled" in the service layer);
 * imageData is required since the whole point of the app is the cropped spine photo.
 */
public class BookRequest {

    private String title;
    private String author;
    private String genre;
    private String startedDate;
    private String finishedDate;
    private Integer rating;

    @NotBlank(message = "imageData is required")
    private String imageData;

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
}
