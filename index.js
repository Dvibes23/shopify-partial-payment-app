require("dotenv").config();
const express = require("express");
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
const { shopifyNodeAdapter } = require("@shopify/shopify-api/adapters/node");

// Initialize the Node adapter for Shopify API (this is required for Node environments)
shopifyNodeAdapter(); 

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Shopify app context
const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SCOPES ? process.env.SCOPES.split(",") : [],
    hostName: process.env.HOST.replace(/https?:\/\//, ""), // Remove protocol
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: false,
});

// Authentication route
app.get("/auth", async (req, res) => {
    const shop = req.query.shop;
    const authRoute = await shopify.auth.beginAuth(req, res, shop, "/auth/callback", false);
    res.redirect(authRoute);
});

// Callback route for authentication
app.get("/auth/callback", async (req, res) => {
    try {
        const session = await shopify.auth.validateAuthCallback(req, res, req.query);
        res.send("App installed successfully!");
    } catch (error) {
        console.error("Error during authentication callback:", error);
        res.status(500).send("Error authenticating with Shopify");
    }
});

// Basic route
app.get("/", (req, res) => {
    res.send("Partial Payment App is running!");
});

// Start server
app.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`);
});
