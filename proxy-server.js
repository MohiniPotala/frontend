const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Proxy API requests to the backend
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://127.0.0.1:8000",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "/api", // No rewrite needed
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying ${req.method} request to: ${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(
        `Received response from backend with status: ${proxyRes.statusCode}`
      );
    },
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(500).json({ error: "Proxy error", message: err.message });
    },
  })
);

// Serve the test HTML file
app.get("/test-otp", (req, res) => {
  res.sendFile(path.join(__dirname, "test-otp.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log(
    `Test OTP page available at http://localhost:${PORT}/test-otp.html`
  );
});
