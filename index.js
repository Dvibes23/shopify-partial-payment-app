require('dotenv').config();
const { Shopify } = require('@shopify/shopify-api');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// Ensure the Shopify API key, secret, and hostname are loaded correctly from environment variables
Shopify.Context.initialize({
    API_KEY: process.env.SHOPIFY_API_KEY,
    API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
    SCOPES: process.env.SCOPES.split(','), // Import scopes as an array from .env
    HOST_NAME: process.env.HOST.replace(/https?:\/\//, ""), // Make sure HOST is just the hostname
    IS_EMBEDDED_APP: false,
    API_VERSION: '2024-07', // Specify the API version
});

// Route for authentication
app.get('/auth', async (req, res) => {
    const authRoute = await Shopify.Auth.beginAuth(
        req,
        res,
        req.query.shop,
        '/auth/callback',
        false
    );
    return res.redirect(authRoute);
});

// Callback route for authentication
app.get('/auth/callback', async (req, res) => {
    try {
        const session = await Shopify.Auth.validateAuthCallback(req, res, req.query);
        res.send('App installed successfully!');
    } catch (error) {
        console.error('Error during authentication callback:', error);
        res.status(500).send('Error authenticating with Shopify');
    }
});

// Basic route
app.get('/', (req, res) => {
    res.send('Partial Payment App is running!');
});

// Start server
app.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`);
});
