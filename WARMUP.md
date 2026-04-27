# Render Warm-up Strategy

Goal: reduce cold-start delays by pinging the services periodically.

Services:
- Frontend: `https://protienlab-frontend.onrender.com/`
- Backend: `https://protienlab-backend.onrender.com/health` (or a lightweight GET such as `/api/stats` if `/health` is absent).

Recommended approaches:
1) External cron (preferred on free plan):
   - Use a small uptime/cron service to `GET` both URLs every 5–10 minutes.
   - Keep requests lightweight (no auth) and avoid sensitive endpoints.
2) Render cron job (if available on your plan):
   - Create a cron that calls the same endpoints on the same cadence.
3) Notes:
   - Warm-up reduces but does not eliminate sleep on free tier.
   - Use idempotent, cheap endpoints to avoid side effects and cost.

Sample curl (every 10m):
```
curl -s https://protienlab-frontend.onrender.com/ >/dev/null
curl -s https://protienlab-backend.onrender.com/health >/dev/null
```













