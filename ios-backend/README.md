# ios-backend

Single-container bundle of the three backends Folia's web build needs
(Netease / Kugou / QQ Music APIs) behind one gateway, for the iOS shell build.

- `Dockerfile` — build with the folia-major repo root as context (Koyeb etc.)
- `proxy.mjs` — gateway: `/netease/*` → :3001, `/kugou/*` → :3002, `/qq/*` → :3003, adds CORS
- `start.sh` — starts all four processes

The app points at `https://<host>/netease`, `https://<host>/kugou`, `https://<host>/qq`.
