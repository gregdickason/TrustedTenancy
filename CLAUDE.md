# TrustedTenancy - Claude Development Documentation

## Project Overview

TrustedTenancy is a comprehensive AI-powered SaaS platform designed for the Australian rental property market. This document serves as a development guide for future Claude sessions, outlining the current state, architecture decisions, and roadmap.

## Current Status (MVP Completed with Technical Debt)

### ✅ Completed Features
- [x] Next.js 14 project setup with TypeScript and Tailwind CSS
- [x] PostgreSQL database with Prisma ORM
- [x] User authentication with NextAuth.js (with workarounds)
- [x] Property listing creation and management
- [x] Property browsing and search functionality
- [x] Responsive UI components and layout
- [x] Tenant inquiry/contact system
- [x] API routes for property management
- [x] Vercel deployment configuration
- [x] Environment variables setup
- [x] **TrustedTenancy branding and logos integrated**
- [x] **Professional header navigation component**
- [x] **Favicon and app icons**
- [x] **SEO metadata with Open Graph support**
- [x] **🔥 DATABASE CONNECTION ISSUES RESOLVED**
- [x] **Enhanced Prisma client with retry logic and connection management**
- [x] **Turbopack-compatible database singleton pattern**
- [x] **Database health monitoring and graceful degradation**
- [x] **Comprehensive database management scripts**

### 🚨 Critical Technical Debt (Priority Fixes Needed)
1. **NextAuth.js Compatibility Issues**:
   - Using `any` types with ESLint disable comments
   - Import path workarounds (`next-auth/next` instead of `next-auth`)
   - Session type casting required in API routes
   - Custom type definitions needed for proper TypeScript support

2. **Prisma Type Issues**:
   - Where clause typing disabled with `any` type
   - Dynamic route parameters require Promise unwrapping for Next.js 15

3. **Build Workarounds**:
   - Database pages set to `force-dynamic` to prevent build-time DB connections
   - Multiple ESLint disable comments for type safety bypasses

### 🚧 In Progress / Next Priority
- [x] **✅ FIXED: Database seeding duplication resolved**
- [ ] **URGENT: Fix NextAuth.js type safety and imports**
- [ ] **URGENT: Resolve Prisma type compatibility**
- [ ] Image upload functionality (Vercel Blob integration)
- [ ] User authentication UI (sign in/up pages)
- [ ] Advanced search filters and sorting
- [ ] Email notification system
- [ ] Remove all `any` types and ESLint disable comments

## Technical Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **File Storage**: Vercel Blob (planned)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS with responsive design

### Database Schema
```
Users -> Properties (1:many)
Properties -> PropertyImages (1:many)
Users -> Inquiries (1:many)
Properties -> Inquiries (1:many)
```

Key models: User, Property, PropertyImage, Inquiry

### API Structure
```
/api/auth/[...nextauth] - Authentication
/api/properties - Property CRUD
/api/properties/[id] - Individual property operations
/api/properties/[id]/inquiries - Inquiry management
```

## Development Approach & Standards

### Code Quality Standards
1. **TypeScript First**: All new code must use TypeScript with strict typing
2. **Component-Based Architecture**: Reusable React components in `/src/components`
3. **API-First Design**: Well-defined API contracts with proper error handling
4. **Responsive Design**: Mobile-first approach using Tailwind CSS
5. **Database-First**: Schema changes through Prisma migrations

### File Organization
```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── properties/        # Property-related pages
│   └── landlords/         # Landlord dashboard
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── property/         # Property-specific components
├── lib/                  # Utility functions and configs
│   ├── auth.ts           # Authentication config
│   ├── db.ts             # Database client
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # Helper functions
└── types/                # TypeScript type definitions
```

### Testing Strategy (To Implement)
1. **Unit Tests**: Jest + React Testing Library for components
2. **Integration Tests**: API route testing with supertest
3. **E2E Tests**: Playwright for critical user journeys
4. **Database Tests**: Prisma test database with transactions

### Monitoring & Observability (To Implement)
1. **Error Tracking**: Sentry integration
2. **Performance Monitoring**: Vercel Analytics + Web Vitals
3. **User Analytics**: Privacy-focused analytics (Plausible/Fathom)
4. **API Monitoring**: Response times and error rates
5. **Database Monitoring**: Query performance and connection pooling

## Development Phases

### Phase 1: MVP (✅ COMPLETED)
**Timeline**: 2-3 weeks
- [x] Core property listing and browsing functionality
- [x] Basic user authentication
- [x] Database schema and API endpoints
- [x] Responsive UI framework
- [x] Vercel deployment setup

### Phase 2: Enhanced UX (🚧 IN PROGRESS)
**Timeline**: 4-6 weeks
- [ ] Image upload and gallery management
- [ ] Advanced property search and filters
- [ ] User profile management
- [ ] Email notification system
- [ ] Property application workflow
- [ ] Mobile app optimization

### Phase 3: Business Features (📋 PLANNED)
**Timeline**: 6-8 weeks
- [ ] Payment integration (Stripe for Australian market)
- [ ] Lease document management
- [ ] Maintenance request system
- [ ] Landlord dashboard with analytics
- [ ] Tenant screening integration
- [ ] Automated rent collection

### Phase 4: AI & Advanced Features (🔮 FUTURE)
**Timeline**: 8-12 weeks
- [ ] AI-powered property recommendations
- [ ] Smart pricing suggestions
- [ ] Automated compliance checking
- [ ] Document OCR and processing
- [ ] Predictive maintenance alerts
- [ ] Market insights and reporting

## Australian Compliance Requirements

### Legal Considerations
1. **State-specific tenancy laws** (NSW, VIC, QLD, SA, WA, TAS, ACT, NT)
2. **Bond lodgement** with state authorities
3. **Privacy Act 1988** compliance
4. **Australian Consumer Law** requirements
5. **Real estate licensing** considerations

### Technical Requirements
1. **Data sovereignty**: Australian-hosted data storage
2. **OAIC compliance**: Privacy policy and data handling
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Security**: SOC 2 Type II equivalent controls

## Development Commands

### Essential Commands
```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server

# Database
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Run database migrations
npx prisma studio          # Open Prisma Studio
npx prisma db seed         # Seed database (when implemented)

# Testing (when implemented)
npm test                   # Run unit tests
npm run test:e2e          # Run E2E tests
npm run test:coverage     # Test coverage report

# Linting & Formatting
npm run lint              # ESLint
npm run lint:fix          # Auto-fix linting issues
npm run format            # Prettier formatting
```

## Environment Variables

### Development
```env
DATABASE_URL="prisma+postgres://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Production (Additional)
```env
BLOB_READ_WRITE_TOKEN="vercel-blob-token"
SENTRY_DSN="sentry-error-tracking"
STRIPE_SECRET_KEY="stripe-payment-processing"
SENDGRID_API_KEY="email-notifications"
```

## Known Issues & Technical Debt

### Critical Issues (Must Fix Before Production)
1. **Type Safety Violations**: Multiple `any` types with ESLint bypasses
2. **NextAuth.js Version Conflicts**: Import and type compatibility issues
3. **Build-time Database Connections**: Pages marked as dynamic to avoid build failures
4. **Session Type Safety**: Manual casting required for user session data

### Current Limitations
1. **Image Upload**: Form shows placeholder, needs Vercel Blob integration
2. **Authentication UI**: Missing custom sign-in/sign-up pages
3. **Error Handling**: Basic error states, need comprehensive error boundaries
4. **Loading States**: Missing loading spinners and skeleton screens
5. **Form Validation**: Client-side validation needs enhancement

### Technical Debt Details
1. **Files with Type Hacks**:
   - `src/lib/auth.ts`: Uses `any` types in callbacks
   - `src/app/api/properties/route.ts`: Where clause typed as `any`
   - `src/app/api/properties/[id]/route.ts`: Session casting
   - `src/app/api/properties/[id]/inquiries/route.ts`: Session casting
   - `src/types/next-auth.d.ts`: Custom type definitions

2. **Import Workarounds**:
   - NextAuth imports use `/next` suffix
   - getServerSession from `next-auth/next`

### Performance Optimizations Needed
1. **Image Optimization**: Next.js Image component implementation ✅ (Completed)
2. **Code Splitting**: Route-based and component-based lazy loading
3. **Caching**: Redis for session storage and API caching
4. **Database**: Query optimization and connection pooling
5. **CDN**: Static asset delivery optimization

## Testing Checklist (For Implementation)

### Unit Tests
- [ ] Component rendering and props
- [ ] Form validation logic
- [ ] Utility functions
- [ ] API route handlers
- [ ] Database operations

### Integration Tests
- [ ] Property CRUD operations
- [ ] User authentication flow
- [ ] Image upload process
- [ ] Email notifications
- [ ] Payment processing

### E2E Tests
- [ ] User registration and login
- [ ] Property listing creation
- [ ] Property search and browsing
- [ ] Inquiry submission
- [ ] Property application process

### Performance Tests
- [ ] Page load times
- [ ] API response times
- [ ] Database query performance
- [ ] Mobile performance
- [ ] Large dataset handling

## Security Considerations

### Current Security Measures
1. **Authentication**: NextAuth.js with secure session handling
2. **Authorization**: Route-level protection for landlord features
3. **Input Validation**: Zod schemas for API endpoints
4. **CSRF Protection**: Built-in Next.js CSRF protection
5. **Environment Variables**: Secure secret management

### Additional Security Needed
1. **Rate Limiting**: API endpoint protection
2. **Content Security Policy**: XSS protection
3. **Input Sanitization**: HTML content cleaning
4. **File Upload Security**: Image validation and virus scanning
5. **Audit Logging**: User action tracking

## Deployment Strategy

### Current Setup
- **Platform**: Vercel with automatic deployments
- **Database**: PostgreSQL (development: Prisma dev DB)
- **Domain**: To be configured
- **SSL**: Automatic via Vercel

### Production Requirements
1. **Database**: Managed PostgreSQL (Neon, PlanetScale, or AWS RDS)
2. **File Storage**: Vercel Blob for images
3. **Email Service**: SendGrid or AWS SES
4. **Monitoring**: Sentry for error tracking
5. **Backup**: Automated database backups

## Future Claude Session Guidelines

### When starting a new session:
1. Review this CLAUDE.md file first
2. Check current todo status with TodoRead
3. Run `npm run dev` to verify application state
4. Review recent git commits for context

### Development priorities:
1. Complete Phase 2 features (image upload, auth UI)
2. Implement comprehensive testing
3. Add monitoring and error tracking
4. Optimize performance and user experience

### Code review checklist:
- [ ] TypeScript strict typing
- [ ] Responsive design implementation
- [ ] Error handling and loading states
- [ ] API input validation
- [ ] Database query optimization
- [ ] Security best practices

## License & Legal

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Greg Dickason

## Contact & Resources

- **Project Repository**: https://github.com/gregdickason/TrustedTenancy
- **Local Development**: /Users/gregdickason/code/TrustedTenancy/trustedtenancy
- **Development Server**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (when running)
- **Documentation**: This CLAUDE.md file

## Recent Changes (2025-01-05)

### ✅ Completed in Previous Session
1. **Brand Integration**: Successfully added TrustedTenancy logos and branding
2. **Navigation**: Created professional Header component with logo
3. **SEO Enhancement**: Added comprehensive metadata with Open Graph support
4. **Image Optimization**: Replaced all `<img>` tags with Next.js `<Image>` components
5. **Build Success**: Resolved compilation errors to achieve successful build

### 🔥 MAJOR: Database Connection Issues RESOLVED (Current Session)

#### ✅ Critical Fixes Implemented
1. **Prepared Statement Conflicts Fixed**: 
   - Resolved "prepared statement 's0' already exists" errors
   - Implemented automatic client recreation on conflicts
   - Added exponential backoff retry logic (up to 3 attempts)

2. **Enhanced Prisma Client Management**:
   - Turbopack-compatible singleton pattern for hot reload support
   - Connection tracking with unique IDs for debugging
   - Enhanced logging with query performance monitoring
   - Graceful degradation when database unavailable

3. **Optimized Database Configuration**:
   - Dedicated `trustedtenancy_dev` database (not `template1`)
   - Removed problematic `single_use_connections=true` setting
   - Increased connection limit from 1 to 5 for better concurrency
   - Proper timeout settings to prevent hanging connections

4. **Enhanced Development Workflow**:
   - Improved startup script with automatic cleanup
   - Database reset command for clean restarts
   - Health check API endpoint at `/api/health`
   - Better error handling with specific recovery suggestions

#### 📁 New Files Created
- `src/lib/db.ts` - Enhanced database client with retry logic
- `src/app/api/health/route.ts` - Database health monitoring endpoint
- `scripts/reset-db.js` - Complete database reset utility
- `scripts/simple-dev.js` - Improved development startup script

#### 🚀 New Commands Available
- `npm run dev:with-db` - Start with automatic database management (recommended)
- `npm run db:reset` - Clean database reset with fresh data
- `npm run db:health` - Check database health and connection stats
- `npm run db:status` - Quick database status check

#### 🎯 Problems Solved
- ✅ Eliminated prepared statement conflicts
- ✅ Fixed hot reload breaking database connections
- ✅ Improved error messages and recovery instructions
- ✅ Added fallback behavior when database temporarily unavailable
- ✅ Enhanced debugging with connection tracking and logging
- ✅ **FIXED: Database seeding duplication issue resolved**

### ⚠️ Technical Compromises Made (Previous Session)
1. **Type Safety**: Multiple `any` types added to resolve NextAuth compatibility
2. **Import Workarounds**: Using non-standard NextAuth import paths
3. **Dynamic Rendering**: Database pages forced to dynamic to prevent build errors
4. **ESLint Bypasses**: Multiple disable comments added for type violations

### ✅ Latest Fixes Completed (Current Session)
6. **Database Seeding Duplication RESOLVED**:
   - Properties and inquiries were being created on every startup
   - Converted from `create()` to idempotent `findFirst()` + conditional create
   - Integrated with enhanced database client for retry logic
   - Added detailed logging showing created vs existing data
   - ✅ Result: No more duplicate data, safe to run multiple times

### 🚨 Immediate Action Items for Next Session
1. **Research NextAuth.js v5 Migration**: Current issues likely due to version conflicts
2. **Investigate Prisma Compatibility**: Update to latest stable versions
3. **Review Next.js 15 Changes**: Ensure all patterns align with latest best practices
4. **Type Safety Audit**: Remove all `any` types and implement proper typing

---

**Last Updated**: 2025-01-05
**Current Status**: MVP Complete with Database Issues Resolved + Remaining Technical Debt
**Next Milestone**: Fix Seeding Duplication → Technical Debt Resolution → Phase 2 Enhanced UX