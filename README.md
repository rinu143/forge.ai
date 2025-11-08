
# Forge AI

Forge AI is a personalized AI co-pilot designed to act as a strategic partner for startup founders and innovators. It moves beyond generic advice by deeply integrating a founder's specific context—team size, runway, tech stack, and location—to analyze problems, discover emerging opportunities, and compose tailored, actionable plans.

This project leverages the advanced reasoning and tool-use capabilities of the Google Gemini API to transform raw ideas into grounded, strategic roadmaps.

---

## ✨ Core Features

Forge AI is built around a three-stage workflow, designed to guide a founder from ideation to execution.

### 🔬 **Analyze**: User-Driven Problem Analysis
This is the foundational stage where an idea is pressure-tested. Founders submit a problem statement, and the AI conducts a multi-faceted analysis personalized to their profile.

-   **Problem Refinement:** Sharpens the initial idea into a precise, actionable problem statement.
-   **Competitive Landscape:** Uses Google Search to identify real-world competitors and existing solutions, analyzing their strengths and weaknesses relative to the founder's constraints.
-   **Feasibility & Scalability:** Provides a tailored assessment of MVP costs, timeline, and recommended tech stack, ensuring the plan aligns with the founder's available resources (runway, team size).
-   **Market & Edge:** Estimates the Total Addressable Market (TAM) using grounded data, defines a target user persona, and identifies a unique value proposition (UVP).
-   **Grounded Insights:** All analysis is backed by verifiable web sources, which are cited directly in the report to ensure transparency and build trust.

### 🔭 **Discover**: Proactive Opportunity Scanner
For founders exploring new territories, this tool scans a given sector to unearth real-world, emerging pain points that are a perfect match for their capabilities.

-   **Personalized Curation:** Identifies and presents 5 "hot" problems filtered to be a viable fit for the founder's specific runway, team size, location, and technical skills.
-   **Real-World Sourcing:** Leverages Google Search to find challenges from credible sources like tech news, industry forums, and market reports—no simulated or generic ideas.
-   **Justification Note:** Each opportunity includes a concise "personalization_note" that explicitly states *why* it's a strong strategic match for the founder.

### 🧠 **Compose**: AI-Powered Strategy Synthesis
This is the central intelligence of the application, acting as an autonomous agent that fuses data from the `Analyze` and `Discover` stages into a coherent, executable strategy.

-   **Insight Fusion:** Synthesizes disparate data points into a high-level strategic summary and a series of "fused insights" with confidence scores.
-   **Action Plan Generation:** Creates a tangible, step-by-step action plan with clearly defined tasks.
-   **Task Delegation:** Assigns owners (`founder`, `ai`, `tool`) to each task, distinguishing between strategic decisions, research/analysis, and automatable actions.
-   **Dynamic & Executable:** The plan is designed to be a living document, ready for execution and iteration.

---

## 🚀 Getting Started

Follow these steps to get the project running in its intended environment.

### Prerequisites
-   An environment where Node.js is available.
-   A Google AI API Key. You can get one from [Google AI Studio](https://aistudio.google.com/).

### Environment Setup
The application is designed to run in an environment where the Google AI API key is securely managed and exposed as an environment variable.

Create a `.env` file in the root of your project and add your API key:
```
API_KEY=your_google_ai_api_key_here
```
The application's service layer (`geminiService.ts`) is pre-configured to read the key from `process.env.API_KEY`. **The application will not run without this key.**

### Running the Application
Once the environment variable is set:
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm start
    ```
This will start the React development server, and you can view the application in your browser.

---

## 🛠️ How It Works & Technical Architecture

The core of Forge AI lies in its sophisticated use of the Gemini API, combined with a modern React frontend.

### AI Engineering & Prompt Design

The logic in `services/geminiService.ts` is the heart of the application.

1.  **Advanced System Prompts:** Each feature is powered by a highly detailed system instruction that acts as a "meta-program" for the AI. It defines the AI's persona (e.g., "SolveForge AI Co-Pilot"), its step-by-step process, its constraints, and critical directives. This ensures consistent, high-quality, and personalized outputs.

2.  **Tool Use for Grounding:** The AI is equipped with `googleSearch` as a tool. This is a **critical** feature that forces the model to ground its analysis in factual, up-to-date information from the web. This dramatically reduces the risk of factual inaccuracies or "hallucinations," especially for market data, competitor analysis, and trends.

3.  **JSON Mode & Schema Enforcement:** To ensure reliable communication between the AI and the UI, the application enforces a strict JSON output. A `responseSchema` is provided to the Gemini model, which compels it to return a valid, structured JSON object. This eliminates fragile string parsing and makes the application robust and predictable.

4.  **Strategic Model Selection:** The application intelligently uses different models for different tasks to balance cost, speed, and reasoning capability:
    -   `gemini-2.5-pro`: Used for complex, multi-step reasoning tasks like `analyzeProblem` and `composeActionPlan` which require deep synthesis.
    -   `gemini-2.5-flash`: Used for faster, more focused tasks like `discoverOpportunities` and `getMarketTrends` where speed is a priority.

### Frontend Architecture

-   **Component-Based UI:** Built with **React** and **TypeScript** for a modern, type-safe, and maintainable codebase.
-   **Responsive Design:** Styled with **Tailwind CSS**, ensuring a seamless experience across all devices.
-   **State Management:** Utilizes React hooks (`useState`, `useEffect`, `useCallback`) for efficient and predictable state management within components.
-   **Dynamic Views:** A central `App.tsx` component manages the active view (`Analyze`, `Discover`, `Composer`) and orchestrates the flow of data between them.
-   **User-Centric Empty States:** The UI is designed to provide value even before interaction. For example, the `Composer` view, when accessed directly, displays current market trends to inspire the user.

---

## 📂 Project Structure

```
.
├── public/               # Static assets
├── src/
│   ├── components/       # React components (Views, Forms, UI elements)
│   │   ├── icons/        # SVG icon components
│   │   └── ...
│   ├── services/
│   │   └── geminiService.ts  # Core AI logic, prompt engineering, and API calls
│   ├── types.ts          # Centralized TypeScript type definitions
│   ├── App.tsx           # Main application component and view router
│   ├── index.css         # Global styles
│   └── index.tsx         # React application entry point
├── .env                  # Environment variables (API Key)
└── package.json
```
