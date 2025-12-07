# 🎓 Campus Marketplace

A full-stack e-commerce platform built for university students to buy and sell items within their campus community. Built with React, TypeScript, Supabase, and Stripe integration.

## 📁 Project Structure

```
Group3_Campus_Marketplace/
├── api/                    # Express.js backend API
├── web/                    # React + TypeScript frontend
├── supabase/              # Supabase Edge Functions & Database
├── assets/                # Static assets and CSS
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Supabase Account** - [Sign up](https://supabase.com)
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
git clone <your-repo-url>
   cd Group3_Campus_Marketplace
```

2. **Install dependencies**
   ```bash
   # Backend dependencies
cd api
npm install

   # Frontend dependencies
cd ../web
npm install
```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp ../api/.env.example ../api/.env
   cp .env.example .env

   # Edit the .env files with your actual values (see setup guides below)
   ```

4. **Run the applications**
   ```bash
   # Terminal 1 - Backend
cd api
npm run dev

   # Terminal 2 - Frontend
cd web
npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🛠️ Detailed Setup

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Get your project credentials**:
   - Go to Settings → API
   - Copy your Project URL and API keys

3. **Configure environment variables** in `web/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Database Setup**:
   - Run the SQL migrations in Supabase SQL Editor
   - Set up Row Level Security (RLS) policies
   - Configure authentication providers (Google OAuth)

### Stripe Integration (Optional)

For payment processing, follow the guide in [`web/README_Stripe.md`](./web/README_Stripe.md)

## 📚 Documentation

- **[Frontend Guide](./web/README.md)** - React app setup and development
- **[API Guide](./api/README.md)** - Backend API documentation
- **[Database Guide](./supabase/README.md)** - Supabase setup and schema
- **[Stripe Integration](./web/README_Stripe.md)** - Payment processing setup

## 🧪 Testing

### End-to-End Tests
```bash
cd web
npm run cy:open  # Opens Cypress test runner
npm run cy:run   # Runs tests headlessly
```

### Development Scripts

```bash
# Frontend
cd web
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend
cd api
npm run dev          # Start Express server
```

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use SCSS for styling with BEM methodology
- Commit messages follow conventional commits

### Branching Strategy
- `main` - Production code
- `develop` - Development branch
- Feature branches: `feature/branch-name`
- Bug fixes: `fix/issue-description`

### Database Schema
- Users table with roles (admin/student)
- Listings table with seller relationships
- Messages system for buyer-seller communication
- Notifications for activity tracking

## 🚨 Common Issues & Troubleshooting

### Port Conflicts
```bash
# Kill processes on specific ports
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:3000 | xargs kill -9   # Backend
```

### Database Connection Issues
- Ensure Supabase project is active
- Check environment variables are correct
- Verify RLS policies are configured

### Build Issues
```bash
# Clear caches and reinstall
cd web && rm -rf node_modules .vite
npm install

cd ../api && rm -rf node_modules
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of a university coursework assignment.

## 👥 Team

Group 3 - Campus Marketplace Development Team

---

For detailed documentation on each component, see the individual README files in their respective directories.
