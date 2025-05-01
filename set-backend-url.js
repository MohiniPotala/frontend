const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Default values
const defaultApiUrl = "http://localhost:8000/api";
const defaultWsUrl = "ws://localhost:8000/ws";

// Ask for backend URL
rl.question(`Enter backend API URL (default: ${defaultApiUrl}): `, (apiUrl) => {
  const finalApiUrl = apiUrl || defaultApiUrl;

  rl.question(`Enter WebSocket URL (default: ${defaultWsUrl}): `, (wsUrl) => {
    const finalWsUrl = wsUrl || defaultWsUrl;

    // Update .env file
    const envContent = `# Backend API URL for development
API_URL=${finalApiUrl}
WS_URL=${finalWsUrl}

# App environment
APP_VARIANT=development`;

    fs.writeFileSync(path.join(__dirname, ".env"), envContent);

    console.log("\nBackend URLs updated successfully:");
    console.log(`API URL: ${finalApiUrl}`);
    console.log(`WebSocket URL: ${finalWsUrl}`);
    console.log("\nRestart your application for changes to take effect.");

    rl.close();
  });
});
