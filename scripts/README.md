# TrustedTenancy Development Scripts

This directory contains scripts to help with development workflow.

## `dev-with-db.js`

An intelligent startup script that ensures the database is running before starting the development server.

### What it does:
1. ✅ Checks if Prisma dev database is running
2. 🚀 Starts the database if it's not running
3. 📊 Ensures database schema is up to date
4. 🌱 Seeds the database with sample data (if empty)
5. 🌐 Starts the Next.js development server

### Usage:

```bash
npm run dev:with-db
```

### Features:
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Intelligent**: Only starts database if not already running
- **Safe**: Won't overwrite existing data when seeding
- **Colorized output**: Easy to read status messages
- **Graceful shutdown**: Properly handles Ctrl+C

### Alternative Scripts:
- `npm run db:start` - Start database only
- `npm run db:stop` - Stop database
- `npm run db:status` - Check database status
- `npm run dev` - Start dev server (requires database to be running)

### Troubleshooting:
- If database fails to start, check if ports 51213-51215 are available
- If seeding fails, the database might already have data (this is normal)
- If schema update fails, try `npx prisma db push --force-reset`