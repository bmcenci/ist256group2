
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Read incoming JSON requests
app.use(express.json());

// Serve website files
app.use(express.static(__dirname));

// Receive registration information
app.post("/api/registrations", function(req, res) {

    const registration = req.body;

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

    registrations.push(registration);

    try {
        fs.writeFileSync(
            filePath,
            JSON.stringify(registrations, null, 2)
        );
    } catch (error) {
        return res.status(500).json({
            message: "Unable to save registration."
        });
    }

    res.status(201).json({
        message: "Registration saved successfully.",
        registration: registration
    });
});

// Receive billing information
app.post("/api/billing", function(req, res) {

    const order = req.body;

    if (
        !order.name ||
        !order.address ||
        !order.city ||
        !/^\d{5}$/.test(String(order.zip || "")) ||
        !Array.isArray(order.items) ||
        order.items.length === 0
    ) {
        return res.status(400).json({
            message: "Missing or invalid billing information."
        });
    }

    const filePath = path.join(__dirname, "billing.json");

    let orders = [];

    if (fs.existsSync(filePath)) {
        try {
            orders = JSON.parse(
                fs.readFileSync(filePath, "utf8")
            );
        } catch (error) {
            return res.status(500).json({
                message: "Unable to read billing data."
            });
        }
    }

    const savedOrder = {
        name: order.name,
        address: order.address,
        city: order.city,
        zip: order.zip,
        paymentMethod: "Demo Card",
        items: order.items,
        total: order.total
    };

    orders.push(savedOrder);

    try {
        fs.writeFileSync(
            filePath,
            JSON.stringify(orders, null, 2)
        );
    } catch (error) {
        return res.status(500).json({
            message: "Unable to save billing data."
        });
    }

    res.status(201).json({
        message: "Order saved successfully.",
        order: savedOrder
    });
});

// Start the server
app.listen(PORT, function() {
    console.log(`Campus Connect running at http://localhost:${PORT}`);
});
