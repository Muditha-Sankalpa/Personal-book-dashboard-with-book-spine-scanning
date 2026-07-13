package com.example.bookshelf;

public class Book {

    public int id;
    public String title;
    public String imageBase64;

    public Book(int id, String title, String imageBase64) {
        this.id = id;
        this.title = title;
        this.imageBase64 = imageBase64;
    }

    public int getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getImageBase64() {
        return imageBase64;
    }
}
