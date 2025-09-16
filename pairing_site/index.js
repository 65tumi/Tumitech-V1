const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Store temporary codes
let codes = {};

// Generate random 8-digit code
function generateCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Request pairing code
app.post("/pair", (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  const code = generateCode();
  codes[code] = { phone, createdAt: Date.now() };

  console.log(`[TUMITECH V1] Pairing code ${code} generated for ${phone}`);
  res.json({ code });
});

// Verify code
app.post("/verify", (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const entry = codes[code];

  if (!entry) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  // Expire after 5 minutes
  if (Date.now() - entry.createdAt > 5 * 60 * 1000) {
    delete codes[code];
    return res.status(400).json({ error: "Code expired" });
  }

  console.log(`[TUMITECH V1] ${entry.phone} successfully verified with code ${code}`);
  res.json({ success: true, phone: entry.phone });
});

// Default route
app.get("/", (req, res) => {
  res.send("✅ TUMITECH V1 Pairing Server is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`[TUMITECH V1] Server running on port ${PORT}`);
});
