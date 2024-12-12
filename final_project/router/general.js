const express = require('express');
let books = require("./booksdb.js"); // Import the books database
let isValid = require("./auth_users.js").isValid; // Import validation function
let users = require("./auth_users.js").users; // Import users array
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Add the new user to the users array
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;

    const filteredBooks = Object.keys(books)
        .filter(isbn => books[isbn].author === author)
        .map(isbn => ({
            isbn,
            title: books[isbn].title,
            reviews: books[isbn].reviews
        }));

    if (filteredBooks.length > 0) {
        return res.status(200).json({ booksByAuthor: filteredBooks });
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get book details based on title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;

    const filteredBooks = Object.keys(books)
        .filter(isbn => books[isbn].title === title)
        .map(isbn => ({
            isbn,
            author: books[isbn].author,
            reviews: books[isbn].reviews
        }));

    if (filteredBooks.length > 0) {
        return res.status(200).json({ booksByTitle: filteredBooks });
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;
