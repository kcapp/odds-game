# Sports Betting Platform

A Vue 3 + TypeScript sports betting platform with authentication.

## Prerequisites

- Node.js 22+
- Running API server (og-api) on port 8080

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your API URL:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Backend API Setup

The frontend requires the backend API (og-api) to be running on port 8080.

1. Navigate to the API folder:
   ```bash
   cd ../og-api
   ```

2. Build and run:
   ```bash
   go build -o og-api
   ./og-api
   ```

## Features

- **Authentication:** JWT-based authentication with login/logout
- **Protected Routes:** All main routes require authentication
- **Session Management:** Automatic token validation and refresh
- **Responsive Design:** Built with Tailwind CSS
- **TypeScript:** Full type safety

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── api/          # API client functions
├── assets/       # CSS and static assets
├── components/   # Reusable Vue components
├── router/       # Vue Router configuration
├── stores/       # Pinia state management
├── types/        # TypeScript type definitions
└── views/        # Page components
```

## Environment Variables

See `ENV.md` for detailed environment configuration.

## CORS Configuration

If you encounter CORS issues, ensure your backend API has CORS middleware enabled for `http://localhost:5173` (Vite dev server).
