import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "python" / "src"))
from lombokservice import render

spec = {"name": "mydaemon", "description": "My daemon", "exec": ["/usr/local/bin/mydaemon", "--config", "/etc/my daemon.toml"], "user": "svc", "env": {"MODE": "prod"}, "network": True}
sys.stdout.write(render("systemd", spec))
