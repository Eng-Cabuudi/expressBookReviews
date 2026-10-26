const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

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
    message: "User successfully registered.",
  });
});

// Task 1: Get all books
public_users.get("/", function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book by ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }

  return res.status(404).json({
    message: "Book not found.",
  });
});

// Task 3: Get books by author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const result = {};

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      result[isbn] = books[isbn];
    }
  });

  return res.status(200).json(result);
});

// Task 4: Get books by title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const result = {};

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      result[isbn] = books[isbn];
    }
  });

  return res.status(200).json(result);
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
