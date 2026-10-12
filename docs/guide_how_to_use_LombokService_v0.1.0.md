# Usage Guide LombokService

## 1. Installation

After release: `npm install lombokservice` or `pip install lombokservice`. Before release, copy the `typescript/src` folder or `python/src/lombokservice` (no dependencies).

## 2. Basic concepts

One ServiceSpec describes a service: name, command (list of arguments), user, working directory, environment variables, restart policy. render(target, spec) produces text for systemd, launchd, Windows, or OpenWrt. Fields that a target cannot express are rejected with an error.

## 3. Examples

`examples/example.ts` and `examples/example.py` produce the following output (TypeScript; Python is identical except for print formatting):

```
[Unit]
Description=My daemon
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mydaemon --config "/etc/my daemon.toml"
User=svc
Environment="MODE=prod"
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

TypeScript code:

```ts
import { render } from "lombokservice";

const spec = { name: "mydaemon", description: "My daemon", exec: ["/usr/local/bin/mydaemon", "--config", "/etc/my daemon.toml"], user: "svc", env: { MODE: "prod" }, network: true };
process.stdout.write(render("systemd", spec));
```

## 4. Recipes

- Cross-OS installer: choose the target from the operating system and write the rendered text to the target's standard location.
- Review: keep the rendered output in the repository to see changes in the service definition.
- Tests: compare the rendered output with golden files.

## 5. Common pitfalls

- Only four targets; SysV, FreeBSD rc.d, runit: NOT YET.
- Only a subset of common fields; no advanced options.
- Not verified against real systemd-analyze, plutil, sc.exe or procd when created (vectors only).
- Windows does not support env and workingDir through sc.exe.
- Rust, Go and PHP ports: NOT YET.

## 6. See also

`SPEC_LombokService_v0.1.0.md`, `API_LombokService_v0.1.0.md`, `full_summary_project_LombokService_v0.1.0.md`.
