# 🖥️ Campus Marketplace - Backend API

Express.js backend API server for the Campus Marketplace platform. Provides RESTful endpoints for data operations and integrates with Supabase for database management.

## 🏗️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Supabase** - Database and authentication
- **CORS** - Cross-origin resource sharing
- **Body Parser** - Request body parsing

## 📁 Project Structure

```
api/
├── index.js              # Main Express server
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (not committed)
├── .env.example          # Environment template
└── node_modules/         # Dependencies (generated)
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

# Edit .env with your configuration
```

### Environment Variables

Create a `.env` file in the api directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# Database Configuration (if using direct PostgreSQL connection)
# DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Configuration (for custom authentication)
JWT_SECRET=your-very-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info
```

⚠️ **Security Note**: Never commit `.env` files to version control. Use `.env.example` as a template for required environment variables.

### Development

```bash
# Start the server
npm run dev

# Server will run on http://localhost:3000
```

## 📡 API Endpoints

### Current Endpoints

```http
GET / - Health check endpoint
```

Returns: `"Hello from API!"`

### Planned/Future Endpoints

```http
# Authentication
POST /auth/login
POST /auth/register
POST /auth/logout

# Listings
GET /listings
POST /listings
PUT /listings/:id
DELETE /listings/:id

# Users
GET /users
GET /users/:id
PUT /users/:id

# Messages
GET /messages/:conversationId
POST /messages

# Orders
GET /orders
POST /orders
PUT /orders/:id/status
```

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests (if implemented)
npm test

# Lint code (if configured)
npm run lint
```

## 🗄️ Database Integration

### Supabase Setup

The API integrates with Supabase for:
- Database operations
- Authentication
- File storage
- Real-time subscriptions

### Database Schema

The application uses the following main tables:
- `users` - User accounts and profiles
- `listings` - Marketplace items for sale
- `messages` - Buyer-seller communication
- `orders` - Purchase transactions
- `notifications` - Activity notifications

## 🔐 Security Features

### Row Level Security (RLS)
- Supabase RLS policies ensure users can only access their own data
- Admin users have elevated permissions for moderation

### Authentication
- JWT-based authentication via Supabase
- Role-based access control (admin vs student)
- Secure password hashing

### CORS Configuration
- Configured to allow requests from the frontend domain
- Prevents unauthorized cross-origin requests

## 🚀 Deployment

### Production Deployment

1. **Environment Variables**: Set all required environment variables in your hosting platform

2. **Build Process**:
   ```bash
   npm install --production
   npm run build  # If build step exists
   ```

3. **Start Command**:
   ```bash
   npm start
   ```

### Hosting Options

- **Railway**
- **Render**
- **Heroku**
- **Vercel** (serverless functions)
- **AWS EC2/Lambda**
- **DigitalOcean App Platform**

### Example Deployment Configuration

For Vercel (`vercel.json`):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

## 🧪 Testing

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:3000/

# Expected response: "Hello from API!"
```

### API Testing Tools

- **Postman** - API testing and documentation
- **Insomnia** - REST client
- **Thunder Client** (VS Code extension)

## 📊 Monitoring

### Logging

The server logs:
- Incoming requests
- Error conditions
- Authentication attempts
- Database operations

### Health Checks

- `GET /` - Basic health check
- `GET /health` - Detailed health status (if implemented)

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill the process
   kill -9 <PID>
   ```

2. **Environment variables not loading**:
   - Ensure `.env` file exists in the api directory
   - Check variable names match exactly
   - Restart the server after changing env vars

3. **Database connection issues**:
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure Supabase project is active

4. **CORS errors**:
   - Verify frontend URL is allowed in CORS configuration
   - Check request headers and preflight requests

## 📚 API Documentation

### Request/Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "error": "Error details"
}
```

## 🔄 Development Workflow

1. **Local Development**: Run `npm run dev` for hot reloading
2. **Testing**: Test endpoints with Postman/Insomnia
3. **Database Changes**: Update Supabase schema and RLS policies
4. **Deployment**: Push to production with environment variables

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Supabase API Documentation](https://supabase.com/docs/guides/api)
- [REST API Design Best Practices](https://restfulapi.net/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

For frontend documentation, see [`../web/README.md`](../web/README.md).
For database setup, see [`../supabase/README.md`](../supabase/README.md).
