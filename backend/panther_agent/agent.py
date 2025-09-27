from google.adk.agents.llm_agent import Agent
from .tools import load_major_template, diff_requirements, get_sections, schedule_solver

# ...same imports...
root_agent = Agent(
    model='gemini-2.0-flash',
    name='root_agent',
    description='FIU class advisor (sample data).',
    instruction=(
        "You advise FIU students on schedule planning. "
        "The user will give you: MAJOR, TERM, CAMPUSES, COMPLETED, PREFS. "
        "Steps:\n"
        "1) Call load_major_template(major) then diff_requirements(template, completed) "
        "   to compute ELIGIBLE courses.\n"
        "2) Call get_sections(term, campuses, eligible) to fetch available sections.\n"
        "3) Call schedule_solver(sections, prefs) to produce 1–3 plans.\n"
        "Rules:\n"
        "- Recommend **at most 3 major courses** for the next term; "
        "  leave **3 elective slots** for the student to choose.\n"
        "Return a short summary: eligible list, sections considered, and the top plan "
        "with CRNs, days, and times.\n"
        "If inputs are missing, ask the user *briefly* for MAJOR/TERM/CAMPUSES/PREFS."
    ),
    tools=[load_major_template, diff_requirements, get_sections, schedule_solver],
)

