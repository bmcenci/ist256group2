
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Read incoming JSON requests
app.use(express.json());

// Serve website files from the project folder
app.use(express.static(__dirname));

// Receive registration information
app.post("/api/registrations", function(req, res) {

    const registration = req.body;

    // Basic server-side validation
    if (
        !registration.name ||
        !registration.email ||
        !registration.event ||
        !registration.attending
    ) {
        return res.status(400).json({
            message: "Missing required registration information."
        });
    }

    const filePath = path.join(__dirname, "registrations.json");

    let registrations = [];

    // Read existing registrations
    if (fs.existsSync(filePath)) {
        try {
            registrations = JSON.parse(
                fs.readFileSync(filePath, "utf8")
            );
        } catch (error) {
            return res.status(500).json({
                message: "Unable to read registration data."
            });
        }
    }

    // Add the new registration
    registrations.push(registration);

    // Save updated JSON file
    fs.writeFileSync(
        filePath,
        JSON.stringify(registrations, null, 2)
    );

    res.status(201).json({
        message: "Registration saved successfully.",
        registration: registration
    });
});

// Start the server
app.listen(PORT, function() {
    console.log(`Campus Connect running at http://localhost:${PORT}`);
});
