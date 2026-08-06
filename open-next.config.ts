import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Adapter OpenNext untuk Cloudflare Workers.
// Cache boleh dinaik taraf ke R2/KV kemudian (lihat docs OpenNext Cloudflare).
export default defineCloudflareConfig({});
