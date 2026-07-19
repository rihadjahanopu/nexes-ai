# Nexus — Frontend

> Next.js 15 + React 19 + TypeScript frontend with Agentic AI chat interface, dark mode, and a modern SaaS design.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui + Radix UI
- **Animations:** Framer Motion
- **Data Fetching:** TanStack Query (React Query) + Axios
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React
- **Theme:** next-themes (Dark Mode)
- **Notifications:** React Hot Toast

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx       # Login page
│   │   │   └── register/page.tsx    # Register page
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Dashboard with charts & stats
│   │   ├── projects/
│   │   │   ├── page.tsx             # Projects listing (search, filter, paginate)
│   │   │   ├── new/page.tsx         # Create project form
│   │   │   └── [id]/page.tsx        # Project detail + AI Agent chat
│   │   ├── layout.tsx               # Root layout with Providers
│   │   ├── page.tsx                 # Public landing page
│   │   └── providers.tsx            # QueryClient, AuthProvider, Toaster
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx           # Responsive sticky navbar with dark mode toggle
│   │   └── ui/                      # shadcn/ui auto-generated components
│   ├── contexts/
│   │   └── AuthContext.tsx          # Auth state: user, login, logout
│   ├── hooks/
│   │   └── useDebounce.ts           # Debounce hook for search inputs
│   └── lib/
│       ├── axios.ts                  # Axios instance with JWT interceptor
│       └── utils.ts                  # shadcn/ui utility (cn)
├── .env.local                        # Local env variables (git ignored)
├── .env.example                      # Environment variable template
├── eslint.config.mjs
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

> ⚠️ Make sure the backend server is running at the URL above before starting the frontend.

### 3. Run in Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 🗺️ Pages Overview

| Route | Description | Protected |
|-------|-------------|-----------|
| `/` | Landing page (Hero, Features, CTA) | ❌ |
| `/login` | Login with email & password | ❌ |
| `/register` | Create a new account | ❌ |
| `/dashboard` | Stats, Charts, Recent Projects | ✅ |
| `/projects` | List all projects with search & filters | ✅ |
| `/projects/new` | Create a new project workspace | ✅ |
| `/projects/[id]` | Project detail + AI Agent chat interface | ✅ |

---

## 🎨 Design System

- **Color Palette:** CSS variables from shadcn/ui — Light & Dark mode support.
- **Typography:** Geist Sans (next/font/google)
- **Radius:** Consistent `rounded-2xl` cards throughout
- **Glassmorphism:** Applied on hero section and overlays
- **Animations:** Framer Motion for page transitions and micro-interactions

## ☁️ Deployment (Vercel)

1. Push your code to GitHub.
2. Import the `frontend/` directory as a new project in [Vercel](https://vercel.com).
3. Set the Framework Preset to **Next.js**.
4. Add this environment variable in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
   ```
5. Click **Deploy**.
