import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, it } from "node:test";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { default: app } = await import("./app.js");
const { openApiSpec } = await import("./lib/openapi.js");

describe("Scalar e OpenAPI", () => {
  it("expõe /openapi.json e /reference fora de produção", async () => {
    const server = createServer(app);
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const { port } = server.address() as AddressInfo;

    try {
      const jsonRes = await fetch(`http://127.0.0.1:${port}/openapi.json`);
      assert.equal(jsonRes.status, 200);
      const spec = (await jsonRes.json()) as { paths?: Record<string, unknown> };
      assert.ok(spec.paths?.["/uploads/presign"]);
      assert.ok(spec.paths?.["/internal/cron/lembretes"]);
      assert.equal(Object.keys(spec.paths ?? {}).length, Object.keys(openApiSpec.paths).length);

      const refRes = await fetch(`http://127.0.0.1:${port}/reference`);
      assert.equal(refRes.status, 200);
      const html = await refRes.text();
      assert.match(html, /scalar/i);
    } finally {
      server.close();
    }
  });
});
