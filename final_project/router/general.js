const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // isValid returns true if the username already exists
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// ---------------------------------------------------------------------------
// Task 10: Get the book list available in the shop
// Implemented with async/await using a Promise callback.
// ---------------------------------------------------------------------------
public_users.get('/', async function (req, res) {
  try {
    const getAllBooks = () => new Promise((resolve, reject) => {
      resolve(books);
    });

    const allBooks = await getAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch book list", error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Task 11: Get book details based on ISBN
// Implemented with async/await using a Promise callback.
// ---------------------------------------------------------------------------
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;

    const getBookByISBN = () => new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error(`Book with ISBN ${isbn} not found`));
      }
    });

    const book = await getBookByISBN();
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// Task 12: Get book details based on Author
// Implemented with async/await using a Promise callback.
// ---------------------------------------------------------------------------
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;

    const getBooksByAuthor = () => new Promise((resolve, reject) => {
      const matches = {};
      Object.keys(books).forEach((key) => {
        if (books[key].author === author) {
          matches[key] = books[key];
        }
      });
      if (Object.keys(matches).length > 0) {
        resolve(matches);
      } else {
        reject(new Error(`No books found for author ${author}`));
      }
    });

    const booksbyauthor = await getBooksByAuthor();
    return res.status(200).send(JSON.stringify({ booksbyauthor }, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// Task 13: Get all books based on Title
// Implemented with async/await using a Promise callback.
// ---------------------------------------------------------------------------
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;

    const getBooksByTitle = () => new Promise((resolve, reject) => {
      const matches = {};
      Object.keys(books).forEach((key) => {
        if (books[key].title === title) {
          matches[key] = books[key];
        }
      });
      if (Object.keys(matches).length > 0) {
        resolve(matches);
      } else {
        reject(new Error(`No books found with title ${title}`));
      }
    });

    const booksbytitle = await getBooksByTitle();
    return res.status(200).send(JSON.stringify({ booksbytitle }, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

module.exports.general = public_users;
