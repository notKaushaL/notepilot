# NotePilot - AI-Powered Notes App

A modern, feature-rich notes application with AI-powered features including summarization, translation, and smart tagging.

## Features

- 📝 **Rich Text Editor** - Full formatting with alignment, colors, and fonts
- 🤖 **AI Summarization** - Intelligent note summaries
- 🏷️ **Smart Tagging** - AI-generated tags for better organization
- 🌍 **Translation** - Multi-language translation support
- 🔐 **Encryption** - Secure note encryption with passwords
- 📱 **Responsive Design** - Works on desktop and mobile

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Build for Production

```bash
npm run build
```

## Environment Variables

Create a `.env` file with your API keys:

```
VITE_GROQ_API_KEY=your_groq_api_key
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key
```

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **AI Services**: Groq, HuggingFace
- **Storage**: LocalStorage with encryption
- **Deployment**: Vercel/Netlify ready

---

Built with ❤️ for productive note-taking