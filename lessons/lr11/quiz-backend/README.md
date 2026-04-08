# LR11 Quiz Backend

Backend from LR10 wrapped in a local-first DevOps contour for LR11.

## What is included

- multi-stage `Dockerfile`
- `docker-compose.yml` and `docker-compose.dev.yml`
- GitHub Actions workflow template in `.github/workflows/ci.yml`
- smoke healthcheck scripts for Bash and PowerShell
- local release and rollback scripts

## Local npm flow

```powershell
npm install
Copy-Item .env.example .env
npm run prisma:generate
npm run typecheck
npm run test
npm run build
```

## Docker flow

```powershell
docker build -t quiz-backend:local .
docker compose up --build -d
docker compose logs -f backend
```

## Local release simulation

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\local-release.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\rollback-local.ps1
```

## Notes

- The project keeps SQLite for the учебный контур, so compose persists the database in a named Docker volume mounted to `/data`.
- The CI workflow file is stored inside the lesson project to keep the lab self-contained.
