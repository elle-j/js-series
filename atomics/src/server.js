/**
 * This simple server is used for serving the files with cross-origin
 * isolation in order to enable `SharedArrayBuffer` support in the browser.
 */
const server = Bun.serve({
  port: 9000,
  fetch(request) {
    if (request.method === "GET") {
      const url = new URL(request.url);
      return new Response(getFile(url.pathname), {
        headers: {
          "Cross-Origin-Embedder-Policy": "require-corp",
          "Cross-Origin-Opener-Policy": "same-origin"
        }
      });
    }

    return new Response(`Unsupported method: ${request.method}.`, {
      status: 405,
      headers: { "Allow": "GET" }
    });
  },
  error() {
    return new Response("The resource does not exist.", { status: 404 });
  }
});

/**
 * @param {string} pathname
 */
function getFile(pathname) {
  pathname = pathname === "/" ? "index.html" : pathname;
  return Bun.file(`${import.meta.dir}/public/${pathname}`);
}

console.log(`Server listening on ${server.url} 👂...`);
