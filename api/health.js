// api/health.js
// Vercel serverless function — health check

module.exports = function handler(req, res) {
  res.status(200).json({
    status: "ok",
    service: "Fitness Buddy",
    model: process.env.GRANITE_MODEL_ID || "ibm/granite-4-h-small",
  });
};
