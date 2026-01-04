# SignalFusion Core: Deployment & Setup

## 1. System Requirements

- **OS**: macOS, Linux, or Windows (WSL2).
- **Node.js**: v20.x or higher.
- **npm**: v9.x or higher.
- **Memory**: 2GB RAM minimum.
- **Disk**: 500MB free space.

---

## 2. Setup Methods

### Using Docker (Recommended)
Docker Compose handles both the frontend and backend orchestration.

```bash
# Start all services
docker-compose up --build -d

# Stop services
docker-compose down
```

### Manual Development Setup
Required for making code changes or testing individual components.

#### Backend
```bash
cd backend
npm install
npx prisma db push
npx tsx src/server.ts
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 3. Configuration

### Environment Variables (.env)
- **Backend**: `DATABASE_URL`, `PORT`.
- **Frontend**: `NEXT_PUBLIC_API_URL`.

### Database Reset
If you need a clean slate:
```bash
# API call
curl -X DELETE http://localhost:8001/api/reset

# Manual reset
cd backend/prisma
rm dev.db
npx prisma db push
```

---

## 4. Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 8001/3000 in use** | Find process with `lsof -i :PORT` and kill it. |
| **Prisma Client missing** | Run `npx prisma generate` in the `backend` folder. |
| **No alerts generated** | Ensure simulation is running and backend logs don't show detector errors. |
| **Frontend build stuck** | Delete `.next/` and restart the dev server. |
