// Import necessary modules
const express = require('express'); // Import Express framework
const jwt = require('jsonwebtoken'); // Import JSON Web Token for authentication
const session = require('express-session'); // Import Express session for session management

// Import route handlers
const customer_routes = require('./router/auth_users.js').authenticated; // Import customer routes with authentication
const genl_routes = require('./router/general.js').general; // Import general routes

// Create an Express application instance
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware to initialize session for routes under "/customer" path
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer", // Secret key for session management
    resave: true,
    saveUninitialized: true,
  })
);

// Middleware for authentication for routes under "/customer/auth/*" path
app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Assuming token is passed as "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, "fingerprint_customer"); // Verify token using the secret key
    req.user = decoded; // Attach decoded token data to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
});

// Define the port number
const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000

// Mount customer routes under "/customer" path
app.use("/customer", customer_routes);

// Mount general routes under "/" path
app.use("/", genl_routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error stack trace
  res.status(500).json({ message: "Something went wrong!" });
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
