# SocraticDev AWS Guide (Beginner, Minimal Changes, Gemini First)

This guide is for your exact goal:

- Deploy current project on AWS quickly
- Keep Gemini for now (no Bedrock migration yet)
- Make minimum changes only
- Avoid confusion

---

## 0) Your plan is correct

Yes, your approach is right:

1. Deploy current version with Gemini first
2. Confirm everything works
3. Then migrate to Bedrock later

This prevents mixing deployment bugs with model-migration bugs.

---

## 1) What is mandatory (if you skip, app can fail)

## A) Do not use API Gateway for uploads

Why:
- API Gateway request body limit is ~10 MB
- Your app supports much larger uploads

What to do:
- Use ALB (Application Load Balancer) in front of backend

---

## B) Use only 1 backend API instance/task for now

Why:
- Upload session state is file-based (`./upload_sessions`)
- Multiple API instances will not share that local folder

What to do:
- ECS API desired count = 1

---

## C) Set correct frontend API URL

Why:
- Frontend must call your AWS backend, not localhost

What to do:
- `VITE_API_BASE_URL=https://<your-api-domain>`

If you forget this, frontend fails to call backend.

---

## D) Gemini keys required (current code path)

Current app still uses Gemini in frontend and backend.

Set both:
- Frontend: `VITE_GEMINI_API_KEY=...`
- Backend: `GEMINI_API_KEY=...`

If missing:
- chat/dojo/flashcard AI can fail
- embedding pipeline can fail

---

## E) Visualizer execution in production

If backend `ENVIRONMENT=production`, execution trace can be blocked unless allowed.

Set:
- `VISUALIZER_EXECUTION_ENABLED=true`
- `VISUALIZER_EXECUTION_ALLOW_IN_PRODUCTION=true`

---

## F) Ensure deployed image matches current source (important)

If your AWS deployment uses an old backend image or old task definition, behavior can differ from your local project.

If GitHub upload shows queued/non-processing behavior, first confirm the running backend image is built from your current source.

---

## 2) Recommended AWS setup (prototype, easiest reliable path)

## Frontend
- AWS Amplify Hosting

## Backend
- ECS Fargate + ALB
- One API task
- One worker task

## Data/services
- Neo4j (Aura or self-host)
- Chroma container (ECS service)
- Redis (ElastiCache or container)
- RabbitMQ (Amazon MQ or container)

---

## 3) One-page ECS settings checklist (copy this)

## Service 1: `socraticdev-api`

- Launch type: Fargate
- Desired count: `1`
- Container port: `8000`
- Health check path: `/health`
- Attached to ALB target group

## Service 2: `socraticdev-worker`

- Launch type: Fargate
- Desired count: `1`
- Command:
```bash
celery -A src.celery_app worker --loglevel=info --pool=solo --concurrency=2
```

## Service 3: `socraticdev-chroma` (if not external)

- Image: `chromadb/chroma:0.4.15`
- Port: `8000`
- Desired count: `1`
- Persistent storage: EFS mount (recommended)

---

## API task env vars (minimum working set)

```env
ENVIRONMENT=production
DEBUG=false
API_HOST=0.0.0.0
API_PORT=8000
API_PREFIX=/api
CORS_ORIGINS=["https://<frontend-domain>"]

NEO4J_URI=bolt://<neo4j-host>:7687
NEO4J_USER=<neo4j-user>
NEO4J_PASSWORD=<neo4j-password>
NEO4J_DATABASE=neo4j

CHROMA_HOST=<chroma-host>
CHROMA_PORT=8000

REDIS_HOST=<redis-host>
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password-or-empty>

RABBITMQ_HOST=<rabbitmq-host>
RABBITMQ_PORT=5672
RABBITMQ_USER=<rabbitmq-user>
RABBITMQ_PASSWORD=<rabbitmq-password>
RABBITMQ_VHOST=/

CELERY_BROKER_URL=amqp://<rabbitmq-user>:<rabbitmq-password>@<rabbitmq-host>:5672/
CELERY_RESULT_BACKEND=redis://:<redis-password>@<redis-host>:6379/0

GEMINI_API_KEY=<your-gemini-key>
GEMINI_EMBEDDING_MODEL=text-embedding-004
GEMINI_RATE_LIMIT_PER_MINUTE=60

VISUALIZER_EXECUTION_ENABLED=true
VISUALIZER_EXECUTION_ALLOW_IN_PRODUCTION=true
VISUALIZER_MAX_CODE_CHARS=50000
```

## Worker task env vars
- Use same DB/Broker/Gemini vars as API task.

## Frontend env vars (Amplify)

```env
VITE_API_BASE_URL=https://<api-domain>
VITE_GEMINI_API_KEY=<your-gemini-key>
VITE_GEMINI_MODEL=gemini-2.5-flash
```

---

## 4) Step-by-step deploy (beginner friendly)

## Step 1: Build and push backend image

From repo root:

```bash
aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com
docker build -t socraticdev-backend:latest backend
docker tag socraticdev-backend:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/socraticdev/backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/socraticdev/backend:latest
```

## Step 2: Create ECS task definitions

- API task: uses backend image, port 8000, env vars above
- Worker task: same image, celery command override

## Step 3: Create ECS services

- API service with ALB attached (desired count 1)
- Worker service (desired count 1, no ALB)

## Step 4: Deploy frontend on Amplify

- Connect repo
- Build command: `npm run build`
- Output dir: `dist` (if frontend root in Amplify is set to `frontend`, keep that)
- Add env vars above

## Step 5: DNS

- `api.<yourdomain>` -> ALB
- `app.<yourdomain>` -> Amplify app domain

## Step 6: Test

1. Open frontend
2. Upload folder
3. Ask chat question
4. Run dojo
5. Try visualizer execution trace
6. Try GitHub upload

---

## 5) Why you got GitHub upload queued but not processing

Possible reasons:

1. Old backend image running
2. Celery worker not running (though local fallback exists)
3. `git` unavailable in runtime image/container
4. Private GitHub repo URL without access credentials

Quick checks:
- API logs for clone error
- Worker logs for task errors
- Ensure repo is public for first test

---

## 6) Minimum code changes summary (for your current goal)

For your "just make it work on AWS now" plan:

- Keep Gemini (do not migrate to Bedrock now)
- Keep current embeddings as-is
- Keep one API task
- Use ALB, not API Gateway
- Set env vars correctly
- Deploy latest backend code

That is enough for prototype deployment.

---

## 7) After prototype is stable (later)

Only after AWS deployment is stable:

1. Move frontend AI calls to backend (key safety)
2. Replace file-based upload sessions with centralized storage
3. Then migrate chat model to Sonnet/Bedrock in a controlled way

Do this later, not now.
