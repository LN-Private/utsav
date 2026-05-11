# Utsav - Nepal's Ceremony Service Marketplace

Utsav is Nepal's first ceremony service marketplace connecting families with photographers, caterers, decorators, tent suppliers, venues, and bands.

## Project Overview

Utsav provides a platform for:
- **Customers** to discover and book ceremony services
- **Providers** to showcase their services and manage bookings
- **Admins** to oversee platform operations

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite + TailwindCSS |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL via Prisma ORM |
| **Authentication** | JWT + Refresh Tokens |
| **Payment Gateways** | eSewa, Khalti (Nepal) |
| **State Management** | Zustand + React Query |
| **UI Components** | Radix UI + TailwindCSS |

## Directory Structure

```
utsav/
├── apps/
│   ├── api/           # Backend API server
│   │   ├── src/
│   │   │   ├── routes/    # API route handlers
│   │   │   ├── middleware/
│   │   │   └── index.ts   # Entry point
│   │   └── prisma/
│   │       └── schema.prisma
│   └── web/           # Frontend React application
│       ├── src/
│       │   ├── pages/     # Page components
│       │   ├── components/
│       │   └── lib/
│       └── index.html
├── packages/
│   └── shared/        # Shared types and utilities
│       └── src/
│           └── types/
└── docker-compose.yml
```

## Development Setup

### Prerequisites

- Node.js >= 20.0.0
- PostgreSQL database (local or Supabase)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/utsav.git
cd utsav

# Install dependencies
npm install
```

### Environment Variables

Create `apps/api/.env` based on `.env.example`:

```bash
cp apps/api/.env.example apps/api/.env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret

### Database Setup

```bash
# Generate Prisma client
npm run db:generate -w @utsav/api

# Push schema to database
npm run db:push -w @utsav/api

# Open Prisma Studio (optional)
npm run db:studio -w @utsav/api
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both API and web in development |
| `npm run dev:api` | Start API server only |
| `npm run dev:web` | Start web frontend only |
| `npm run build` | Build all packages |
| `npm run build:api` | Build API only |
| `npm run build:web` | Build web only |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run start` | Start production API server |

### API-specific Scripts

```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create and run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## Deployment to Vercel

Utsav is configured for deployment on Vercel using a monorepo setup.

### Prerequisites

1. Push your code to GitHub/GitLab
2. Create a Vercel account
3. Link your repository to Vercel

### Configuration

The `vercel.json` file configures:
- **API Build**: Node.js serverless functions from `apps/api/src/index.ts`
- **Web Build**: Static site from `apps/web/dist`
- **Routing**: `/api/*` routes to API, all other routes to SPA

### Environment Variables in Vercel

Set these in Vercel Dashboard → Project Settings → Environment Variables:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string | All |
| `JWT_SECRET` | Strong random string | All |
| `JWT_ACCESS_SECRET` | Strong random string | All |
| `JWT_REFRESH_SECRET` | Strong random string | All |

### Deploy Steps

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy! Vercel will automatically:
   - Install dependencies
   - Run Prisma generate
   - Build API and Web
   - Deploy serverless functions and static assets

### Production Considerations

- Update CORS settings in API for your production domain
- Configure payment gateway credentials (eSewa, Khalti)
- Set up actual SMTP/SMS providers for notifications
- Configure Redis for rate limiting in production

## Nepal-Specific Considerations

- **Currency**: NPR (Nepali Rupees)
- **Phone Format**: +977 98XXXXXXXX or +977 97XXXXXXXX
- **Initial Launch**: Kathmandu Valley only

## Architecture Notes

- Modular monolith backend for Phase 0 MVP
- JWT + Refresh tokens for authentication
- Prisma for type-safe database access
- Payments via eSewa/Khalti (Nepal payment gateways)

## License

MIT