#!/bin/bash

# start-dev.sh - Start local development environment

set -e

echo "🚀 Starting RSE Data Pipeline development environment..."

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please update it with your configuration."
fi

# Start Docker containers
echo "📦 Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Install dependencies
echo "📥 Installing Node dependencies..."
npm install

# Run Prisma migrations
echo "🗄️  Running Prisma migrations..."
npx prisma migrate deploy

# Seed database (optional)
# echo "🌱 Seeding database..."
# npx prisma db seed

echo "✅ Development environment is ready!"
echo "📝 Logs are available in the data/logs/ directory"
echo "🧪 Run 'npm test' to execute tests"
echo "🔄 Run 'npm start' to run the pipeline"
