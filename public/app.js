/**
 * Fitness Buddy — Frontend Chat Logic
 * Manages conversation state, API calls, markdown rendering, and UI updates.
 */

(function () {
  "use strict";

  // ── DOM references ──────────────────────────────────────────────────────
  const chatWindow     = document.getElementById("chatWindow");
  const userInput      = document.getElementById("userInput");
  const sendBtn        = document.getElementById("sendBtn");
  const typingIndicator = document.getElementById("typingIndicator");
  const clearChatBtn   = document.getElementById("clearChatBtn");
  const topicBtns      = document.querySelectorAll(".topic-btn");

  // ── State ───────────────────────────────────────────────────────────────
  let conversationHistory = []; // [{role, content}]
  let isLoading = false;

  // ── Welcome screen ──────────────────────────────────────────────────────
  function renderWelcome() {
    chatWindow.innerHTML = "";
    const card = document.createElement("div");
    card.className = "welcome-card";
    card.innerHTML = `
      <div class="welcome-icon">💪</div>
      <h2 class="welcome-title">Welcome to Fitness Buddy!</h2>
      <p class="welcome-sub">Your personal AI-powered health and fitness coach.<br/>Ask me anything about workouts, nutrition, or motivation.</p>
      <div class="welcome-chips">
        <span class="chip" data-msg="How do I start exercising as a complete beginner?">🏃 Beginner Workout</span>
        <span class="chip" data-msg="Give me a 7-day healthy meal plan.">🥗 7-Day Meal Plan</span>
        <span class="chip" data-msg="What exercises can I do at home without equipment?">🏠 Home Exercises</span>
        <span class="chip" data-msg="How can I stay motivated to work out every day?">🔥 Stay Motivated</span>
        <span class="chip" data-msg="What should I eat before and after a workout?">🍌 Pre/Post Workout</span>
        <span class="chip" data-msg="How do I build a consistent morning fitness routine?">🌅 Morning Routine</span>
      </div>`;
    chatWindow.appendChild(card);

    // Attach chip click handlers
    card.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => sendMessage(chip.dataset.msg));
    });
  }

  // ── Format plain text → basic HTML ──────────────────────────────────────
  function formatText(text) {
    // Escape HTML first
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Headers: ### or ## or #
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm,  "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm,   "<h1>$1</h1>");

    // Bullet lists: lines starting with - or *
    html = html.replace(/^[-*] (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>\n?)+/gs, match => `<ul>${match}</ul>`);

    // Numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

    // Inline code: `code`
    html = html.replace(/`(.+?)`/g, "<code>$1</code>");

    // Paragraphs: double newlines
    html = html
      .split(/\n{2,}/)
      .map(p => p.trim())
      .filter(p => p && !p.startsWith("<h") && !p.startsWith("<ul") && !p.startsWith("<ol"))
      .map(p => p.includes("<li>") ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");

    return html;
  }

  // ── Append a message bubble ──────────────────────────────────────────────
  function appendMessage(role, content, isError = false) {
    // Remove welcome card on first real message
    const welcomeCard = chatWindow.querySelector(".welcome-card");
    if (welcomeCard) welcomeCard.remove();

    if (isError) {
      const errEl = document.createElement("div");
      errEl.className = "error-msg";
      errEl.textContent = content;
      chatWindow.appendChild(errEl);
      scrollToBottom();
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = `message ${role}`;

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = role === "user" ? "🧑" : "💪";

    const inner = document.createElement("div");

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.innerHTML = role === "bot" ? formatText(content) : escapeHtml(content).replace(/\n/g, "<br/>");

    const time = document.createElement("div");
    time.className = "msg-time";
    time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    inner.appendChild(bubble);
    inner.appendChild(time);
    wrapper.appendChild(avatar);
    wrapper.appendChild(inner);

    chatWindow.appendChild(wrapper);
    scrollToBottom();
    return bubble;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // ── Show / hide typing indicator ────────────────────────────────────────
  function setTyping(show) {
    typingIndicator.style.display = show ? "flex" : "none";
    if (show) scrollToBottom();
  }

  // ── Disable / enable input ───────────────────────────────────────────────
  function setLoading(state) {
    isLoading = state;
    sendBtn.disabled = state;
    userInput.disabled = state;
    setTyping(state);
  }

  // ── Core send function ───────────────────────────────────────────────────
  async function sendMessage(text) {
    const message = (text || userInput.value).trim();
    if (!message || isLoading) return;

    userInput.value = "";
    autoResize();
    setLoading(true);

    appendMessage("user", message);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: conversationHistory }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error");
      }

      // Update history
      conversationHistory.push({ role: "user", content: message });
      conversationHistory.push({ role: "assistant", content: data.reply });

      appendMessage("bot", data.reply);
    } catch (err) {
      appendMessage("bot", `⚠️ ${err.message || "Something went wrong. Please try again."}`, true);
    } finally {
      setLoading(false);
      userInput.focus();
    }
  }

  // ── Auto-resize textarea ─────────────────────────────────────────────────
  function autoResize() {
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 140) + "px";
  }

  // ── Event listeners ──────────────────────────────────────────────────────
  sendBtn.addEventListener("click", () => sendMessage());

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  userInput.addEventListener("input", autoResize);

  topicBtns.forEach(btn => {
    btn.addEventListener("click", () => sendMessage(btn.dataset.msg));
  });

  clearChatBtn.addEventListener("click", () => {
    conversationHistory = [];
    renderWelcome();
  });

  // ── Init ─────────────────────────────────────────────────────────────────
  renderWelcome();
  userInput.focus();
})();
