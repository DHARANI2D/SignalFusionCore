# SignalFusion Core - Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)
- 2GB RAM minimum
- 1GB free disk space

### One-Command Deployment (Demo Only)

For a quick demo, use the provided automation script:

```bash
# Make script executable
chmod +x host-demo.sh

# Run demo hosting
./host-demo.sh
```

This will automatically build containers, seed the database, and verify health.

---

### Standard Deployment

```bash
# Clone and navigate to project
cd "SignalFusion Core"

# Build and start all services
docker-compose up --build
```

**Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- Health Check: http://localhost:8001/health

---

## Detailed Setup

### 1. Environment Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env if needed (defaults work for Docker)
```

#### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local if needed (defaults work for Docker)
```

### 2. Build Docker Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### 3. Start Services

```bash
# Start in detached mode
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up backend
```

### 4. Verify Deployment

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check health
curl http://localhost:8001/health
curl http://localhost:3000
```

---

## Docker Commands Reference

### Container Management

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Logs and Debugging

```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Service-specific logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Exec into Container

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# Run command in backend
docker-compose exec backend npx prisma studio
```

---

## Architecture

### Services

```
┌─────────────────────────────────────────┐
│  Docker Host                            │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Frontend Container (Port 3000)   │ │
│  │  - Next.js 16                     │ │
│  │  - Node.js 20 Alpine              │ │
│  └───────────────┬───────────────────┘ │
│                  │                      │
│                  │ HTTP                 │
│                  ↓                      │
│  ┌───────────────────────────────────┐ │
│  │  Backend Container (Port 8001)    │ │
│  │  - Express.js                     │ │
│  │  - Prisma + SQLite                │ │
│  │  - Node.js 20 Alpine              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Volumes                          │ │
│  │  - backend-data (SQLite DB)       │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Network

- **Bridge Network**: `signalfusion-network`
- **Internal Communication**: Services communicate via service names
- **External Access**: Ports 3000 and 8001 exposed to host

### Volumes

- **backend-data**: Persists SQLite database across container restarts

---

## Production Deployment

### Environment Variables

#### Backend Production
```env
DATABASE_URL=file:./dev.db
PORT=8001
NODE_ENV=production
```

#### Frontend Production
```env
NEXT_PUBLIC_API_URL=http://your-backend-domain:8001
```

### Security Considerations

1. **Change Default Ports** (if needed):
```yaml
services:
  backend:
    ports:
      - "8080:8001"  # External:Internal
  frontend:
    ports:
      - "80:3000"
```

2. **Use Environment Files**:
```bash
docker-compose --env-file .env.production up
```

3. **Enable HTTPS** (use reverse proxy like Nginx):
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

---

## Testing the Deployment

### 1. Run Attack Simulation

```bash
# Reset database
curl -X DELETE http://localhost:8001/api/reset

# Run 10 diverse scenarios
curl -X POST 'http://localhost:8001/api/simulation/run?count=10'

# Check generated alerts
curl http://localhost:8001/api/stats
```

### 2. Verify Frontend

```bash
# Open in browser
open http://localhost:3000

# Or use curl
curl -I http://localhost:3000
```

### 3. Check Health

```bash
# Backend health
curl http://localhost:8001/health

# Should return:
# {"status":"ok","version":"2.0.0 (Distributed)"}
```

---

## Troubleshooting

### Issue: Containers won't start

**Solution**:
```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Issue: Frontend can't connect to backend

**Solution**:
```bash
# Check network
docker network inspect signalfusion-network

# Verify backend is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend
```

### Issue: Database not persisting

**Solution**:
```bash
# Check volume
docker volume ls | grep backend-data

# Inspect volume
docker volume inspect signalfusion_backend-data
```

### Issue: Port already in use

**Solution**:
```bash
# Find process using port
lsof -ti:3000
lsof -ti:8001

# Kill process or change port in docker-compose.yml
```

---

## Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Backup Database

```bash
# Copy database from container
docker-compose exec backend cat /app/prisma/dev.db > backup.db

# Or use volume backup
docker run --rm -v signalfusion_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data
```

### Restore Database

```bash
# Copy backup to container
docker cp backup.db signalfusion-backend:/app/prisma/dev.db

# Restart backend
docker-compose restart backend
```

---

## Performance Tuning

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Scaling

```bash
# Scale frontend (load balancing)
docker-compose up -d --scale frontend=3

# Note: Requires load balancer configuration
```

---

## Development vs Production

### Development (Current Setup)
- SQLite database
- Hot reload disabled
- Logs to stdout
- No SSL

### Production Recommendations
- Use PostgreSQL instead of SQLite
- Enable SSL/TLS
- Use environment-specific configs
- Implement log aggregation
- Add monitoring (Prometheus, Grafana)
- Use secrets management

---

## Additional Resources

- **Project Structure**: See `PROJECT_STRUCTURE.md`
- **Ingestion Guide**: See `INGESTION_GUIDE.md`
- **Comprehensive Guide**: See `COMPREHENSIVE_GUIDE.md`
- **Docker Docs**: https://docs.docker.com/
- **Docker Compose Docs**: https://docs.docker.com/compose/

---

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Verify health: `curl http://localhost:8001/health`
3. Review documentation in project root
4. Check Docker and Docker Compose versions
