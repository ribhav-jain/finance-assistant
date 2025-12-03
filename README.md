# FinAI: AI-Powered Finance Assistant

> **FinAI** is a modern, AI-powered personal finance dashboard built with React, Vite. It helps you track expenses, set budgets, manage saving goals, and get smart insights and chat-based financial advice—all in a beautiful, interactive UI.

---

## ✨ Features

- **Dashboard:** Visualize your income, expenses, and trends with interactive charts.
- **Transactions:** Add, edit, filter, and categorize transactions. AI-powered auto-categorization.
- **Smart Budget:** Set and track category-based budgets. Visual feedback on spending.
- **Saving Goals:** Create and monitor progress toward your financial goals.
- **AI Insights:** Get smart, actionable insights and recommendations powered by AI.
- **Ask AI:** Chat with an AI assistant about your finances, spending habits, and more.
- **Profile & Theme:** Manage your profile and switch between light/dark mode.

---

## 🏗️ Project Structure

```
finance-assistant/
├── components/         # React UI components (Dashboard, Transactions, AI, etc.)
├── services/           # AI service integration
├── types.ts            # TypeScript types and enums
├── App.tsx             # Main app logic and state
├── index.tsx           # App entry point
├── index.html          # HTML template (TailwindCSS included)
├── vite.config.ts      # Vite configuration
├── package.json        # Project metadata and scripts
└── ...
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)

### Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Set up Gemini API key:**
   - Create a `.env.local` file in the root directory.
   - Add your Gemini API key:
     ```env
     GEMINI_API_KEY=your_key_here
     ```
3. **Run the app locally:**
   ```sh
   npm run dev
   ```
4. **Open in browser:**
   - Visit [http://localhost:5173](http://localhost:5173) (or as shown in terminal)

---

## 🛠️ Technologies Used

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** (utility-first styling)
- **Recharts** (data visualization)
- **Gemini AI** (`@google/genai`)
- **Lucide Icons**

---

## 📁 Main Components

- `Dashboard` — Overview of finances with charts
- `Transactions` — Transaction management & AI categorization
- `Smart Budget` — Budgeting by category
- `Saving Goals` — Track savings goals
- `AI Insights` — Automated insights from Gemini
- `Ask AI` — Chat interface for financial Q&A
- `Profile` — User profile and theme settings
- `Sidebar` — Navigation

---

## 🤖 AI Integration

- **AI** is used for:
  - Categorizing transactions
  - Generating financial insights
  - Answering user questions in context
- Fallback logic ensures the app works even if AI is unavailable.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
