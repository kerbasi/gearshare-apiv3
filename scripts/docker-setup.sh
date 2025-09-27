#!/bin/bash

# Auto Parts API - Docker Setup Script
# This script sets up the entire application using Docker

echo "🐳 Auto Parts API - Docker Setup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Docker is installed
echo "🔍 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    echo "Please install Docker Desktop first:"
    echo "  Windows/Mac: https://www.docker.com/products/docker-desktop/"
    echo "  Linux: sudo apt install docker.io docker-compose"
    exit 1
fi
print_status "Docker is installed"

# Check if Docker is running
echo "🔍 Checking Docker daemon..."
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi
print_status "Docker daemon is running"

# Check if docker-compose is available
echo "🔍 Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not available"
    echo "Please install Docker Compose"
    exit 1
fi
print_status "Docker Compose is available"

# Check if .env file exists
echo "🔍 Checking environment configuration..."
if [ ! -f .env ]; then
    print_warning ".env file not found, creating from template..."
    cp .env.example .env
    print_status ".env file created from template"
else
    print_status ".env file exists"
fi

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down &> /dev/null
print_status "Existing containers stopped"

# Start database services first
echo "🗄️ Starting database services..."
docker-compose up -d postgres redis pgadmin
print_status "Database services started"

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker-compose exec postgres pg_isready -U autoparts_user -d autoparts_api &> /dev/null; then
        print_status "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL failed to start after 30 seconds"
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Run database migrations
echo "📊 Running database migrations..."
if docker-compose exec api npm run migration:run; then
    print_status "Database migrations completed"
else
    print_warning "Migration command not available in container yet"
    print_info "You can run migrations manually later with:"
    print_info "  docker-compose exec api npm run migration:run"
fi

# Start the API service
echo "🚀 Starting API service..."
docker-compose up -d api
print_status "API service started"

# Wait for API to be ready
echo "⏳ Waiting for API to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000/health &> /dev/null; then
        print_status "API is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "API failed to start after 30 seconds"
        print_info "Check logs with: docker-compose logs api"
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Display service status
echo ""
echo "📊 Service Status:"
echo "=================="
docker-compose ps

echo ""
echo "🎉 Docker setup completed successfully!"
echo "======================================"
echo ""
echo "🌐 Access Points:"
echo "  API: http://localhost:3000"
echo "  Swagger Docs: http://localhost:3000/api/docs"
echo "  Health Check: http://localhost:3000/health"
echo "  pgAdmin: http://localhost:5050"
echo ""
echo "📝 pgAdmin Credentials:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
echo "🔧 Useful Commands:"
echo "  View logs: docker-compose logs -f api"
echo "  Stop services: docker-compose down"
echo "  Restart API: docker-compose restart api"
echo "  Run migrations: docker-compose exec api npm run migration:run"
echo ""
echo "🧪 Quick Test:"
echo "  curl http://localhost:3000/health"
echo ""
print_status "Setup complete! Happy coding! 🚀"
