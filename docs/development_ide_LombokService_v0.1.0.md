# Development LombokService

## 1. Roadmap

- 0.1.1: CI, coverage, fuzz, publish; verification with the real target tools
- 0.2.0: Rust, Go, PHP ports; FreeBSD rc.d and SysV targets
- 0.3.0: optional advanced fields (resource limits, dependencies)

## 2. Deferred scope

Installing, starting, or inspecting services; file permissions; legacy SysV scripts and FreeBSD rc.d (NOT YET); advanced systemd unit fields (sandboxing, custom dependencies).

## 3. Design principles for contributors

- Contract first: change the SPEC and vectors before the code; differences between ports are bugs.
- No runtime dependencies; no clock, no network, no hidden randomness.
- Every README feature has a vector case or a test.
- No client or owning-application names in public files.
- No emoji in `*.md`.
- Documentation, comments, error messages and examples are written in English (the default language of all Lombok Ecosystem repositories).

## 4. How to contribute

Fork, create a `feat/...` branch, run both vector runners, update `API_` and `SPEC_` if behavior changes, and open a PR. Regenerate vectors with `node scripts/gen_vectors.ts` only when the contract changes, and review the vector diff.

## 5. Open questions

- Should env support on Windows be implemented through the service registry?
- Is a target version (for example a minimum systemd version) needed as a parameter?
