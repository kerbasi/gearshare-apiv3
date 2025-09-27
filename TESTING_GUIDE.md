# Auto Parts API - Testing Guide

## 🎯 Overview

This guide provides comprehensive instructions for setting up and testing the Auto Parts API with a real local PostgreSQL database. Follow these steps to run the complete API locally and test all features.

**Repository:** [https://github.com/kerbasi/gearshare-apiv3](https://github.com/kerbasi/gearshare-apiv3)

---

## 🚀 Quick Start (Docker - Recommended)

> **TL;DR:** Just run these commands and you're ready to test!

```bash
# 1. Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/

# 2. Clone and setup
git clone https://github.com/kerbasi/gearshare-apiv3.git
cd gearshare-apiv3/auto-parts-api

# 3. One-command setup
# Linux/Mac:
./scripts/docker-setup.sh

# Windows:
scripts\docker-setup.bat

# 4. Test the API
curl http://localhost:3000/health
# Open: http://localhost:3000/api/docs
```

**That's it!** Your API is running with PostgreSQL, Redis, and pgAdmin. 🎉

---

## 📋 Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### Optional Tools
- **Postman** - API testing tool
- **pgAdmin** - PostgreSQL administration tool (included in Docker setup)

### Why Docker?
✅ **One-click setup** - No complex PostgreSQL installation  
✅ **Consistent environment** - Same setup across all platforms  
✅ **Easy cleanup** - Remove everything with one command  
✅ **No system pollution** - Doesn't install software on your machine  
✅ **Production-like** - Same environment as production deployment

---

## 🐳 Step 1: Docker Setup (Recommended)

### 1.1 Install Docker Desktop

#### Windows:
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Run the installer
3. Enable WSL 2 integration (recommended)
4. Restart your computer if prompted
5. Start Docker Desktop

#### macOS:
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Install and start Docker Desktop
3. Ensure Docker is running (whale icon in menu bar)

#### Linux (Ubuntu/Debian):
```bash
# Install Docker
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (optional)
sudo usermod -aG docker $USER
# Log out and back in for changes to take effect
```

### 1.2 Start Database with Docker Compose

```bash
# Navigate to project directory
cd auto-parts-api

# Start only the database services
docker-compose up -d postgres redis pgadmin

# Or start everything (API + Database + Redis + pgAdmin)
docker-compose up -d
```

### 1.3 Verify Docker Services

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs postgres

# Connect to PostgreSQL directly
docker-compose exec postgres psql -U autoparts_user -d autoparts_api
```

### 1.4 Access pgAdmin (Optional)

1. Open browser and go to: http://localhost:5050
2. Login credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Add server connection:
   - Host: `postgres`
   - Port: `5432`
   - Database: `autoparts_api`
   - Username: `autoparts_user`
   - Password: `secure_password`

---

## 🗄️ Alternative: Traditional PostgreSQL Setup

> **Note:** This section is for users who prefer to install PostgreSQL directly on their system instead of using Docker.

### Traditional Installation Steps

#### Install PostgreSQL
- **Windows:** [Download from postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS:** `brew install postgresql && brew services start postgresql`
- **Linux:** `sudo apt install postgresql postgresql-contrib`

#### Create Database and User
```bash
# Connect as superuser
psql -U postgres

# Create database and user
CREATE DATABASE autoparts_api;
CREATE USER autoparts_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE autoparts_api TO autoparts_user;

# Grant schema privileges
\c autoparts_api
GRANT ALL ON SCHEMA public TO autoparts_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO autoparts_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO autoparts_user;
\q
```

#### Use Setup Scripts
```bash
# Linux/Mac
./scripts/setup-database.sh

# Windows
scripts\setup-database.bat
```

---

## 🚀 Step 2: API Setup

### 2.1 Clone and Install
```bash
# Clone the repository
git clone https://github.com/kerbasi/gearshare-apiv3.git
cd gearshare-apiv3/auto-parts-api

# Install dependencies
npm install
```

### 2.2 Environment Configuration

#### For Docker Setup (Recommended):
The `.env` file is already configured for Docker. No changes needed!

#### For Traditional PostgreSQL Setup:
```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` file with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autoparts_api
DB_USER=autoparts_user
DB_PASSWORD=secure_password
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
```

### 2.3 Database Migration
```bash
# Run database migrations
npm run migration:run
```

This will create all tables, indexes, and seed initial data.

### 2.4 Start the Application

#### Option A: Docker Compose (Recommended)
```bash
# Start everything (API + Database + Redis + pgAdmin)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

#### Option B: Local Development
```bash
# Make sure Docker database is running first
docker-compose up -d postgres redis

# Start API locally with hot reload
npm run start:dev
```

#### Option C: Traditional PostgreSQL
```bash
# Start API locally (with traditional PostgreSQL)
npm run start:dev
```

The API will be available at `http://localhost:3000`

---

## 🧪 Step 3: API Testing

### 3.1 Health Check
```bash
# Test if API is running
curl http://localhost:3000/health

# Expected response:
{
  "status": "ok",
  "info": {},
  "error": {},
  "details": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "disk": { "status": "up" }
  }
}
```

### 3.2 Access Swagger Documentation
Open your browser and navigate to:
**http://localhost:3000/api/docs**

This provides interactive API documentation where you can:
- View all available endpoints
- Test API calls directly
- See request/response schemas
- Authenticate with JWT tokens

### 3.3 Authentication Testing

#### Register a New User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "username": "admin",
    "password": "AdminPass123!",
    "confirmPassword": "AdminPass123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123!"
  }'
```

Save the `accessToken` from the response for authenticated requests.

#### Test Protected Endpoint
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3.4 CRUD Operations Testing

#### Create a Category
```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Engine Parts",
    "slug": "engine-parts",
    "description": "All engine-related auto parts",
    "sortOrder": 1
  }'
```

#### Create a Manufacturer
```bash
curl -X POST http://localhost:3000/manufacturers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Bosch",
    "country": "Germany",
    "website": "https://www.bosch.com",
    "contactEmail": "contact@bosch.com",
    "description": "German multinational engineering company"
  }'
```

#### Create a Part
```bash
curl -X POST http://localhost:3000/parts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Brake Pad Set",
    "partNumber": "BP001",
    "description": "High-quality brake pads for all vehicles",
    "price": 89.99,
    "stockQuantity": 50,
    "minStockLevel": 10,
    "categoryId": "CATEGORY_ID_FROM_PREVIOUS_STEP",
    "manufacturerId": "MANUFACTURER_ID_FROM_PREVIOUS_STEP",
    "isActive": true,
    "isFeatured": true
  }'
```

#### Search Parts (Public Endpoint)
```bash
curl -X GET "http://localhost:3000/parts/search?q=brake"
```

#### Get All Active Parts (Public Endpoint)
```bash
curl -X GET http://localhost:3000/parts/active
```

---

## 📊 Step 4: Database Verification

### 4.1 Check Database Tables
```bash
# Connect to database
psql -h localhost -U autoparts_user -d autoparts_api

# List all tables
\dt

# Check users table
SELECT id, email, username, "firstName", "lastName", "isActive" FROM users;

# Check categories table
SELECT id, name, slug, "isActive" FROM categories;

# Check manufacturers table
SELECT id, name, country, website FROM manufacturers;

# Check parts table
SELECT id, name, "partNumber", price, "stockQuantity", "isActive" FROM parts;

# Exit psql
\q
```

### 4.2 Verify Relationships
```bash
# Check parts with category and manufacturer info
SELECT 
  p.name as part_name,
  c.name as category_name,
  m.name as manufacturer_name,
  p.price,
  p."stockQuantity"
FROM parts p
JOIN categories c ON p."categoryId" = c.id
JOIN manufacturers m ON p."manufacturerId" = m.id;
```

---

## 🔍 Step 5: Advanced Testing

### 5.1 Test Rate Limiting
```bash
# Make multiple rapid requests to test rate limiting
for i in {1..110}; do
  curl -X GET http://localhost:3000/parts/active
  echo "Request $i"
done
```

After 100 requests, you should see rate limiting responses.

### 5.2 Test Error Handling
```bash
# Test invalid data
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "username": "test",
    "password": "weak",
    "confirmPassword": "different"
  }'

# Test non-existent endpoint
curl -X GET http://localhost:3000/non-existent-endpoint

# Test unauthorized access
curl -X GET http://localhost:3000/parts
```

### 5.3 Test Soft Delete
```bash
# Create a part
PART_ID="your-part-id"

# Soft delete the part
curl -X PATCH http://localhost:3000/parts/$PART_ID/soft-delete \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Try to get the part (should return 404)
curl -X GET http://localhost:3000/parts/$PART_ID

# Restore the part
curl -X PATCH http://localhost:3000/parts/$PART_ID/restore \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5.4 Test Logging
Check the log files in the `logs/` directory:
```bash
# View real-time logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log

# View authentication events
grep "AUTH" logs/combined.log
```

---

## 🐳 Step 6: Docker Management Commands

### 6.1 Docker Service Management
```bash
# Start all services
docker-compose up -d

# Start specific services only
docker-compose up -d postgres redis

# View service logs
docker-compose logs -f api
docker-compose logs -f postgres

# Check service status
docker-compose ps

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### 6.2 Access Docker Services
- **API:** http://localhost:3000
- **PostgreSQL:** localhost:5432
- **pgAdmin:** http://localhost:5050
- **Redis:** localhost:6379

### 6.3 Run Commands in Docker Containers
```bash
# Execute migration command in API container
docker-compose exec api npm run migration:run

# Connect to PostgreSQL container
docker-compose exec postgres psql -U autoparts_user -d autoparts_api

# Run tests in API container
docker-compose exec api npm run test:unit

# Access container shell
docker-compose exec api sh
```

---

## 🧪 Step 7: Automated Testing

### 7.1 Run Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### 7.2 Run Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run all tests
npm run test:all
```

### 7.3 Test Coverage
```bash
# Generate coverage report
npm run test:cov

# Open coverage report
open coverage/lcov-report/index.html
```

---

## 🔧 Step 8: Performance Testing

### 8.1 Load Testing with Artillery
```bash
# Install Artillery (optional)
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health Check"
    weight: 50
    flow:
      - get:
          url: "/health"
  - name: "Get Parts"
    weight: 30
    flow:
      - get:
          url: "/parts/active"
  - name: "Search Parts"
    weight: 20
    flow:
      - get:
          url: "/parts/search?q=brake"
EOF

# Run load test
artillery run load-test.yml
```

### 8.2 Memory and Performance Monitoring
```bash
# Check memory usage
curl http://localhost:3000/health/memory

# Check disk usage
curl http://localhost:3000/health/disk

# Monitor logs for performance
tail -f logs/combined.log | grep "responseTime"
```

---

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_ctl status

# Check connection details
psql -h localhost -U autoparts_user -d autoparts_api

# Verify environment variables
cat .env | grep DB_
```

#### Migration Errors
```bash
# Reset database (WARNING: This will delete all data)
npm run migration:revert
npm run migration:run

# Check migration status
npm run typeorm -- migration:show -d src/database/typeorm.config.ts
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change PORT in .env
```

#### Permission Denied (Database)
```bash
# Grant proper permissions
psql -U postgres -d autoparts_api -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO autoparts_user;"
psql -U postgres -d autoparts_api -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO autoparts_user;"
```

### Log Analysis
```bash
# View application logs
tail -f logs/combined.log

# Filter error logs
grep "ERROR" logs/combined.log

# View authentication events
grep "AUTH" logs/combined.log

# Monitor request patterns
grep "HTTP" logs/combined.log | tail -20
```

---

## 📚 API Endpoints Reference

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PATCH /auth/change-password` - Change password

### Parts (Public)
- `GET /parts/active` - List active parts
- `GET /parts/search?q=query` - Search parts
- `GET /parts/featured` - List featured parts
- `GET /parts/:id` - Get part details
- `GET /parts/by-category/:id` - Parts by category
- `GET /parts/by-manufacturer/:id` - Parts by manufacturer

### Parts (Protected - Admin/Manager)
- `GET /parts` - List all parts
- `POST /parts` - Create part
- `PATCH /parts/:id` - Update part
- `PATCH /parts/:id/stock` - Update stock
- `DELETE /parts/:id` - Delete part (Admin only)
- `PATCH /parts/:id/soft-delete` - Soft delete
- `PATCH /parts/:id/restore` - Restore part

### Categories (Public)
- `GET /categories/active` - List active categories
- `GET /categories/tree` - Category tree structure
- `GET /categories/root` - Root categories
- `GET /categories/:id` - Get category details

### Categories (Protected - Admin/Manager)
- `GET /categories` - List all categories
- `POST /categories` - Create category
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category (Admin only)

### Manufacturers (Public)
- `GET /manufacturers/active` - List active manufacturers
- `GET /manufacturers/:id` - Get manufacturer details

### Manufacturers (Protected - Admin/Manager)
- `GET /manufacturers` - List all manufacturers
- `POST /manufacturers` - Create manufacturer
- `PATCH /manufacturers/:id` - Update manufacturer
- `DELETE /manufacturers/:id` - Delete manufacturer (Admin only)

### Health & Monitoring
- `GET /health` - Complete health check
- `GET /health/database` - Database health
- `GET /health/memory` - Memory usage
- `GET /health/disk` - Disk usage

---

## 🎯 Testing Checklist

### ✅ Basic Setup
- [ ] PostgreSQL installed and running
- [ ] Database and user created
- [ ] API cloned and dependencies installed
- [ ] Environment variables configured
- [ ] Migrations run successfully
- [ ] API starts without errors

### ✅ Authentication Testing
- [ ] User registration works
- [ ] User login returns JWT token
- [ ] Protected endpoints require authentication
- [ ] Public endpoints accessible without auth
- [ ] Role-based access control works

### ✅ CRUD Operations
- [ ] Create categories, manufacturers, parts
- [ ] Read operations work (public and protected)
- [ ] Update operations work with proper auth
- [ ] Delete operations work with proper roles
- [ ] Soft delete and restore functionality

### ✅ Advanced Features
- [ ] Search functionality works
- [ ] Filtering by category/manufacturer works
- [ ] Stock management works
- [ ] Rate limiting prevents abuse
- [ ] Error handling returns proper responses
- [ ] Logging captures all events

### ✅ Production Features
- [ ] Health checks return correct status
- [ ] Logging system works properly
- [ ] Docker setup works (if used)
- [ ] Tests pass successfully
- [ ] API documentation is accessible

---

## 🚀 Next Steps

After successful testing, you can:

1. **Deploy to Production** - Use Docker or cloud services
2. **Add More Features** - Implement Phase 4 features (Orders, Payments)
3. **Integrate Frontend** - Connect with React/Vue/Angular apps
4. **Set up CI/CD** - Automated testing and deployment
5. **Monitor in Production** - Set up monitoring and alerting

---

**Happy Testing!** 🎉

For issues or questions, check the repository issues or create a new one.
