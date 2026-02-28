# SocraticDev AWS Deployment Guide (Single Host Full Stack)

This guide deploys the entire project together on AWS:
- Frontend (Vite build served by Nginx)
- Backend API (FastAPI)
- Celery worker
- Neo4j, PostgreSQL, ChromaDB, Redis, RabbitMQ

No split frontend hosting (no Vercel/Netlify required).

## 1. Which AWS Service Should You Use?

Use `EC2` for this codebase right now.

Why:
- Your backend already runs as a multi-container Docker Compose stack with stateful services.
- You want frontend + backend together in one deployment.
- EC2 gives full host control and is the lowest-friction path.

Use this target:
- `EC2 t3.large` minimum (2 vCPU, 8 GB RAM), `50 GB gp3` disk.

When to choose something else:
- `ECS/Fargate`: better for long-term managed operations, but more setup and best when databases are moved out to managed services.
- `App Runner`: best for stateless web services, not a full stateful compose stack like this one.

## 2. Target Architecture

Single EC2 instance:
- Nginx on host:
  - serves frontend static files
  - reverse proxies API traffic to Docker backend
- Docker Compose (`backend/docker-compose.prod.yml`) runs:
  - backend
  - celery-worker
  - neo4j
  - postgres
  - chroma
  - redis
  - rabbitmq

Public ports:
- `80` and `443` only
- Keep service ports (8000, 7474, 15672, etc.) private

## 3. Launch EC2

In AWS Console:
1. Launch instance: Ubuntu 22.04 LTS
2. Instance type: `t3.large` (or bigger)
3. Storage: `50 GB gp3`
4. Security Group inbound rules:
   - SSH `22` from your IP only
   - HTTP `80` from `0.0.0.0/0`
   - HTTPS `443` from `0.0.0.0/0`
5. (Recommended) Allocate and attach an Elastic IP

SSH:

```bash
ssh -i /path/to/key.pem ubuntu@<EC2_PUBLIC_IP>
```

## 4. Install Runtime Dependencies on EC2

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 nginx certbot python3-certbot-nginx git curl rsync ca-certificates gnupg
sudo usermod -aG docker $USER
exit
```

Reconnect via SSH after logout.

Install Node.js 20 (required to build frontend):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify:

```bash
docker --version
docker compose version
nginx -v
node -v
npm -v
```

## 5. Clone Project and Prepare Env

```bash
git clone <YOUR_REPO_URL> ~/socraticDev
cd ~/socraticDev
```

Create backend env:

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Set secure values at minimum:

```env
NEO4J_PASSWORD=<strong-password>
POSTGRES_PASSWORD=<strong-password>
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=<strong-password>
GEMINI_API_KEY=<your-key>
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=["https://<YOUR_DOMAIN_OR_EC2_HOSTNAME>"]
```

Set frontend env (single-domain deployment):

```bash
cp frontend/.env.example frontend/.env.local
nano frontend/.env.local
```

Use:

```env
VITE_API_BASE_URL=https://<YOUR_DOMAIN_OR_EC2_HOSTNAME>
VITE_GEMINI_API_KEY=<your-key>
```

## 6. Build Frontend

```bash
cd ~/socraticDev/frontend
npm ci
npm run build
```

Publish static files to Nginx web root:

```bash
sudo mkdir -p /var/www/socraticdev
sudo rsync -a --delete ~/socraticDev/frontend/dist/ /var/www/socraticdev/
```

## 7. Start Full Backend Stack (Docker Compose)

```bash
cd ~/socraticDev/backend
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Health check:

```bash
curl http://localhost:8000/health
```

## 8. Configure Nginx (Frontend + API Reverse Proxy)

Create Nginx site config:

```bash
sudo nano /etc/nginx/sites-available/socraticdev
```

Paste:

```nginx
server {
    listen 80;
    server_name <YOUR_DOMAIN_OR_EC2_HOSTNAME>;

    root /var/www/socraticdev;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }

    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/socraticdev /etc/nginx/sites-enabled/socraticdev
sudo nginx -t
sudo systemctl restart nginx
```

Now test:
- Frontend: `http://<YOUR_DOMAIN_OR_EC2_HOSTNAME>`
- API: `http://<YOUR_DOMAIN_OR_EC2_HOSTNAME>/health`

## 9. Enable HTTPS (Recommended)

If you have a domain pointing to your EC2/Elastic IP:

```bash
sudo certbot --nginx -d <YOUR_DOMAIN>
```

Then update:

```env
# frontend/.env.local
VITE_API_BASE_URL=https://<YOUR_DOMAIN>
VITE_GEMINI_API_KEY=<your-key>
```

Rebuild/redeploy frontend:

```bash
cd ~/socraticDev/frontend
npm run build
sudo rsync -a --delete ~/socraticDev/frontend/dist/ /var/www/socraticdev/
```

## 10. Deploy Updates

Code updates:

```bash
cd ~/socraticDev
git pull
```

Backend updates:

```bash
cd ~/socraticDev/backend
docker compose -f docker-compose.prod.yml up -d --build
```

Frontend updates:

```bash
cd ~/socraticDev/frontend
npm ci
npm run build
sudo rsync -a --delete ~/socraticDev/frontend/dist/ /var/www/socraticdev/
```

## 11. Ops Commands

```bash
# Backend stack status
cd ~/socraticDev/backend
docker compose -f docker-compose.prod.yml ps

# Follow backend logs
docker logs graphrag-backend-prod -f

# Follow all compose logs
docker compose -f docker-compose.prod.yml logs -f

# Restart stack
docker compose -f docker-compose.prod.yml restart

# Stop stack
docker compose -f docker-compose.prod.yml down

# Host resources
free -h
df -h
```

## 12. Cost Snapshot (Typical)

- EC2 `t3.large`: roughly mid double-digit USD/month on-demand (region dependent)
- EBS `50 GB gp3`: low single-digit USD/month
- Elastic IP: charged when not attached/running; generally no charge while correctly attached to a running instance

Check AWS Pricing Calculator for your exact region and expected uptime.

## 13. Notes on Future Migration

If you later want higher reliability and easier scaling:
1. Move databases/broker to managed AWS services (RDS, ElastiCache, etc.)
2. Move app containers to ECS/Fargate
3. Put CloudFront in front of the frontend

For now, one EC2 instance is the right pragmatic deployment for this repository and your "single startup" requirement.
