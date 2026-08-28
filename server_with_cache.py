import http.server
import socketserver
import gzip
import io
import os

# In-memory cache: path -> (content_type, raw_bytes, gzip_bytes)
_FILE_CACHE = {}

class CompressCacheHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suppress access logs for cleaner output

    def end_headers(self):
        # Cache static files for a long time
        if self.path.endswith(('.css', '.js', '.webp', '.jpg', '.png', '.svg', '.woff2', '.ico')):
            self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
            self.send_header('Vary', 'Accept-Encoding')
        else:
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_GET(self):
        path = self.translate_path(self.path)

        # If it's a directory, map to index.html
        if os.path.isdir(path):
            for index in ("index.html", "index.htm"):
                index_path = os.path.join(path, index)
                if os.path.exists(index_path):
                    path = index_path
                    break

        # Check if the file exists and is a file
        if not os.path.isfile(path):
            super().do_GET()
            return

        # Check if we should compress
        accept_encoding = self.headers.get('Accept-Encoding', '')
        can_compress = (
            'gzip' in accept_encoding and
            path.lower().endswith(('.html', '.css', '.js', '.svg', '.json', '.xml', '.txt'))
        )

        # Use memory cache
        if path not in _FILE_CACHE:
            try:
                with open(path, 'rb') as f:
                    content = f.read()
                content_type = self.guess_type(path)
                # Pre-compress if compressible
                if path.lower().endswith(('.html', '.css', '.js', '.svg', '.json', '.xml', '.txt')):
                    out = io.BytesIO()
                    with gzip.GzipFile(fileobj=out, mode='wb', compresslevel=6) as fg:
                        fg.write(content)
                    gz_bytes = out.getvalue()
                else:
                    gz_bytes = None
                _FILE_CACHE[path] = (content_type, content, gz_bytes)
            except IOError:
                super().do_GET()
                return

        content_type, raw_bytes, gz_bytes = _FILE_CACHE[path]

        if can_compress and gz_bytes is not None:
            self.send_response(200)
            self.send_header('Content-Encoding', 'gzip')
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(gz_bytes)))
            self.end_headers()
            self.wfile.write(gz_bytes)
        else:
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(raw_bytes)))
            self.end_headers()
            self.wfile.write(raw_bytes)


PORT = 8080

class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True

ThreadingTCPServer.allow_reuse_address = True

print(f"Sol y Tierra Dev Server — puerto {PORT} (gzip + memory cache + threading)")

with ThreadingTCPServer(("", PORT), CompressCacheHTTPHandler) as httpd:
    httpd.serve_forever()
