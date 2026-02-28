# SocraticDev AWS Black-Screen Fix Runbook

This document is for deployment handoff.
Code changes are already done. This guide tells you exactly what to deploy and how to verify the fix on AWS EC2 + Nginx.

## 1) Problem this fixes

The frontend was crashing on navigation with:

- `TypeError: crypto.randomUUID is not a function`

Impact:

- Clicking `Launch App` could briefly show the page, then go black.
- Route transitions could go black until hard reload.
- Deep-link reloads like `/app` could fail if Nginx SPA fallback was not configured.

## 2) What was changed in code

The following files were changed:

- `frontend/src/utils/generateId.ts` (new): robust ID generator fallback chain.
- `frontend/src/store/useStore.ts`: replaced direct `crypto.randomUUID()` calls.
- `frontend/src/components/CustomCursor.tsx`: replaced direct `crypto.randomUUID()` call.
- `frontend/src/features/dojo/useChallengeAI.ts`: replaced direct `crypto.randomUUID()` usage.
- `frontend/src/components/AppErrorBoundary.tsx` (new): app-level crash fallback UI.
- `frontend/src/App.tsx`: wrapped app shell in `AppErrorBoundary`.
- `deploy/nginx/socraticdev-http.conf` (new): Nginx config with React SPA fallback + API routing.
- `aws_deployment_guide.md`: updated docs.

Backend API behavior was not changed.

## 3) Deployment assumptions

This runbook assumes:

- EC2 Ubuntu host
- Repo path: `~/socraticDev`
- Backend API reachable at `127.0.0.1:8000`
- Nginx serves frontend static files from:
  - `/var/www/socraticdev/frontend/dist`

If your paths differ, change only the Nginx `root` path in the config file.

## 4) Exact deployment steps

### 4.1 Pull latest code

```bash
cd ~/socraticDev
git pull
```

### 4.2 Build frontend with fixed code

```bash
cd ~/socraticDev/frontend
npm ci
npm run build
```

Expected: build succeeds and outputs `frontend/dist`.

### 4.3 Publish static frontend to Nginx web root

```bash
sudo mkdir -p /var/www/socraticdev/frontend/dist
sudo rsync -av --delete ~/socraticDev/frontend/dist/ /var/www/socraticdev/frontend/dist/
```

### 4.4 Install Nginx site config (required for BrowserRouter)

```bash
sudo cp ~/socraticDev/deploy/nginx/socraticdev-http.conf /etc/nginx/sites-available/socraticdev
sudo ln -sf /etc/nginx/sites-available/socraticdev /etc/nginx/sites-enabled/socraticdev
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Important behavior in this config:

- `/api/*` -> proxied to backend `127.0.0.1:8000`
- `/health` -> proxied to backend `127.0.0.1:8000/health`
- all other frontend routes use:
  - `try_files $uri $uri/ /index.html;`

This is the key for deep-link reloads like `/app` and `/build`.

## 5) Verification checklist (must pass all)

Use browser + DevTools Console:

1. Open `http://<EC2_PUBLIC_IP>/`
2. Click `Launch App` multiple times.
3. Navigate between `/`, `/app`, `/build`, `/learn`.
4. Directly open `http://<EC2_PUBLIC_IP>/app` in a new tab.
5. Refresh on `/app` and `/build`.
6. Confirm console does **not** show:
   - `crypto.randomUUID is not a function`
7. Confirm backend still healthy:
   - `http://<EC2_PUBLIC_IP>/health`
   - should return JSON health response.

Expected result:

- No black screen during route changes.
- No UUID runtime crash.
- Deep links and reloads work.

## 6) Quick rollback (if needed)

If anything breaks unexpectedly:

```bash
cd ~/socraticDev
git log --oneline -n 5
# checkout previous stable commit if required
# git checkout <stable_commit>

cd ~/socraticDev/frontend
npm ci
npm run build
sudo rsync -av --delete ~/socraticDev/frontend/dist/ /var/www/socraticdev/frontend/dist/
sudo systemctl reload nginx
```

## 7) Notes for later hardening

- HTTP is now supported by code fallback.
- Production should still move to HTTPS when ready.
- HTTPS is recommended for security and broader browser feature reliability.

