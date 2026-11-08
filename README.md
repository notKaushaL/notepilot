# NotePilot – AI-Powered Notes Application

A feature-rich note-taking application built with React and Vite, designed to make creating, organizing, editing, and understanding notes easier through rich-text editing and AI-assisted features.

**Live Demo:** https://notepilot.vercel.app  
**GitHub:** https://github.com/notKaushaL/notepilot

## Features

### 1. Rich Text Editor
- Built a custom rich-text editor without relying on external editor libraries.
- Supports bold, italic, underline, and strikethrough formatting.
- Provides text alignment options: left, center, right, and justify.
- Includes font-size and text-color formatting controls.
- Supports editing and formatting note content through an interactive toolbar.

### 2. Note Management
- Create, view, update, and delete notes.
- Pin important notes for quick access.
- Archive and restore notes.
- Search notes by title and content.
- Track note creation and modification timestamps.
- Organize notes through a responsive notes interface.

### 3. AI-Assisted Features
- Generate concise summaries of note content.
- Extract relevant keywords and suggest tags for categorization.
- Use Hugging Face and Cohere integrations for summarization where configured.
- Provide local NLP-based summarization as a fallback.
- Extract key phrases and estimate reading time.

### 4. Translation
- Translate note content into multiple languages.
- Supports automatic source-language detection.
- Integrates MyMemory and Google Translate endpoints.
- Uses caching and request throttling to improve reliability.

### 5. Note Security
- Supports password-based encryption for individual notes.
- Uses AES encryption through CryptoJS.
- Requires a password to access encrypted note content.
- Displays encrypted-note indicators in the interface.

### 6. User Interface
- Responsive interface for desktop, tablet, and mobile.
- Sidebar navigation and organized note views.
- Interactive AI panel and note editor.
- Reusable React components and custom hooks.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React 18, JavaScript, Vite |
| Styling | Tailwind CSS, Custom CSS |
| AI / NLP | Hugging Face, Cohere, Local NLP Processing |
| Translation | MyMemory API, Google Translate |
| Storage | Browser LocalStorage |
| Encryption | CryptoJS (AES) |
| Language Detection | Franc |
| Icons | Lucide React |
| HTTP Requests | Axios, Fetch API |
| Deployment | Vercel |

## Project Structure

```text
notepilot/
├── api/
│   ├── ai.js
│   ├── ai-production.js
│   └── translate.js
├── public/
│   ├── NotePilot-Logo.png
│   └── notepilot-favicon.svg
├── src/
│   ├── components/
│   │   ├── AIPanel.jsx
│   │   ├── EncryptionModal.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── GlossaryTooltip.jsx
│   │   ├── NotesGrid.jsx
│   │   ├── NoteSummary.jsx
│   │   ├── RichTextEditor.jsx
│   │   ├── Sidebar.jsx
│   │   └── TimeFilter.jsx
│   ├── hooks/
│   │   ├── useAI.js
│   │   ├── useNotes.js
│   │   └── useSummary.js
│   ├── services/
│   │   ├── aiSummaryService.js
│   │   ├── summaryService.js
│   │   └── translationService.js
│   ├── utils/
│   │   ├── summaryTestUtils.js
│   │   └── textUtils.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/notKaushaL/notepilot.git
   ```

2. Navigate to the project directory:

   ```bash
   cd notepilot
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure environment variables if you want to use external AI services:

   ```bash
   cp .env.example .env
   ```

   Add the required API credentials to `.env`. Check `.env.example` for the supported configuration variables.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL shown in your terminal, usually:

   ```text
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Environment Configuration

External AI services may require API credentials. Refer to `.env.example` for the available variables.

Basic note creation, editing, formatting, and local storage functionality can be used without configuring external AI credentials. Some AI-powered features depend on the availability and configuration of their respective services.

## Key Technical Highlights

- Developed a custom rich-text editor using native browser editing capabilities.
- Implemented reusable React components and custom hooks for note and AI functionality.
- Integrated external NLP services with local fallback processing.
- Implemented password-based AES encryption for individual notes.
- Built note search, pinning, archiving, and CRUD workflows.
- Added multilingual translation with language detection and caching.
- Configured the project for Vercel deployment.

## Future Improvements

- Move sensitive API credentials to secure server-side environment variables.
- Add cloud synchronization and user authentication.
- Improve encryption key management and recovery workflows.
- Add automated tests for note management and AI services.
- Improve accessibility and editor compatibility.

## Author

**Kaushal Radadiya**

- GitHub: https://github.com/notKaushaL
- LinkedIn: https://linkedin.com/in/notkaushal
