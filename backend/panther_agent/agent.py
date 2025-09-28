# panther_agent/agent.py
import os
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY1")

from google.adk.agents import Agent
from .tools import (
    get_course_details,
    get_course_requirements,
    user_meets_prereqs,
    get_major_info,
    get_user_profile,
    compute_remaining_for_major,
)

root_agent = Agent(
    name="panther_agent",
    model="gemini-2.0-flash",
    description="FIU class advisor (sample data).",
    instruction=(
        "You advise FIU students on courses and major progress. "
        "When the user asks about a COURSE (e.g., prereqs, coreqs, description, credits), "
        "call get_course_details or get_course_requirements. "
        "When asked if they can take a course, call user_meets_prereqs with their user_id and the course code. "
        "When asked 'what should I take next' or similar, call compute_remaining_for_major "
        "to list remaining required courses and which are eligible right now. "
        "Always respond succinctly with bullet points when listing multiple items."
    ),
    tools=[
        get_course_details,
        get_course_requirements,
        user_meets_prereqs,
        get_major_info,
        get_user_profile,
        compute_remaining_for_major,
    ],
)
