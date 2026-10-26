"""Serves index.html and proxies POST /api/workflow to the Kore workflow API (avoids browser CORS)."""
import http.server
import urllib.request
import urllib.error

WORKFLOW_URL = 'https://agents.kore.ai/api/v1/project/usha-test/draft/workflow/extractdoucmentandupload/invoke'
ENV_TIER = 'dev'
API_TOKEN = 'abl_3dd2a1ce06fd6472c9360d508990ff9d22fc57309f6c8b35'


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/api/workflow':
            self.send_error(404)
            return
        body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        req = urllib.request.Request(WORKFLOW_URL, data=body, method='POST', headers={
            'Authorization': 'Bearer ' + API_TOKEN,
            'X-ABL-Env-Tier': ENV_TIER,
            'Content-Type': 'application/json',
        })
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                status, data = r.status, r.read()
        except urllib.error.HTTPError as e:
            status, data = e.code, e.read()
        except Exception as e:
            status, data = 502, str(e).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)


if __name__ == '__main__':
    print('Open http://localhost:8000')
    http.server.ThreadingHTTPServer(('', 8000), Handler).serve_forever()
