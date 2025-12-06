# 🗄️ Campus Marketplace - Database & Edge Functions

Supabase configuration, database schema, and Edge Functions for the Campus Marketplace platform. Handles data persistence, authentication, and serverless functions.

## 🏗️ Tech Stack

- **Supabase** - Backend as a Service platform
- **PostgreSQL** - Primary database
- **Deno** - Runtime for Edge Functions
- **TypeScript** - For Edge Functions
- **Row Level Security (RLS)** - Database access control

## 📁 Project Structure

```
supabase/
├── functions/                    # Edge Functions (serverless)
│   ├── create-checkout-session/ # Stripe payment integration
│   │   ├── index.ts            # Payment session creation
│   │   └── deno.json           # Deno configuration
│   └── stripe-webhook/         # Stripe webhook handler
│       ├── index.ts            # Webhook processing
│       └── deno.json           # Deno configuration
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Supabase account and project
- Supabase CLI installed
- Node.js (for CLI operations)

### Installation

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id
```

### Local Development

```bash
# Start local Supabase instance
supabase start

# View local dashboard
# http://localhost:54323
```

## 🗄️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id),
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'student')) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Listings Table
```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  status TEXT CHECK (status IN ('active', 'sold', 'pending', 'inactive')) DEFAULT 'active',
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  thumbnail_url TEXT,
  seller_id UUID REFERENCES users(id),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  sender_auth_id UUID REFERENCES auth.users(id),
  receiver_auth_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  payload JSONB,
  private BOOLEAN DEFAULT true,
  event TEXT DEFAULT 'message',
  topic TEXT,
  extension TEXT DEFAULT 'chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT,
  action TEXT,
  status TEXT CHECK (status IN ('active', 'warning', 'error')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Row Level Security (RLS) Policies

### Users Policies
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);
```

### Listings Policies
```sql
-- Anyone can view active listings
CREATE POLICY "Public listings are viewable by everyone" ON listings
  FOR SELECT USING (status = 'active');

-- Users can create their own listings
CREATE POLICY "Users can insert their own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = seller_id
  ));

-- Users can update their own listings
CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = seller_id
  ));

-- Admins can delete any listing
CREATE POLICY "admin_delete_listings" ON listings
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
    AND users.role = 'admin'
  ));
```

### Messages Policies
```sql
-- Users can view messages where they are sender or receiver
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_auth_id OR auth.uid() = receiver_auth_id
  );

-- Users can send messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_auth_id);
```

## ⚡ Edge Functions

### Create Checkout Session

**Location**: `supabase/functions/create-checkout-session/index.ts`

Creates Stripe checkout sessions for purchases. Handles:
- Cart item processing
- Price calculations
- Stripe session creation
- Success/cancel URL configuration

**Environment Variables Required**:
- `STRIPE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`

### Stripe Webhook

**Location**: `supabase/functions/stripe-webhook/index.ts`

Handles Stripe webhook events including:
- Payment success confirmation
- Order status updates
- Inventory management
- Email notifications

**Environment Variables Required**:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 Deployment

### Database Deployment

```bash
# Deploy database changes
supabase db push

# Generate types from database schema
supabase gen types typescript --local > src/types/database.ts
```

### Edge Functions Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy create-checkout-session

# Deploy with environment variables
supabase functions deploy create-checkout-session --env-file .env.local
```

## 🔧 Development Workflow

### Local Development

1. **Start Supabase locally**:
   ```bash
   supabase start
   ```

2. **Make database changes** in the SQL editor or migration files

3. **Test functions locally**:
   ```bash
   supabase functions serve create-checkout-session
   ```

4. **Deploy changes**:
   ```bash
   supabase db push
   supabase functions deploy
   ```

### Environment Variables

Set these in Supabase Dashboard → Project Settings → Functions:

```bash
# For create-checkout-session
STRIPE_SECRET_KEY=sk_test_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SITE_URL=http://localhost:5173

# For stripe-webhook
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🧪 Testing

### Database Testing

```bash
# Reset local database
supabase db reset

# Run migrations
supabase db push

# Check database health
supabase db health
```

### Function Testing

```bash
# Test function locally
curl -X POST http://localhost:54321/functions/v1/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"cartItems": [...]}'
```

### Integration Testing

Use the frontend application to test complete workflows:
- User registration/authentication
- Listing creation and browsing
- Cart and checkout process
- Message sending

## 📊 Monitoring

### Supabase Dashboard

Access these from your Supabase project dashboard:

- **Database**: Table data, query performance
- **Auth**: User management, authentication logs
- **Functions**: Edge function logs and metrics
- **Storage**: File uploads and management

### Logs and Analytics

```bash
# View function logs
supabase functions logs create-checkout-session

# View database query logs
# Available in Supabase dashboard
```

## 🚨 Troubleshooting

### Common Issues

1. **RLS Policy Errors**:
   - Check policy definitions match your schema
   - Verify auth.uid() usage in policies
   - Test policies with different user roles

2. **Function Deployment Failures**:
   - Ensure deno.json is correctly configured
   - Check environment variables are set
   - Verify function syntax and imports

3. **Database Connection Issues**:
   - Confirm connection string is correct
   - Check firewall and network settings
   - Verify SSL certificate configuration

4. **Auth Issues**:
   - Ensure auth providers are configured
   - Check redirect URLs match your domain
   - Verify JWT secrets are set

## 🔒 Security Best Practices

### Database Security
- Always use RLS policies
- Implement proper foreign key relationships
- Validate data at the database level
- Use parameterized queries

### Function Security
- Validate all input data
- Use environment variables for secrets
- Implement proper error handling
- Log security events

### Authentication Security
- Use secure password policies
- Implement account lockout mechanisms
- Enable multi-factor authentication
- Regularly rotate API keys

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Deno Documentation](https://deno.land/manual)

For frontend integration, see [`../web/README.md`](../web/README.md).
For API documentation, see [`../api/README.md`](../api/README.md).
