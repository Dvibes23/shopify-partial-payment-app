require("dotenv").config();
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize the Shopify API context using shopifyApi
const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SCOPES ? process.env.SCOPES.split(",") : ["read_orders", "write_orders", "read_checkouts", "write_checkouts", "read_all_orders"],
    hostName: process.env.HOST.replace(/https?:\/\//, ""),
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: false,
});

// Route for authentication
app.get("/auth", async (req, res) => {
    const authRoute = await shopify.auth.begin({
        shop: req.query.shop,
        callbackPath: "/auth/callback",
        isOnline: false,
    });
    res.redirect(authRoute);
});

// Callback route for authentication
app.get("/auth/callback", async (req, res) => {
    try {
        const session = await shopify.auth.validateCallback(req, res, req.query);
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
