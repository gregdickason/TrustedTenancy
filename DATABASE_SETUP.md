# Database Setup Guide

## Current Setup

TrustedTenancy uses **Prisma Dev** for local development - a managed PostgreSQL database that requires no local installation.

### ✅ Quick Start (Already Done)

The database is already configured and seeded with sample data. Just run:

```bash
npm run dev
```

Visit http://localhost:3000/properties to see the sample properties!

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

### 🌐 Environment Variables

Current `.env` configuration:
```env
DATABASE_URL="postgres://postgres:postgres@localhost:51214/trustedtenancy?..."
NEXTAUTH_SECRET="trustedtenancy-dev-secret-2025"
```

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