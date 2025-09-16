const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Temporary store for pairing codes
let codes = {};

// Function to generate random 8-digit code
function generateCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Route to request a pairing code
app.post("/pair", (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  const code = generateCode();
  codes[code] = { phone, createdAt: Date.now() };

  console.log(`[TUMITECH V1] Code ${code} generated for ${phone}`);
  res.json({ code });
});

// Route to verify a code
app.post("/verify", (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const entry = codes[code];

  if (!entry) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  // Code expires after 5 minutes
  if (Date.now() - entry.createdAt > 5 * 60 * 1000) {
    delete codes[code];
    return res.status(400).json({ error: "Code expired" });
  }

  console.log(`[TUMITECH V1] Phone ${entry.phone} verified with code ${code}`);
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
