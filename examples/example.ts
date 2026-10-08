import { render } from "../typescript/src/index.ts";

const spec = { name: "mydaemon", description: "My daemon", exec: ["/usr/local/bin/mydaemon", "--config", "/etc/my daemon.toml"], user: "svc", env: { MODE: "prod" }, network: true };
process.stdout.write(render("systemd", spec));
