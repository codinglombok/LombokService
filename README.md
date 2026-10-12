# LombokService

Render service definitions for systemd, launchd, Windows (sc.exe) and OpenWrt procd from one specification, with exact quoting and escaping per target. Part of the Lombok Ecosystem.

## Why this library?

Installing a program as a service means writing a different file for each system, with different and easy-to-get-wrong quoting and escaping rules. This library takes one specification and produces the exact text for each target, rejecting unsupported combinations instead of silently ignoring them.

## Features

- Four targets: systemd, launchd, Windows sc.exe, OpenWrt procd
- Per-target quoting rules (systemd, Windows argv, POSIX shell, XML)
- Strict validation of the specification; unsupported combinations are rejected
- Deterministic output (environment variables sorted)

## Use cases

- An installer that creates a service definition for the user's operating system
- A deployment or configuration tool that generates units for many servers
- Router or gateway firmware that needs init scripts
- Testing: making sure service definitions do not change between versions

## Installation

Not yet published to any registry (0.1.0 has not been released). After release:

```
npm install lombokservice
pip install lombokservice
```

## API overview

- `render(target, spec) -> string; target: systemd | launchd | windows | openwrt`
- `spec: name, description?, exec[], workingDir?, user?, env?, restart? (always | on-failure | never), restartDelaySec?, network?`

Details: `docs/API_LombokService_v0.1.0.md`.

## Port status

| Port | Status |
|---|---|
| TypeScript (reference) | YES, passes all 165 vector cases |
| Python | YES, passes all 165 vector cases |
| Rust, Go, PHP | NOT YET |

## Standards implemented

The normative contract is in `docs/SPEC_LombokService_v0.1.0.md`; the vectors are in `vectors/lombokservice-vectors-v1.json`.

## Known limitations

- Only four targets; SysV, FreeBSD rc.d, runit: NOT YET.
- Only a subset of common fields; no advanced options.
- Not verified against real systemd-analyze, plutil, sc.exe or procd when created (vectors only).
- Windows does not support env and workingDir through sc.exe.
- Rust, Go and PHP ports: NOT YET.

## Development

```
node --test typescript/test/vectors.test.ts   # TypeScript (Node 22+)
python -m pytest python/tests                 # Python 3.10+
node scripts/gen_vectors.ts                   # regenerate vectors from the TypeScript reference
```

## Lombok Ecosystem

Part of the [Lombok Ecosystem](https://github.com/codinglombok).

## License

Apache-2.0 OR MIT (see `LICENSE-APACHE` and `LICENSE-MIT`).
