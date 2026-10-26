// Serves index.html and proxies POST /api/workflow to the Kore workflow API (avoids browser CORS).
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const WORKFLOW_URL = 'https://agents.kore.ai/api/v1/project/usha-test/draft/workflow/extractdoucmentandupload/invoke';
const ENV_TIER = 'dev';
const API_TOKEN = 'abl_3dd2a1ce06fd6472c9360d508990ff9d22fc57309f6c8b35';

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) { res.writeHead(500); return res.end('Failed to load page'); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/workflow') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    try {
      const upstream = await fetch(WORKFLOW_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + API_TOKEN,
          'X-ABL-Env-Tier': ENV_TIER,
          'Content-Type': 'application/json',
        },
        body: Buffer.concat(chunks),
      });
      const body = Buffer.from(await upstream.arrayBuffer());
      res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
      res.end(body);
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => console.log(`Open http://localhost:${PORT}`));
