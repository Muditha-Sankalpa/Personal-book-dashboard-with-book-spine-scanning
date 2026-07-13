package com.example.bookshelf;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Controller
public class BookController {

    static List<Book> books = new ArrayList<>();
    static int nextId = 1;

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("books", books);
        return "index";
    }

    @PostMapping("/add")
    public String addBook(@RequestParam("title") String title,
                           @RequestParam("photo") MultipartFile photo) throws IOException {

        if (title == null || title.trim().length() == 0) {
            title = "Untitled";
        }

        String base64Image = "";
        if (photo != null && !photo.isEmpty()) {
            byte[] bytes = photo.getBytes();
            String encoded = Base64.getEncoder().encodeToString(bytes);
            base64Image = "data:" + photo.getContentType() + ";base64," + encoded;
        }

        Book book = new Book(nextId, title, base64Image);
        nextId = nextId + 1;
        books.add(book);

        return "redirect:/";
    }

    @GetMapping("/delete/{id}")
    public String deleteBook(@PathVariable("id") int id) {
        Book toRemove = null;
        for (Book b : books) {
            if (b.getId() == id) {
                toRemove = b;
            }
        }
        if (toRemove != null) {
            books.remove(toRemove);
        }
        return "redirect:/";
    }
}
