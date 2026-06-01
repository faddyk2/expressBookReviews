const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL used by the Axios calls below (the server itself)
const BASE_URL = "http://localhost:5000";

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

// Task 1 (Task 10 in lab): Get the book list available in the shop.
// This route is the data source and is consumed by the Axios calls below.
public_users.get('/', function (req, res) {
  // Wrapped in a Promise to use async style without recursion.
  const getBooks = new Promise((resolve, reject) => {
    resolve(books);
  });

  getBooks
    .then((bookList) => res.status(200).send(JSON.stringify(bookList, null, 4)))
    .catch((err) => res.status(500).json({ message: "Error fetching books", error: err.message }));
});

// Task 2 (Task 11 in lab): Get book details based on ISBN using async/await + Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${BASE_URL}/`);
    const allBooks = response.data;
    if (allBooks[isbn]) {
      return res.status(200).send(JSON.stringify(allBooks[isbn], null, 4));
    }
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
  }
});

// Task 3 (Task 12 in lab): Get book details based on author using async/await + Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`${BASE_URL}/`);
    const allBooks = response.data;
    const matches = {};
    Object.keys(allBooks).forEach((key) => {
      if (allBooks[key].author === author) {
        matches[key] = allBooks[key];
      }
    });
    if (Object.keys(matches).length === 0) {
      return res.status(404).json({ message: `No books found for author ${author}` });
    }
    return res.status(200).send(JSON.stringify({ booksbyauthor: matches }, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

// Task 4 (Task 13 in lab): Get all books based on title using async/await + Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get(`${BASE_URL}/`);
    const allBooks = response.data;
    const matches = {};
    Object.keys(allBooks).forEach((key) => {
      if (allBooks[key].title === title) {
        matches[key] = allBooks[key];
      }
    });
    if (Object.keys(matches).length === 0) {
      return res.status(404).json({ message: `No books found with title ${title}` });
    }
    return res.status(200).send(JSON.stringify({ booksbytitle: matches }, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

module.exports.general = public_users;
