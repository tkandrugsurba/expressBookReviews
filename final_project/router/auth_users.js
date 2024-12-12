const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username is valid
const isValid = (username) => {
    return username && username.length >= 3; // Example validation rule
};

// Check if the username and password match the records
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username && user.password === password);
    return !!user; // Return true if user exists, false otherwise
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });
    req.session.authorization = { accessToken: token };

    return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    if (!username) {
        return res.status(401).json({ message: "Unauthorized: You must be logged in" });
    }

    books[isbn].reviews = books[isbn].reviews || {};
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
