import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
let html = await readFile(join(dist, "index.html"), "utf8");
let css = "";
let js = "";

const stylesheetPattern = /<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
for (const match of [...html.matchAll(stylesheetPattern)]) {
  const cssPath = match[1].replace(/^\//, "");
  css += await readFile(join(dist, cssPath), "utf8");
  html = html.replace(match[0], `<link rel="stylesheet" href="/app.css">`);
}

const scriptPattern = /<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g;
for (const match of [...html.matchAll(scriptPattern)]) {
  const jsPath = match[1].replace(/^\//, "");
  js += await readFile(join(dist, jsPath), "utf8");
  html = html.replace(match[0], `<script type="module" src="/app.js"></script>`);
}

const worker = `const page = ${JSON.stringify(html)};
const styles = ${JSON.stringify(css)};
const application = ${JSON.stringify(js)};

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    const path = new URL(request.url).pathname;
    if (path === "/og.png" && env?.ASSETS?.fetch) {
      return env.ASSETS.fetch(request);
    }
    const origin = new URL(request.url).origin;
    const renderedPage = page.replaceAll('content="/og.png"', 'content="' + origin + '/og.png"');
    const asset = path === "/app.js"
      ? { body: application, type: "text/javascript; charset=utf-8" }
      : path === "/app.css"
        ? { body: styles, type: "text/css; charset=utf-8" }
        : { body: renderedPage, type: "text/html; charset=utf-8" };
    return new Response(request.method === "HEAD" ? null : asset.body, {
      status: 200,
      headers: {
        "content-type": asset.type,
        "cache-control": "no-cache, no-store, must-revalidate"
      }
    });
  }
};
`;

await mkdir(join(dist, "server"), { recursive: true });
await mkdir(join(dist, ".openai"), { recursive: true });
await writeFile(join(dist, "server", "index.js"), worker, "utf8");
await writeFile(
  join(dist, ".openai", "hosting.json"),
  await readFile(join(root, ".openai", "hosting.json"), "utf8"),
  "utf8"
);
