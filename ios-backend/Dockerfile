# Single-container bundle of Folia's three web music backends (Netease / Kugou / QQ)
# plus a small gateway. Build context = folia-major repository root.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY deploy/docker/netease-api/package.json deploy/docker/netease-api/package-lock.json /app/netease/
RUN cd /app/netease && npm ci --omit=dev
COPY deploy/docker/kugou-api/package.json deploy/docker/kugou-api/package-lock.json /app/kugou/
RUN cd /app/kugou && npm ci --omit=dev
COPY deploy/docker/qq-api/package.json deploy/docker/qq-api/package-lock.json /app/qq/
RUN cd /app/qq && npm ci --omit=dev

COPY deploy/docker/scripts/patch-music-api-client-ip.mjs /app/scripts/patch-music-api-client-ip.mjs
RUN cd /app/netease && node /app/scripts/patch-music-api-client-ip.mjs netease
RUN cd /app/kugou && node /app/scripts/patch-music-api-client-ip.mjs kugou

COPY ios-backend/proxy.mjs /app/gateway/proxy.mjs
COPY ios-backend/start.sh /app/start.sh
RUN chmod +x /app/start.sh && mkdir -p /app/qq-state

EXPOSE 8080
CMD ["/bin/sh", "/app/start.sh"]
