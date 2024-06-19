const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Define a route handler for the root URL
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your App Title</title>
            <link rel="stylesheet" href="styles.css">
        </head>
        <body>
            <h1>Hello World!</h1>
            <p>This is your MERN stack application.</p>
            <script src="script.js"></script>
        </body>
        </html>
    `);
});

// Other routes and middleware configurations...

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
