
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

// Receive return requests
app.post("/api/returns", function(req, res) {

    const request = req.body;

    if (
        !request.name ||
        !request.productId ||
        !request.reason ||
        !request.condition
    ) {
        return res.status(400).json({
            message: "Missing return information."
        });
    }

    const filePath = path.join(__dirname, "returns.json");

    let returns = [];

    if (fs.existsSync(filePath)) {
        try {
            returns = JSON.parse(
                fs.readFileSync(filePath, "utf8")
            );
        } catch (error) {
            return res.status(500).json({
                message: "Unable to read returns data."
            });
        }
    }

    returns.push(request);

    try {
        fs.writeFileSync(
            filePath,
            JSON.stringify(returns, null, 2)
        );
    } catch (error) {
        return res.status(500).json({
            message: "Unable to save return."
        });
    }

    res.status(201).json({
        message: "Return saved successfully.",
        returnRequest: request
    });
});

// File for community posts
const submissionsFile = path.join(__dirname, "submissions.json");

// Get all submissions
app.get("/api/submissions", function(req, res) {

    let submissions = [];

    if (fs.existsSync(submissionsFile)) {
        try {
            submissions = JSON.parse(
                fs.readFileSync(submissionsFile, "utf8")
            );
        } catch (error) {
            return res.status(500).json({
                message: "Could not read submissions."
            });
        }
    }

    res.json(submissions);
});

// Submit a new community post
app.post("/api/submissions", function(req, res) {

    const post = req.body;

    if (
        typeof post.name !== "string" ||
        typeof post.title !== "string" ||
        typeof post.category !== "string" ||
        typeof post.content !== "string" ||
        !post.name.trim() ||
        !post.title.trim() ||
        !post.category.trim() ||
        !post.content.trim()
    ) {
        return res.status(400).json({
            message: "Please complete all required fields."
        });
    }

    let submissions = [];

    if (fs.existsSync(submissionsFile)) {
        try {
            submissions = JSON.parse(
                fs.readFileSync(submissionsFile, "utf8")
            );
        } catch (error) {
            return res.status(500).json({
                message: "Could not read submissions."
            });
        }
    }

    const newPost = {
        id: Date.now(),
        name: post.name.trim(),
        title: post.title.trim(),
        category: post.category.trim(),
        content: post.content.trim(),
        status: "Pending"
    };

    submissions.push(newPost);

    try {
        fs.writeFileSync(
            submissionsFile,
            JSON.stringify(submissions, null, 2)
        );
    } catch (error) {
        return res.status(500).json({
            message: "Could not save submission."
        });
    }

    res.status(201).json({
        message: "Post submitted successfully.",
        submission: newPost
    });
});

// Approve or reject a post
app.put("/api/submissions/:id", function(req, res) {

    const status = req.body.status;

    if (status !== "Approved" && status !== "Rejected") {
        return res.status(400).json({
            message: "Invalid status."
        });
    }

    if (!fs.existsSync(submissionsFile)) {
        return res.status(404).json({
            message: "Post not found."
        });
    }

    let submissions = [];

    try {
        submissions = JSON.parse(
            fs.readFileSync(submissionsFile, "utf8")
        );
    } catch (error) {
        return res.status(500).json({
            message: "Could not read submissions."
        });
    }

    const post = submissions.find(function(item) {
        return String(item.id) === req.params.id;
    });

    if (!post) {
        return res.status(404).json({
            message: "Post not found."
        });
    }

    post.status = status;

    try {
        fs.writeFileSync(
            submissionsFile,
            JSON.stringify(submissions, null, 2)
        );
    } catch (error) {
        return res.status(500).json({
            message: "Could not update submission."
        });
    }

    res.json({
        message: "Post updated successfully.",
        submission: post
    });
});

// Start the server
app.listen(PORT, function() {
    console.log(`Campus Connect running at http://localhost:${PORT}`);
});
