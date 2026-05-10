# Utsav Marketplace Launch Checklist

## Production Launch Timeline: 3-4 Months (Aggressive)

---

## Phase 0: Foundation & Setup

### 0.1 Infrastructure Setup

- [ ] Select cloud infrastructure provider (AWS, GCP, or Azure)
- [ ] Set up development, staging, and production environments
- [ ] Configure VPC, subnets, and network security groups
- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI, or similar)
- [ ] Configure domain and DNS (utsav.com.np or utsavnepal.com)
- [ ] Set up SSL certificates for all environments
- [ ] Configure backup and disaster recovery strategy
- [ ] Set up monitoring and alerting (logs, metrics, uptime)
- [ ] Configure CDN for static assets

### 0.2 Team Composition

- [ ] Hire or assign CTO/Tech Lead
- [ ] Hire or assign Full-stack Developer (2)
- [ ] Hire or assign Mobile Developer (React Native)
- [ ] Hire or assign UI/UX Designer
- [ ] Hire or assign Project Manager
- [ ] Define roles and responsibilities matrix
- [ ] Set up team communication tools (Slack, Teams, Discord)
- [ ] Define sprint cadence and agile workflow
- [ ] Establish code review and merge processes
- [ ] Define definition of done for all tasks

### 0.3 Legal & Compliance Requirements

- [ ] Register company (Utsav Platform Pvt. Ltd.)
- [ ] Obtain VAT registration number
- [ ] Register for tax compliance (IRD)
- [ ] Draft Terms of Service for customers
- [ ] Draft Terms of Service for service providers
- [ ] Draft Privacy Policy
- [ ] Draft Refund and Cancellation Policy
- [ ] Draft Service Level Agreement
- [ ] Consult with legal counsel on payment processing regulations
- [ ] Ensure GDPR-like data protection for user data
- [ ] Register company PAN number
- [ ] Set up legal entity for payment processing
- [ ] Review Nepal's e-commerce regulations
- [ ] Draft intellectual property agreements

### 0.4 Design System & Branding

- [ ] Finalize brand identity (logo, colors, typography)
- [ ] Create style guide document
- [ ] Define color palette (primary, secondary, accent colors)
- [ ] Select and license font families
- [ ] Create component library (buttons, cards, inputs, modals)
- [ ] Design icon set or select icon library
- [ ] Define spacing and grid system
- [ ] Create error states and empty states designs
- [ ] Design loading states and skeleton screens
- [ ] Define animation guidelines
- [ ] Create brand asset templates for providers

### 0.5 Technical Architecture Decisions

- [ ] Select technology stack (React Native for mobile, Node.js/Express for backend)
- [ ] Choose database (PostgreSQL recommended for transactions)
- [ ] Choose cache layer (Redis)
- [ ] Select file storage (AWS S3, Google Cloud Storage)
- [ ] Define API architecture (REST or GraphQL)
- [ ] Design database schema for all entities
- [ ] Define authentication strategy (JWT, OAuth)
- [ ] Define payment processing architecture
- [ ] Select push notification service
- [ ] Choose email service provider
- [ ] Define SMS integration (for Nepal - verify operators)
- [ ] Design for scalability (microservices vs monolith)
- [ ] Define third-party integrations (eSewa, Khalti)
- [ ] Create API documentation standards

---

## Phase 1: MVP Development

### 1.1 User-Facing Features (Customer App/Website)

#### Authentication & Onboarding
- [ ] Phone number verification (OTP via SMS)
- [ ] Email signup and login
- [ ] Social login (Google, Facebook)
- [ ] Password reset flow
- [ ] Onboarding screens (first-time user)
- [ ] Profile creation and management
- [ ] Profile photo upload

#### Home Screen
- [ ] Featured service categories
- [ ] Recommended providers
- [ ] Upcoming festival/season highlights
- [ ] Search bar
- [ ] Quick category access
- [ ] Promotional banners

#### Service Categories
- [ ] Photographer listings
- [ ] Caterer listings
- [ ] Decorator listings
- [ ] Tent supplier listings
- [ ] Venue listings
- [ ] Band/DJ listings
- [ ] Category filtering

#### Service Details
- [ ] Provider profile page
- [ ] Service package listings
- [ ] Photo gallery/portfolio
- [ ] Pricing display (NPR)
- [ ] Service description
- [ ] Availability calendar
- [ ] Location/map display
- [ ] Contact information
- [ ] Response time display

#### Booking Flow
- [ ] Select service package
- [ ] Select event date
- [ ] Select event location
- [ ] Add event details
- [ ] Add special requests
- [ ] Review booking summary
- [ ] Payment method selection
- [ ] Booking confirmation
- [ ] Booking receipt generation

#### User Dashboard
- [ ] Active bookings view
- [ ] Past bookings view
- [ ] Booking details view
- [ ] Cancel booking option
- [ ] Reschedule booking option
- [ ] Download booking invoice
- [ ] Payment history

#### User Profile
- [ ] Edit profile information
- [ ] Manage addresses
- [ ] Notification preferences
- [ ] Language preference (English/Nepali)
- [ ] Delete account option

### 1.2 Service Provider Features (Provider Portal)

#### Provider Registration
- [ ] Business registration form
- [ ] Service category selection
- [ ] Business license upload
- [ ] Identity verification
- [ ] Bank account details (for payouts)
- [ ] Profile creation wizard

#### Provider Dashboard
- [ ] Earnings overview
- [ ] Pending bookings
- [ ] Confirmed bookings
- [ ] Completed bookings
- [ ] Cancelled bookings
- [ ] Customer messages
- [ ] Review summary
- [ ] Analytics overview

#### Service Management
- [ ] Create new service listing
- [ ] Edit service listing
- [ ] Delete service listing
- [ ] Set pricing (NPR)
- [ ] Create service packages
- [ ] Upload service photos
- [ ] Set availability calendar
- [ ] Define service areas (locations)
- [ ] Set response time

#### Booking Management
- [ ] View incoming booking requests
- [ ] Accept booking
- [ ] Decline booking (with reason)
- [ ] Mark as completed
- [ ] Request cancellation
- [ ] View booking details
- [ ] Communicate with customer

#### Reviews Management
- [ ] View received reviews
- [ ] Respond to reviews
- [ ] Report inappropriate reviews

#### Financial Management
- [ ] View earnings
- [ ] View transaction history
- [ ] Request payout
- [ ] View commission deductions
- [ ] Download financial statements

### 1.3 Admin Panel

#### Dashboard
- [ ] Total users count
- [ ] Total providers count
- [ ] Total bookings count
- [ ] Total revenue
- [ ] Recent bookings
- [ ] System health metrics

#### User Management
- [ ] View all customers
- [ ] Search customers
- [ ] View customer details
- [ ] Suspend/activate customer
- [ ] View customer booking history

#### Provider Management
- [ ] View all providers
- [ ] Search providers
- [ ] View provider details
- [ ] Approve provider registration
- [ ] Reject provider registration
- [ ] Suspend/activate provider
- [ ] Verify provider badge assignment
- [ ] View provider earnings
- [ ] Manage provider subscriptions

#### Booking Management
- [ ] View all bookings
- [ ] Filter bookings (status, date, provider)
- [ ] View booking details
- [ ] Cancel booking (admin)
- [ ] Refund booking
- [ ] Handle booking disputes

#### Content Management
- [ ] Manage service categories
- [ ] Manage homepage banners
- [ ] Manage promotional content
- [ ] Manage FAQ content
- [ ] Manage terms and policies

#### Review Management
- [ ] View all reviews
- [ ] Flag inappropriate reviews
- [ ] Remove reviews
- [ ] Respond to disputes

#### Financial Management
- [ ] View all transactions
- [ ] View revenue reports
- [ ] View commission reports
- [ ] Process provider payouts
- [ ] Generate financial reports
- [ ] Export data (CSV, Excel)

#### System Management
- [ ] Manage admin users
- [ ] Set commission rates
- [ ] Manage subscription plans
- [ ] Configure payment settings
- [ ] View system logs
- [ ] Manage API keys

### 1.4 Payment Integration

#### eSewa Integration
- [ ] Create eSewa merchant account
- [ ] Configure eSewa API credentials
- [ ] Implement eSewa checkout
- [ ] Handle payment success callback
- [ ] Handle payment failure callback
- [ ] Implement refund functionality
- [ ] Test in sandbox environment
- [ ] Go live with eSewa

#### Khalti Integration
- [ ] Create Khalti merchant account
- [ ] Configure Khalti API credentials
- [ ] Implement Khalti checkout
- [ ] Handle payment success callback
- [ ] Handle payment failure callback
- [ ] Implement refund functionality
- [ ] Test in sandbox environment
- [ ] Go live with Khalti

#### Bank Transfer Integration
- [ ] Define bank account details for transfers
- [ ] Create bank transfer instructions UI
- [ ] Implement payment proof upload
- [ ] Manual verification workflow
- [ ] Confirmation notification

#### Payment Infrastructure
- [ ] Secure payment processing (PCI compliance)
- [ ] NPR currency handling
- [ ] Price formatting (NPR)
- [ ] Decimal handling for Nepal paisa
- [ ] Transaction logging
- [ ] Invoice generation
- [ ] Refund processing workflow
- [ ] Payout calculation (commission deduction)

### 1.5 Booking Management System

#### Booking Core
- [ ] Create booking database schema
- [ ] Booking status workflow (pending → confirmed → completed/cancelled)
- [ ] Booking ID generation
- [ ] Automatic confirmation emails/SMS
- [ ] Booking modification handling
- [ ] Booking cancellation handling

#### Calendar & Availability
- [ ] Provider availability management
- [ ] Date conflict detection
- [ ] Real-time availability checking
- [ ] Blocked dates management
- [ ] Seasonal pricing support

#### Notifications
- [ ] Email notifications (booking created, confirmed, completed, cancelled)
- [ ] SMS notifications (booking created, confirmed, completed, cancelled)
- [ ] Push notifications (mobile app)
- [ ] In-app notifications
- [ ] Admin alerts for new bookings

#### Dispute Handling
- [ ] Customer complaint submission
- [ ] Provider response workflow
- [ ] Admin mediation interface
- [ ] Refund processing for disputes
- [ ] Dispute resolution history

### 1.6 Review & Rating System

#### Review Structure
- [ ] Star rating (1-5)
- [ ] Category-specific ratings (quality, timeliness, professionalism)
- [ ] Written review text
- [ ] Photo upload for reviews
- [ ] Review date and timestamp

#### Review Features
- [ ] Submit review after completion
- [ ] Edit review (within time window)
- [ ] Delete review
- [ ] Report inappropriate review
- [ ] Provider response to review

#### Review Display
- [ ] Overall rating calculation
- [ ] Rating breakdown display
- [ ] Review filtering (most recent, highest rated)
- [ ] Review pagination
- [ ] Provider response display

#### Trust & Verification
- [ ] Verified booking badge on reviews
- [ ] Review authenticity verification
- [ ] Spam/fake review prevention
- [ ] Minimum booking requirement for review

### 1.7 Search & Filtering

#### Search Functionality
- [ ] Keyword search (provider name, service)
- [ ] Search suggestions/autocomplete
- [ ] Recent searches
- [ ] Search result ranking

#### Category Filtering
- [ ] Filter by service category
- [ ] Filter by sub-category
- [ ] Filter by location (Kathmandu areas)
- [ ] Filter by price range (NPR)
- [ ] Filter by rating
- [ ] Filter by availability
- [ ] Filter by verified status

#### Sorting Options
- [ ] Sort by relevance
- [ ] Sort by rating (highest)
- [ ] Sort by price (lowest/highest)
- [ ] Sort by distance
- [ ] Sort by newest

#### Advanced Features
- [ ] Save search filters
- [ ] Compare services side-by-side
- [ ] Wishlist/favorites
- [ ] Share search results

---

## Pre-Launch Checklist

### Launch Readiness
- [ ] Complete all Phase 0 items
- [ ] Complete all Phase 1 items
- [ ] Conduct user acceptance testing
- [ ] Conduct security audit
- [ ] Load testing completed
- [ ] Performance optimization done
- [ ] Bug fixes completed

### Marketing Preparation
- [ ] Provider acquisition (200+ providers onboarded)
- [ ] Marketing materials ready
- [ ] Social media accounts set up
- [ ] Press release prepared
- [ ] Influencer partnerships established

### Operations
- [ ] Customer support setup
- [ ] Support contact channels configured
- [ ] FAQ content ready
- [ ] Escalation process defined

---

## Post-Launch (Immediate)

- [ ] Monitor system performance
- [ ] Monitor booking flow
- [ ] Gather user feedback
- [ ] Address critical issues immediately
- [ ] Track key metrics daily

---

## Notes

- Timeline: 3-4 months aggressive
- Initial focus: Kathmandu Valley
- Currency: NPR (Nepalese Rupee)
- Service categories: Photographers, Caterers, Decorators, Tent Suppliers, Venues, Bands
- Mobile-first approach
- Payment methods: eSewa, Khalti, Bank Transfer