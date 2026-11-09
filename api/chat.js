// api/chat.js
// Vercel serverless function — wraps the IBM Granite chat logic

const { getIAMToken } = require("../services/ibmAuth");
const { chatWithGranite } = require("../services/graniteService");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, history = [] } = req.body || {};

  if (!message || typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const token = await getIAMToken();
    const reply = await chatWithGranite(token, message.trim(), history);
    return res.status(200).json({ reply });
  } catch (err) {
    const apiErr = err.response?.data?.errors?.[0]?.message || err.response?.data?.error || "";
    const status = err.response?.status || "N/A";
    console.error(`Chat error [HTTP ${status}]:`, err.message);
    if (apiErr) console.error("API error detail:", apiErr);
    return res.status(500).json({
      error: apiErr
        ? `AI service error: ${apiErr}`
        : "Failed to get a response from Fitness Buddy. Please try again.",
    });
  }
};
