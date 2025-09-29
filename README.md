# User Management Service

This repository contains a 3-tier web application for managing users with a frontend, backend API, and database layer, hosted using Docker!

## Project Structure

```
|-- UI/           # Frontend - Web Application (HTML, CSS, JavaScript)
|-- api/          # Backend - Node.js Application
|-- README.md     # Documentation
```

## Components

### 1. Frontend (UI)
- Developed using HTML, CSS, and JavaScript.
- User management interface with CRUD operations.
- Served using Nginx.

### 2. Backend API
- A Node.js application providing backend functionality.
- Exposes RESTful endpoints for user management operations.
- Handles CRUD operations for user data.

### 3. Database
- Uses Postgres Database for user data storage.
- Stores user information including name, email, age, and address.

### 4. Networking & Security
- Use Default Docker Bridge Network

## Solution

Added three files

1. api/Dockerfile
2. ui/Dockerfile
3. docker-compose.yml

Execute the following code to start the application

```
docker-compose.yml
```