# 🎓 Campus Marketplace - Frontend

React + TypeScript frontend application for the Campus Marketplace platform. Built with modern web technologies for a fast, responsive user experience.

## 🏗️ Tech Stack

- **React 19** - UI framework with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Supabase** - Backend as a Service (Database, Auth, Storage)
- **Stripe** - Payment processing
- **SCSS** - Styling with CSS modules
- **Lucide React** - Icon library
- **Cypress** - End-to-end testing

## 📁 Project Structure

```
web/
├── src/
│   ├── api/              # API integration functions
│   ├── components/       # Reusable UI components
│   │   ├── admin/       # Admin-specific components
│   │   └── ...          # Shared components
│   ├── context/         # React context providers
│   ├── layout/          # Layout components (Header, Footer, etc.)
│   ├── lib/            # Utility functions and configurations
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin dashboard pages
│   │   ├── auth/       # Authentication pages
│   │   └── student/    # Student-facing pages
│   ├── routes/         # Routing configuration
│   ├── style/          # SCSS stylesheets
│   └── types/          # TypeScript type definitions
├── public/             # Static assets
├── cypress/           # E2E test configuration
├── dist/              # Build output (generated)
└── package.json       # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your Supabase credentials
```

### Environment Variables

Create a `.env` file in the web directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Stripe (if using payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Development

```bash
# Start development server
npm run dev

# Open in browser
# http://localhost:5173
```

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

### End-to-End Tests

```bash
# Open Cypress test runner
npm run cy:open

# Run tests headlessly
npm run cy:run
```

### Test Files

- `cypress/e2e/adminPages.cy.js` - Admin dashboard tests
- `cypress/e2e/logincampEmail.cy.js` - Login functionality tests
- `cypress/e2e/registerCampusEmail.cy.js` - Registration tests

## 🎨 Styling

### SCSS Architecture

- **Component-specific styles**: Each component has its own `.scss` file
- **Global styles**: `src/style/` contains shared stylesheets
- **BEM methodology**: Block-Element-Modifier naming convention
- **CSS Modules**: Scoped styling to prevent conflicts

### Key Style Files

- `src/style/theme.css` - Global theme variables
- `src/style/login.scss` - Authentication page styles
- `src/style/admin-dashboard.scss` - Admin dashboard styles

## 🔐 Authentication

### Supabase Auth Integration

- **Email/Password authentication**
- **Google OAuth** (students only)
- **Role-based access control** (admin vs student)
- **Protected routes** with automatic redirects

### User Roles

- **Admin**: Full access to manage listings, users, analytics
- **Student**: Buy/sell items, messaging, cart functionality

## 🛒 Features

### Student Features
- Browse marketplace listings
- Add items to cart
- Message sellers
- Create and manage listings
- View purchase history
- Report inappropriate content

### Admin Features
- Dashboard with analytics (KPIs, revenue, user stats)
- Manage all marketplace listings
- User management
- View recent activity/notifications
- Export data

## 🚀 Deployment

### Build Configuration

The app uses Vite for building and can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

### Environment Variables for Production

Ensure these are set in your deployment platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...  # For live payments
```

## 🐛 Development Scripts

```bash
# Code quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Build
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm run cy:open      # Open Cypress
npm run cy:run       # Run Cypress tests
```

## 📚 Key Components

### Authentication Flow
- `src/pages/auth/Login.tsx` - Login page with Google OAuth
- `src/pages/auth/Register.tsx` - Registration with email validation
- `src/lib/auth.ts` - Authentication utilities

### Shopping Cart
- `src/context/CartContext.tsx` - Cart state management
- `src/pages/student/StudentCart.tsx` - Cart page
- `src/pages/student/StudentCartPage.tsx` - Alternative cart implementation

### Admin Dashboard
- `src/pages/admin/AdminDashboard.tsx` - Main dashboard
- `src/pages/admin/ManageListings.tsx` - Listing management
- `src/layout/AdminLayout.tsx` - Admin layout wrapper

## 🔧 Configuration Files

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `cypress.config.ts` - Cypress test configuration

## 🚨 Troubleshooting

### Common Issues

1. **Build fails**: Clear node_modules and reinstall
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Auth not working**: Check Supabase credentials and RLS policies

3. **Styling issues**: Ensure SCSS files are imported correctly

4. **Type errors**: Run `npm run lint` to identify TypeScript issues

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Stripe Documentation](https://stripe.com/docs) (for payments)
- [Cypress Documentation](https://docs.cypress.io) (for testing)

For backend API documentation, see [`../api/README.md`](../api/README.md).
For database setup, see [`../supabase/README.md`](../supabase/README.md).