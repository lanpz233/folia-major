#!/bin/sh
# Starts the three music API servers plus the gateway in one container.
set -u
mkdir -p /app/qq-state

cd /app/netease && PORT=3001 HOST=0.0.0.0 ENABLE_GENERAL_UNBLOCK=false node node_modules/@neteasecloudmusicapienhanced/api/app.js &
cd /app/kugou && PORT=3002 HOST=0.0.0.0 node node_modules/kugoumusicapi/app.js &
cd /app/qq && PORT=3003 HOST=0.0.0.0 QQ_AUTH_STATE_PATH=/app/qq-state/qq-device.json node node_modules/@yakult-green-tea/qq-music-api/dist/src/app.js &
cd /app/gateway && node proxy.mjs &
wait
