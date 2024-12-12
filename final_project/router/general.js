const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered" });
});

// Get the book list available in the shop using async/await
public_users.get('/', async (req, res) => {
    try {
        const booksList = await new Promise((resolve) => resolve(books));
        res.status(200).json(booksList);
    } catch (err) {
        res.status(500).json({ message: "An error occurred" });
    }
});

// Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ message: "Book not found" });
        }
    })
        .then((book) => res.status(200).json(book))
        .catch((err) => res.status(404).json(err));
});

// Get book details based on author using Promises
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;

    new Promise((resolve, reject) => {
        const booksByAuthor = Object.values(books).filter(
            (book) => book.author.toLowerCase() === author.toLowerCase()
        );

        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject({ message: "No books found for this author" });
        }
    })
        .then((books) => res.status(200).json(books))
        .catch((err) => res.status(404).json(err));
});

// Get book details based on title using async/await
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const booksByTitle = await new Promise((resolve, reject) => {
            const results = Object.values(books).filter(
                (book) => book.title.toLowerCase() === title.toLowerCase()
            );

            if (results.length > 0) {
                resolve(results);
            } else {
                reject({ message: "No books found with this title" });
            }
        });

        res.status(200).json(booksByTitle);
    } catch (err) {
        res.status(404).json(err);
    }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json({ reviews: books[isbn].reviews });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
