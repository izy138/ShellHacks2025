# panther-planner/tools.py
from typing import List, Dict, Any
from .sample_data import SAMPLE_SECTIONS

def load_major_template(major: str) -> Dict[str, Any]:
    """Return a small requirement template for the requested major.
    For MVP, CS has one bucket 'core' where the student must choose 2 courses.
    Returns:
      dict: { "buckets": [ {"id": str, "choose": int, "courses": [str, ...]} ] }
    """
    templates = {
        "CS": {"buckets":[{"id":"core","choose":2,
                           "courses":["COP3530","CDA3103","COT3100"]}]}
    }
    return templates.get(major, templates["CS"])

def diff_requirements(template: Dict[str,Any], completed: Dict[str,int]) -> Dict[str, Any]:
    """Compare the requirement template with completed courses.
    Args:
      template: output of load_major_template
      completed: mapping of completed course->credits (e.g., {"MAC2311":4})
    Returns:
      dict: {
        "needed": [{"id":..., "choose": int, "remaining": [course_code,...]}, ...],
        "eligible": [course_code, ...]  # flattened remaining list
      }
    """
    needed=[]
    for b in template["buckets"]:
        remaining=[c for c in b["courses"] if c not in completed]
        needed.append({"id":b["id"],"choose":b["choose"],"remaining":remaining})
    eligible=sorted({c for b in needed for c in b["remaining"]})
    return {"needed":needed,"eligible":eligible}

def get_sections(term: str, campuses: List[str], course_codes: List[str]) -> List[Dict[str,Any]]:
    """Return sections filtered by term, campuses, and target course codes.
    Args:
      term: e.g., "2026 Spring"
      campuses: e.g., ["MMC","Online"]
      course_codes: e.g., ["COP3530","CDA3103"]
    Returns:
      List[Section]: dictionaries with meeting times, CRN, etc.
    """
    return [s for s in SAMPLE_SECTIONS
            if s["term"]==term and s["campus"] in campuses and s["course"] in course_codes]

def schedule_solver(sections: List[Dict[str,Any]], prefs: Dict[str,Any]) -> List[Dict[str,Any]]:
    """Produce 1–3 non-conflicting schedules and score them by preferences.
    Hard constraints: no time conflicts; credits >= target.
    Soft: if prefs['timeOfDay']=='Morning', prefer earlier start times.
    Args:
      sections: list from get_sections
      prefs: e.g., {"creditsTarget":9,"timeOfDay":"Morning","daysToAvoid":["Tue","Thu"]}
    Returns:
      List[Plan]: [{"sections":[...], "credits": int, "score": int}, ...]
    """
    target=prefs.get("creditsTarget",9)
    morning=prefs.get("timeOfDay")=="Morning"
    days_to_avoid=set(prefs.get("daysToAvoid", []))

    def violates_days(s):
        return any(d in days_to_avoid for d in s["days"])

    def overlap(a,b):
        same_day=any(d in b["days"] for d in a["days"])
        time_conflict=not (a["end"]<=b["start"] or b["end"]<=a["start"])
        return same_day and time_conflict

    pool=[s for s in sections if not violates_days(s)]
    pool=sorted(pool, key=lambda x:(x["start"], x["course"]))

    chosen=[]
    for s in pool:
        if any(overlap(s,u) for u in chosen): 
            continue
        chosen.append(s)
        if sum(c["credits"] for c in chosen)>=target:
            break

    score=sum(1 for c in chosen if morning and c["start"]<"12:00")
    return [{"sections":chosen,"credits":sum(c["credits"] for c in chosen),"score":score}]
