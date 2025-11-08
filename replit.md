# Forge AI Co-Pilot

## Overview
Forge AI is a personalized AI co-pilot for startup founders and innovators. It uses Google Gemini API to provide strategic analysis, opportunity discovery, and actionable planning tailored to a founder's specific context (team size, runway, tech stack, and location).

## Project Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini API (@google/genai)
- **Flow Visualization**: @xyflow/react
- **Markdown Rendering**: react-markdown with remark-gfm

### Key Features
1. **Authentication**: User registration and login with secure session management
2. **Analyze**: Integrated analysis and chat view with three tabs:
   - Analyze tab: Structured problem analysis with founder profile customization
   - Chat tab: Conversational AI interface with full conversation memory
   - History tab: Browse and switch between past conversations
   - AI remembers entire conversation context like ChatGPT
   - Persistent conversations stored in PostgreSQL database
3. **Discover**: Proactive opportunity scanner that finds emerging problems in specified sectors
4. **Compose**: AI-powered strategy synthesis that creates actionable plans

### Project Structure
- `components/` - React components including views, forms, and UI elements
  - `LoginView.tsx` - User login form
  - `RegisterView.tsx` - User registration form
  - `AnalyzeView.tsx` - Integrated chat and analysis interface with conversation history
- `contexts/` - React context providers
  - `AuthContext.tsx` - Authentication state management
  - `ConversationContext.tsx` - Conversation history and memory management
- `services/geminiService.ts` - Core AI logic and Gemini API integration (includes chat function)
- `services/apiService.ts` - Backend API client with authentication and conversation endpoints
- `server/index.ts` - Express backend server (port 3001)
- `shared/schema.ts` - Database schema definitions using Drizzle ORM
- `types.ts` - TypeScript type definitions
- `vite.config.ts` - Vite configuration (port 5000, proxy for /api requests)

## Configuration

### Environment Variables
- `GEMINI_API_KEY` - Google Gemini API key (required)

### Development Server
- Port: 5000
- Host: 0.0.0.0 (configured for Replit environment)
- Allowed Hosts: Enabled for Replit proxy

## Database Setup
Forge AI now uses a PostgreSQL database for secure, persistent data storage:
- **Users**: Stores user accounts with encrypted passwords (bcrypt)
- **Conversations**: Stores chat conversations with timestamps
- **Messages**: Stores individual messages within conversations

Backend API runs on port 3001, frontend on port 5000.

## Recent Changes (November 08, 2025)
- Imported from GitHub
- Updated Vite config to use port 5000 (Replit requirement)
- Added `allowedHosts: true` to Vite config for Replit proxy compatibility
- Configured GEMINI_API_KEY environment variable
- Set up development workflow
- Implemented authentication system:
  - Created AuthContext for user session management
  - Built LoginView and RegisterView components with matching UI design
  - Added Forge AI branding and logo to auth pages
  - Integrated dark mode toggle on login/register pages
  - Added user info display and logout in Sidebar
  - Protected routes - users must authenticate before accessing main features
  - Consistent styling with grid background and gradient effects
- Migrated to PostgreSQL database backend:
  - Created database schema with Drizzle ORM (users, conversations, messages tables)
  - Built Express API server with authentication and conversation endpoints
  - Updated AuthContext to use API instead of localStorage
  - Updated ConversationContext to use API instead of localStorage
  - Added bcrypt password hashing for security
  - Session-based authentication with tokens
  - Data now persists in database instead of browser storage
  - Fixed Vite proxy configuration to forward /api requests to backend (port 3001)
- Integrated chat into Analyze view:
  - Removed separate Chat view from navigation
  - Added three-tab interface to AnalyzeView (Analyze, Chat, History tabs)
  - Analyze tab: Structured problem analysis with founder profile (preserves Discover→Analyze→Compose workflow)
  - Chat tab: Conversational AI interface with ChatGPT-like memory
  - History tab: Browse all past conversations and switch between them
  - Set Analyze as default view on login
  - Conversations persist in PostgreSQL with full message history
  - Features: New chat, clear conversation, switch conversations from history
- Implemented contextual chat after analysis:
  - After analysis completes, conversation is automatically seeded with analysis results
  - User's problem is added as the first message in the conversation
  - Analysis results (all chunks and key insights) are formatted and added as assistant's response
  - Chat tab is automatically activated after analysis, ready for user to continue conversation
  - User can chat about the analysis with full context preserved
  - Conversation history includes both analysis and subsequent chat messages
  - Works for both auto-analysis (from Discover) and manual analysis (from Analyze tab)

## Running the Project
The project runs automatically via the configured workflow using `npm run dev`. The application is accessible through the Replit webview on port 5000.
