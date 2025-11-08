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
2. **Chat**: Conversational AI interface with memory - remembers entire conversation history like ChatGPT
3. **Analyze**: User-driven problem analysis with competitive landscape, feasibility assessment, and market insights
4. **Discover**: Proactive opportunity scanner that finds emerging problems in specified sectors
5. **Compose**: AI-powered strategy synthesis that creates actionable plans

### Project Structure
- `components/` - React components including views, forms, and UI elements
  - `LoginView.tsx` - User login form
  - `RegisterView.tsx` - User registration form
  - `ChatView.tsx` - Conversational AI chat interface
- `contexts/` - React context providers
  - `AuthContext.tsx` - Authentication state management
  - `ConversationContext.tsx` - Conversation history and memory management
- `services/geminiService.ts` - Core AI logic and Gemini API integration (includes chat function)
- `types.ts` - TypeScript type definitions
- `vite.config.ts` - Vite configuration (port 5000, allowedHosts enabled)

## Configuration

### Environment Variables
- `GEMINI_API_KEY` - Google Gemini API key (required)

### Development Server
- Port: 5000
- Host: 0.0.0.0 (configured for Replit environment)
- Allowed Hosts: Enabled for Replit proxy

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
  - User data stored in browser localStorage
  - Consistent styling with grid background and gradient effects
- Implemented conversation memory feature (like ChatGPT):
  - Created ConversationContext to manage chat history
  - Built ChatView component with conversational interface
  - Added chat function to geminiService that includes conversation history
  - Conversations persist across sessions (stored in localStorage per user)
  - Features: New chat, clear conversation, message history with markdown support
  - AI remembers all previous messages in the conversation for context
  - Chat set as default view for new users

## Running the Project
The project runs automatically via the configured workflow using `npm run dev`. The application is accessible through the Replit webview on port 5000.
