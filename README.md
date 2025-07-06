# TrustedTenancy

A comprehensive AI-powered Software-as-a-Service (SaaS) platform designed specifically for the Australian rental property market.

## ✅ Current Features (MVP + Authentication)

### Core Functionality
- **Property Management**: Create, list, browse, and search properties
- **Google OAuth Authentication**: Fully functional sign-in/sign-up with user avatars
- **Tenant-Landlord Communication**: Inquiry system for property communications
- **Responsive Design**: Mobile-first design optimized for all devices
- **Database Management**: PostgreSQL with circuit breaker pattern for reliability
- **Comprehensive Logging**: Structured logging system for debugging and monitoring

### Authentication & Security
- ✅ **Google OAuth Integration**: Complete setup with redirect URI configuration
- ✅ **User Session Management**: JWT-based sessions with role management
- ✅ **Protected Routes**: Landlord-only sections with proper authorization
- ✅ **Comprehensive Error Handling**: Detailed logging and user-friendly error messages
- ✅ **Configuration Validation**: Built-in checks for OAuth setup

### Technical Stack
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with comprehensive error handling
- **Database**: PostgreSQL with Prisma ORM and circuit breaker pattern
- **Authentication**: NextAuth.js v4 with Google OAuth provider
- **Image Optimization**: Next.js Image component with remote pattern support
- **Development Tools**: Turbopack, structured logging, regression testing
- **Deployment**: Vercel-ready configuration

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or later
- PostgreSQL database (or use Prisma dev database)
- Google Cloud Console project for OAuth
- npm or yarn

### Quick Start

1. **Clone and Install**:
```bash
git clone https://github.com/gregdickason/TrustedTenancy.git
cd TrustedTenancy/trustedtenancy
npm install
```

2. **Environment Setup**:
Create a `.env` file:
```env
# Database (automatically managed by Prisma dev)
DATABASE_URL="postgres://postgres:postgres@localhost:51214/trustedtenancy_dev?sslmode=disable&connection_limit=5&connect_timeout=10&max_idle_connection_lifetime=300&pool_timeout=30&socket_timeout=30&prepared_statements=false"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="trustedtenancy-dev-secret-2025"

# Google OAuth (required - see setup guide)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# File Upload (optional for development)
BLOB_READ_WRITE_TOKEN=""
```

3. **Google OAuth Setup**:
   - Follow the detailed guide in `SETUP_GOOGLE_OAUTH.md`
   - Or run: `node scripts/check-auth-config.js` to verify configuration

4. **Start Development**:
```bash
# Recommended: Start with automatic database management
npm run dev:with-db

# Alternative: Start server only (if database already running)
npm run dev
```

5. **Verify Setup**:
```bash
# Run regression tests to ensure everything works
npm run test:regression
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth.js authentication
│   │   ├── properties/   # Property CRUD operations
│   │   ├── health/       # Database health monitoring
│   │   ├── upload/       # Image upload (Vercel Blob)
│   │   └── log-client-error/ # Client error logging
│   ├── auth/             # Authentication pages (signin/signup)
│   ├── landlords/        # Landlord property management
│   ├── properties/       # Property browsing and details
│   └── layout.tsx        # Root layout with SessionProvider
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components with validation
│   ├── property/        # Property-specific components
│   └── Header.tsx       # Navigation with user session
├── lib/
│   ├── auth.ts          # NextAuth.js configuration
│   ├── db.ts            # Enhanced Prisma client with circuit breaker
│   ├── logger.ts        # Structured logging system
│   └── validations.ts   # Zod validation schemas
├── types/               # TypeScript type definitions
└── logs/               # Application and authentication logs
```

### Configuration Files
```
├── CLAUDE.md           # Development documentation and guidelines
├── SETUP_GOOGLE_OAUTH.md # Complete Google OAuth setup guide
├── next.config.ts      # Next.js config with image domains
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Database seeding
└── scripts/
    ├── check-auth-config.js    # OAuth configuration validator
    ├── regression-test.js      # Comprehensive test suite
    ├── reset-db.js            # Database reset utility
    └── simple-dev.js          # Enhanced development startup
```

## 🔌 API Routes

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js endpoints
- `GET /api/auth/providers` - Available OAuth providers

### Properties
- `GET /api/properties` - List properties (with filtering and pagination)
- `POST /api/properties` - Create new property (authenticated)
- `GET /api/properties/[id]` - Get property details
- `PUT /api/properties/[id]` - Update property (owner only)
- `DELETE /api/properties/[id]` - Delete property (owner only)

### Property Inquiries
- `POST /api/properties/[id]/inquiries` - Submit inquiry (authenticated)
- `GET /api/properties/[id]/inquiries` - Get inquiries (property owner only)

### System
- `GET /api/health` - Database health with circuit breaker status
- `POST /api/upload` - Image upload (requires Vercel Blob token)
- `POST /api/log-client-error` - Client-side error logging

## 🗄️ Database Schema

### Core Models
- **User**: Google OAuth users with role-based access (TENANT/LANDLORD)
- **Account**: OAuth account linking (NextAuth.js adapter)
- **Session**: User session management
- **Property**: Listings with full Australian address, pricing, and features
- **PropertyImage**: Image galleries with primary/secondary designation
- **Inquiry**: Tenant-landlord communication system

### Key Features
- **Circuit Breaker Pattern**: Automatic failover and recovery for database connections
- **Prepared Statement Handling**: Development-optimized for PostgreSQL compatibility
- **Comprehensive Indexing**: Optimized queries for property search and filtering
- **Data Validation**: Zod schemas ensuring data integrity

## 📋 Development Commands

### Core Development
```bash
npm run dev                 # Start Next.js development server
npm run dev:with-db        # Start with automatic database management (recommended)
npm run dev:clean          # Clean restart (kills port conflicts)
npm run build              # Build for production
npm run start              # Start production server
```

### Database Management
```bash
npm run db:seed            # Seed database with sample data
npm run db:health          # Check database connection and status
npm run db:status          # View Prisma dev database info
npm run db:reset           # Complete database reset with fresh data
```

### Development Tools
```bash
npm run test:regression    # Run full application test suite
npm run kill-port          # Clear port 3000 conflicts
npm run lint               # ESLint code checking
node scripts/check-auth-config.js  # Verify OAuth configuration
```

### Database Operations (Advanced)
```bash
npx prisma generate        # Regenerate Prisma client
npx prisma migrate dev     # Create and apply new migration
npx prisma studio          # Open database browser
npx prisma migrate reset   # Reset database with migrations
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Configure in Vercel dashboard:
   ```env
   DATABASE_URL=your-production-db-url
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=your-production-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
   ```
3. **OAuth Configuration**: Update Google OAuth with production URLs
4. **Deploy**: Automatic deployment on push to main branch

### Production Considerations
- **Database**: Use managed PostgreSQL (Neon, PlanetScale, AWS RDS)
- **File Storage**: Configure Vercel Blob for image uploads
- **Monitoring**: Enable error tracking and performance monitoring
- **Security**: Review CORS policies and rate limiting

## 🗺️ Features Roadmap

### ✅ Phase 1: MVP + Authentication (COMPLETED)
- [x] Core property listing and browsing
- [x] Google OAuth authentication with custom UI
- [x] Database management with circuit breaker
- [x] Responsive design and navigation
- [x] Comprehensive logging and error handling
- [x] Development environment optimization

### 🚧 Phase 2: Enhanced UX (IN PROGRESS)
- [x] Custom authentication pages (sign-in/sign-up)
- [x] **Image upload functionality** (local storage for development, Vercel Blob for production)
- [ ] Advanced property search and filters
- [ ] User profile management and settings
- [ ] Email notification system
- [ ] Property application workflow
- [ ] Mobile app optimization

### 📋 Phase 3: Business Features (PLANNED)
- [ ] Payment integration (Stripe for Australian market)
- [ ] Lease document management
- [ ] Maintenance request system
- [ ] Landlord dashboard with analytics
- [ ] Tenant screening integration
- [ ] Automated rent collection

### 🔮 Phase 4: AI & Advanced Features (FUTURE)
- [ ] AI-powered property recommendations
- [ ] Smart pricing suggestions based on market data
- [ ] Automated compliance checking (Australian tenancy laws)
- [ ] Document OCR and processing
- [ ] Predictive maintenance alerts
- [ ] Market insights and reporting

## 🔧 Configuration Guides

### Google OAuth Setup
See `SETUP_GOOGLE_OAUTH.md` for complete setup instructions including:
- Google Cloud Console project creation
- OAuth consent screen configuration
- Redirect URI setup for development and production
- Troubleshooting common authentication issues

### Image Upload Configuration
**Development**: ✅ **Automatic local storage** - Images saved to `public/uploads/` directory
**Production**: Requires Vercel Blob token configuration:
1. Get Vercel Blob token from Vercel dashboard
2. Add `BLOB_READ_WRITE_TOKEN` to environment variables
3. Images will automatically use Vercel Blob storage

### Database Configuration
The application uses Prisma dev database for development:
- Automatically managed by `npm run dev:with-db`
- No manual PostgreSQL installation required
- Production requires managed database provider

## 🧪 Testing

### Regression Test Suite
The application includes comprehensive regression testing:
```bash
npm run test:regression
```

**Tests Include**:
- Database health and circuit breaker status
- All page routes (homepage, properties, landlords, auth)
- API endpoints (properties, health checks)
- Authentication flow verification
- Image domain configuration
- Error handling and recovery

**Expected Results**: 8/8 tests passing with ~10-second database operations (normal for development environment due to prepared statement handling).

## 🐛 Known Development Behavior

### Database Performance
- **10+ second response times**: Expected in development due to PostgreSQL prepared statement conflicts
- **Circuit breaker protection**: Prevents application crashes during slow database operations
- **Production solution**: Managed database providers handle this automatically

### Port Management
- Use `npm run dev:clean` if port 3000 conflicts occur
- `npm run kill-port` clears zombie processes
- Automatic port conflict resolution included

### Image Upload
- **Development**: ✅ **Works automatically** using local storage (`public/uploads/`)
- **Production**: Requires `BLOB_READ_WRITE_TOKEN` for Vercel Blob storage
- **Storage**: Automatically detects environment and uses appropriate storage method

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Greg Dickason

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow development guidelines in `CLAUDE.md`
4. Run regression tests (`npm run test:regression`)
5. Commit changes with descriptive messages
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Maintain TypeScript strict typing
- Follow existing code patterns and conventions
- Add appropriate logging for debugging
- Update regression tests for new features
- Test authentication flows thoroughly

## 🆘 Support & Troubleshooting

### Common Issues
1. **Authentication errors**: Check `SETUP_GOOGLE_OAUTH.md` and verify redirect URIs
2. **Database connection issues**: Restart with `npm run dev:clean`
3. **Port conflicts**: Run `npm run kill-port` then restart
4. **Image upload issues**: Check that you're signed in (authentication required)

### Getting Help
- Check application logs in `logs/` directory
- Run `npm run test:regression` to identify issues
- Review `CLAUDE.md` for development guidelines
- Create GitHub issue with error logs and reproduction steps

### Debug Commands
```bash
# Check authentication configuration
node scripts/check-auth-config.js

# View database status
npm run db:status

# Check application health
curl http://localhost:3000/api/health

# View recent logs
tail -f logs/app-$(date +%Y-%m-%d).log
```

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- Authentication powered by [NextAuth.js](https://next-auth.js.org/)
- Database management with [Prisma](https://www.prisma.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Image optimization with [Next.js Image](https://nextjs.org/docs/api-reference/next/image)
- Deployment on [Vercel](https://vercel.com/)

---

**Current Status**: MVP completed with full Google OAuth authentication. Phase 2 Enhanced UX features in development.