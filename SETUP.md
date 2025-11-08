# 🚀 SolveForge AI Co-Pilot - Complete Setup Guide

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for version control)
- A code editor (VS Code recommended)

## 📋 Setup Steps

### 1. Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including:
- React & React DOM
- TypeScript
- Vite (build tool)
- Tailwind CSS
- Google Gemini AI SDK
- React Flow (for visualizer)
- And other dependencies

### 2. Configure Environment Variables

Your API key is already configured in `.env.local`:

```bash
GEMINI_API_KEY=AIzaSyBfNp1ko-wOpI1tCakMJF7uUt8YFQJtU_4
```

**Optional: Database Configuration (for Authentication)**

The app works without a database - all main features (Analyze, Discover, Compose) are available.

If you want to enable user authentication and conversation history:

```bash
# Add to .env.local
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

Then run:
```bash
npm run db:push    # Create database tables
```

**Important Security Notes:**
- ⚠️ Never commit `.env.local` to Git (it's already in `.gitignore`)
- ⚠️ Keep your API key secure
- ⚠️ For production, use environment variables on your hosting platform

### 3. Start the Development Server

Run the development server:

```bash
npm run dev
```

This will start:
- Frontend (Vite): `http://localhost:3000` or `http://localhost:3001`
- The app should automatically open in your browser

### 4. Verify Setup

Once the server is running, you should see:
- ✅ The app loads in light mode (matching your system theme)
- ✅ Three tabs in the sidebar: Analyze, Discover, Compose
- ✅ Theme toggle button working (sun/moon icon)
- ✅ No console errors

## 🎯 Available Scripts

### Development
```bash
npm run dev        # Start frontend and backend together
npm run client     # Start only frontend (Vite)
npm run server     # Start only backend (Express)
```

### Production
```bash
npm run build      # Build for production
npm run preview    # Preview production build
```

### Database (if using)
```bash
npm run db:push    # Push database schema
```

## 🔧 Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use
**Solution:**
- The app will automatically try port 3001 if 3000 is busy
- Or manually kill the process using the port:
```bash
lsof -ti:3000 | xargs kill -9
```

### Issue: Theme not working on Fedora
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- The app now defaults to light mode and syncs with system theme

### Issue: API Key not working
**Solution:**
- Verify the key in `.env.local`
- Restart the dev server after changing env variables
- Check the Google AI Studio for API key status

## 🌐 Browser Support

The app works best on:
- ✅ Chrome/Chromium (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Edge (Latest)

Tested on:
- ✅ Windows 10/11
- ✅ macOS
- ✅ Linux (Fedora, Ubuntu, etc.)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 📱 Features

### 1. **Analyze Tab**
- Submit a problem statement
- Get personalized analysis based on your founder profile
- View results in Cards or Visualizer mode
- Interactive flowchart visualization

### 2. **Discover Tab**
- Scan sectors for opportunities
- Get 5 personalized problem suggestions
- Click any opportunity to analyze it
- Real-world data from Google Search

### 3. **Compose Tab**
- Combine analysis and opportunities
- Generate action plans
- Task delegation (Founder/AI/Tool)
- Strategic synthesis

## 🎨 Theme System

The app now features a smart theme system:
- 🌞 Defaults to light mode
- 🌓 Syncs with your system theme
- 💾 Remembers manual toggle preference
- 🔄 Auto-updates with system theme changes

## 🔒 Security Best Practices

1. **Never expose your API key** in client-side code
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** in production
4. **Add authentication** before deploying
5. **Use HTTPS** in production

## 📦 Project Structure

```
solveforge-ai-co-pilot/
├── components/          # React components
│   ├── AnalyzeView.tsx
│   ├── DiscoverView.tsx
│   ├── ComposerView.tsx
│   ├── AnalysisVisualizer.tsx
│   ├── Sidebar.tsx
│   └── icons/
├── services/           # API services
│   └── geminiService.ts
├── server/            # Backend (Express)
├── types.ts           # TypeScript types
├── App.tsx            # Main app component
├── .env.local         # Environment variables
└── package.json       # Dependencies

```

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Custom Server
```bash
npm run build
# Serve dist/ folder with nginx/apache
```

**Remember to set environment variables on your hosting platform!**

## 🤝 Contributing

If you want to contribute or customize:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter issues:
1. Check this SETUP.md
2. Review console logs for errors
3. Verify API key is valid
4. Check network requests in DevTools
5. Restart the dev server

## 🎉 You're All Set!

Your SolveForge AI Co-Pilot is ready to use. Start by:
1. Opening the app in your browser
2. Filling out your Founder Profile
3. Submitting your first problem to analyze
4. Exploring the visualizer and other features

Happy building! 🚀
