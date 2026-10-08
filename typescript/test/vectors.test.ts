import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render, type ServiceSpec, type Target } from "../src/index.ts";

const v = JSON.parse(readFileSync(new URL("../../vectors/lombokservice-vectors-v1.json", import.meta.url), "utf8"));

test("vector count >= 100", () => assert.ok(v.caseCount >= 100));
test("render", () => {
  for (const c of v.cases) {
    if (c.error) assert.throws(() => render(c.target as Target, c.spec as ServiceSpec), RangeError, JSON.stringify(c));
    else assert.equal(render(c.target as Target, c.spec as ServiceSpec), c.out, JSON.stringify(c));
  }
});
test("dollar and percent escaping in systemd", () => {
  const out = render("systemd", { name: "x", exec: ["/b", "$5", "50%"] });
  assert.ok(out.includes('ExecStart=/b "$$5" "50%%"'));
});
