# Utsav - AI Agent Guide

## Project Overview
Utsav is Nepal's first ceremony service marketplace connecting families with photographers, caterers, decorators, tent suppliers, venues, and bands.

## Tech Stack
- **Frontend**: React PWA (planned) - `apps/web`
- **Backend**: Node.js/Express with TypeScript - `apps/api`
- **Database**: PostgreSQL via Prisma ORM - `apps/api/prisma`
- **Shared Package**: TypeScript types and utilities - `packages/shared`

## Commands
```bash
npm run dev           # Start both API and web in development
npm run dev:api       # Start API server only
npm run dev:web       # Start web frontend only
npm run build         # Build all packages
npm run lint          # Run ESLint
npm run typecheck     # Run TypeScript type checking
```

## Key Files
- `apps/api/src/index.ts` - Main API entry point
- `apps/api/prisma/schema.prisma` - Database schema
- `packages/shared/src/` - Shared types: user, service, payment, booking, review

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret

## Architecture Notes
- Modular monolith backend (not microservices) for Phase 0 MVP
- JWT + Refresh tokens for authentication
- Prisma for type-safe database access
- Payments via eSewa/Khalti (Nepal payment gateways)

## Nepal-Specific Considerations
- Currency: NPR (Nepali Rupees)
- Phone format: +977 98XXXXXXXX or +977 97XXXXXXXX
- Initial launch: Kathmandu Valley only

## Type Checking
The project uses TypeScript with ESM modules. Run `npm run typecheck` to verify types across the API and shared packages.