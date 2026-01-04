# Running SignalFusion Core

This guide provides instructions for setting up and running the SignalFusion Core platform.

## Prerequisites

- **Node.js**: v20 or higher
- **npm**: v9 or higher
- **Docker**: (Optional, for containerized deployment)

---

## Method 1: Using Docker (Recommended)

The easiest way to get started is by using Docker Compose.

### 1. Start the services
From the root of the repository, run:
```bash
docker-compose up --build
```

### 2. Access the application
- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8001](http://localhost:8001)

---

## Method 2: Manual Setup (Development)

Follow these steps to run the backend and frontend services separately.

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npx tsx src/server.ts
```
The backend will be available at `http://localhost:8001`.

### 2. Frontend Setup
Open a new terminal tab and run:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`.

---

## Verification

To verify the setup, you can run an attack simulation:

```bash
curl -X POST 'http://localhost:8001/api/simulation/run?count=5'
```

Then check the dashboard at `http://localhost:3000` to see the generated alerts.
