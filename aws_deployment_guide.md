# 🚀 SocraticDev — AWS Deployment Guide

Deploy the **backend (Docker on EC2)** + **frontend (Vercel/Netlify)** and connect them.

---

## Architecture Overview

```
                    🌍 Users
                       │
                       ▼
        ┌──────────────────────────┐
        │    Vercel / Netlify      │
        │    (Frontend - React)    │
        │    https://your-app.com  │
        └──────────┬───────────────┘
                   │ API calls
                   ▼
        ┌──────────────────────────┐
        │     AWS EC2 Instance     │
        │     (Ubuntu 22.04)       │
        │                          │
        │  🐳 Docker Compose:      │
        │  ├── FastAPI Backend     │
        │  ├── Celery Worker       │
        │  ├── Neo4j               │
        │  ├── PostgreSQL          │
        │  ├── ChromaDB            │
        │  ├── Redis               │
        │  └── RabbitMQ            │
        └──────────────────────────┘
```

---

## Part 1 — Launch an EC2 Instance

### 1.1 Go to AWS Console
- Log in at [console.aws.amazon.com](https://console.aws.amazon.com)
- Navigate to **EC2** → **Launch Instance**

### 1.2 Configure the Instance

| Setting | Recommended Value |
|---------|------------------|
| **Name** | `socraticdev-backend` |
| **AMI** | Ubuntu Server 22.04 LTS (free tier eligible) |
| **Instance type** | `t3.large` (2 vCPU, 8 GB RAM) — minimum for all the databases |
| **Key pair** | Create new → download `.pem` file (you'll need this to SSH in) |
| **Storage** | 30 GB gp3 (minimum — 50 GB recommended) |

> [!IMPORTANT]
> A `t2.micro` (free tier) won't work — Neo4j + ChromaDB + PostgreSQL + Redis + RabbitMQ + Backend need at least **8 GB RAM**. Use `t3.large` or bigger.

### 1.3 Configure Security Group (Firewall)

Add these **inbound rules**:

| Type | Port | Source | Purpose |
|------|------|--------|---------|
| SSH | 22 | Your IP | SSH access |
| Custom TCP | 8000 | 0.0.0.0/0 | Backend API |
| Custom TCP | 7474 | Your IP | Neo4j Browser (optional) |
| Custom TCP | 15672 | Your IP | RabbitMQ UI (optional) |

> [!CAUTION]
> Only open ports 7474 and 15672 to **your IP** (not 0.0.0.0/0) — these are admin UIs.

### 1.4 Launch & Connect

```bash
# From your local machine (where you downloaded the .pem file)
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
```

On Windows, use PowerShell:
```powershell
ssh -i .\your-key.pem ubuntu@<your-ec2-public-ip>
```

---

## Part 2 — Set Up Docker on EC2

Run these commands **on the EC2 instance** after SSHing in:

### 2.1 Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose-v2

# Add your user to the docker group (avoids needing sudo)
sudo usermod -aG docker $USER

# Log out and back in for group change to take effect
exit
```

SSH back in:
```bash
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
```

Verify:
```bash
docker --version
docker compose version
```

### 2.2 Clone Your Repository

```bash
git clone <your-repo-url> socraticDev
cd socraticDev/backend
```

### 2.3 Create the `.env` File

```bash
nano .env
```

Paste the following (update values as needed):

```env
# Passwords
NEO4J_PASSWORD=your_secure_password_here
POSTGRES_PASSWORD=your_secure_password_here
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=your_secure_password_here

# Gemini API
GEMINI_API_KEY=your-actual-gemini-api-key

# CORS — add your frontend domain
CORS_ORIGINS=["https://your-frontend-domain.vercel.app","http://localhost:5173"]
```

> [!WARNING]
> Use **strong passwords** in production, not `password` or `guest`!

### 2.4 Start Everything

```bash
cd ~/socraticDev/backend
docker compose -f docker-compose.prod.yml up -d --build
```

This will take 5-10 minutes the first time.

### 2.5 Verify

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Test the health endpoint
curl http://localhost:8000/health
```

You should get a JSON response. Also test from your local browser:

```
http://<your-ec2-public-ip>:8000/health
```

---

## Part 3 — Deploy the Frontend (Vercel)

Your project already has a [vercel.json](file:///b:/software/temp/socraticDev-final/frontend/vercel.json) configured. Vercel is the easiest option.

### 3.1 Push Frontend to GitHub

Make sure your frontend code is pushed to a GitHub repo.

### 3.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New" → "Project"**
3. Import your GitHub repository
4. Set the **Root Directory** to `frontend`
5. Vercel will auto-detect Vite — framework settings are already in [vercel.json](file:///b:/software/temp/socraticDev-final/frontend/vercel.json)

### 3.3 Set Environment Variables in Vercel

In Vercel → Project Settings → **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `VITE_GEMINI_API_KEY` | Your Gemini API key |
| `VITE_API_BASE_URL` | `http://<your-ec2-public-ip>:8000` |

> [!IMPORTANT]
> `VITE_API_BASE_URL` is the critical variable that **connects the frontend to your EC2 backend**. The frontend code reads this from [graphrag-api.ts](file:///b:/software/temp/socraticDev-final/frontend/src/services/graphrag-api.ts):
> ```ts
> const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';
> ```

### 3.4 Deploy

Click **"Deploy"** — Vercel will build and give you a URL like `https://socraticdev.vercel.app`.

---

## Part 4 — Connect Frontend ↔ Backend

### 4.1 Update Backend CORS

SSH into your EC2 and update `.env` to allow your Vercel domain:

```bash
nano ~/socraticDev/backend/.env
```

Update:
```env
CORS_ORIGINS=["https://your-app.vercel.app","http://localhost:5173"]
```

Restart the backend:
```bash
cd ~/socraticDev/backend
docker compose -f docker-compose.prod.yml restart backend
```

### 4.2 Verify the Connection

1. Open `https://your-app.vercel.app` in your browser
2. Open **DevTools → Network** tab
3. Interact with the app — you should see API calls going to `http://<your-ec2-ip>:8000`
4. If calls succeed → ✅ connected!

### Connection Flow

```
Browser (your-app.vercel.app)
   │
   │  VITE_API_BASE_URL = http://<ec2-ip>:8000
   │
   ▼
EC2 Backend (FastAPI :8000)
   │
   │ CORS allows: your-app.vercel.app
   │
   ├──► Neo4j     (internal Docker network)
   ├──► ChromaDB  (internal Docker network)
   ├──► Redis     (internal Docker network)
   ├──► RabbitMQ  (internal Docker network)
   └──► PostgreSQL(internal Docker network)
```

---

## Part 5 — (Optional) Add HTTPS with a Domain

For production, you should use HTTPS. The simplest way:

### Option A: Elastic IP + Domain + Nginx

```bash
# Install Nginx as reverse proxy
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/socraticdev
```

```nginx
server {
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # For file uploads
        client_max_body_size 100M;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/socraticdev /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get free SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

Then update Vercel env vars:
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Option B: Use an AWS Elastic IP

By default, your EC2 public IP changes on restart. To keep a fixed IP:

1. Go to **EC2 → Elastic IPs → Allocate**
2. Associate it with your EC2 instance
3. Use this IP in `VITE_API_BASE_URL`

---

## Quick Reference — Useful Commands on EC2

```bash
# Check status
docker compose -f docker-compose.prod.yml ps

# View backend logs
docker logs graphrag-backend-prod -f

# View all logs
docker compose -f docker-compose.prod.yml logs -f

# Restart everything
docker compose -f docker-compose.prod.yml restart

# Stop everything
docker compose -f docker-compose.prod.yml down

# Rebuild after code changes
git pull
docker compose -f docker-compose.prod.yml up -d --build

# Check disk space
df -h

# Check memory
free -h
```

---

## Cost Estimate

| Resource | Monthly Cost |
|----------|-------------|
| EC2 `t3.large` (on-demand) | ~$60/month |
| EC2 `t3.large` (1-yr reserved) | ~$35/month |
| Elastic IP (if associated) | Free |
| EBS 50 GB gp3 | ~$4/month |
| Vercel (free tier) | $0 |
| **Total** | **~$40-65/month** |

> [!TIP]
> For testing, you can use a `t3.medium` (4 GB RAM, ~$30/mo) if you reduce Neo4j memory settings in [docker-compose.prod.yml](file:///b:/software/temp/socraticDev-final/backend/docker-compose.prod.yml).
