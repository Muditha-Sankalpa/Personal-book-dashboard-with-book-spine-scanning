# Bookshelf AI (Version B - AI-assisted)

A personal bookshelf dashboard: capture or upload a photo of a book spine,
crop it, and it appears as a cover on your visual shelf. No database -
books are kept in memory while the app is running.

## Tech stack

- Java 17
- Spring Boot 3.3 (Spring Web, Spring Validation)
- Plain HTML / CSS / JavaScript frontend (no framework), served as static files

## Prerequisites

- Java 17 or newer (`java -version`)
- Maven 3.8+ (`mvn -version`) - or use an IDE that bundles Maven (IntelliJ, Eclipse, VS Code + Java extension pack)

## Project structure

```
bookshelf-ai/
  pom.xml
  src/main/java/com/example/bookshelf/
    BookshelfApplication.java        - main entry point
    model/Book.java                  - book entity (id, title, image, date)
    model/BookRequest.java           - request body for POST /api/books
    service/BookService.java         - in-memory storage and business logic
    controller/BookController.java   - REST endpoints
  src/main/resources/
    application.properties
    static/index.html                - page markup
    static/css/style.css             - styling
    static/js/app.js                 - capture, crop, and API calls
```

## Step-by-step: initialize and run

1. **Unzip the project** (or clone it if you push it to GitHub first).

2. **Open a terminal in the project root** (the folder containing `pom.xml`).

3. **Build the project**
   ```
   mvn clean install
   ```
   This downloads dependencies and compiles the code. First run may take a
   minute while Maven fetches Spring Boot.

4. **Run the application**
   ```
   mvn spring-boot:run
   ```
   You should see Spring Boot's startup banner and a line like
   `Tomcat started on port(s): 8080`.

5. **Open the app**
   Go to `http://localhost:8080` in your browser.

6. **Add a book**
   - Click "Choose or capture photo" and pick/take a photo of a book spine.
   - Drag a rectangle over the spine on the preview canvas.
   - (Optional) type a title.
   - Click "Crop & add to shelf" - it appears in the grid below.

7. **Remove a book**
   Click the small "x" in the top-right corner of any book card.

## API reference (for the report)

| Method | Endpoint          | Body                              | Response          |
|--------|-------------------|------------------------------------|--------------------|
| GET    | `/api/books`      | -                                   | `200` list of books |
| POST   | `/api/books`      | `{ "title": "...", "imageData": "data:image/jpeg;base64,..." }` | `201` created book |
| DELETE | `/api/books/{id}` | -                                   | `204` no content, or `404` if not found |

## Notes for the report

- No database is used deliberately, to keep the project scope focused on the
  AI-assisted-programming comparison rather than persistence/ORM setup.
  Books reset when the server restarts.
- The crop happens entirely client-side using the HTML5 Canvas API - the
  backend only ever receives the already-cropped image as a base64 string.
- Validation (`@NotBlank` on `imageData`) and a global exception handler in
  `BookController` demonstrate basic error handling on the AI-assisted side.
