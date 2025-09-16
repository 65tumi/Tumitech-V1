const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Store temporary codes in memory (use DB in production)
let codes = {};

// Generate 8-digit code
function generateCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Request a pairing code
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

// Verify a code
app.post("/verify", (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const entry = codes[code];

  if (!entry) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  // Auto-expire codes after 5 minutes
  if (Date.now() - entry.createdAt > 5 * 60 * 1000) {
    delete codes[code];
    return res.status(400).json({ error: "Code expired" });
  }

  console.log(`[TUMITECH V1] Phone ${entry.phone} successfully verified with code ${code}`);
  res.json({ success: true, phone: entry.phone });
});

// Default route
app.get("/", (req, res) => {
  res.send("✅ TUMITECH V1 Bot Pairing Server is running");
});

app.listen(PORT, () => {
  console.log(`[TUMITECH V1] Server running on port ${PORT}`);
});
