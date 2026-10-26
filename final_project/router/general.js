const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();
const BOOKS_API_URL =
  process.env.BOOKS_API_URL || "http://127.0.0.1:5000/_internal/books";

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password.trim()
  ) {
    return res.status(400).json({
      message: "Username and password are required.",
    });
  }

  if (!isValid(username)) {
    return res.status(409).json({
      message: "Username already exists.",
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: "User successfully registered. Now you can login",
  });
});

// Internal data endpoint used by the Axios based public search routes.
public_users.get("/_internal/books", (req, res) => {
  return res.status(200).json(books);
});

// Task 10: Get all books asynchronously with async/await
public_users.get("/", async function (req, res) {
  try {
    const { data: allBooks } = await axios.get(BOOKS_API_URL);
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve books.",
    });
  }
});

// Task 11: Get a book by ISBN with Promise callbacks
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  axios
    .get(BOOKS_API_URL)
    .then(({ data: allBooks }) => {
      const book = allBooks[isbn];
      if (!book) {
        return res.status(404).json({
          message: "Book not found.",
        });
      }

      return res.status(200).json(book);
    })
    .catch(() =>
      res.status(500).json({
        message: "Unable to retrieve book.",
      }),
    );
});

// Task 12: Get books by author asynchronously with async/await
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author;
  const result = {};

  try {
    const { data: allBooks } = await axios.get(BOOKS_API_URL);
    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].author.toLowerCase() === author.toLowerCase()) {
        result[isbn] = allBooks[isbn];
      }
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve books by author.",
    });
  }
});

// Task 13: Get books by title with Promise callbacks
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;

  axios
    .get(BOOKS_API_URL)
    .then(({ data: allBooks }) => {
      const result = Object.entries(allBooks)
        .filter(([, book]) => book.title.toLowerCase() === title.toLowerCase())
        .map(([isbn, book]) => ({ isbn, ...book }));

      return res.status(200).json(result);
    })
    .catch(() =>
      res.status(500).json({
        message: "Unable to retrieve books by title.",
      }),
    );
});

// Task 5: Get book reviews by ISBN
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found.",
    });
  }

  const reviews = books[isbn].reviews;

  if (Object.keys(reviews).length === 0) {
    return res.status(200).json({
      message: "No reviews found for this book.",
    });
  }

  return res.status(200).json(reviews);
});

module.exports.general = public_users;
