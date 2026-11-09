// netlify/functions/health.js
// Netlify serverless function — health check endpoint

exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "ok",
      service: "Fitness Buddy",
      model: process.env.GRANITE_MODEL_ID || "ibm/granite-4-h-small",
    }),
  };
};
