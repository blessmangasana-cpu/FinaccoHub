#!/bin/bash

# migrate.sh - Run Prisma migrations

set -e

echo "🗄️  Running Prisma migrations..."

if [ "$1" == "create" ]; then
    if [ -z "$2" ]; then
        echo "Usage: ./migrate.sh create <migration_name>"
        exit 1
    fi
    echo "Creating migration: $2"
    npx prisma migrate dev --name "$2"
elif [ "$1" == "deploy" ]; then
    echo "Deploying migrations..."
    npx prisma migrate deploy
elif [ "$1" == "reset" ]; then
    echo "⚠️  Resetting database..."
    npx prisma migrate reset
elif [ "$1" == "status" ]; then
    echo "Checking migration status..."
    npx prisma migrate status
else
    echo "Usage:"
    echo "  ./migrate.sh create <name>   - Create a new migration"
    echo "  ./migrate.sh deploy          - Deploy pending migrations"
    echo "  ./migrate.sh reset           - Reset the database"
    echo "  ./migrate.sh status          - Check migration status"
    exit 1
fi

echo "✅ Migration complete!"
