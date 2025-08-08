# Flutter Offline App Backend

A Node.js/TypeScript backend API server designed to support a Flutter offline-capable task management application. This backend provides authentication services and task management functionality with PostgreSQL database integration.

## Features

- **User Authentication**: Sign up, login, and token validation
- **Task Management**: Create, read, delete, and sync tasks
- **Offline Support**: Task synchronization capabilities for offline-first Flutter apps
- **JWT Authentication**: Secure token-based authentication
- **PostgreSQL Database**: Robust data persistence with Drizzle ORM
- **Docker Support**: Containerized deployment with Docker Compose
- **TypeScript**: Full type safety and modern JavaScript features

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT with bcryptjs
- **Containerization**: Docker & Docker Compose
- **Development**: Nodemon for hot reloading

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (if running locally without Docker)

## Quick Start

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Flutter-Offline-App-Backend
   ```

2. Start the application with Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. The API will be available at `http://localhost:8000`

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (create a `.env` file):
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/task_manager
   PORT=8000
   ```

3. Start the PostgreSQL database:
   ```bash
   docker-compose up db
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### POST `/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### POST `/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### POST `/auth/tokenIsValid`
Validate JWT token.

**Headers:**
```
x-auth-token: jwt_token_here
```

**Response:**
```json
true
```

### Tasks

All task endpoints require authentication via the `x-auth-token` header.

#### POST `/tasks`
Create a new task.

**Headers:**
```
x-auth-token: jwt_token_here
```

**Request Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the Flutter app backend",
  "dueAt": "2024-01-15T10:00:00Z",
  "priority": "high"
}
```

#### GET `/tasks`
Get all tasks for the authenticated user.

**Headers:**
```
x-auth-token: jwt_token_here
```

**Response:**
```json
[
  {
    "id": "task_id",
    "title": "Complete project",
    "description": "Finish the Flutter app backend",
    "dueAt": "2024-01-15T10:00:00Z",
    "priority": "high",
    "uid": "user_id",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### DELETE `/tasks`
Delete a task.

**Headers:**
```
x-auth-token: jwt_token_here
```

**Request Body:**
```json
{
  "taskId": "task_id_to_delete"
}
```

#### POST `/tasks/sync`
Sync multiple tasks (useful for offline-first apps).

**Headers:**
```
x-auth-token: jwt_token_here
```

**Request Body:**
```json
[
  {
    "title": "Task 1",
    "description": "Description 1",
    "dueAt": "2024-01-15T10:00:00Z",
    "priority": "medium",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts with authentication data
- **tasks**: Task management with user relationships

## Development

### Project Structure

```
src/
├── app.ts              # Main application entry point
├── routes/             # API route handlers
│   ├── auth.ts         # Authentication endpoints
│   └── tasks.ts        # Task management endpoints
├── middleware/         # Express middleware
│   └── auth.ts         # JWT authentication middleware
├── db/                 # Database configuration
│   ├── schema.ts       # Database schema definitions
│   ├── drizzle-client.ts # Database connection
│   └── drizzle.config.ts # Drizzle ORM configuration
```

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm test`: Run tests (not implemented yet)

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 8000)

## Deployment

The application is containerized and can be deployed using Docker Compose:

```bash
docker-compose up -d
```

For production deployment, consider:
- Using environment variables for sensitive data
- Setting up proper SSL/TLS certificates
- Configuring database backups
- Implementing rate limiting
- Adding monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 