# panther_agent/tools.py
from typing import List, Dict, Any

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
