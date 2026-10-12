# Project Summary LombokService

## What it is

Render service definitions for systemd, launchd, Windows (sc.exe) and OpenWrt procd from one specification, with exact quoting and escaping per target. Part of the Lombok Ecosystem.

## Why it exists

Installing a program as a service means writing a different file for each system, with different and easy-to-get-wrong quoting and escaping rules. This library takes one specification and produces the exact text for each target, rejecting unsupported combinations instead of silently ignoring them.

## Main features

- Four targets: systemd, launchd, Windows sc.exe, OpenWrt procd
- Per-target quoting rules (systemd, Windows argv, POSIX shell, XML)
- Strict validation of the specification; unsupported combinations are rejected
- Deterministic output (environment variables sorted)

## Current status

Version 0.1.0, not yet released. TypeScript and Python pass 165 vector cases. No other ports exist.

## Example use cases

- An installer that creates a service definition for the user's operating system
- A deployment or configuration tool that generates units for many servers
- Router or gateway firmware that needs init scripts
- Testing: making sure service definitions do not change between versions

## Known Limitations

- Only four targets; SysV, FreeBSD rc.d, runit: NOT YET.
- Only a subset of common fields; no advanced options.
- Not verified against real systemd-analyze, plutil, sc.exe or procd when created (vectors only).
- Windows does not support env and workingDir through sc.exe.
- Rust, Go and PHP ports: NOT YET.

## Further information

SPEC: `SPEC_LombokService_v0.1.0.md`; API: `API_LombokService_v0.1.0.md`; guide: `guide_how_to_use_LombokService_v0.1.0.md`.

## Gap versus comparable libraries

Comparable: platform-specific service installers (nssm, winsw, node-windows, python-daemon) and hand-written templates. Honest gap: it does not install or verify; strengths: one specification, quoting tested across languages, explicit rejection of what is unsupported.
