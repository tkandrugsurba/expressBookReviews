const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to validate if a username exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Function to authenticate a user
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username && user.password === password);
    return user !== undefined;
};

// Only registered users can log in
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username) || !authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: '1h' });
    return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Extract the username from the token
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Token is missing" });
    }

    try {
        const decoded = jwt.verify(token, "fingerprint_customer");
        const username = decoded.username;

        // Add or update the review
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users; 
