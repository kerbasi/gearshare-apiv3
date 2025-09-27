# Auto Parts API

A comprehensive REST API for managing auto parts inventory, built with NestJS, TypeORM, and PostgreSQL.

## 🚀 Features

- **Modern Tech Stack**: NestJS + TypeORM + PostgreSQL
- **Comprehensive Database Design**: Robust schema with audit trails and flexible relationships
- **Environment Configuration**: Secure environment variable management
- **Database Migrations**: Version-controlled database schema management
- **Production Ready**: Structured logging, error handling, and security measures

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auto-parts-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=autoparts_api
   DB_USER=autoparts_user
   DB_PASSWORD=your_secure_password
   ```

4. **Database Setup**
   ```bash
   # Create the database
   createdb autoparts_api
   
   # Run migrations (when available)
   npm run migration:run
   ```

## 🏃‍♂️ Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3000`

## 🗄️ Database Management

```bash
# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Create empty migration
npm run migration:create -- src/database/migrations/MigrationName
```

## 📁 Project Structure

```
src/
├── database/
│   ├── entities/          # TypeORM entities
│   ├── migrations/        # Database migrations
│   ├── seeds/            # Database seed files
│   └── typeorm.config.ts # TypeORM configuration
├── modules/              # Feature modules
├── app.module.ts         # Root module
├── app.controller.ts     # Root controller
└── main.ts              # Application entry point
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📝 API Documentation

API documentation will be available at `http://localhost:3000/api` (Swagger/OpenAPI)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `autoparts_api` |
| `DB_USER` | Database user | `autoparts_user` |
| `DB_PASSWORD` | Database password | - |
| `NODE_ENV` | Environment | `development` |
| `PORT` | Application port | `3000` |
| `API_PREFIX` | API prefix | `api/v1` |

## 📋 Project Status

**Current Phase:** Phase 2 Complete - Authentication & Authorization System  
**Progress:** 2/5 phases completed (40%)  
**Next Phase:** Production Readiness & Best Practices  

📖 **For detailed progress tracking, see [PHASES_SUMMARY.md](./PHASES_SUMMARY.md)**

## 🔐 Authentication

The API uses JWT-based authentication. To access protected endpoints:

1. Register a new user: `POST /auth/register`
2. Login: `POST /auth/login`
3. Use the returned token: `Authorization: Bearer <your-jwt-token>`

### Available Roles:
- **Admin** - Full system access
- **Manager** - Inventory and order management  
- **Client** - Customer access (default for new users)
- **Guest** - View-only access

## 🚧 Development Phases

### ✅ Phase 0: Project Initialization (Completed)
- [x] NestJS project setup
- [x] TypeORM and PostgreSQL integration
- [x] Environment configuration
- [x] Basic project structure

### ✅ Phase 1: Core API Structure & CRUD (Completed)
- [x] Define TypeORM entities (14 entities)
- [x] Create modules, controllers, and services
- [x] Implement CRUD operations
- [x] Create DTOs with validation
- [x] Advanced search and filtering

### ✅ Phase 2: Authentication & Authorization (Completed)
- [x] JWT-based authentication
- [x] User registration and login
- [x] Role-based access control
- [x] Password hashing with bcrypt
- [x] Protected API endpoints

### 🔄 Phase 3: Production Readiness (Next)
- [ ] Docker containerization
- [ ] API documentation with Swagger
- [ ] Health checks and monitoring
- [ ] Comprehensive testing suite
- [ ] Logging and error tracking

### ⏳ Phase 4: Advanced Features (Planned)
- [ ] Orders and inventory management
- [ ] Payment processing
- [ ] Analytics and reporting
- [ ] Background job processing

### ⏳ Phase 5: Deployment & DevOps (Planned)
- [ ] Cloud deployment
- [ ] CI/CD pipeline
- [ ] Monitoring and alerting
- [ ] Security audit

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API specifications

---

**Built with ❤️ using NestJS**