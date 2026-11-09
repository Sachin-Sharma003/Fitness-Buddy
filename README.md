# Fitness Buddy — AI Health & Fitness Coach

> **AICTE Problem Statement #13** — An AI-powered conversational fitness assistant built with **IBM Granite** via **IBM Cloud watsonx.ai**.

---

## Features

| Feature | Description |
|---|---|
|  **Home Workouts** | Tailored workout routines for any fitness level |
|  **Meal Planning** | Simple, nutritious meal and snack suggestions |
|  **Motivation** | Daily inspiration and habit-building tips |
|  **Consistency Coach** | Helps track habits and celebrate progress |
|  **Conversational AI** | Natural multi-turn chat powered by IBM Granite |

---

##  Architecture

```
Fitness Buddy
├── server.js                   # Express server & REST API
├── services/
│   ├── ibmAuth.js              # IBM IAM token management (with caching)
│   └── graniteService.js       # watsonx.ai Granite chat integration
├── public/
│   ├── index.html              # Chat UI
│   ├── style.css               # Dark-themed responsive design
│   └── app.js                  # Frontend chat logic
├── .env                        # IBM credentials (not committed)
└── package.json
```

---

##  Quick Start

### 1. Prerequisites
- Node.js ≥ 18
- An **IBM Cloud** account (free Lite tier works)

### 2. Get IBM Credentials

1. **IBM API Key** → [https://cloud.ibm.com/iam/apikeys](https://cloud.ibm.com/iam/apikeys)
2. **watsonx.ai Project ID** → [https://dataplatform.cloud.ibm.com](https://dataplatform.cloud.ibm.com) → Create a project → **Manage → General → Project ID**
3. Enable the **Watson Machine Learning** service on your project.

### 3. Configure `.env`

Edit the `.env` file in the project root:

```env
IBM_API_KEY=your_ibm_cloud_api_key_here
WATSONX_PROJECT_ID=your_watsonx_project_id_here
WATSONX_BASE_URL=https://us-south.ml.cloud.ibm.com
GRANITE_MODEL_ID=ibm/granite-3-8b-instruct
IBM_IAM_URL=https://iam.cloud.ibm.com/identity/token
PORT=3000
```

### 4. Install & Run

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or with auto-reload during development
npm run dev
```

### 5. Open the App

Navigate to **(https://fitness-buddy-hd4z.onrender.com/)**

---

## 🤖 IBM Granite Model Options

| Model ID | Description |
|---|---|
| `ibm/granite-3-8b-instruct` | Best for chat — fast, efficient |
| `ibm/granite-13b-chat-v2` | Larger, more detailed responses |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/chat` | Send message, get AI response |

### POST `/api/chat`

**Request:**
```json
{
  "message": "Suggest a 20-minute workout for beginners",
  "history": []
}
```

**Response:**
```json
{
  "reply": "Great choice! Here's a beginner-friendly 20-minute home workout..."
}
```

---

##  Disclaimer

Fitness Buddy provides general wellness information. It is **not** a substitute for professional medical advice. Always consult a healthcare professional before starting a new fitness program.

---

##  License

MIT © AICTE Project 2024
