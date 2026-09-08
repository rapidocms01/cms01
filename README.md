# School Management CMS SaaS

Enterprise Multi-Tenant School Management SaaS Platform built with Next.js 14, NestJS, and Supabase Database-per-School architecture.

## Repository Structure

```text
CMS/
├── frontend/             # Next.js 14 App Router Web Application
│   ├── src/              # Pages, App Router, Components, Shell
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── backend/              # Node.js / NestJS Modular Monolith API
│   ├── src/              # Core Auth, Tenant Resolver, Modules, Services
│   ├── test/             # Unit tests
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── packages/
│   └── common/           # Shared Types, DTOs, Enums & Permission Definitions
├── package.json          # Root Monorepo Workspace Configuration
└── README.md
```

## Quick Start & Development Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
Run frontend and backend concurrently or in separate terminals:

```bash
# Start NestJS API Backend (Port 4000)
npm run dev:backend

# Start Next.js Frontend Portal (Port 3000)
npm run dev:frontend
```

Alternatively, from within the subdirectories:
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run start:dev
```

### 3. Testing & Verification

```bash
# Run Automated Jest Unit Tests
npm run test

# Run TypeScript Typecheck Across All Packages
npm run typecheck

# Build Production Artifacts
npm run build
```
