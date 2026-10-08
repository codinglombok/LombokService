from __future__ import annotations

import re
from typing import Any

_CTRL = re.compile(r"[\x00-\x1f\x7f]")
_NAME = re.compile(r"[a-z][a-z0-9_-]{0,62}")
_KEY = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")
_TARGETS = ("systemd", "launchd", "windows", "openwrt")


def _bad(msg: str):
    raise ValueError(msg)


def _str(v: Any, what: str, allow_empty: bool = False) -> str:
    if not isinstance(v, str) or _CTRL.search(v) or (not allow_empty and v == ""):
        _bad(f"invalid {what}")
    return v


def _normalize(s: dict) -> dict:
    name = s.get("name")
    if not isinstance(name, str) or _NAME.fullmatch(name) is None:
        _bad("invalid name")
    description = name if "description" not in s else _str(s["description"], "description")
    ex = s.get("exec")
    if not isinstance(ex, list) or len(ex) == 0:
        _bad("invalid exec")
    exec_ = [_str(a, "exec argument", i > 0) for i, a in enumerate(ex)]
    env_in = s.get("env") or {}
    env = []
    for k in env_in:
        if _KEY.fullmatch(k) is None:
            _bad("invalid env key")
        env.append((k, _str(env_in[k], "env value", True)))
    env.sort(key=lambda kv: kv[0])
    restart = s.get("restart", "always")
    if restart not in ("always", "on-failure", "never"):
        _bad("invalid restart")
    delay = s.get("restartDelaySec", 5)
    if not isinstance(delay, int) or isinstance(delay, bool) or delay < 0 or delay > 3600:
        _bad("invalid restartDelaySec")
    net = s.get("network", False)
    if not isinstance(net, bool):
        _bad("invalid network")
    return {
        "name": name, "description": description, "exec": exec_,
        "workingDir": _str(s["workingDir"], "workingDir") if "workingDir" in s else None,
        "user": _str(s["user"], "user") if "user" in s else None,
        "env": env, "restart": restart, "delay": delay, "network": net,
    }


def _pct(s: str) -> str:
    return s.replace("%", "%%")


def _sd_quote(arg: str) -> str:
    e = arg.replace("%", "%%").replace("$", "$$")
    if e != "" and re.fullmatch(r"[A-Za-z0-9_@+=:,./-]+", e):
        return e
    return '"' + e.replace("\\", "\\\\").replace('"', '\\"') + '"'


def _xml(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _win_quote(arg: str) -> str:
    if arg != "" and not re.search(r'[ \t"]', arg):
        return arg
    out, bs = '"', 0
    for c in arg:
        if c == "\\":
            bs += 1
        elif c == '"':
            out += "\\" * (bs * 2 + 1) + '"'
            bs = 0
        else:
            out += "\\" * bs + c
            bs = 0
    return out + "\\" * (bs * 2) + '"'


def _sh_quote(a: str) -> str:
    if a != "" and re.fullmatch(r"[A-Za-z0-9_@%+=:,./-]+", a):
        return a
    return "'" + a.replace("'", "'\\''") + "'"


def _systemd(n: dict) -> str:
    l = ["[Unit]", f"Description={_pct(n['description'])}"]
    if n["network"]:
        l += ["After=network-online.target", "Wants=network-online.target"]
    l += ["", "[Service]", "Type=simple", "ExecStart=" + " ".join(_sd_quote(a) for a in n["exec"])]
    if n["workingDir"] is not None:
        l.append(f"WorkingDirectory={_pct(n['workingDir'])}")
    if n["user"] is not None:
        l.append(f"User={_pct(n['user'])}")
    for k, v in n["env"]:
        l.append('Environment="' + k + "=" + _pct(v).replace("\\", "\\\\").replace('"', '\\"') + '"')
    l.append("Restart=" + ("no" if n["restart"] == "never" else n["restart"]))
    if n["restart"] != "never":
        l.append(f"RestartSec={n['delay']}")
    l += ["", "[Install]", "WantedBy=multi-user.target"]
    return "\n".join(l) + "\n"


def _launchd(n: dict) -> str:
    T = "\t"
    l = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
         '<plist version="1.0">', "<dict>",
         f"{T}<key>Label</key>", f"{T}<string>{_xml(n['name'])}</string>",
         f"{T}<key>ProgramArguments</key>", f"{T}<array>"]
    l += [f"{T}{T}<string>{_xml(a)}</string>" for a in n["exec"]]
    l.append(f"{T}</array>")
    if n["workingDir"] is not None:
        l += [f"{T}<key>WorkingDirectory</key>", f"{T}<string>{_xml(n['workingDir'])}</string>"]
    if n["user"] is not None:
        l += [f"{T}<key>UserName</key>", f"{T}<string>{_xml(n['user'])}</string>"]
    if n["env"]:
        l += [f"{T}<key>EnvironmentVariables</key>", f"{T}<dict>"]
        for k, v in n["env"]:
            l += [f"{T}{T}<key>{k}</key>", f"{T}{T}<string>{_xml(v)}</string>"]
        l.append(f"{T}</dict>")
    l += [f"{T}<key>RunAtLoad</key>", f"{T}<true/>"]
    if n["restart"] == "always":
        l += [f"{T}<key>KeepAlive</key>", f"{T}<true/>"]
    elif n["restart"] == "on-failure":
        l += [f"{T}<key>KeepAlive</key>", f"{T}<dict>", f"{T}{T}<key>SuccessfulExit</key>", f"{T}{T}<false/>", f"{T}</dict>"]
    if n["restart"] != "never":
        l += [f"{T}<key>ThrottleInterval</key>", f"{T}<integer>{n['delay']}</integer>"]
    l += ["</dict>", "</plist>"]
    return "\n".join(l) + "\n"


def _windows(n: dict) -> str:
    if n["env"] or n["workingDir"] is not None:
        _bad("env and workingDir are not supported on windows")
    if '"' in n["description"] or (n["user"] is not None and '"' in n["user"]):
        _bad("double quote not allowed")
    cmd = " ".join(_win_quote(a) for a in n["exec"])
    c = f'sc.exe create {n["name"]} binPath= {_win_quote(cmd)} start= auto DisplayName= "{n["description"]}"'
    if n["user"] is not None:
        c += f' obj= "{n["user"]}"'
    l = [c]
    if n["restart"] != "never":
        l.append(f"sc.exe failure {n['name']} reset= 86400 actions= restart/{n['delay'] * 1000}")
    return "\n".join(l) + "\n"


def _openwrt(n: dict) -> str:
    if n["workingDir"] is not None:
        _bad("workingDir is not supported on openwrt")
    if n["restart"] == "on-failure":
        _bad("restart on-failure is not supported on openwrt")
    T = "\t"
    l = ["#!/bin/sh /etc/rc.common", "", "USE_PROCD=1", "START=95", "STOP=10", "", "start_service() {", f"{T}procd_open_instance",
         f"{T}procd_set_param command " + " ".join(_sh_quote(a) for a in n["exec"])]
    if n["env"]:
        l.append(f"{T}procd_set_param env " + " ".join(f"{k}={_sh_quote(v)}" for k, v in n["env"]))
    if n["user"] is not None:
        l.append(f"{T}procd_set_param user {_sh_quote(n['user'])}")
    if n["restart"] == "always":
        l.append(f"{T}procd_set_param respawn 3600 {n['delay']} 0")
    l += [f"{T}procd_close_instance", "}"]
    return "\n".join(l) + "\n"


def render(target: str, spec: dict) -> str:
    if target not in _TARGETS:
        _bad("invalid target")
    n = _normalize(spec)
    return {"systemd": _systemd, "launchd": _launchd, "windows": _windows, "openwrt": _openwrt}[target](n)
