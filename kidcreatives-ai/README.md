# KidCreatives AI

**Teaching AI Literacy Through Creative Expression**

An educational web application that transforms AI from a "black box" into a "glass box" for children aged 7-10, teaching prompt engineering through interactive art creation.

🚀 **Live Demo**: [https://kidcreativesai.netlify.app/]  
📹 **Demo Video**: https://youtu.be/KmWL4p0KPMA 
🏆 **Hackathon**: Dynamous Kiro Hackathon (January 2026)

---

## 📖 Overview

KidCreatives AI is an educational platform that teaches children how AI systems work by making the prompt engineering process visible and interactive. Instead of just generating art, children learn **how** AI creates by building prompts through a guided 5-phase workflow.

### The Problem We Solve

Children use AI tools daily but don't understand how they work. KidCreatives AI bridges this gap by:
- Making AI decision-making transparent ("glass box" vs "black box")
- Teaching prompt engineering through creative expression
- Providing tangible learning artifacts (certificates, prompt cards)
- Building AI literacy skills for the next generation

### Who It's For

- **Primary**: Children aged 7-10 learning AI literacy
- **Secondary**: Parents and educators seeking quality educational screen time
- **Use Cases**: Classroom AI education, home learning, creative portfolio building

---

## ✨ Key Features

### 🎨 5-Phase Educational Workflow

1. **Phase 1: Handshake** - Upload drawing, describe intent, AI analyzes and confirms
2. **Phase 2: Prompt Builder** - Answer 4 contextual questions with animated visual feedback
3. **Phase 3: Generation** - Watch AI enhance your art while preserving your drawing's "soul"
4. **Phase 4: Refinement** - Make conversational edits with localized AI inpainting
5. **Phase 5: Trophy** - Receive 3D holo-card, PDF certificate, and prompt master card

### 🎓 Educational Innovation

- **Visual Prompt Construction**: Animated code blocks show how answers become AI instructions
- **Color-Coded Learning**: Subject (blue), Variables (purple), Context (orange) for clarity
- **Contextual Questions**: AI generates relevant questions based on your drawing
- **Phygital Rewards**: Digital trophies + printable certificates proving prompt engineering skills

### 🖼️ Gallery Management

- Save unlimited creations with thumbnails
- Download certificates and prompt cards anytime
- Masonry layout with hover effects
- Delete unwanted creations

### 🔐 Child-Friendly Authentication

- Anonymous username login (COPPA-compliant)
- Email/password option for parents
- Secure Supabase backend with Row Level Security

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **Supabase Account** ([Sign up free](https://supabase.com))
- **Google Gemini API Key** ([Get key](https://ai.google.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dynamous-kiro-hackathon.git
   cd dynamous-kiro-hackathon/kidcreatives-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `kidcreatives-ai` directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configure Supabase**
   
   Run the SQL migrations in your Supabase project:
   ```sql
   -- See ../SUPABASE_SETUP.md for complete schema
   -- Or use Supabase CLI: supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
npm run preview  # Test production build locally
```

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18.3 + TypeScript 5.6 (strict mode)
- Vite 6.0 (fast dev server, optimized builds)
- TailwindCSS 3.4 (custom "Constructivist Pop" theme)
- Framer Motion 11.0 (physics-based animations)
- ShadCN UI (accessible component library)

**Backend:**
- Supabase 2.39 (PostgreSQL, Auth, Storage)
- Row Level Security for data protection
- Real-time subscriptions

**AI Integration:**
- Google Gemini 2.5 Flash (Vision API for image analysis)
- Gemini 1.5 Flash (Text generation for questions)
- Gemini 2.5 Flash Image (Art generation with style transformation)
- Gemini Edit API (Localized inpainting for refinements)

**Deployment:**
- Netlify (CDN, automatic HTTPS, environment variables)

### Project Structure

```
kidcreatives-ai/
├── src/
│   ├── components/
│   │   ├── phases/          # 5 phase components (core workflow)
│   │   ├── ui/              # Reusable UI (Sparky, HoloCard, CodeBlock)
│   │   ├── landing/         # Marketing landing page
│   │   ├── gallery/         # Gallery management
│   │   ├── auth/            # Authentication modals
│   │   └── shared/          # Shared utilities
│   ├── lib/
│   │   ├── gemini/          # AI API clients
│   │   ├── supabase/        # Backend services
│   │   └── [utilities]      # PDF, stats, prompts, thumbnails
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript definitions
│   └── contexts/            # React contexts (Auth)
├── public/                  # Static assets
└── dist/                    # Production build
```

### Key Components

**Phase Components:**
- `HandshakePhase.tsx` - Image upload, intent input, vision analysis
- `PromptBuilderPhase.tsx` - Socratic Q&A with animated code blocks
- `GenerationPhase.tsx` - Prompt synthesis and image generation
- `RefinementPhase.tsx` - Conversational editing with edit history
- `TrophyPhase.tsx` - 3D holo-card, PDF certificate, prompt master card

**Core Systems:**
- `gemini/visionClient.ts` - Image analysis with Gemini Vision
- `gemini/textClient.ts` - Contextual question generation
- `gemini/imageClient.ts` - AI art generation with style transformation
- `gemini/editClient.ts` - Localized inpainting for edits
- `supabase/galleryService.ts` - Gallery CRUD operations
- `pdfGenerator.ts` - Certificate generation with jsPDF
- `promptSynthesis.ts` - JSON → narrative prompt conversion

---

## 💡 Usage Guide

### Creating Your First Artwork

1. **Start Creating**
   - Click "Start Creating" on landing page
   - Login with username or email

2. **Phase 1: Upload & Describe**
   - Upload your drawing (PNG/JPG, max 5MB)
   - Describe what you drew (max 200 characters)
   - Click "Analyze" and wait for Sparky's response

3. **Phase 2: Build Your Prompt**
   - Answer 4 contextual questions about your art
   - Watch animated code blocks fly into the Prompt Engine
   - Each answer becomes a technical instruction

4. **Phase 3: Generate**
   - AI creates enhanced version of your drawing
   - See side-by-side comparison
   - Choose to refine or finalize

5. **Phase 4: Refine (Optional)**
   - Request changes via chat ("Add a planet in the background")
   - AI makes localized edits without regenerating
   - View edit history

6. **Phase 5: Get Your Trophy**
   - Enter your name for the certificate
   - View 3D holo-card with creativity stats
   - Download PDF certificate and prompt master card
   - Save to gallery

### Managing Your Gallery

- **View Gallery**: Click gallery icon in navigation
- **Download**: Click download button on any creation
- **Delete**: Click delete button to remove creation
- **Re-download**: Access saved certificates anytime

---

## 🎨 Design System

### Color Coding (Educational)

- **Subject Blue** (#4A90E2) - Subjects (Robot, Cat, Monster)
- **Variable Purple** (#9B59B6) - Variables (Texture, Material, Style)
- **Context Orange** (#E67E22) - Context (Lighting, Background, Era)
- **Action Green** (#27AE60) - Action buttons
- **System Grey** (#95A5A6) - System UI (Sparky dialogue)

### Animations

- **Code Blocks**: Spring physics with stagger effect
- **Sparky States**: Smooth transitions (waiting, thinking, success)
- **Holo-Card**: 3D tilt effect with mouse/device motion
- **Confetti**: Celebration animation on trophy phase

---

## 🔧 Troubleshooting

### Common Issues

**"API key not found" error:**
```bash
# Ensure .env file exists in kidcreatives-ai/ directory
# Check that VITE_GEMINI_API_KEY is set correctly
# Restart dev server after adding environment variables
```

**Supabase connection errors:**
```bash
# Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# Check Supabase project is active
# Ensure RLS policies are configured (see SUPABASE_SETUP.md)
```

**Image upload fails:**
```bash
# Check file size (max 5MB)
# Verify file type (PNG or JPG only)
# Ensure Supabase storage bucket exists
```

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 20.x or higher
```

**ESLint errors:**
```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Getting Help

- **Documentation**: See `../DEVLOG.md` for development timeline
- **Steering Docs**: Check `../.kiro/steering/` for architecture details
- **Issues**: Open an issue on GitHub
- **Kiro CLI**: Use `@prime` to load project context

---

## 📊 Performance

- **Bundle Size**: 366 KB gzipped (main chunk)
- **Build Time**: ~5 seconds
- **Load Time**: <2 seconds (first load)
- **Lighthouse Score**: *To be measured*

---

## 🧪 Testing

### Manual Testing

```bash
# Start dev server
npm run dev

# Test complete workflow:
# 1. Upload image
# 2. Complete Q&A
# 3. Generate art
# 4. Make edits
# 5. Save to gallery
```

### Code Quality

```bash
# Run TypeScript compiler
npm run build

# Run ESLint
npm run lint
```

### Browser Testing

Tested on:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Mobile Safari (iOS 16+)
- ✅ Chrome Mobile (Android 12+)

---

## 🚢 Deployment

### Netlify (Recommended)

1. **Connect repository** to Netlify
2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `kidcreatives-ai`
3. **Add environment variables** in Netlify dashboard
4. **Deploy** - automatic on push to main branch

### Manual Deployment

```bash
# Build production bundle
npm run build

# Deploy dist/ folder to any static host
# (Vercel, Cloudflare Pages, AWS S3, etc.)
```

---

## 📝 Development

### Kiro CLI Workflow

This project was built using Kiro CLI with custom prompts:

```bash
@prime              # Load project context
@plan-feature       # Plan new features
@execute            # Implement systematically
@code-review        # Quality assurance
@update-devlog      # Document progress
```

See `../.kiro/prompts/` for all custom commands.

### Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- **Dynamous Kiro Hackathon** for the opportunity
- **Google Gemini** for AI capabilities
- **Supabase** for backend infrastructure
- **Vercel** for agent-browser testing tool
- **ShadCN** for accessible UI components

---

## 📞 Contact

**Project Link**: [https://github.com/yourusername/dynamous-kiro-hackathon](https://github.com/yourusername/dynamous-kiro-hackathon)

**Developer**: [Your Name]  
**Email**: your.email@example.com  
**Hackathon**: Dynamous Kiro Hackathon (January 2026)

---

**Built with ❤️ using Kiro CLI and AI-assisted development**
