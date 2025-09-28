# panther_agent/agent.py
import os

# Prefer a custom var if present; fall back to GOOGLE_API_KEY
os.environ["GOOGLE_API_KEY"] = (os.getenv("GOOGLE_API_KEY1"))

from google.adk.agents import Agent
from .tools import load_major_template, diff_requirements, get_sections, schedule_solver

root_agent = Agent(
    name="panther_agent",
    model="gemini-2.0-flash",
    description="FIU class advisor (sample data).",
    instruction=(
        "You advise FIU students on schedule planning.\n"
        "Inputs provided: MAJOR, TERM, CAMPUSES, COMPLETED (list of codes), PREFS.\n"
        "Steps:\n"
        "1) Call load_major_template(major) then diff_requirements(template, completed) to get ELIGIBLE courses.\n"
        "2) Call get_sections(term, campuses, eligible) to fetch available sections.\n"
        "3) Call schedule_solver(sections, prefs) to produce a plan.\n"
        "Rules: Recommend at most 3 major courses; leave space for electives. "
        "Return a succinct summary: eligible list, sections considered, and the plan with CRNs/days/times."
    ),
    tools=[load_major_template, diff_requirements, get_sections, schedule_solver],
)
