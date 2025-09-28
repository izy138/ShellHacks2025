# panther_agent/tools.py
from typing import List, Dict, Any
import os, httpx

API_BASE = os.getenv("API_BASE", "http://127.0.0.1:8000/api")


# ---- tiny sample catalog ----
SAMPLE_REQUIREMENTS: Dict[str, List[str]] = {
    "COMPSC:BS": [
        "COP 2210", "COP 3337", "COP 3530",
        "CDA 3102", "CEN 4010", "CNT 4713",
        "COP 4610"
    ]
}

SAMPLE_PREREQS: Dict[str, List[str]] = {
    "COP 3337": ["COP 2210"],
    "COP 3530": ["COP 3337"],
    "CDA 3102": ["COP 3337"],
    "CEN 4010": ["COP 3530"],
    "CNT 4713": ["COP 3530"],
    "COP 4610": ["COP 4338"],  # won’t be eligible in the tiny sample
}

SAMPLE_SECTIONS: List[Dict[str, Any]] = [
    {"term": "Fall 2025", "campus": "MMC", "course": "COP 2210", "crn": "10001", "days": ["MW"], "start": "10:00", "end": "11:15", "credits": 3},
    {"term": "Fall 2025", "campus": "MMC", "course": "COP 3337", "crn": "10002", "days": ["TR"], "start": "09:30", "end": "10:45", "credits": 3},
    {"term": "Fall 2025", "campus": "MMC", "course": "COP 3530", "crn": "10003", "days": ["MW"], "start": "12:00", "end": "13:15", "credits": 3},
    {"term": "Fall 2025", "campus": "BBC", "course": "CDA 3102", "crn": "20001", "days": ["TR"], "start": "11:00", "end": "12:15", "credits": 3},
]

def load_major_template(major: str) -> Dict[str, Any]:
    """Return a simple bucket template of required course codes for a major."""
    major_id = "COMPSC:BS" if major.upper().startswith("CS") else major
    codes = SAMPLE_REQUIREMENTS.get(major_id, [])
    return {"buckets": [{"id": "core", "choose": 3, "courses": codes}]}

def diff_requirements(template: Dict[str, Any], completed: List[str]) -> Dict[str, Any]:
    """Given template + completed course codes, return what’s still needed and eligible next."""
    done = set(c.strip().upper().replace(" ", "") for c in completed or [])
    eligible: List[str] = []
    needed_buckets: List[Dict[str, Any]] = []

    def _norm(x: str) -> str: return x.strip().upper().replace(" ", "")

    for b in template.get("buckets", []):
        remaining: List[str] = []
        for code in b.get("courses", []):
            n = _norm(code)
            if n in done:
                continue
            # check prereqs
            pre_ok = True
            for p in SAMPLE_PREREQS.get(code, []):
                if _norm(p) not in done:
                    pre_ok = False
                    break
            if pre_ok:
                remaining.append(code)
        needed_buckets.append({"id": b.get("id", "core"), "choose": b.get("choose", 0), "remaining": remaining})
        eligible.extend(remaining)

    return {"needed": needed_buckets, "eligible": sorted(set(eligible))}

def get_sections(term: str, campuses: List[str], course_codes: List[str]) -> List[Dict[str, Any]]:
    """Filter sample sections by term, campuses, and course list."""
    term = term.strip()
    campus_set = set(campuses or [])
    course_set = {c.strip().upper().replace(" ", "") for c in course_codes or []}
    def _norm(x: str) -> str: return x.strip().upper().replace(" ", "")
    out = []
    for s in SAMPLE_SECTIONS:
        if s["term"] != term:
            continue
        if s["campus"] not in campus_set:
            continue
        if _norm(s["course"]) not in course_set:
            continue
        out.append(s)
    return out

def schedule_solver(sections: List[Dict[str, Any]], prefs: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Very simple greedy scheduler: pick non-overlapping until ~9 credits."""
    target = int(prefs.get("creditsTarget", 9))
    chosen: List[Dict[str, Any]] = []

    def overlap(a, b):
        same_day = any(d in b["days"] for d in a["days"])
        if not same_day:
            return False
        return not (a["end"] <= b["start"] or b["end"] <= a["start"])

    for s in sections:
        if any(overlap(s, c) for c in chosen):
            continue
        chosen.append(s)
        if sum(c["credits"] for c in chosen) >= target:
            break
    return [{"sections": chosen, "credits": sum(c["credits"] for c in chosen)}]


# ---------- tiny HTTP helper ----------
def _get(path: str) -> Dict[str, Any]:
    with httpx.Client(timeout=10.0) as client:
        r = client.get(f"{API_BASE}{path}")
        r.raise_for_status()
        return r.json()

# ---------- core data fetchers ----------
def get_course_details(code: str) -> Dict[str, Any]:
    """
    Return canonical course info for a course code.
    Uses GET /api/courses/{code}.
    """
    code = (code or "").strip().upper()
    data = _get(f"/courses/{code}")
    # Normalize fields and types a bit
    return {
        "code": data.get("code", code),
        "name": data.get("name", ""),
        "description": data.get("description", ""),
        "credits": int(data.get("credits", 0) or 0),
        "prereqs": data.get("prereqs") or [],
        "coreqs": data.get("coreqs") or [],
    }

def get_major_info(major_id: str) -> Dict[str, Any]:
    """
    Return required course codes for a major.
    Uses GET /api/majors/{major_id}.
    """
    mid = (major_id or "").strip()
    data = _get(f"/majors/{mid}")
    req = data.get("required_courses") or []
    # normalize to list[str]
    if req and isinstance(req[0], dict):
        req = [c.get("code") for c in req if isinstance(c, dict)]
    return {
        "major_id": data.get("major_id", mid),
        "name": data.get("name", ""),
        "required_courses": req,
    }

def get_user_profile(user_id: str) -> Dict[str, Any]:
    """
    Return user profile including major and taken courses.
    Uses GET /api/users/{user_id}.
    """
    uid = (user_id or "").strip()
    data = _get(f"/users/{uid}")
    return {
        "user_id": data.get("user_id", uid),
        "major": data.get("major", ""),
        "taken_courses": data.get("taken_courses") or [],
        # schedule/current_courses exist too but we don’t need them for prereq checks
    }

# ---------- analysis / logic tools ----------
def get_course_requirements(code: str) -> Dict[str, Any]:
    """
    Returns prereqs/coreqs for a course, plus a short plain-English summary.
    """
    c = get_course_details(code)
    prereqs = c["prereqs"]
    coreqs = c["coreqs"]
    parts = []
    parts.append(f"{c['code']} — {c['name']}")
    if prereqs:
        parts.append("Prerequisites: " + ", ".join(prereqs))
    else:
        parts.append("Prerequisites: none.")
    if coreqs:
        parts.append("Corequisites: " + ", ".join(coreqs))
    else:
        parts.append("Corequisites: none.")
    return {
        "code": c["code"],
        "name": c["name"],
        "credits": c["credits"],
        "prereqs": prereqs,
        "coreqs": coreqs,
        "summary": "\n".join(parts),
    }

def user_meets_prereqs(user_id: str, course_code: str) -> Dict[str, Any]:
    """
    Checks whether user has completed the prereqs for a given course.
    Returns {eligible: bool, missing: [codes], taken: [...]}.
    """
    user = get_user_profile(user_id)
    taken = {x.strip().upper() for x in (user.get("taken_courses") or [])}
    c = get_course_details(course_code)
    prereqs = [p.strip().upper() for p in (c.get("prereqs") or [])]
    missing = [p for p in prereqs if p not in taken]
    return {
        "user_id": user["user_id"],
        "course": c["code"],
        "eligible": len(missing) == 0,
        "missing": missing,
        "taken": sorted(taken),
    }

def compute_remaining_for_major(user_id: str) -> Dict[str, Any]:
    """
    For a user, compute which required major courses remain and which ones are currently eligible
    (i.e., all prereqs satisfied).
    """
    user = get_user_profile(user_id)
    major = get_major_info(user.get("major", ""))
    taken = {x.strip().upper() for x in (user.get("taken_courses") or [])}

    remaining = []
    eligible_now = []

    for code in (major.get("required_courses") or []):
        c = get_course_details(code)
        if c["code"] in taken:
            continue
        prereqs = [p.strip().upper() for p in (c.get("prereqs") or [])]
        missing = [p for p in prereqs if p not in taken]
        remaining.append({
            "code": c["code"],
            "name": c["name"],
            "prereqs": prereqs,
            "missing_prereqs": missing,
            "credits": c["credits"],
        })
        if not missing:
            eligible_now.append(c["code"])

    return {
        "user_id": user["user_id"],
        "major_id": major["major_id"],
        "major_name": major["name"],
        "remaining_required": remaining,     # list of dicts
        "eligible_now": sorted(eligible_now) # list[str]
    }
