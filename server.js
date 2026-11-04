/**
 * Fitness Buddy — Express Backend
 * Connects to IBM watsonx.ai (Granite model) to power an AI fitness coach.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { getIAMToken } = require("./services/ibmAuth");
const { chatWithGranite } = require("./services/graniteService");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Routes ─────────────────────────────────────────────────────────────────

/**
 * Health check
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Fitness Buddy", model: process.env.GRANITE_MODEL_ID });
});

/**
 * Chat endpoint — receives a user message and returns AI coach response
 * Body: { message: string, history: Array<{role, content}> }
 */
app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const token = await getIAMToken();
    const reply = await chatWithGranite(token, message.trim(), history);
    res.json({ reply });
  } catch (err) {
    // Log full error detail for debugging
    const apiErr = err.response?.data?.errors?.[0]?.message || err.response?.data?.error || "";
    const status = err.response?.status || "N/A";
    console.error(`Chat error [HTTP ${status}]:`, err.message);
    if (apiErr) console.error("API error detail:", apiErr);
    res.status(500).json({
      error: apiErr
        ? `AI service error: ${apiErr}`
        : "Failed to get a response from Fitness Buddy. Please try again.",
    });
  }
});

// ── Serve frontend for any other route ────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Start server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Fitness Buddy is running at http://localhost:${PORT}`);
  console.log(`    Model : ${process.env.GRANITE_MODEL_ID}`);
  console.log(`    Region: ${process.env.WATSONX_BASE_URL}\n`);
});
