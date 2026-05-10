# 🏗️ UTSAV Technical Architecture Document
## Phase 0 — MVP Foundation
### *Nepal's First Ceremony Service Marketplace*

---

**Document Version:** 1.0  
**Date:** May 2026  
**Author:** Technical Architecture Team  
**Status:** Draft for Review  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack Selection](#2-tech-stack-selection)
3. [Infrastructure Architecture](#3-infrastructure-architecture)
4. [Third-party Integrations](#4-third-party-integrations)
5. [Security Considerations](#5-security-considerations)
6. [Development Environment Setup](#6-development-environment-setup)
7. [Project Structure](#7-project-structure)
8. [Phase 0 Implementation Roadmap](#8-phase-0-implementation-roadmap)
9. [Appendices](#9-appendices)

---

## 1. Executive Summary

### 1.1 Purpose

This document outlines the technical architecture for **Utsav** — a mobile-first marketplace connecting Nepali families with ceremony service providers (photographers, caterers, decorators, tent suppliers, venues, bands). The architecture is designed for **Phase 0 (MVP)** with a 3-4 month timeline, targeting Kathmandu Valley initially.

### 1.2 Key Architectural Principles

| Principle | Description |
|-----------|-------------|
| **Mobile-First** | 70%+ of users will access via mobile; design for low bandwidth |
| **Cost-Efficient** | Optimize for startup budget; scale when revenue justifies |
| **Nepal-Optimized** | CDN, payment gateways, SMS providers with Nepal coverage |
| **MVP-Focused** | Build only what's needed for launch; defer nice-to-haves |
| **Scalable Foundation** | Architecture should support growth without rewrites |

### 1.3 Target Metrics (Phase 0)

| Metric | Target |
|--------|--------|
| Concurrent Users | 500-1,000 |
| Service Providers | 200+ at launch |
| Monthly Bookings | 500-1,000 |
| Page Load Time | <3 seconds on 3G |
| Uptime | 99.5% |

---

## 2. Tech Stack Selection

### 2.1 Frontend

#### 2.1.1 Recommendation: **Progressive Web App (PWA) with React**

| Criteria | PWA (React) | React Native | Flutter |
|----------|-------------|--------------|---------|
| **Development Speed** | ✅ Fast | ⚠️ Medium | ⚠️ Medium |
| **Cost (Single Codebase)** | ✅ One codebase | ⚠️ iOS + Android | ⚠️ iOS + Android |
| **Nepal Market Fit** | ✅ No app store needed | ⚠️ App store friction | ⚠️ App store friction |
| **Offline Support** | ✅ Service Workers | ✅ Native | ✅ Native |
| **Low-End Device Support** | ✅ Lightweight | ⚠️ Heavier | ⚠️ Heavier |
| **Discoverability** | ✅ SEO-friendly | ❌ App store only | ❌ App store only |
| **Push Notifications** | ✅ Supported | ✅ Native | ✅ Native |
| **Future App Store** | ⚠️ Can wrap later | ✅ Ready | ✅ Ready |

**Justification:**
- **No app store friction** — Users can access immediately via browser; critical for Nepal where app downloads are costly (data charges)
- **Single codebase** — Faster development, lower cost for MVP
- **SEO benefits** — Organic discovery via Google for "photographer in Kathmandu"
- **Future-proof** — Can be wrapped in React Native later if app store presence needed

#### 2.1.2 Frontend Stack Details

```yaml
Framework: React 18+ with TypeScript
State Management: Zustand (lightweight) or Redux Toolkit
UI Library: Tailwind CSS + Headless UI
Forms: React Hook Form + Zod validation
HTTP Client: Axios with React Query (TanStack Query)
Routing: React Router v6
PWA: Workbox for service workers
Maps: Leaflet (open-source) or Google Maps SDK
```

### 2.2 Backend Framework

#### 2.2.1 Recommendation: **Node.js with Express/Fastify**

| Criteria | Node.js (Express) | Python (Django) | Go (Gin) |
|----------|-------------------|-----------------|----------|
| **Developer Availability (Nepal)** | ✅ High | ⚠️ Medium | ❌ Low |
| **Development Speed** | ✅ Fast | ✅ Fast | ⚠️ Medium |
| **JSON/API Development** | ✅ Native | ⚠️ Good | ⚠️ Good |
| **Real-time Features** | ✅ Socket.io | ⚠️ Channels | ✅ Native |
| **Ecosystem (Payments, SMS)** | ✅ Rich | ✅ Rich | ⚠️ Growing |
| **Hiring Pool** | ✅ Large | ⚠️ Medium | ❌ Small |

**Justification:**
- **Largest developer pool in Nepal** — Easier to hire and scale team
- **JavaScript everywhere** — Full-stack TypeScript reduces context switching
- **Rich ecosystem** — Libraries for eSewa, Khalti, Nepali SMS providers
- **Real-time capabilities** — Socket.io for booking notifications, chat

#### 2.2.2 Backend Stack Details

```yaml
Runtime: Node.js 20 LTS
Framework: Express.js or Fastify (Fastify for better performance)
Language: TypeScript (strict mode)
ORM: Prisma (type-safe, excellent DX)
Validation: Zod (shared with frontend)
Authentication: Passport.js + JWT
API Documentation: Swagger/OpenAPI
Testing: Jest + Supertest
```

### 2.3 Database

#### 2.3.1 Recommendation: **PostgreSQL**

| Criteria | PostgreSQL | MongoDB | MySQL |
|----------|------------|---------|-------|
| **Relational Data Fit** | ✅ Excellent | ⚠️ Document-based | ✅ Good |
| **Complex Queries** | ✅ Advanced | ⚠️ Limited | ⚠️ Basic |
| **JSON Support** | ✅ JSONB | ✅ Native | ⚠️ Limited |
| **Geospatial (Location)** | ✅ PostGIS | ⚠️ Basic | ⚠️ Basic |
| **ACID Compliance** | ✅ Full | ⚠️ Limited | ✅ Full |
| **Prisma Support** | ✅ Excellent | ✅ Good | ✅ Good |
| **Hosting Options** | ✅ All clouds | ✅ Atlas | ✅ All clouds |

**Justification:**
- **Relational data model** — Bookings, users, services, payments are inherently relational
- **PostGIS extension** — Location-based queries for "photographers near me"
- **JSONB columns** — Flexible metadata for service provider profiles
- **ACID compliance** — Critical for payment transactions
- **Prisma ORM** — Type-safe database access with excellent migrations

#### 2.3.2 Database Stack Details

```yaml
Primary Database: PostgreSQL 15+
ORM: Prisma
Caching: Redis (for sessions, frequent queries)
Search: PostgreSQL Full-Text Search (Phase 0) → Elasticsearch (Future)
Migrations: Prisma Migrate
```

### 2.4 Cloud Provider

#### 2.4.1 Recommendation: **AWS (Mumbai Region)**

| Criteria | AWS (ap-south-1) | GCP (asia-south1) | Azure (Central India) |
|----------|------------------|-------------------|----------------------|
| **Nepal Latency** | ✅ ~20-40ms | ✅ ~20-40ms | ⚠️ ~40-60ms |
| **Free Tier** | ✅ 12 months | ✅ $300 credit | ✅ 12 months |
| **Service Maturity** | ✅ Most mature | ✅ Mature | ⚠️ Growing |
| **Nepal Developer Familiarity** | ✅ High | ⚠️ Medium | ⚠️ Low |
| **CDN (CloudFront)** | ✅ Excellent | ✅ Good | ⚠️ Good |
| **Documentation** | ✅ Extensive | ✅ Good | ✅ Good |

**Justification:**
- **Mumbai region** — Closest to Nepal with lowest latency
- **Most mature ecosystem** — Best documentation, community support
- **Largest talent pool** — Easier to find AWS-experienced developers
- **CloudFront CDN** — Edge locations in Mumbai for fast content delivery

#### 2.4.2 AWS Services (Phase 0)

```yaml
Compute: EC2 (t3.micro/small) or ECS Fargate
Database: RDS PostgreSQL (db.t3.micro)
Cache: ElastiCache Redis (cache.t3.micro)
Storage: S3 (media files, documents)
CDN: CloudFront
DNS: Route 53
Email: SES (Simple Email Service)
Monitoring: CloudWatch
```

### 2.5 CI/CD Tools

#### 2.5.1 Recommendation: **GitHub Actions**

| Criteria | GitHub Actions | GitLab CI | Jenkins | CircleCI |
|----------|---------------|-----------|---------|----------|
| **Cost (Open Source)** | ✅ Free tier generous | ✅ Free | ✅ Free (self-hosted) | ⚠️ Limited free |
| **Setup Complexity** | ✅ Simple | ✅ Simple | ❌ Complex | ✅ Simple |
| **GitHub Integration** | ✅ Native | ⚠️ Good | ⚠️ Plugin | ⚠️ Good |
| **Marketplace Actions** | ✅ Extensive | ⚠️ Limited | ⚠️ Plugins | ⚠️ Limited |

**Justification:**
- **Zero additional cost** — Integrated with GitHub repository
- **Simple YAML configuration** — Easy to set up and maintain
- **Rich marketplace** — Pre-built actions for AWS deployment, testing

#### 2.5.2 CI/CD Pipeline

```yaml
Trigger: Push to main/develop branches
Stages:
  1. Lint & Type Check (ESLint, TypeScript)
  2. Unit Tests (Jest)
  3. Build (Next.js/React)
  4. Deploy to Staging (AWS)
  5. Integration Tests (Supertest)
  6. Manual Approval (Production)
  7. Deploy to Production (AWS)
```

### 2.6 Monitoring & Logging

#### 2.6.1 Recommendation: **CloudWatch + Sentry**

| Service | Purpose | Cost |
|---------|---------|------|
| **AWS CloudWatch** | Infrastructure monitoring, logs | Included with AWS |
| **Sentry** | Error tracking, performance monitoring | Free tier (5k errors/month) |
| **Uptime Robot** | External uptime monitoring | Free tier (50 monitors) |

**Justification:**
- **CloudWatch** — Native AWS integration, no additional setup
- **Sentry** — Best-in-class error tracking with stack traces
- **Uptime Robot** — Free external monitoring for uptime alerts

---

## 3. Infrastructure Architecture

### 3.1 Server Architecture

#### 3.1.1 Recommendation: **Modular Monolith**

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOAD BALANCER                            │
│                     (AWS ALB - Future)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION SERVER                          │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Auth      │  │  Booking    │  │  Payment    │             │
│  │   Module    │  │  Module     │  │  Module     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Provider   │  │  Search     │  │Notification │             │
│  │  Module     │  │  Module     │  │  Module     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │     Redis       │   │       S3        │
│   (RDS)         │ │  (ElastiCache)  │   │   (Media)       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Justification for Modular Monolith over Microservices:**

| Factor | Modular Monolith | Microservices |
|--------|------------------|---------------|
| **Development Speed** | ✅ Fast | ❌ Slow (coordination overhead) |
| **Deployment Complexity** | ✅ Simple | ❌ Complex (orchestration needed) |
| **Debugging** | ✅ Easy | ❌ Distributed tracing needed |
| **Team Size (Phase 0)** | ✅ 2-4 developers | ❌ Needs 5+ per service |
| **Infrastructure Cost** | ✅ Low | ❌ High (multiple services) |
| **Future Migration** | ✅ Can extract services | ✅ Already distributed |

**Key Design Principles:**
- **Modular code organization** — Clear boundaries between modules
- **Shared database with schema separation** — Each module has its own schema
- **Internal API contracts** — Modules communicate via defined interfaces
- **Future extraction path** — Can split into microservices when needed

### 3.2 Database Design Overview

#### 3.2.1 Core Entities

```sql
-- Users (Customers & Providers)
users (
  id, email, phone, password_hash, role, 
  full_name, avatar_url, created_at, updated_at
)

-- Service Providers (Extended profile)
service_providers (
  id, user_id, business_name, description, 
  category_id, location, latitude, longitude,
  verified, subscription_tier, rating, review_count
)

-- Service Categories
categories (
  id, name, slug, icon, parent_id, sort_order
)

-- Services (Listings)
services (
  id, provider_id, category_id, title, description,
  price_min, price_max, price_type, 
  images[], availability, location
)

-- Bookings
bookings (
  id, service_id, customer_id, provider_id,
  event_date, event_location, guest_count,
  total_amount, commission_amount, status,
  special_requests, created_at
)

-- Payments
payments (
  id, booking_id, amount, method, 
  transaction_id, status, paid_at
)

-- Reviews
reviews (
  id, booking_id, customer_id, provider_id,
  rating, comment, images[], created_at
)

-- Conversations (Messaging)
conversations (
  id, booking_id, customer_id, provider_id,
  last_message_at
)

messages (
  id, conversation_id, sender_id, 
  content, attachments[], created_at
)
```

#### 3.2.2 Database Schema Separation

```sql
-- Schema-based modular separation
CREATE SCHEMA auth;
CREATE SCHEMA providers;
CREATE SCHEMA bookings;
CREATE SCHEMA payments;
CREATE SCHEMA notifications;

-- Tables assigned to schemas
auth.users
auth.sessions
auth.verification_tokens

providers.profiles
providers.services
providers.availability

bookings.orders
bookings.messages

payments.transactions
payments.commissions

notifications.preferences
notifications.logs
```

### 3.3 CDN and Media Storage

#### 3.3.1 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUDFRONT CDN                          │
│                    (Edge: Mumbai, Delhi)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          S3 BUCKET                              │
│                                                                 │
│  /uploads/providers/{id}/photos/                                │
│  /uploads/providers/{id}/documents/                             │
│  /uploads/users/{id}/avatars/                                   │
│  /uploads/bookings/{id}/attachments/                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.3.2 Media Optimization Strategy

| Media Type | Storage | Optimization |
|------------|---------|--------------|
| **Provider Photos** | S3 | WebP format, multiple sizes (thumbnail, medium, full) |
| **User Avatars** | S3 | 200x200px, WebP, lazy loading |
| **Documents** | S3 (private) | PDF only, signed URLs |
| **Icons/Static** | S3 + CloudFront | Aggressive caching |

#### 3.3.3 Image Processing

```yaml
Service: Sharp (Node.js) or AWS Lambda@Edge
Formats: WebP (primary), JPEG (fallback)
Sizes:
  thumbnail: 150x150
  medium: 400x300
  full: 1200x900
Quality: 80%
```

### 3.4 Caching Strategy

#### 3.4.1 Multi-Layer Caching

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER CACHE                            │
│              (Service Worker, Local Storage)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CDN CACHE                               │
│              (CloudFront - Static assets, images)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION CACHE                          │
│                    (Redis - ElastiCache)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE CACHE                             │
│                 (PostgreSQL query cache)                        │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.4.2 Redis Cache Keys

```yaml
# Session Storage
session:{token} → user_data (TTL: 24 hours)

# Frequent Queries
providers:featured:{category} → provider_list (TTL: 1 hour)
providers:nearby:{lat}:{lng} → provider_list (TTL: 30 min)
categories:all → category_list (TTL: 24 hours)

# Rate Limiting
rate_limit:{ip}:{endpoint} → count (TTL: 1 minute)

# Search Results
search:{query_hash} → results (TTL: 15 minutes)
```

#### 3.4.3 Cache Invalidation Strategy

| Data Type | Cache TTL | Invalidation Trigger |
|-----------|-----------|---------------------|
| User Profile | 1 hour | Profile update |
| Provider Listings | 30 min | New listing, edit |
| Categories | 24 hours | Admin update |
| Search Results | 15 min | Time-based |
| Sessions | 24 hours | Logout, expiry |

### 3.5 Load Balancing Considerations

#### 3.5.1 Phase 0: Single Instance

```
┌─────────────────────────────────────────────────────────────────┐
│                         ROUTE 53                                │
│                    (DNS - utsav.com.np)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EC2 INSTANCE                               │
│                    (t3.small - 2 vCPU, 2GB)                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    PM2 CLUSTER MODE                      │   │
│  │              (2-4 Node.js processes)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.5.2 Phase 1: Horizontal Scaling (Future)

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LOAD BALANCER                     │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   EC2 Instance  │ │   EC2 Instance  │ │   EC2 Instance  │
│   (App Server)  │ │   (App Server)  │ │   (App Server)  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RDS PostgreSQL (Multi-AZ)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Third-party Integrations

### 4.1 Payment Gateways

#### 4.1.1 Nepal Payment Landscape

| Gateway | Market Share | API Quality | Integration Complexity |
|---------|--------------|-------------|------------------------|
| **eSewa** | ~60% | ✅ Good | Medium |
| **Khalti** | ~30% | ✅ Good | Medium |
| **Bank Transfer** | ~10% | ⚠️ Manual | High |

#### 4.1.2 Payment Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER                                 │
│                    (Books Service)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     UTSAV PLATFORM                              │
│                                                                 │
│  1. Create Booking Record (status: pending_payment)             │
│  2. Generate Payment Intent                                     │
│  3. Redirect to Payment Gateway                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│     eSewa       │ │     Khalti      │ │   Bank Transfer │
│   (Primary)     │ │   (Secondary)   │ │   (Manual)      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WEBHOOK HANDLER                              │
│                                                                 │
│  1. Verify Payment Signature                                    │
│  2. Update Booking Status (confirmed)                           │
│  3. Record Transaction                                          │
│  4. Send Confirmation SMS/Email                                 │
│  5. Notify Provider                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.1.3 Payment Integration Code Structure

```typescript
// Payment Service Interface
interface PaymentGateway {
  createIntent(amount: number, bookingId: string): Promise<PaymentIntent>;
  verifyWebhook(payload: any, signature: string): Promise<boolean>;
  verifyPayment(transactionId: string): Promise<PaymentStatus>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

// Implementations
class ESewaGateway implements PaymentGateway { ... }
class KhaltiGateway implements PaymentGateway { ... }
class BankTransferGateway implements PaymentGateway { ... }

// Factory
class PaymentGatewayFactory {
  static create(method: PaymentMethod): PaymentGateway {
    switch(method) {
      case 'esewa': return new ESewaGateway();
      case 'khalti': return new KhaltiGateway();
      case 'bank_transfer': return new BankTransferGateway();
    }
  }
}
```

#### 4.1.4 Commission Handling

```yaml
Payment Flow:
  1. Customer pays NPR 50,000 (full amount to Utsav)
  2. Utsav holds in escrow (merchant account)
  3. After event completion:
     - Commission (10%): NPR 5,000 to Utsav
     - Provider payout: NPR 45,000 via bank transfer
  
Refund Policy:
  - 7+ days before event: Full refund
  - 3-7 days: 50% refund
  - <3 days: No refund (provider discretion)
```

### 4.2 SMS/Notification Services

#### 4.2.1 Nepal SMS Providers

| Provider | Coverage | API | Cost per SMS | Recommendation |
|----------|----------|-----|--------------|----------------|
| **Ncell** | Excellent | SMPP/HTTP | NPR 0.50-1.00 | ✅ Primary |
| **Nepal Telecom** | Excellent | SMPP/HTTP | NPR 0.50-1.00 | ✅ Secondary |
| **Twilio** | Limited | REST | $0.05-0.10 | ⚠️ Backup |

#### 4.2.2 SMS Integration

```typescript
// SMS Service
interface SMSService {
  send(phone: string, message: string): Promise<SMSResult>;
  sendBulk(recipients: string[], message: string): Promise<SMSResult[]>;
}

// Nepal-specific formatting
class NepalSMSService implements SMSService {
  formatPhone(phone: string): string {
    // Handle 98/97 prefix, +977
    return phone.startsWith('+977') ? phone : `+977${phone}`;
  }
}

// Use Cases
const smsTemplates = {
  booking_confirmation: 'Utsav: Your booking with {provider} on {date} is confirmed. Ref: {ref}',
  payment_received: 'Utsav: Payment of NPR {amount} received. Booking Ref: {ref}',
  provider_new_booking: 'Utsav: New booking request from {customer} for {date}. Login to respond.',
  otp_verification: 'Utsav: Your verification code is {code}. Valid for 10 minutes.',
};
```

### 4.3 Email Services

#### 4.3.1 Recommendation: **AWS SES**

| Provider | Cost | Nepal Deliverability | Recommendation |
|----------|------|---------------------|----------------|
| **AWS SES** | $0.10/1000 emails | ✅ Good | ✅ Primary |
| **SendGrid** | Free tier available | ✅ Good | ⚠️ Backup |
| **Mailgun** | Free tier available | ⚠️ Medium | ⚠️ Backup |

#### 4.3.2 Email Use Cases

```yaml
Transactional Emails:
  - Welcome / Account Verification
  - Booking Confirmation (with PDF attachment)
  - Payment Receipt
  - Password Reset
  - Booking Status Updates

Marketing Emails (Future):
  - Weekly digest of new providers
  - Seasonal promotions (wedding season)
  - Re-engagement campaigns
```

### 4.4 Maps/Location Services

#### 4.4.1 Recommendation: **Leaflet + OpenStreetMap (Phase 0)**

| Provider | Cost | Nepal Coverage | Recommendation |
|----------|------|----------------|----------------|
| **OpenStreetMap** | Free | ✅ Good | ✅ Phase 0 |
| **Google Maps** | $200/month credit | ✅ Excellent | ⚠️ Phase 1 |
| **Mapbox** | Free tier | ⚠️ Medium | ⚠️ Future |

**Justification:**
- **Zero cost** — Critical for MVP budget
- **Good Nepal coverage** — Kathmandu well-mapped
- **No API key management** — Simpler setup

#### 4.4.2 Location Features

```yaml
Phase 0:
  - Provider location display (static map)
  - Distance calculation (Haversine formula)
  - Kathmandu Valley boundary validation

Phase 1 (Future):
  - Interactive map with filters
  - "Search near me" (GPS)
  - Service area polygons
  - Route/distance estimation
```

---

## 5. Security Considerations

### 5.1 Authentication Strategy

#### 5.1.1 Recommendation: **JWT + Refresh Tokens**

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                        │
│                                                                 │
│  1. User Login (email/phone + password)                         │
│  2. Server validates credentials                                │
│  3. Generate Access Token (JWT, 15 min expiry)                  │
│  4. Generate Refresh Token (7 days, stored in DB)               │
│  5. Return both tokens to client                                │
│                                                                 │
│  6. Client includes Access Token in Authorization header        │
│  7. Server validates JWT signature and expiry                   │
│  8. If expired, client uses Refresh Token to get new Access     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.1.2 JWT Implementation

```typescript
// Token Configuration
const authConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '15m',
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
  },
};

// Token Payload
interface JWTPayload {
  userId: string;
  role: 'customer' | 'provider' | 'admin';
  iat: number;
  exp: number;
}

// Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = verify(token, authConfig.accessToken.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### 5.1.3 OAuth Integration (Future)

```yaml
Phase 0: Email/Phone + Password only
Phase 1: Add Google OAuth (for diaspora users)
Phase 2: Add Facebook Login (for provider onboarding)
```

### 5.2 Data Protection

#### 5.2.1 Data Classification

| Data Type | Classification | Storage | Encryption |
|-----------|----------------|---------|------------|
| **Passwords** | Critical | Hashed (bcrypt) | N/A |
| **Phone Numbers** | Sensitive | Database | At rest (RDS) |
| **Email** | Sensitive | Database | At rest (RDS) |
| **Payment Info** | Critical | NOT stored | N/A |
| **ID Documents** | Sensitive | S3 (encrypted) | At rest + in transit |
| **Booking Details** | Internal | Database | At rest (RDS) |

#### 5.2.2 Security Measures

```yaml
Password Security:
  - bcrypt hashing (cost factor: 12)
  - Minimum 8 characters, complexity requirements
  - Password reset via OTP (SMS)

Data Encryption:
  - RDS: Encryption at rest (AES-256)
  - S3: Server-side encryption (SSE-S3)
  - In transit: TLS 1.3 (HTTPS only)

API Security:
  - Rate limiting (100 requests/minute per IP)
  - CORS whitelist (utsav.com.np only)
  - Input validation (Zod schemas)
  - SQL injection prevention (Prisma parameterized queries)
  - XSS prevention (React auto-escaping + CSP headers)

Headers:
  - Content-Security-Policy
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Strict-Transport-Security
```

### 5.3 Payment Security

#### 5.3.1 PCI Compliance Approach

```yaml
Strategy: Never store card details
  - Use eSewa/Khalti hosted payment pages
  - Redirect to gateway for payment
  - Receive webhook confirmation
  - Store only: transaction_id, amount, status

Webhook Security:
  - Verify signature from gateway
  - Idempotency check (prevent duplicate processing)
  - Log all webhook events
```

#### 5.3.2 Fraud Prevention

```yaml
Phase 0:
  - Phone verification (OTP) for all users
  - Email verification for providers
  - Manual review for first 100 providers

Phase 1:
  - Document verification (citizenship/license)
  - Address verification
  - Suspicious activity monitoring
```

---

## 6. Development Environment Setup

### 6.1 Environment Strategy

#### 6.1.1 Three-Environment Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEVELOPMENT (Local)                        │
│                                                                 │
│  - Local PostgreSQL (Docker)                                    │
│  - Local Redis (Docker)                                         │
│  - Hot reload enabled                                           │
│  - Test payment gateways (sandbox)                              │
│  - Mock SMS/Email (console output)                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        STAGING                                  │
│                                                                 │
│  - AWS (separate account or VPC)                                │
│  - RDS PostgreSQL (db.t3.micro)                                 │
│  - ElastiCache Redis                                            │
│  - Test payment gateways (sandbox)                              │
│  - Real SMS/Email (limited)                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PRODUCTION                                │
│                                                                 │
│  - AWS (production account)                                     │
│  - RDS PostgreSQL (db.t3.small+)                                │
│  - ElastiCache Redis                                            │
│  - Live payment gateways                                        │
│  - Real SMS/Email                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Environment Variables Management

#### 6.2.1 Environment Files Structure

```yaml
# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/utsav_dev
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=dev_access_secret
JWT_REFRESH_SECRET=dev_refresh_secret
ESEWA_MERCHANT_ID=test_merchant
ESEWA_SECRET=test_secret

# .env.staging
NODE_ENV=staging
PORT=3000
DATABASE_URL=postgresql://user:pass@staging-db:5432/utsav_staging
REDIS_URL=redis://staging-redis:6379
JWT_ACCESS_SECRET=staging_access_secret_very_long_random
JWT_REFRESH_SECRET=staging_refresh_secret_very_long_random
ESEWA_MERCHANT_ID=staging_merchant
ESEWA_SECRET=staging_secret

# .env.production (NEVER commit this)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@prod-db:5432/utsav_prod
REDIS_URL=redis://prod-redis:6379
JWT_ACCESS_SECRET=use_aws_secrets_manager
JWT_REFRESH_SECRET=use_aws_secrets_manager
ESEWA_MERCHANT_ID=prod_merchant
ESEWA_SECRET=prod_secret
```

#### 6.2.2 Secrets Management

```yaml
Phase 0 (Development):
  - .env files (gitignored)
  - dotenv package for loading

Phase 1 (Production):
  - AWS Secrets Manager for sensitive values
  - IAM roles for EC2/ECS access
  - Environment variables in ECS task definitions

Never Commit:
  - .env.production
  - Any file with "secret", "password", "key" in name
  - AWS credentials
```

### 6.3 Docker Setup

#### 6.3.1 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://utsav:utsav@postgres:5432/utsav_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: utsav
      POSTGRES_PASSWORD: utsav
      POSTGRES_DB: utsav_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 6.4 Local Development Workflow

```bash
# Initial Setup
git clone https://github.com/utsav/marketplace.git
cd marketplace
cp .env.example .env.development
docker-compose up -d
npx prisma migrate dev
npx prisma db seed

# Daily Development
docker-compose up -d  # Start dependencies
npm run dev           # Start development server (hot reload)

# Database Changes
npx prisma migrate dev --name add_new_field
npx prisma generate   # Regenerate Prisma client

# Testing
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
```

---

## 7. Project Structure

### 7.1 Monorepo Structure

```
utsav-marketplace/
│
├── 📁 apps/
│   ├── 📁 web/                    # Frontend (React PWA)
│   │   ├── 📁 public/
│   │   │   ├── favicon.ico
│   │   │   ├── manifest.json
│   │   │   └── service-worker.js
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 common/     # Shared components
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── 📁 layout/     # Layout components
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   └── ...
│   │   │   │   └── 📁 features/   # Feature-specific components
│   │   │   │       ├── 📁 auth/
│   │   │   │       ├── 📁 booking/
│   │   │   │       ├── 📁 provider/
│   │   │   │       └── 📁 search/
│   │   │   ├── 📁 hooks/          # Custom React hooks
│   │   │   ├── 📁 pages/          # Page components (routes)
│   │   │   ├── 📁 services/       # API service functions
│   │   │   ├── 📁 stores/         # Zustand stores
│   │   │   ├── 📁 types/          # TypeScript types
│   │   │   ├── 📁 utils/          # Utility functions
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── 📁 api/                    # Backend (Node.js)
│       ├── 📁 prisma/
│       │   ├── schema.prisma      # Database schema
│       │   ├── migrations/        # Database migrations
│       │   └── seed.ts            # Seed data
│       ├── 📁 src/
│       │   ├── 📁 config/         # Configuration
│       │   │   ├── database.ts
│       │   │   ├── redis.ts
│       │   │   ├── aws.ts
│       │   │   └── ...
│       │   ├── 📁 modules/        # Feature modules
│       │   │   ├── 📁 auth/
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.routes.ts
│       │   │   │   ├── auth.validation.ts
│       │   │   │   └── auth.test.ts
│       │   │   ├── 📁 bookings/
│       │   │   ├── 📁 payments/
│       │   │   ├── 📁 providers/
│       │   │   ├── 📁 search/
│       │   │   └── 📁 users/
│       │   ├── 📁 middleware/      # Express middleware
│       │   │   ├── auth.middleware.ts
│       │   │   ├── error.middleware.ts
│       │   │   ├── rateLimit.middleware.ts
│       │   │   └── validation.middleware.ts
│       │   ├── 📁 services/        # External services
│       │   │   ├── 📁 payment/
│       │   │   │   ├── esewa.service.ts
│       │   │   │   ├── khalti.service.ts
│       │   │   │   └── payment.factory.ts
│       │   │   ├── 📁 sms/
│       │   │   ├── 📁 email/
│       │   │   └── 📁 storage/
│       │   ├── 📁 utils/          # Utility functions
│       │   ├── 📁 types/          # TypeScript types
│       │   ├── app.ts             # Express app setup
│       │   └── server.ts          # Server entry point
│       ├── package.json
│       └── tsconfig.json
│
├── 📁 packages/
│   ├── 📁 shared/                 # Shared types & utilities
│   │   ├── 📁 src/
│   │   │   ├── 📁 types/          # Shared TypeScript types
│   │   │   ├── 📁 constants/      # Shared constants
│   │   │   └── 📁 utils/          # Shared utilities
│   │   └── package.json
│   │
│   └── 📁 config/                 # Shared configurations
│       ├── eslint-config.js
│       ├── tsconfig.base.json
│       └── tailwind.config.js
│
├── 📁 infrastructure/             # Infrastructure as Code
│   ├── 📁 terraform/              # Terraform configurations
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── 📁 scripts/                # Deployment scripts
│       ├── deploy.sh
│       └── setup.sh
│
├── 📁 docs/                       # Documentation
│   ├── api.md                     # API documentation
│   ├── architecture.md            # This document
│   └── setup.md                   # Setup guide
│
├── .github/
│   └── workflows/
│       ├── ci.yml                 # CI pipeline
│       └── cd.yml                 # CD pipeline
│
├── .env.example                   # Example environment variables
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml
├── package.json                   # Root package.json (workspaces)
├── turbo.json                     # Turborepo config
└── README.md
```

### 7.2 Module Structure (Backend)

Each backend module follows this structure:

```
📁 module-name/
├── module-name.controller.ts    # Request handlers
├── module-name.service.ts       # Business logic
├── module-name.routes.ts        # Route definitions
├── module-name.validation.ts    # Input validation schemas
├── module-name.test.ts          # Unit tests
└── module-name.types.ts         # Module-specific types
```

### 7.3 Component Structure (Frontend)

```
📁 ComponentName/
├── ComponentName.tsx            # Main component
├── ComponentName.test.tsx       # Component tests
├── ComponentName.styles.ts      # Component styles (if needed)
└── index.ts                     # Export barrel
```

---

## 8. Phase 0 Implementation Roadmap

### 8.1 Development Sprints

| Sprint | Duration | Focus | Deliverables |
|--------|----------|-------|--------------|
| **Sprint 0** | Week 1-2 | Setup & Architecture | Repo, CI/CD, DB schema, auth |
| **Sprint 1** | Week 3-4 | Core Features | User auth, provider profiles, search |
| **Sprint 2** | Week 5-6 | Booking System | Booking flow, calendar, notifications |
| **Sprint 3** | Week 7-8 | Payments | eSewa/Khalti integration, webhooks |
| **Sprint 4** | Week 9-10 | Polish & Testing | UI polish, testing, bug fixes |
| **Sprint 5** | Week 11-12 | Launch Prep | Staging, provider onboarding, soft launch |
| **Sprint 6** | Week 13-14 | Buffer | Contingency, performance optimization |

### 8.2 MVP Feature Priority

```yaml
P0 (Must Have):
  - User registration/login (phone + OTP)
  - Provider profiles with photos
  - Service listings with pricing
  - Search and filters
  - Booking request flow
  - eSewa/Khalti payment
  - Basic reviews and ratings
  - SMS notifications

P1 (Should Have):
  - Provider dashboard
  - Booking management
  - Email notifications
  - Map integration
  - Advanced search (location-based)

P2 (Nice to Have):
  - Real-time chat
  - Provider analytics
  - Promoted listings
  - Subscription management
```

---

## 9. Appendices

### 9.1 Technology Alternatives Considered

| Decision | Chosen | Alternatives | Reason for Choice |
|----------|--------|--------------|-------------------|
| Frontend | React PWA | React Native, Flutter | No app store friction, SEO |
| Backend | Node.js | Python, Go | Developer availability, ecosystem |
| Database | PostgreSQL | MongoDB, MySQL | Relational fit, PostGIS |
| Cloud | AWS | GCP, Azure | Nepal latency, maturity |
| CI/CD | GitHub Actions | GitLab CI, Jenkins | Cost, simplicity |

### 9.2 Cost Estimates (Monthly)

| Service | Phase 0 Cost | Phase 1 Cost |
|---------|--------------|--------------|
| AWS EC2 (t3.small) | $15-20 | $50-100 |
| RDS PostgreSQL | $15-20 | $50-100 |
| ElastiCache Redis | $10-15 | $30-50 |
| S3 Storage | $5-10 | $20-50 |
| CloudFront CDN | $5-10 | $20-50 |
| SES Email | $1-5 | $5-10 |
| SMS (Ncell/NTC) | $20-50 | $100-200 |
| Domain + SSL | $1-2 | $1-2 |
| **Total** | **$72-132** | **$276-462** |

### 9.3 Nepal-Specific Considerations

```yaml
Language:
  - Primary: Nepali (Devanagari script)
  - Secondary: English
  - UI should support both languages

Phone Numbers:
  - Format: +977 98XXXXXXXX or +977 97XXXXXXXX
  - Validation: 10 digits after country code
  - OTP verification required

Currency:
  - NPR (Nepali Rupee)
  - Format: NPR 50,000 or रु 50,000
  - No decimal places (use whole numbers)

Location:
  - Primary: Kathmandu Valley (initial)
  - Coordinates: 27.7172° N, 85.3240° E
  - PostGIS for location queries

Cultural:
  - Support for Nepali calendar (Bikram Sambat)
  - Festival seasons (Dashain, Tihar, Falgun)
  - Wedding season peaks (Falgun, Baisakh)
```

### 9.4 Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Payment gateway downtime | High | Multiple gateways (eSewa + Khalti) |
| SMS delivery failure | Medium | Retry logic, fallback provider |
| Slow internet (3G users) | High | PWA offline support, image optimization |
| Provider onboarding delays | High | Manual onboarding support, incentives |
| Data breach | Critical | Encryption, minimal data storage |

### 9.5 Future Scalability Path

```yaml
Phase 0 (MVP):
  - Modular monolith
  - Single EC2 instance
  - PostgreSQL with read replicas (future)

Phase 1 (Growth):
  - Extract high-traffic services (search, notifications)
  - Add read replicas for database
  - Implement CDN for all static assets

Phase 2 (Scale):
  - Microservices architecture
  - Kubernetes orchestration
  - Multi-region deployment
  - Advanced caching (Redis Cluster)
```

---

## Document Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Technical Lead | | | |
| Product Manager | | | |
| CEO/Founder | | | |

---

**End of Document**

*This is a living document and will be updated as the architecture evolves.*
