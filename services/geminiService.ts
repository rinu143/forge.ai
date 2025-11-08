import { GoogleGenAI, Type } from "@google/genai";
import {
  UserDrivenResponse,
  ProactiveDiscoveryResponse,
  FounderProfile,
  ComposedActionPlan,
  Problem,
  LiveData,
  Priority
} from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. Please provide a valid API key for the app to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleGeminiError = (error: any, context: string): never => {
  console.error(`Error ${context}:`, error);
  const errorMessage = String(error);
  if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
    throw new Error("You've exceeded your API quota. Please check your plan and billing details on Google AI Studio. You might need to wait a bit before trying again.");
  }
  throw new Error(`Failed to ${context}. Please check your network connection and try again.`);
};

const founderProfileSchema = {
  type: Type.OBJECT,
  properties: {
    experience_years: { type: Type.INTEGER },
    team_size: { type: Type.INTEGER },
    runway_months: { type: Type.INTEGER },
    tech_stack: { type: Type.ARRAY, items: { type: Type.STRING } },
    location: { type: Type.STRING },
    funding_stage: { type: Type.STRING, enum: ["pre-seed", "seed", "pre-series-a", "series-a+"] },
  },
  required: ['experience_years', 'team_size', 'runway_months', 'tech_stack', 'location', 'funding_stage'],
};

const userDrivenResponseSchema = {
  type: Type.OBJECT,
  properties: {
    mode: { type: Type.STRING, enum: ['user_driven'] },
    input_problem: { type: Type.STRING },
    refined_problem: { type: Type.STRING },
    founder_profile: founderProfileSchema,
    chunks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          title: { type: Type.STRING },
          analysis: { type: Type.STRING },
          key_insights: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['id', 'title', 'analysis', 'key_insights'],
      },
    },
    synthesis: {
      type: Type.OBJECT,
      properties: {
        solution_guide: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['solution_guide'],
    },
  },
  required: ['mode', 'input_problem', 'refined_problem', 'founder_profile', 'chunks', 'synthesis'],
};

const proactiveDiscoveryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    mode: { type: Type.STRING, enum: ['proactive_discovery'] },
    sector: { type: Type.STRING },
    founder_profile: founderProfileSchema,
    problems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          problem_statement: { type: Type.STRING },
          simulated_source: { type: Type.STRING },
          freshness_timestamp: { type: Type.STRING },
          personalization_note: { type: Type.STRING },
        },
        required: ['id', 'problem_statement', 'simulated_source', 'freshness_timestamp', 'personalization_note'],
      },
    },
  },
  required: ['mode', 'sector', 'founder_profile', 'problems'],
};

const composedActionPlanSchema = {
  type: Type.OBJECT,
  properties: {
    mode: { type: Type.STRING, enum: ['compose'] },
    cap_id: { type: Type.STRING, description: "UUID v4" },
    generated_at: { type: Type.STRING, description: "ISO 8601 UTC" },
    founder_profile: founderProfileSchema,
    priority: { type: Type.STRING, enum: ["urgent", "high", "medium", "low"] },
    fusion_summary: { type: Type.STRING },
    fused_insights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          from_sources: { type: Type.ARRAY, items: { type: Type.STRING } },
          insight: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
        },
        required: ['from_sources', 'insight', 'confidence'],
      },
    },
    action_plan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          owner: { type: Type.STRING, enum: ["founder", "ai", "tool"] },
          executable: { type: Type.BOOLEAN },
          command: { type: Type.STRING, nullable: true },
          status: { type: Type.STRING, enum: ["pending", "in_progress", "done"] },
          due_in_hours: { type: Type.INTEGER },
        },
        required: ['id', 'title', 'description', 'owner', 'executable', 'command', 'status', 'due_in_hours'],
      },
    },
    execution_log: { type: Type.ARRAY, items: { type: Type.STRING } },
    next_heartbeat_in_seconds: { type: Type.INTEGER },
  },
  required: ['mode', 'cap_id', 'generated_at', 'founder_profile', 'priority', 'fusion_summary', 'fused_insights', 'action_plan', 'execution_log', 'next_heartbeat_in_seconds'],
};

const composedActionPlanSchemaWithConsiderations = {
  ...composedActionPlanSchema,
  properties: {
    ...composedActionPlanSchema.properties,
    key_considerations: {
      type: Type.OBJECT,
      properties: {
        financial: { type: Type.ARRAY, items: { type: Type.STRING } },
        governmental: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['financial', 'governmental'],
    },
  },
  required: [...composedActionPlanSchema.required, 'key_considerations'],
};

export const analyzeProblem = async (problem: string, founderProfile: FounderProfile): Promise<UserDrivenResponse> => {
  const systemInstruction = `
    You are Forge AI, a personalized co-pilot for founders. Your task is to analyze a user-submitted problem and generate a structured JSON report that is DEEPLY PERSONALIZED to the provided founder's profile. You must strictly adhere to the provided JSON schema.

    Founder Profile for this analysis: ${JSON.stringify(founderProfile)}

    Follow this 8-step process with absolute precision, tailoring every step to the founder's profile:
    1.  **Refine Problem:** Rewrite the user's input into a precise, actionable problem statement. Incorporate context from the founder's profile, especially their location and team size. For example, "Predict crop failure" for a 2-person team in Bihar becomes "Enable a 2-person team in Bihar to predict crop loss 7 days ahead using free satellite data and SMS alerts."
    2.  **Chunk 1 - Existing Solutions & Gaps:** The chunk title must be exactly "Existing Solutions & Gaps". Simulate a web search for 3-5 competitors. Filter or critique them based on the founder's constraints. For example, flag solutions as "too expensive" if they would exhaust the founder's runway. Note gaps that are exploitable by a small, agile team.
    3.  **Chunk 2 - Feasibility & Scalability:** The chunk title must be exactly "Feasibility & Scalability". Your analysis MUST be based on the founder's runway and team size.
        -   **MVP Cost:** Use this logic: runway <= 3 months -> '< ₹50,000'; runway <= 6 months -> '₹50K - ₹2 Lakh'; else -> '₹2L - ₹10L'.
        -   **Tech Stack:** Recommend a stack that aligns with the founder's preferred tech_stack and is suitable for their team_size. Prioritize free tiers and low-code/no-code solutions if the runway is short.
        -   **Scalability:** Rate as Low, Medium, or High, justifying it based on the recommended tech stack (e.g., 'High due to serverless architecture').
    4.  **Chunk 3 - Market & Edge:** The chunk title must be exactly "Market & Edge".
        -   **TAM:** Simulate a search for the market size, but then narrow it down to the founder's location (e.g., "Estimate the TAM for EdTech in Tier-2 Indian cities").
        -   **Target User & UVP:** Define a specific user persona relevant to the location. The UVP must be a compelling advantage for that niche (e.g., "Offline-first SMS alerts for farmers in low-connectivity regions").
        -   **Govt Support:** Mention relevant Indian government schemes.
        -   **Govt Support:** Identify 1-2 specific Indian government schemes (e.g., Startup India Seed Fund, TIDE 2.0) that are highly relevant to the startup's sector, the founder's location, and funding stage. For each scheme, provide a brief on its benefits and a direct link to its official page.
    5.  **Chunk 4 - Resources & Timeline:** The chunk title must be exactly "Resources & Timeline".
        -   **Team:** The team composition must match the founder's team_size.
        -   **Timeline:** The MVP timeline must be realistic for the founder's runway_months: runway <= 3 months -> '2-3 weeks'; runway <= 6 months -> '4-6 weeks'; else -> '2-3 months'.
    6.  **Chunk 5 - Ethics & Risks:** The chunk title must be exactly "Ethics & Risks". Identify 1-2 risks directly related to the founder's context, like "Model bias in regional dialects" if location is specific, and suggest a mitigation.
    7.  **Synthesis:** Create a 'solution_guide' with 5-7 concrete, actionable steps the founder can take immediately, given their profile. Recommend specific free-tier tools (e.g., "Set up Gemini API free tier," "Use Vercel for hosting").
    8.  **Output:** Ensure the entire output is a single, valid JSON object matching the schema, including the founder's profile.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Analyze this problem: "${problem}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: userDrivenResponseSchema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as UserDrivenResponse;
  } catch (error) {
    handleGeminiError(error, "analyze the problem");
  }
};


export const discoverOpportunities = async (sector: string, founderProfile: FounderProfile): Promise<ProactiveDiscoveryResponse> => {
  const systemInstruction = `
    You are Forge AI, a personalized co-pilot for founders. Your task is to scan a given sector and generate a JSON report of exactly 5 "hot" problems that are HIGHLY PERSONALIZED and viable for the provided founder's profile. You must strictly adhere to the provided JSON schema.

    Founder Profile for this discovery: ${JSON.stringify(founderProfile)}

    Follow this 4-step process with absolute precision:
    1.  **Identify Sector:** The user's input is the sector to scan.
    2.  **Simulate Fresh Scan:** Simulate scanning recent activity from diverse sources (GitHub, arXiv, Reddit, tech news) to find emerging pain points.
    3.  **Generate 5 Personalized Hot Problems:** From your simulated scan, generate 5 diverse problems. Each problem MUST be filtered and framed to be a perfect fit for the founder's profile.
        -   **Viability Filter:** Only select problems that can be addressed with an MVP within the founder's runway_months and by their team_size. Do not suggest capital-intensive or large-team ideas.
        -   **Tech Stack Alignment:** Prioritize problems that can be solved using the founder's preferred tech_stack.
        -   **Location Relevance:** Find problems that are particularly acute or offer a unique advantage in the founder's location.
        -   **Personalization Note:** For each problem, you MUST write a concise 'personalization_note' explaining *why* this specific problem is a good fit for this founder. Example: "Fits your 3-month runway: solvable in 10 days with under ₹30K," or "Leverages your team's Python skills and is a major issue in your location."
        -   **Timestamp:** Provide a recent ISO 8601 timestamp for each problem.
    4.  **Output:** Ensure the entire output is a single, valid JSON object with exactly 5 problems, matching the schema perfectly and including the founder's profile.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Scan this sector: "${sector}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: proactiveDiscoveryResponseSchema,
      },
    });
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as ProactiveDiscoveryResponse;
    if (result.problems && result.problems.length > 5) {
      result.problems = result.problems.slice(0, 5);
    }
    return result;
  } catch (error) {
    handleGeminiError(error, "discover opportunities");
  }
};

export const composeActionPlan = async (
  analysis: UserDrivenResponse,
  opportunities: Problem[],
  liveData: LiveData[],
  founderProfile: FounderProfile,
  priority: Priority
): Promise<ComposedActionPlan> => {
  const systemInstruction = `
    You are the Forge AI "Composer," the central brain of Project Aura. Your purpose is to synthesize multiple data streams into a single, executable, cross-domain action plan. You must act as an autonomous agent, fusing insights and generating tangible actions. Strictly adhere to the JSON schema.

    **INPUTS FOR FUSION:**
    1.  **Founder Profile:** ${JSON.stringify(founderProfile)}
    2.  **Problem Analysis:** ${JSON.stringify(analysis)}
    3.  **Discovered Opportunities:** ${JSON.stringify(opportunities)}
    4.  **Live Data Stream:** ${JSON.stringify(liveData)}
    5.  **Stated Priority:** ${priority}

    **7-STEP FUSION ENGINE DIRECTIVE:**
    1.  **Ingest & Normalize:** Review all provided inputs. Identify key constraints from the founder profile (runway, team size), core insights from the analysis (especially financial estimates from 'Feasibility & Scalability' and government schemes from 'Market & Edge'), high-potential problems from opportunities, and urgent signals from the live data.
    2.  **Cross-Domain Matching:** Find non-obvious connections between the inputs. For example, connect a 'key_insight' from the analysis with a user comment from 'liveData' and a relevant 'problem_statement' from the opportunities. The goal is to find threats or opportunities that only emerge when looking at the whole picture.
    3.  **Insight Fusion:** Generate 2-5 high-quality 'fused_insights'. Each must cite its sources (e.g., "analysis.chunk2", "opportunities[0]", "liveData.slack"). Assign a 'confidence' score (0.0 to 1.0) based on how strongly the data supports the insight. A high-confidence insight might be, "The offline crash reported in Slack directly threatens the core UVP of serving farmers in low-connectivity areas, which was a key part of the analysis. This is a critical threat."
    4.  **Priority Scoring:** Synthesize a single 'fusion_summary' that explains the most critical takeaway. Then, use the user's stated 'priority' and the founder's constraints (especially a short runway) to determine the urgency of the action plan.
    5.  **Action Plan Synthesis:** Generate 3-7 'action_plan' tasks. These must be concrete and actionable.
        -   **Ownership:** Assign tasks to 'founder' (requires human decision), 'ai' (can be automated), or 'tool' (a specific integration).
        -   **Executability:** About 60% of tasks should be 'executable' by an AI. For these, provide a mock 'command' string (e.g., "github create issue --title 'Fix offline crash'"). For founder tasks, the command should be null.
        -   **Deadlines:** Assign a 'due_in_hours' that is aggressive and reflects the project's priority and the founder's runway.
    6.  **Auto-Execution Simulation:** Populate the 'execution_log' with 1-2 entries simulating that you have ALREADY taken the first step. For example: "EXECUTION: AI created GitHub issue #123 for 'Fix offline crash'." This makes the plan feel alive.
    7.  **Output & Schedule:** Generate a UUID for 'cap_id' and a current ISO 8601 UTC timestamp for 'generated_at'. Extract financial and governmental notes from the 'analysis' input into the 'key_considerations' field. Set the 'next_heartbeat_in_seconds' based on priority: 'urgent' -> 300, 'high' -> 900, 'medium' -> 1800, 'low' -> 3600. The entire output must be a single, valid JSON object that strictly follows the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: "Compose the action plan based on the provided data.",
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: composedActionPlanSchemaWithConsiderations,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ComposedActionPlan;
  } catch (error) {
    handleGeminiError(error, "compose the action plan");
  }
};