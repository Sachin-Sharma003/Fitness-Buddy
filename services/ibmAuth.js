/**
 * IBM IAM Token Service
 * Fetches a short-lived Bearer token using the IBM Cloud API Key.
 * Caches the token in memory and refreshes before expiry.
 */

const axios = require("axios");

let cachedToken = null;
let tokenExpiry = 0; // Unix timestamp (ms)

/**
 * Returns a valid IBM IAM Bearer token.
 * Automatically refreshes when the cached token is within 60 s of expiry.
 */
async function getIAMToken() {
  const now = Date.now();

  // Return cached token if still valid
  if (cachedToken && now < tokenExpiry - 60_000) {
    return cachedToken;
  }

  const iamUrl = process.env.IBM_IAM_URL || "https://iam.cloud.ibm.com/identity/token";

  const params = new URLSearchParams();
  params.append("grant_type", "urn:ibm:params:oauth:grant-type:apikey");
  params.append("apikey", process.env.IBM_API_KEY);

  const response = await axios.post(iamUrl, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  cachedToken = response.data.access_token;
  // expires_in is in seconds
  tokenExpiry = now + response.data.expires_in * 1000;

  return cachedToken;
}

module.exports = { getIAMToken };
