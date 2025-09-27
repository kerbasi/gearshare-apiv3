#!/bin/bash

# Auto Parts API - Database Setup Script
# This script helps set up the PostgreSQL database for local testing

echo "🚀 Auto Parts API - Database Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if PostgreSQL is installed
echo "🔍 Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL first:"
    echo "  Windows: https://www.postgresql.org/download/windows/"
    echo "  macOS: brew install postgresql"
    echo "  Linux: sudo apt install postgresql postgresql-contrib"
    exit 1
fi
print_status "PostgreSQL is installed"

# Get database credentials
echo ""
echo "📝 Database Configuration"
echo "========================="
read -p "Enter PostgreSQL superuser name [postgres]: " SUPERUSER
SUPERUSER=${SUPERUSER:-postgres}

read -p "Enter database name [autoparts_api]: " DB_NAME
DB_NAME=${DB_NAME:-autoparts_api}

read -p "Enter database user [autoparts_user]: " DB_USER
DB_USER=${DB_USER:-autoparts_user}

read -p "Enter database password [secure_password]: " DB_PASSWORD
DB_PASSWORD=${DB_PASSWORD:-secure_password}

read -p "Enter database host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter database port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

echo ""
echo "🔧 Creating database and user..."

# Create database
echo "Creating database '$DB_NAME'..."
if psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    print_warning "Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " RECREATE
    if [[ $RECREATE =~ ^[Yy]$ ]]; then
        echo "Dropping database '$DB_NAME'..."
        psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -c "DROP DATABASE IF EXISTS $DB_NAME;"
        psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -c "CREATE DATABASE $DB_NAME;"
        print_status "Database recreated"
    fi
else
    psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -c "CREATE DATABASE $DB_NAME;"
    print_status "Database created"
fi

# Create user
echo "Creating user '$DB_USER'..."
if psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    print_warning "User '$DB_USER' already exists"
    read -p "Do you want to recreate the user? (y/N): " RECREATE_USER
    if [[ $RECREATE_USER =~ ^[Yy]$ ]]; then
        psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -c "DROP USER IF EXISTS $DB_USER;"
        psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
        print_status "User recreated"
    fi
else
    psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    print_status "User created"
fi

# Grant privileges
echo "Granting privileges..."
psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -d $DB_NAME -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"
psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
psql -h $DB_HOST -p $DB_PORT -U $SUPERUSER -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"
print_status "Privileges granted"

# Test connection
echo "Testing connection..."
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
    print_status "Connection test successful"
else
    print_error "Connection test failed"
    exit 1
fi

# Generate .env file
echo ""
echo "📄 Generating .env file..."
cat > .env << EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_SSL=false

# Application Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging Configuration
LOG_LEVEL=debug
EOF
print_status ".env file created"

echo ""
echo "🎉 Database setup completed!"
echo "=========================="
echo ""
echo "Next steps:"
echo "1. Run database migrations: npm run migration:run"
echo "2. Start the application: npm run start:dev"
echo "3. Access Swagger docs: http://localhost:3000/api/docs"
echo "4. Test health endpoint: http://localhost:3000/health"
echo ""
echo "Database connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""
print_status "Setup complete! Happy coding! 🚀"
