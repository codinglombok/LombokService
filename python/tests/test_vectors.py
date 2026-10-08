import json
import pathlib
import sys

import pytest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "src"))
from lombokservice import render  # noqa: E402

V = json.loads((pathlib.Path(__file__).resolve().parents[2] / "vectors" / "lombokservice-vectors-v1.json").read_text("utf-8"))


def test_count():
    assert V["caseCount"] >= 100


def test_render():
    for c in V["cases"]:
        if c["error"]:
            with pytest.raises(ValueError):
                render(c["target"], c["spec"])
        else:
            assert render(c["target"], c["spec"]) == c["out"], c


def test_dollar_percent():
    assert 'ExecStart=/b "$$5" "50%%"' in render("systemd", {"name": "x", "exec": ["/b", "$5", "50%"]})
