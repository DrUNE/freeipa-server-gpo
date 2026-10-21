"""The `gpo_editor_*` response contract shared with the frontend.

`tests/contracts/gpo_editor/*.json` hold one reference answer per method. The frontend tests check that the mock
backend of the dev stand and `util/API.js` agree with them (frontend/tests/unit/gpo-editor-contract.test.js); this
file checks that the real commands produce answers of the same shape, so a change on either side that the other
does not follow fails before it reaches a live server.

Shape means: the same keys at every level, the same JSON type of every value, the first element of non-empty lists
compared; `null` in a reference answer means "any value" (the field is optional or its content is not part of the
contract), and an empty list on either side compares nothing.
"""

import json
from pathlib import Path
from types import SimpleNamespace

import pytest

from test_gpo_editor_backend import (
    GPO,
    CommandHarness,
    PolicyIndexWorkspace,
    PolicyReadWorkspace,
    PreferenceWorkspace,
    ScriptWorkspace,
    _script_command_environment,
    editor_context,
    runtime,
    snapshot,
)

CONTRACTS = Path(__file__).resolve().parent / "contracts" / "gpo_editor"


def contract(name):
    return json.loads((CONTRACTS / f"{name}.json").read_text())


def json_type(value):
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, (int, float)):
        return "number"
    if isinstance(value, str):
        return "string"
    if isinstance(value, (list, tuple)):
        return "array"
    return "object"


def differences(actual, reference, path="$"):
    """Where `actual` does not have the shape of `reference` (see the module docstring)."""
    if reference is None:
        return []
    if json_type(actual) != json_type(reference):
        return [f"{path}: {json_type(actual)} instead of {json_type(reference)}"]
    if isinstance(reference, dict):
        found = []
        for key in sorted(set(reference) | set(actual)):
            if key not in actual:
                found.append(f"{path}.{key}: missing")
            elif key not in reference:
                found.append(f"{path}.{key}: not in the contract")
            else:
                found += differences(actual[key], reference[key], f"{path}.{key}")
        return found
    if isinstance(reference, (list, tuple)) and reference and actual:
        return differences(actual[0], reference[0], f"{path}[0]")
    return []


def test_the_shape_comparison_reports_missing_extra_and_mistyped_fields():
    reference = {"a": 1, "b": {"c": "x"}, "d": [{"e": True}], "any": None}
    assert differences({"a": 2, "b": {"c": "y"}, "d": [{"e": False}, 5], "any": [1]}, reference) == []
    assert differences({"a": "1", "b": {}, "d": [{"e": 1}], "any": 0, "z": 1}, reference) == [
        "$.a: string instead of number",
        "$.b.c: missing",
        "$.d[0].e: number instead of boolean",
        "$.z: not in the contract",
    ]
    assert differences({"a": 1, "b": {"c": ""}, "d": [], "any": None}, reference) == []


def run(command, golden, monkeypatch, workspace, *, harness=None):
    args = tuple(golden["args"])
    options = dict(golden["options"])
    return command.execute(harness or CommandHarness(editor_context()), *args, **options)


def patched_workspace(monkeypatch, workspace, runtime_data=None):
    monkeypatch.setattr(
        GPO, "_open_workspace", lambda *args, **kwargs: (workspace, runtime_data or runtime())
    )


def test_open_answers_with_the_contract_shape(monkeypatch):
    golden = contract("open")
    workspace = PreferenceWorkspace()
    # What the binding reports includes the document's file path; the public answer must not.
    workspace.list_preference_documents = lambda: [
        dict(document, path="Machine/Preferences/Files/Files.xml")
        for document in golden["result"]["preference_documents"]
    ]
    patched_workspace(monkeypatch, workspace)
    result = run(GPO.gpo_editor_open, golden, monkeypatch, workspace)
    assert differences(result, golden["result"]) == []
    assert all("path" not in document for document in result["preference_documents"])


def test_preference_documents_answers_with_the_contract_shape(monkeypatch):
    golden = contract("preference_documents")
    workspace = PreferenceWorkspace()
    workspace.list_preference_documents = lambda: list(golden["result"]["documents"])
    patched_workspace(monkeypatch, workspace)
    result = run(GPO.gpo_editor_preference_documents, golden, monkeypatch, workspace)
    assert differences(result, golden["result"]) == []


def test_preference_items_answers_with_the_contract_shape(monkeypatch):
    golden = contract("preference_items")
    workspace = PreferenceWorkspace()
    workspace.list_preference_items = lambda scope, kind: list(golden["result"]["items"])
    patched_workspace(monkeypatch, workspace)
    result = run(GPO.gpo_editor_preference_items, golden, monkeypatch, workspace)
    assert differences(result, golden["result"]) == []


@pytest.mark.parametrize("name", ["scripts_show", "script_files"])
def test_script_reads_answer_with_the_contract_shape(monkeypatch, name):
    golden = contract(name)
    workspace = ScriptWorkspace()
    command, _recovered, _commits = _script_command_environment(monkeypatch, workspace)
    method = getattr(GPO, golden["method"])
    result = method.execute(command, *golden["args"], **golden["options"])
    assert differences(result, golden["result"]) == []


def test_reconcile_answers_with_the_contract_shape(monkeypatch):
    golden = contract("reconcile")
    workspace = SimpleNamespace(pending_external_publication=lambda: None, diagnostics=lambda: [])
    patched_workspace(monkeypatch, workspace)
    monkeypatch.setattr(
        GPO, "_reconcile_workspace", lambda *args, **kwargs: ({"kind": "clean"}, snapshot())
    )
    result = run(GPO.gpo_editor_reconcile, golden, monkeypatch, workspace)
    assert differences(result, golden["result"]) == []


def test_children_answers_with_the_contract_shape(monkeypatch):
    golden = contract("children")
    workspace = PolicyReadWorkspace()
    patched_workspace(monkeypatch, workspace)
    result = run(GPO.gpo_editor_children, golden, monkeypatch, workspace)
    assert differences(result, golden["result"]) == []


def test_policy_index_answers_with_the_contract_shape(monkeypatch):
    golden = contract("policy_index")
    workspace = PolicyIndexWorkspace({
        ("computer", None): [
            {"kind": "category", "id": "opaque:category/A", "label": "System"},
            {"kind": "policy", "id": "opaque:root", "label": "Root"},
        ],
        ("computer", "opaque:category/A"): [
            {"kind": "policy", "id": "opaque:policy/A", "label": "Policy"},
        ],
    })
    patched_workspace(monkeypatch, workspace)
    result = run(GPO.gpo_editor_policy_index, golden, monkeypatch, workspace)
    assert differences(result, golden["result"]) == []


def test_policy_show_answers_with_the_contract_shape(monkeypatch):
    golden = contract("policy_show")
    workspace = PolicyReadWorkspace()
    workspace.policy = golden["result"]["policy"]
    patched_workspace(monkeypatch, workspace)
    result = run(GPO.gpo_editor_policy_show, golden, monkeypatch, workspace)
    assert differences(result, golden["result"]) == []


def feed_preference_detail(workspace, answer):
    """Make the fake workspace report what the reference answer says the binding reports."""
    workspace.get_new_preference_item_fields = lambda scope, kind: answer["new_item_fields"]
    kinds = answer["filter_kinds"]
    workspace.preference_filter_kinds = lambda: [
        {key: value for key, value in kind.items() if key != "fields"} for kind in kinds
    ]
    workspace.get_new_preference_filter_fields = lambda kind: kinds[0]["fields"]
    workspace.parent_candidates = answer["parent_candidates"]
    if answer["item"] is not None:
        workspace.items = [answer["item"]]
        workspace.get_preference_fields = lambda *args: answer["fields"]
        workspace.list_preference_filters = lambda *args: answer["filters"]
        workspace.get_preference_filter_fields = lambda *args: answer["filter_fields"][0]["fields"]


def test_preference_show_answers_with_the_contract_shape(monkeypatch):
    golden = contract("preference_show")
    workspace = PreferenceWorkspace()
    feed_preference_detail(workspace, golden["result"])
    patched_workspace(monkeypatch, workspace)
    result = run(GPO.gpo_editor_preference_show, golden, monkeypatch, workspace)
    assert differences(result, golden["result"]) == []


def mutating_workspace(monkeypatch):
    workspace = PreferenceWorkspace()
    patched_workspace(monkeypatch, workspace)
    monkeypatch.setattr(GPO, "_recover_before_mutation", lambda *args: None)
    monkeypatch.setattr(GPO, "_commit_external_once", lambda *args: {"changed": True})
    return workspace


@pytest.mark.parametrize(
    ("name", "command"),
    [
        ("preference_create", "gpo_editor_preference_create"),
        ("preference_update", "gpo_editor_preference_update"),
        ("preference_delete", "gpo_editor_preference_delete"),
    ],
)
def test_preference_writes_answer_with_the_contract_shape(monkeypatch, name, command):
    golden = contract(name)
    workspace = mutating_workspace(monkeypatch)
    if "fields" in golden["result"]:
        feed_preference_detail(workspace, golden["result"])
    result = run(getattr(GPO, command), golden, monkeypatch, workspace)
    assert differences(result, golden["result"]) == []
