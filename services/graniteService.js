/**
 * IBM Granite Chat Service
 * Sends conversation history + new user message to IBM watsonx.ai
 * and returns the model's response text.
 */

const axios = require("axios");

// ── System Prompt ─────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Fitness Buddy, a friendly, encouraging, and knowledgeable AI health and fitness coach. Your role is to:

1. **Recommend home workouts**: Suggest effective exercises and routines tailored to the user's fitness level, goals, and available equipment (bodyweight, resistance bands, dumbbells, etc.).
2. **Provide motivational tips**: Offer daily fitness inspiration, positive reinforcement, and habit-building strategies to keep users consistent.
3. **Suggest nutritious meal ideas**: Recommend simple, healthy, and balanced meal plans or snack ideas that align with the user's dietary preferences and fitness goals.
4. **Encourage consistency**: Help users build sustainable fitness habits by tracking progress milestones and celebrating small wins.

Guidelines:
- Always be warm, supportive, and non-judgmental.
- Keep advice practical, actionable, and beginner-friendly unless the user specifies they are advanced.
- Ask clarifying questions when needed (e.g., fitness goal, dietary restrictions, available time).
- Always recommend consulting a doctor before starting a new fitness program if the user mentions any health conditions.
- Keep responses concise but thorough — use bullet points and headers where helpful.
- Do NOT provide medical diagnoses or replace professional medical advice.`;

/**
 * Sends the conversation to IBM Granite and returns the assistant reply.
 *
 * @param {string} iamToken  - Valid IBM IAM Bearer token
 * @param {string} userMessage - The latest user message
 * @param {Array}  history   - Previous turns: [{role: 'user'|'assistant', content: string}]
 * @returns {Promise<string>} - The model's reply text
 */
async function chatWithGranite(iamToken, userMessage, history = []) {
  const baseUrl = process.env.WATSONX_BASE_URL || "https://us-south.ml.cloud.ibm.com";
  const modelId = process.env.GRANITE_MODEL_ID || "ibm/granite-3-8b-instruct";
  const projectId = process.env.WATSONX_PROJECT_ID;

  const endpoint = `${baseUrl}/ml/v1/text/chat?version=2024-05-31`;

  // Build messages array: system + history + new user message
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-10), // keep last 10 turns for context window efficiency
    { role: "user", content: userMessage },
  ];

  const payload = {
    model_id: modelId,
    project_id: projectId,
    messages,
    parameters: {
      max_new_tokens: 800,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.1,
    },
  };

  const response = await axios.post(endpoint, payload, {
    headers: {
      Authorization: `Bearer ${iamToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // Extract assistant text from the response
  const choice = response.data?.choices?.[0];
  const text = choice?.message?.content || choice?.text || "";

  if (!text) {
    throw new Error("Empty response from Granite model.");
  }

  return text.trim();
}

module.exports = { chatWithGranite };
