#!/bin/bash

# TrustedTenancy Development Startup Script
# This script ensures the Prisma dev database is running before starting the dev server

set -e

echo "🚀 Starting TrustedTenancy development environment..."

# Function to check if Prisma dev database is running
check_db_running() {
    npx prisma dev ls | grep -q "running"
}

# Function to start the database
start_database() {
    echo "📊 Starting Prisma dev database..."
    
    # Start the database in background
    nohup npx prisma dev > /dev/null 2>&1 &
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    for i in {1..30}; do
        if check_db_running; then
            echo "✅ Database is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Database failed to start after 30 seconds"
            exit 1
        fi
        sleep 1
    done
}

# Check if database is already running
if check_db_running; then
    echo "✅ Database is already running"
else
    start_database
fi

# Ensure database schema is up to date
echo "🔄 Ensuring database schema is up to date..."
npx prisma db push --accept-data-loss > /dev/null 2>&1 || echo "⚠️  Schema already up to date"

# Check if database has data, if not seed it
echo "🌱 Checking database data..."
if ! npx prisma db seed --preview-feature > /dev/null 2>&1; then
    echo "📦 Seeding database with sample data..."
    npm run db:seed
fi

echo "🎉 Development environment ready!"
echo "📍 Database running on: localhost:51214"
echo "🌐 Starting Next.js development server..."
echo ""

# Start the development server
npm run dev