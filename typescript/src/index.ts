export type Target = "systemd" | "launchd" | "windows" | "openwrt";
export type Restart = "always" | "on-failure" | "never";
export interface ServiceSpec {
  name: string;
  description?: string;
  exec: string[];
  workingDir?: string;
  user?: string;
  env?: Record<string, string>;
  restart?: Restart;
  restartDelaySec?: number;
  network?: boolean;
}

const CTRL = /[\u0000-\u001f\u007f]/;
const NAME_RE = /^[a-z][a-z0-9_-]{0,62}$/;
const KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const TARGETS: Target[] = ["systemd", "launchd", "windows", "openwrt"];

function cmp(a: string, b: string): number {
  const x = Array.from(a, (c) => c.codePointAt(0) as number);
  const y = Array.from(b, (c) => c.codePointAt(0) as number);
  for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return x.length === y.length ? 0 : x.length < y.length ? -1 : 1;
}
function bad(msg: string): never {
  throw new RangeError(msg);
}
function str(v: unknown, what: string, allowEmpty = false): string {
  if (typeof v !== "string" || CTRL.test(v) || (!allowEmpty && v === "")) bad(`invalid ${what}`);
  return v;
}

interface Norm {
  name: string;
  description: string;
  exec: string[];
  workingDir?: string;
  user?: string;
  env: [string, string][];
  restart: Restart;
  delay: number;
  network: boolean;
}
function normalize(s: ServiceSpec): Norm {
  if (typeof s.name !== "string" || !NAME_RE.test(s.name)) bad("invalid name");
  const description = s.description === undefined ? s.name : str(s.description, "description");
  if (!Array.isArray(s.exec) || s.exec.length === 0) bad("invalid exec");
  const exec = s.exec.map((a, i) => str(a, "exec argument", i > 0));
  const env: [string, string][] = [];
  for (const k of Object.keys(s.env ?? {})) {
    if (!KEY_RE.test(k)) bad("invalid env key");
    env.push([k, str((s.env as Record<string, string>)[k], "env value", true)]);
  }
  env.sort((a, b) => cmp(a[0], b[0]));
  const restart = s.restart ?? "always";
  if (restart !== "always" && restart !== "on-failure" && restart !== "never") bad("invalid restart");
  const delay = s.restartDelaySec ?? 5;
  if (!Number.isInteger(delay) || delay < 0 || delay > 3600) bad("invalid restartDelaySec");
  if (s.network !== undefined && typeof s.network !== "boolean") bad("invalid network");
  return {
    name: s.name, description, exec,
    workingDir: s.workingDir === undefined ? undefined : str(s.workingDir, "workingDir"),
    user: s.user === undefined ? undefined : str(s.user, "user"),
    env, restart, delay, network: s.network ?? false,
  };
}

const pct = (s: string): string => s.replace(/%/g, "%%");
function sdQuote(arg: string): string {
  const e = arg.replace(/%/g, "%%").replace(/\$/g, () => "$$");
  if (e !== "" && /^[A-Za-z0-9_@+=:,./-]+$/.test(e)) return e;
  return '"' + e.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}
const xml = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function winQuote(arg: string): string {
  if (arg !== "" && !/[ \t"]/.test(arg)) return arg;
  let out = '"';
  let bs = 0;
  for (const c of arg) {
    if (c === "\\") {
      bs++;
    } else if (c === '"') {
      out += "\\".repeat(bs * 2 + 1) + '"';
      bs = 0;
    } else {
      out += "\\".repeat(bs) + c;
      bs = 0;
    }
  }
  return out + "\\".repeat(bs * 2) + '"';
}
const shQuote = (a: string): string => (a !== "" && /^[A-Za-z0-9_@%+=:,./-]+$/.test(a) ? a : "'" + a.replace(/'/g, "'\\''") + "'");

function systemd(n: Norm): string {
  const l = ["[Unit]", `Description=${pct(n.description)}`];
  if (n.network) l.push("After=network-online.target", "Wants=network-online.target");
  l.push("", "[Service]", "Type=simple", `ExecStart=${n.exec.map(sdQuote).join(" ")}`);
  if (n.workingDir !== undefined) l.push(`WorkingDirectory=${pct(n.workingDir)}`);
  if (n.user !== undefined) l.push(`User=${pct(n.user)}`);
  for (const [k, v] of n.env) l.push(`Environment="${k}=${pct(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
  l.push(`Restart=${n.restart === "never" ? "no" : n.restart}`);
  if (n.restart !== "never") l.push(`RestartSec=${n.delay}`);
  l.push("", "[Install]", "WantedBy=multi-user.target");
  return l.join("\n") + "\n";
}
function launchd(n: Norm): string {
  const T = "\t";
  const l = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">', "<dict>",
    `${T}<key>Label</key>`, `${T}<string>${xml(n.name)}</string>`,
    `${T}<key>ProgramArguments</key>`, `${T}<array>`,
    ...n.exec.map((a) => `${T}${T}<string>${xml(a)}</string>`),
    `${T}</array>`,
  ];
  if (n.workingDir !== undefined) l.push(`${T}<key>WorkingDirectory</key>`, `${T}<string>${xml(n.workingDir)}</string>`);
  if (n.user !== undefined) l.push(`${T}<key>UserName</key>`, `${T}<string>${xml(n.user)}</string>`);
  if (n.env.length) {
    l.push(`${T}<key>EnvironmentVariables</key>`, `${T}<dict>`);
    for (const [k, v] of n.env) l.push(`${T}${T}<key>${k}</key>`, `${T}${T}<string>${xml(v)}</string>`);
    l.push(`${T}</dict>`);
  }
  l.push(`${T}<key>RunAtLoad</key>`, `${T}<true/>`);
  if (n.restart === "always") l.push(`${T}<key>KeepAlive</key>`, `${T}<true/>`);
  else if (n.restart === "on-failure") l.push(`${T}<key>KeepAlive</key>`, `${T}<dict>`, `${T}${T}<key>SuccessfulExit</key>`, `${T}${T}<false/>`, `${T}</dict>`);
  if (n.restart !== "never") l.push(`${T}<key>ThrottleInterval</key>`, `${T}<integer>${n.delay}</integer>`);
  l.push("</dict>", "</plist>");
  return l.join("\n") + "\n";
}
function windows(n: Norm): string {
  if (n.env.length || n.workingDir !== undefined) bad("env and workingDir are not supported on windows");
  if (n.description.includes('"') || (n.user !== undefined && n.user.includes('"'))) bad("double quote not allowed");
  const cmd = n.exec.map(winQuote).join(" ");
  let c = `sc.exe create ${n.name} binPath= ${winQuote(cmd)} start= auto DisplayName= "${n.description}"`;
  if (n.user !== undefined) c += ` obj= "${n.user}"`;
  const l = [c];
  if (n.restart !== "never") l.push(`sc.exe failure ${n.name} reset= 86400 actions= restart/${n.delay * 1000}`);
  return l.join("\n") + "\n";
}
function openwrt(n: Norm): string {
  if (n.workingDir !== undefined) bad("workingDir is not supported on openwrt");
  if (n.restart === "on-failure") bad("restart on-failure is not supported on openwrt");
  const T = "\t";
  const l = ["#!/bin/sh /etc/rc.common", "", "USE_PROCD=1", "START=95", "STOP=10", "", "start_service() {", `${T}procd_open_instance`,
    `${T}procd_set_param command ${n.exec.map(shQuote).join(" ")}`];
  if (n.env.length) l.push(`${T}procd_set_param env ${n.env.map(([k, v]) => `${k}=${shQuote(v)}`).join(" ")}`);
  if (n.user !== undefined) l.push(`${T}procd_set_param user ${shQuote(n.user)}`);
  if (n.restart === "always") l.push(`${T}procd_set_param respawn 3600 ${n.delay} 0`);
  l.push(`${T}procd_close_instance`, "}");
  return l.join("\n") + "\n";
}

/** Render the service definition text for a target; throws RangeError if the spec is invalid or unsupported by the target. */
export function render(target: Target, spec: ServiceSpec): string {
  if (!TARGETS.includes(target)) bad("invalid target");
  const n = normalize(spec);
  return target === "systemd" ? systemd(n) : target === "launchd" ? launchd(n) : target === "windows" ? windows(n) : openwrt(n);
}
