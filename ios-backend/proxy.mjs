// Folia iOS backends: single-entry gateway.
// Routes /netease/*, /kugou/*, /qq/* to the three music API servers running
// in the same container, adds the CORS headers a cross-origin app needs.
import http from 'node:http';

const ROUTES = {
  '/netease': 3001,
  '/kugou': 3002,
  '/qq': 3003,
};
const PORT = Number(process.env.PORT || 8080);

function corsHeaders(req) {
  const origin = req.headers.origin;
  const h = {
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': req.headers['access-control-request-headers'] || '*',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (origin) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Credentials'] = 'true';
  } else {
    h['Access-Control-Allow-Origin'] = '*';
  }
  return h;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://gateway');
  if (url.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"ok":true}');
    return;
  }
  if (url.pathname === '/' || url.pathname === '') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ name: 'folia-backends', routes: Object.keys(ROUTES) }));
    return;
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(req));
    res.end();
    return;
  }
  const prefix = Object.keys(ROUTES).find(p => url.pathname === p || url.pathname.startsWith(p + '/'));
  if (!prefix) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end('{"error":"unknown route"}');
    return;
  }
  const targetPort = ROUTES[prefix];
  const upstreamPath = url.pathname.slice(prefix.length) + url.search;
  const headers = { ...req.headers, host: `127.0.0.1:${targetPort}` };
  const upstream = http.request(
    { host: '127.0.0.1', port: targetPort, path: upstreamPath || '/', method: req.method, headers, timeout: 120000 },
    (up) => {
      const responseHeaders = { ...up.headers, ...corsHeaders(req) };
      res.writeHead(up.statusCode || 502, responseHeaders);
      up.pipe(res);
    },
  );
  upstream.on('timeout', () => upstream.destroy(new Error('upstream timeout')));
  upstream.on('error', (err) => {
    if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json', ...corsHeaders(req) });
    res.end(JSON.stringify({ error: 'backend unavailable', detail: String(err && err.message || err) }));
  });
  req.pipe(upstream);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[gateway] listening on ${PORT}, routes: ${Object.keys(ROUTES).join(' ')}`);
});
