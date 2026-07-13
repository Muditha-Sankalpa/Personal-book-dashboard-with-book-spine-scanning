# Bookshelf Traditional (Version A - written without AI assistance)

A bare-bones bookshelf: upload a photo of a book (whole photo, no cropping),
type a title, submit, see it in a plain table. Everything reloads the full
page - no JavaScript, no REST API, no styling flourishes.

## Tech stack

- Java 17
- Spring Boot 3.3 (Spring Web + Thymeleaf)
- Server-rendered HTML, minimal CSS

## Prerequisites

- Java 17+
- Maven 3.8+ (or an IDE that bundles it)

## Step-by-step: initialize and run

1. Unzip the project.
2. Open a terminal in the project root (the folder with `pom.xml`).
3. Build: `mvn clean install`
4. Run: `mvn spring-boot:run`
5. Open `http://localhost:8081` (different port from Version B, so both can
   run at the same time if you want to compare them side by side).
6. Type a title, choose a photo, click "Add Book". The page reloads and the
   book appears in the table below.
7. Click "Delete" next to any row to remove it.

## What's deliberately different from Version B (for the report)

- One controller class does everything (routing, validation, image
  encoding) - no service layer, no DTOs.
- Whole photos are stored, not cropped spines - there's no cropping UI at all.
- Every action is a full page reload (plain HTML forms), not an AJAX call.
- Delete uses a GET link instead of a proper DELETE request - quick to wire
  up but not RESTful; worth noting as a shortcut in your comparison.
- No search, sort, genres, animations, or styling system - just default
  browser form controls and a bordered HTML table.
- No input validation beyond a blank-title check - a bad file type or a
  huge image will only fail with a generic Spring error page.
