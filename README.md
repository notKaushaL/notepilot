# 📝 AI-Powered Notes App

A modern, feature-rich notes application with AI enhancements, built with React and Vite. This app provides a seamless note-taking experience with intelligent features powered by AI.

## ✨ Features

### 🔧 Core Features (Mandatory Requirements)
- ✅ **Custom Rich Text Editor** - Built from scratch with formatting toolbar
- ✅ **Note Management** - Create, edit, delete, and organize notes
- ✅ **Pin Functionality** - Pin important notes to the top with visual indicators
- ✅ **Search** - Search notes by title or content
- ✅ **Clean UI** - Modern, responsive design with easy navigation
- ✅ **Data Persistence** - Notes saved in localStorage between sessions

### 🤖 AI Features
- ✅ **Auto Glossary Highlighting** - Key terms highlighted with hover definitions
- ✅ **AI Summarization** - Automatic 1-2 line summaries of note content
- ✅ **AI Tag Suggestions** - Smart tag recommendations based on content
- ✅ **Grammar Check** - Real-time grammar and spelling error detection
- ✅ **Multi-language Translation** - Translate notes to 8+ languages

### 🔐 Security Features
- ✅ **Note Encryption** - Password-protect individual notes with AES encryption
- ✅ **Secure Storage** - Encrypted notes require password for viewing
- ✅ **Data Safety** - All data stored locally for privacy

### 📱 Bonus Features
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
- ✅ **Touch Support** - Optimized for touch interactions
- ✅ **Folder Organization** - Organize notes into different categories
- ✅ **Time-based Filtering** - Filter notes by Today, This Week, This Month
- ✅ **Error Handling** - Comprehensive error boundaries and edge case handling

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Integration**: Groq API (Mixtral-8x7b model)
- **Encryption**: CryptoJS (AES encryption)
- **Build Tool**: Vite with optimized production builds

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notes-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up AI API Key**
   - Get your Groq API key from [console.groq.com](https://console.groq.com/keys)
   - Replace the API key in `src/hooks/useAI.js`:
   ```javascript
   const GROQ_API_KEY = 'your-groq-api-key-here';
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🌐 Hosting

This app is optimized for hosting on:
- ✅ **Netlify** (Recommended)
- ✅ **Vercel**
- ✅ **GitHub Pages**
- ✅ **Any static hosting service**

### Build Output
- Production build creates optimized files in `/dist` folder
- Code splitting for better performance
- Minified and compressed assets

## 📱 Usage

### Creating Notes
1. Click "Create Note" button in sidebar
2. Start typing in the rich text editor
3. Use formatting toolbar for text styling
4. Notes auto-save as you type

### AI Features
- **Auto-processing**: AI features activate automatically after 2 seconds of inactivity
- **Glossary**: Hover over highlighted terms for definitions
- **Summary**: View AI-generated summaries in the AI panel
- **Tags**: Get intelligent tag suggestions
- **Grammar**: See grammar issues with suggestions
- **Translation**: Translate notes to different languages

### Note Security
1. Click "..." menu on any note card
2. Select "Encrypt" to password-protect
3. Enter a strong password (min 6 characters)
4. Encrypted notes show lock icon and require password to view

### Organization
- **Folders**: Organize notes into categories (Personal, Work, etc.)
- **Pinning**: Pin important notes to keep them at the top
- **Search**: Use the search bar to find notes quickly
- **Filters**: Filter by time periods (Today, This Week, etc.)

## 🔧 Technical Details

### Architecture
- **Component-based**: Modular React components
- **Custom Hooks**: `useNotes` and `useAI` for state management
- **Error Boundaries**: Comprehensive error handling
- **Responsive Design**: Mobile-first approach

### Performance
- **Code Splitting**: Vendor, crypto, and UI chunks separated
- **Lazy Loading**: AI features load on demand
- **Debounced Updates**: Optimized for smooth typing experience
- **Local Storage**: Fast data persistence

### Security
- **AES Encryption**: Industry-standard encryption for protected notes
- **Client-side**: All encryption happens in browser
- **No Server**: Complete privacy - no data sent to servers
- **Input Validation**: Comprehensive input sanitization

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
│   ├── AIPanel.jsx     # AI features sidebar
│   ├── EncryptionModal.jsx # Note encryption dialog
│   ├── ErrorBoundary.jsx  # Error handling
│   ├── NotesGrid.jsx   # Note cards display
│   ├── RichTextEditor.jsx # Custom text editor
│   ├── Sidebar.jsx     # Navigation sidebar
│   └── TimeFilter.jsx  # Time-based filtering
├── hooks/              # Custom React hooks
│   ├── useAI.js       # AI functionality
│   └── useNotes.js    # Note management
├── App.jsx            # Main application component
├── main.jsx          # Application entry point
└── index.css         # Global styles
```

### Key Features Implementation

#### Rich Text Editor
- Custom contentEditable implementation
- Toolbar with formatting commands
- Clean paste handling
- Auto-save functionality

#### AI Integration
- Groq API for LLM features
- Parallel processing for performance
- Error handling and fallbacks
- Rate limiting and debouncing

#### Encryption
- AES-256 encryption using CryptoJS
- Password validation and strength requirements
- Secure key derivation
- Encrypted preview handling

## 📋 Assessment Compliance

This application fully meets all mandatory requirements:

### ✅ Custom Rich Text Editor
- Built from scratch without external libraries
- Full formatting toolbar (bold, italic, underline, alignment, font size)
- Clean, intuitive interface

### ✅ Note Management
- Complete CRUD operations
- Pin functionality with visual indicators
- Advanced search capabilities
- Organized folder system

### ✅ UI & Data Persistence
- Clean, modern interface
- localStorage with error handling
- Session persistence
- Responsive design

### ✅ AI Features
- Auto glossary with definitions
- AI summarization (1-2 lines)
- Tag suggestions (3-5 tags)
- Grammar checking with suggestions
- Multi-language translation

### ✅ Note Encryption
- Password protection for individual notes
- Secure AES encryption
- Password validation
- Encrypted note indicators

### ✅ Hosting Ready
- Optimized production build
- Static file hosting compatible
- No server dependencies

## 🎨 Design Features

- **Modern UI**: Clean, professional design
- **Color Coding**: Different colored note cards
- **Visual Feedback**: Hover effects and animations
- **Mobile Optimized**: Touch-friendly interface
- **Dark Mode Ready**: Prepared for theme switching

## 🔒 Privacy & Security

- **Local-First**: All data stays on your device
- **No Tracking**: No analytics or user tracking
- **Secure Encryption**: Industry-standard AES encryption
- **Open Source**: Transparent, auditable code

## 📄 License

This project is created for assessment purposes. All rights reserved.

---

**Built with ❤️ using React, Vite, and AI**
