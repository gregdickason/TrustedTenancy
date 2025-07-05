# Database Setup Guide

## Current Setup

TrustedTenancy uses **Prisma Dev** for local development - a managed PostgreSQL database that requires no local installation.

### ✅ Quick Start (Recommended)

The database is configured with enhanced connection management and will be automatically started with sample data. Just run:

```bash
npm run dev:with-db
```

This will:
- 🧹 Clean up any existing database connections
- 🏗️  Create a dedicated development database (`trustedtenancy_dev`)
- ✅ Start the database with optimized connection settings
- ✅ Ensure the database schema is up to date
- ✅ Seed the database with sample data (if empty)
- ✅ Start the Next.js development server with connection retry logic

Visit http://localhost:3000/properties to see the sample properties!

### Alternative: Manual Start

If you prefer to manage the database manually:

```bash
npm run dev
```

(Note: This requires the database to be running already)

### 🛠️ Manual Setup (If Needed)

If you need to reset or set up the database from scratch:

1. **Start Prisma Dev Database**:
   ```bash
   npx prisma dev
   ```
   This starts a local PostgreSQL instance on ports 51213-51215.

2. **Push Schema to Database**:
   ```bash
   npx prisma db push
   ```

3. **Seed with Sample Data**:
   ```bash
   npm run db:seed
   ```

### 📊 Sample Data Included

The seeded database contains:
- **2 Users**: 1 landlord (landlord@example.com), 1 tenant (tenant@example.com)
- **3 Properties**: 
  - Modern 2BR Apartment in Sydney CBD ($3,000/month)
  - Charming 3BR House in Melbourne ($2,500/month)  
  - Studio Apartment near University in Brisbane ($1,200/month)
- **1 Sample Inquiry**: Tenant inquiry for the Sydney apartment

### 🔧 Database Management

- **View Data**: Use Prisma Studio: `npx prisma studio`
- **Reset Database**: `npx prisma db push --force-reset`
- **Re-seed**: `npm run db:seed`

### 🛠️ Database Control Scripts

- **Start Database**: `npm run db:start` - Start database only
- **Stop Database**: `npm run db:stop` - Stop database server
- **Check Status**: `npm run db:status` - Check if database is running
- **Reset Database**: `npm run db:reset` - Clean reset with fresh data
- **Health Check**: `npm run db:health` - Check database health and stats
- **Start with Database**: `npm run dev:with-db` (recommended for development)

### 🔧 New Features & Improvements

- **Connection Retry Logic**: Automatic retry with exponential backoff for connection issues
- **Prepared Statement Fix**: Resolves "prepared statement already exists" errors
- **Turbopack Compatibility**: Enhanced singleton pattern works with Next.js hot reload
- **Health Monitoring**: Real-time database health checks at `/api/health`
- **Enhanced Logging**: Detailed connection and query logging in development
- **Graceful Degradation**: App continues working even when database is temporarily unavailable

### 🌐 Environment Variables

Current `.env` configuration (optimized for stability):
```env
DATABASE_URL="postgres://postgres:postgres@localhost:51214/trustedtenancy_dev?sslmode=disable&connection_limit=5&connect_timeout=10&max_idle_connection_lifetime=300&pool_timeout=30&socket_timeout=30"
NEXTAUTH_SECRET="trustedtenancy-dev-secret-2025"
```

**Key optimizations:**
- Uses dedicated `trustedtenancy_dev` database (not `template1`)
- Connection limit increased to 5 for better concurrency
- Proper timeout settings to prevent hanging connections
- Removed problematic `single_use_connections=true` setting

### 📋 What You Can Test

1. **Browse Properties**: Visit `/properties` - should show 3 sample properties
2. **Property Details**: Click on any property to view details
3. **Create Property**: Visit `/landlords` - form should submit successfully (requires auth)
4. **Database Connection**: No more "Database Connection Error" messages

### 🚨 Troubleshooting

- **"Can't reach database server"**: Restart Prisma dev with `npx prisma dev`
- **Empty properties page**: Re-run seeding with `npm run db:seed`
- **Build issues**: Regenerate client with `npx prisma generate`

### 📁 Files Modified

- `.env` - Updated with working database connection
- `prisma/seed.ts` - Sample data seeding script
- `package.json` - Added seed script
- Database schema created in Prisma dev instance