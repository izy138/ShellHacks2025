# panther-planner/tools.py (replace with this enhanced version)
from typing import List, Dict, Any, Iterable
import httpx
import os

API_BASE = os.getenv("API_BASE", "http://127.0.0.1:8000/api")

# ---------- requisite parsing ----------
def _norm(code: str) -> str:
    return code.replace(" ", "").upper()

def parse_requisite_string(expr: str) -> List[List[str]]:
    if not expr or not expr.strip():
        return []
    groups = []
    for g in expr.split(","):
        g = g.strip()
        if not g:
            continue
        ors = [o.strip() for o in g.split("|") if o.strip()]
        groups.append(ors if ors else [])
    return groups

def requirements_satisfied(completed: Iterable[str], expr: str) -> bool:
    comp = {_norm(c) for c in completed}
    for group in parse_requisite_string(expr):
        if group and not any(_norm(opt) in comp for opt in group):
            return False
    return True

# ---------- DB calls ----------
def _get(path: str):
    with httpx.Client(timeout=10.0) as client:
        r = client.get(f"{API_BASE}{path}")
        r.raise_for_status()
        return r.json()

def _safe_get_course(code: str) -> Dict[str, Any]:
    try:
        return _get(f"/courses/{code}")
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            # fallback shape
            return {"code": code, "name": code, "credits": 3, "prereqs": "", "coreqs": ""}
        raise

# ---------- Tools (same names) ----------
def load_major_template(major: str) -> Dict[str, Any]:
    """
    Pull required course codes from the major in DB.
    You can map 'CS' to your stored major_id (e.g., 'COMPSC:BS').
    """
    major_id = "COMPSC:BS" if major.upper().startswith("CS") else major
    mj = _get(f"/majors/{major_id}")
    # Your DB may return a list of Course docs or a list of codes.
    # Normalize to codes:
    req = mj.get("required_courses", [])
    if req and isinstance(req[0], dict):
        codes = [c["code"] for c in req]
    else:
        codes = req  # already codes
    return {"buckets": [{"id": "core", "choose": 2, "courses": codes}]}

def diff_requirements(template: Dict[str, Any], completed: Dict[str, int]) -> Dict[str, Any]:
    completed_set = set(completed.keys())
    needed = []
    eligible = set()

    for b in template["buckets"]:
        remaining = []
        for code in b["courses"]:
            if code in completed_set:
                continue
            cdoc = _safe_get_course(code)
            prereq_expr = cdoc.get("prereqs", "") if isinstance(cdoc.get("prereqs"), str) else ""
            if requirements_satisfied(completed_set, prereq_expr):
                remaining.append(code)
        needed.append({"id": b["id"], "choose": b["choose"], "remaining": remaining})
        eligible.update(remaining)

    return {"needed": needed, "eligible": sorted(eligible)}

# Keep your section/schedule tools as-is for now (they don’t hit DB)
from .sample_data import SAMPLE_SECTIONS
def get_sections(term: str, campuses: List[str], course_codes: List[str]) -> List[Dict[str, Any]]:
    code_set = {_norm(c) for c in course_codes}
    return [s for s in SAMPLE_SECTIONS
            if s["term"] == term and s["campus"] in campuses and _norm(s["course"]) in code_set]

def schedule_solver(sections: List[Dict[str, Any]], prefs: Dict[str, Any]) -> List[Dict[str, Any]]:
    target = prefs.get("creditsTarget", 9)
    morning = prefs.get("timeOfDay") == "Morning"
    days_to_avoid = set(prefs.get("daysToAvoid", []))

    def violates_days(s): return any(d in days_to_avoid for d in s["days"])
    def overlap(a, b):
        same_day = any(d in b["days"] for d in a["days"])
        time_conflict = not (a["end"] <= b["start"] or b["end"] <= a["start"])
        return same_day and time_conflict

    pool = [s for s in sections if not violates_days(s)]
    pool.sort(key=lambda x: (x["start"], x["course"]))

    chosen = []
    for s in pool:
        if any(overlap(s, u) for u in chosen): 
            continue
        chosen.append(s)
        if sum(c["credits"] for c in chosen) >= target:
            break

    score = sum(1 for c in chosen if morning and c["start"] < "12:00")
    return [{"sections": chosen, "credits": sum(c["credits"] for c in chosen), "score": score}]
