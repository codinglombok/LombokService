import { writeFileSync } from "node:fs";
import { render, type ServiceSpec, type Target } from "../typescript/src/index.ts";

const specs: unknown[] = [
  { name: "mydaemon", exec: ["/usr/local/bin/mydaemon"] },
  { name: "mydaemon", description: "My daemon", exec: ["/usr/local/bin/mydaemon", "--config", "/etc/mydaemon.toml"], network: true },
  { name: "full", description: "Full 100% service", exec: ["/opt/app/bin", "--name", "a b", "--price", "$5", "--pct", "50%", "--q", 'say "hi"', "--e", "", "--bs", "c:\\dir\\"],
    workingDir: "/var/lib/app", user: "svc", env: { ZED: "1", ALPHA: 'va"l\\ue 5%', MID: "" }, restart: "on-failure", restartDelaySec: 30, network: true },
  { name: "never", exec: ["/bin/true"], restart: "never" },
  { name: "nodelay", exec: ["/bin/true"], restartDelaySec: 0 },
  { name: "maxdelay", exec: ["/bin/true"], restartDelaySec: 3600 },
  { name: "ampersand", description: "A & B <c> d", exec: ["/bin/x", "a&b", "<tag>", "it's"], env: { K: "v&<>" } },
  { name: "quotes", exec: ["/bin/x", "it's a 'test'", "plain", "tab\there"] },
  { name: "windows-path", exec: ["C:\\Program Files\\App\\app.exe", "--dir", "C:\\Data Dir\\", "--q", '"x"', "\\\\server\\share"], user: "NT AUTHORITY\\LocalService" },
  { name: "unicode", description: "Service \u00e9\u4e2d", exec: ["/bin/x", "\u00e9\ud83d\ude00"], env: { U: "\u00e9" } },
  { name: "a", exec: ["x"] },
  { name: "a".repeat(63), exec: ["/x"] },
  { name: "env-order", exec: ["/x"], env: { b: "1", B: "2", a: "3", _z: "4", A1: "5" } },
  // invalid
  { name: "A", exec: ["/x"] }, { name: "1a", exec: ["/x"] }, { name: "a b", exec: ["/x"] }, { name: "a".repeat(64), exec: ["/x"] }, { name: "", exec: ["/x"] },
  { name: "ok", exec: [] }, { name: "ok", exec: [""] }, { name: "ok", exec: ["/x", "a\nb"] }, { name: "ok", exec: ["/x", "a\u0000b"] }, { name: "ok" },
  { name: "ok", exec: ["/x"], description: "" }, { name: "ok", exec: ["/x"], description: "a\nb" }, { name: "ok", exec: ["/x"], user: "" },
  { name: "ok", exec: ["/x"], workingDir: "/a\rb" }, { name: "ok", exec: ["/x"], env: { "1A": "x" } }, { name: "ok", exec: ["/x"], env: { "A-B": "x" } },
  { name: "ok", exec: ["/x"], env: { A: "x\ny" } }, { name: "ok", exec: ["/x"], restart: "sometimes" }, { name: "ok", exec: ["/x"], restartDelaySec: -1 },
  { name: "ok", exec: ["/x"], restartDelaySec: 3601 }, { name: "ok", exec: ["/x"], restartDelaySec: 1.5 }, { name: "ok", exec: ["/x"], network: "yes" },
  { name: "ok", exec: ["/x"], description: 'say "hi"' }, { name: "ok", exec: ["/x"], user: 'a"b' }, { name: "ok", exec: ["/x"], workingDir: "/w" },
  { name: "ok", exec: ["/x"], env: { A: "1" } }, { name: "ok", exec: ["/x"], restart: "on-failure" },
  { name: "ok", exec: ["/x"], restartDelaySec: 7, restart: "always", description: "d" },
];
const targets: Target[] = ["systemd", "launchd", "windows", "openwrt"];
const cases: { target: string; spec: unknown; out: string | null; error: boolean }[] = [];
for (const spec of specs)
  for (const target of targets) {
    try { cases.push({ target, spec, out: render(target, spec as ServiceSpec), error: false }); } catch { cases.push({ target, spec, out: null, error: true }); }
  }
try { render("sysv" as Target, specs[0] as ServiceSpec); throw new Error("expected"); } catch (e) { if ((e as Error).message === "expected") throw e; }
cases.push({ target: "sysv", spec: specs[0], out: null, error: true });
const errors = cases.filter((c) => c.error).length;
writeFileSync(new URL("../vectors/lombokservice-vectors-v1.json", import.meta.url), JSON.stringify({ version: 1, caseCount: cases.length, cases }, null, 1) + "\n");
console.log("cases", cases.length, "errors", errors);
