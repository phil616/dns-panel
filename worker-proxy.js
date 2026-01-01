// worker-proxy.js
// Deploy this to Cloudflare Workers to use as a CORS proxy for your Dashboard

export default {
  async fetch(request, env) {
    // 1. Handle CORS Preflight (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*", // Allow all origins (or restrict to your frontend URL)
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Auth-Email, X-Auth-Key",
        },
      });
    }

    const url = new URL(request.url);
    
    // 2. Construct target Cloudflare API URL
    // Map /client/v4/... to https://api.cloudflare.com/client/v4/...
    // Example: https://my-worker.workers.dev/client/v4/zones -> https://api.cloudflare.com/client/v4/zones
    
    // If the path doesn't start with /client/v4, you might need to adjust logic based on how your frontend calls it.
    // The frontend code uses /zones, so we might need to prepend /client/v4 if it's missing,
    // or the frontend should send the full path relative to the worker.
    
    // In this project's src/lib/api.ts, we append endpoints like `/zones` to the base URL.
    // So if base URL is the worker, request is `WORKER/zones`.
    // We need to map `WORKER/zones` -> `https://api.cloudflare.com/client/v4/zones`.
    
    let targetPath = url.pathname;
    if (!targetPath.startsWith('/client/v4')) {
        targetPath = '/client/v4' + targetPath;
    }
    
    const apiUrl = "https://api.cloudflare.com" + targetPath + url.search;

    // 3. Forward the request
    // We don't inject the token here because the frontend sends it in the header.
    // We just forward the Authorization/X-Auth headers.
    
    const modifiedRequest = new Request(apiUrl, {
      method: request.method,
      headers: request.headers, // Forward all headers including Auth
      body: request.body,
    });

    const response = await fetch(modifiedRequest);

    // 4. Return response with CORS headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    return newResponse;
  },
};
