# SPEC LombokService v0.1.0

This document is the normative cross-language contract. Every language port MUST produce byte-identical output for all specified inputs. Deviations from this specification are bugs.

The keywords MUST, SHOULD and MAY are to be read as in RFC 2119. Last reviewed: 2026-10-07.

## 0. Reference standards

This library defines its own contract; there is no normative external standard except those named in the relevant sections.

## 1. Vectors

| File | Cases | SHA-256 |
|---|---|---|
| `vectors/lombokservice-vectors-v1.json` | 165 | `e347da95c2b103e51260a45febee99c420638e1543a6776fb45fb17052de32b3` |

## 2. Contract

1. name matches ^[a-z][a-z0-9_-]{0,62}$. exec is non-empty; its elements are strings without control characters (U+0000-U+001F, U+007F); only the first element MUST be non-empty. description, workingDir and user are non-empty without control characters. env keys match ^[A-Za-z_][A-Za-z0-9_]*$; values contain no control characters. restart defaults to always; restartDelaySec is an integer 0..3600 and defaults to 5; network defaults to false.
2. Environment variables are sorted by key (code point order).
3. systemd: sections [Unit], [Service], [Install]; '%' in values becomes '%%'; ExecStart arguments that are not entirely from [A-Za-z0-9_@+=:,./-] (after doubling '%' and '$') are wrapped in double quotes with '\\' and '"' escaped; Restart=no for never; RestartSec only when restart is not never; After/Wants network-online.target only when network is true.
4. launchd: XML plist with tab indentation; '&', '<', '>' escaped; RunAtLoad true; KeepAlive true for always, a SuccessfulExit=false dict for on-failure, absent for never; ThrottleInterval when restart is not never. description is not used.
5. windows: env and workingDir are rejected; a double quote in description or user is rejected. An `sc.exe create` line whose binPath is a command line (arguments quoted by the CommandLineToArgvW rules) quoted again as a single argument; `obj=` when user is set; an `sc.exe failure ... actions= restart/<seconds*1000>` line when restart is not never.
6. openwrt: workingDir and restart on-failure are rejected; an rc.common script using procd; arguments are POSIX single-quoted unless entirely from [A-Za-z0-9_@%+=:,./-]; respawn 3600 <delay> 0 only for always.
7. Every output ends with LF. An invalid specification or target raises RangeError/ValueError.

## 3. Cross-language representation

String indexes and lengths are counted in code points; floating-point numbers use IEEE 754 doubles with the order of operations as written; large integers MUST NOT lose precision.

## 4. Non-goals

Installing, starting, or inspecting services; file permissions; legacy SysV scripts and FreeBSD rc.d (NOT YET); advanced systemd unit fields (sandboxing, custom dependencies).

## 5. Contract change history

- 0.1.0: initial contract.
