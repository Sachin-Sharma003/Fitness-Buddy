// netlify/functions/chat.js
// Netlify serverless function — wraps the IBM Granite chat logic

const { getIAMToken } = require("../../services/ibmAuth");
const { chatWithGranite } = require("../../services/graniteService");

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { message, history = [] } = body;

  if (!message || typeof message !== "string" || message.trim() === "") {
    return { statusCode: 400, body: JSON.stringify({ error: "Message is required." }) };
  }

  try {
    const token = await getIAMToken();
    const reply = await chatWithGranite(token, message.trim(), history);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    const apiErr = err.response?.data?.errors?.[0]?.message || err.response?.data?.error || "";
    const status = err.response?.status || "N/A";
    console.error(`Chat error [HTTP ${status}]:`, err.message);
    if (apiErr) console.error("API error detail:", apiErr);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: apiErr
          ? `AI service error: ${apiErr}`
          : "Failed to get a response from Fitness Buddy. Please try again.",
      }),
    };
  }
};
