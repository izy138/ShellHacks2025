from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
from app.db import db
import uuid, httpx
from fastapi import Request, HTTPException
import os
ADK_BASE = os.getenv("ADK_BASE", "http://127.0.0.1:8001")
ADK_APP  = os.getenv("ADK_APP",  "panther_agent")


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Backend is running!"}

@app.get("/test-db")
async def test_db():
    try:
        # Test database connection
        await db.command("ping")
        return {"status": "success", "message": "Database connected successfully"}
    except Exception as e:
        return {"status": "error", "message": f"Database connection failed: {str(e)}"}

@app.post("/seed-data")
async def seed_data():
    try:
        # Create sample major data
        sample_major = {
            "major_id": "COMPSC:BS",
            "name": "Computer Science Bachelor of Science",
            "required_courses": [
                "COP 2210", "COP 3337", "COP 3530", "COP 4338", "COP 4610",
                "MAC 2311", "MAC 2312", "STA 3033", "COT 3100", "MAD 2104",
                "CDA 3102", "CNT 4713", "CEN 4010", "CEN 4021", "CEN 4072",
                "CAI 4002", "CAI 4105", "CAI 4304", "COP 4710", "COP 4751",
                "CAP 4710", "CIS 4203", "CIS 4731", "COP 4534", "MAD 3512",
                "COT 3541", "COP 4655", "COP 4226", "CAP 4052", "CAP 4506",
                "COP 4520", "COT 4601", "CAP 4770", "CAP 4104", "CAP 4453",
                "CDA 4625", "CEN 4083", "CAP 4830", "ENC 3249", "CGS 3095",
                "CGS 1920", "CIS 3950", "CIS 4951"
            ]
        }
        
        # Insert or update major
        await db.majors.replace_one(
            {"major_id": "COMPSC:BS"}, 
            sample_major, 
            upsert=True
        )
        
        # Create sample course data for all required courses
        sample_courses = [
            # Foundation Programming
            {"code": "COP 2210", "name": "Programming I", "credits": 3, "prereqs": [], "coreqs": []},
            {"code": "COP 3337", "name": "Programming II", "credits": 3, "prereqs": ["COP 2210"], "coreqs": []},
            {"code": "COP 3530", "name": "Data Structures", "credits": 3, "prereqs": ["COP 3337"], "coreqs": []},
            {"code": "COP 4338", "name": "Systems Programming", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            {"code": "COP 4610", "name": "Operating Systems", "credits": 3, "prereqs": ["COP 4338"], "coreqs": []},
            
            # Mathematics
            {"code": "MAC 2311", "name": "Calculus I", "credits": 4, "prereqs": [], "coreqs": []},
            {"code": "MAC 2312", "name": "Calculus II", "credits": 4, "prereqs": ["MAC 2311"], "coreqs": []},
            {"code": "STA 3033", "name": "Probability & Statistics", "credits": 3, "prereqs": ["MAC 2311"], "coreqs": []},
            {"code": "COT 3100", "name": "Discrete Structures", "credits": 3, "prereqs": ["MAC 2311"], "coreqs": []},
            {"code": "MAD 2104", "name": "Discrete Math", "credits": 3, "prereqs": ["MAC 2311"], "coreqs": []},
            
            # Missing courses from major requirements
            {"code": "CSG 1920", "name": "Introduction to Computer Science", "credits": 3, "prereqs": [], "coreqs": []},
            {"code": "ENC 3249", "name": "Technical Writing", "credits": 3, "prereqs": [], "coreqs": []},
            {"code": "ENC 3213", "name": "Professional Writing", "credits": 3, "prereqs": [], "coreqs": []},
            {"code": "CSG 3095", "name": "Computer Science Seminar", "credits": 1, "prereqs": [], "coreqs": []},
            {"code": "COP 4336", "name": "Advanced Programming", "credits": 3, "prereqs": ["COP 3337"], "coreqs": []},
            
            # Systems & Architecture
            {"code": "CDA 3102", "name": "Computer Architecture", "credits": 3, "prereqs": ["COP 3337"], "coreqs": []},
            {"code": "CNT 4713", "name": "Net-centric Computing", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            
            # Software Engineering
            {"code": "CEN 4010", "name": "Software Engineering I", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            {"code": "CEN 4021", "name": "Software Engineering II", "credits": 3, "prereqs": ["CEN 4010"], "coreqs": []},
            {"code": "CEN 4072", "name": "Software Testing", "credits": 3, "prereqs": ["CEN 4010"], "coreqs": []},
            
            # AI/Machine Learning
            {"code": "CAI 4002", "name": "Artificial Intelligence", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            {"code": "CAI 4105", "name": "Machine Learning", "credits": 3, "prereqs": ["CAI 4002"], "coreqs": []},
            {"code": "CAI 4304", "name": "Natural Language Processing", "credits": 3, "prereqs": ["CAI 4002"], "coreqs": []},
            
            # Database & Graphics
            {"code": "COP 4710", "name": "Database Management", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            {"code": "COP 4751", "name": "Advanced Database", "credits": 3, "prereqs": ["COP 4710"], "coreqs": []},
            {"code": "CAP 4710", "name": "Computer Graphics", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            
            # Security & Networking
            {"code": "CIS 4203", "name": "Digital Forensics", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            {"code": "CIS 4731", "name": "Blockchain Technologies", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            
            # Algorithms & Theory
            {"code": "COP 4534", "name": "Algorithm Techniques", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            {"code": "MAD 3512", "name": "Theory of Algorithms", "credits": 3, "prereqs": ["COT 3100"], "coreqs": []},
            {"code": "COT 3541", "name": "Logic for CS", "credits": 3, "prereqs": ["COT 3100"], "coreqs": []},
            
            # Mobile & Web Development
            {"code": "COP 4655", "name": "Mobile App Development", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            {"code": "COP 4226", "name": "Advanced Windows Programming", "credits": 3, "prereqs": ["COP 3337"], "coreqs": []},
            
            # Game Development
            {"code": "CAP 4052", "name": "Game Design & Development", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            {"code": "CAP 4506", "name": "Intro to Game Theory", "credits": 3, "prereqs": ["COT 3100"], "coreqs": []},
            
            # Advanced Topics
            {"code": "COP 4520", "name": "Parallel Computing", "credits": 3, "prereqs": ["COP 4338"], "coreqs": []},
            {"code": "COT 4601", "name": "Quantum Computing", "credits": 3, "prereqs": ["COT 3100"], "coreqs": []},
            {"code": "CAP 4770", "name": "Data Mining", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            
            # Human-Computer Interaction
            {"code": "CAP 4104", "name": "Human Computer Interaction", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            
            # Robotics
            {"code": "CAP 4453", "name": "Robot Vision", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            {"code": "CDA 4625", "name": "Mobile Robotics", "credits": 3, "prereqs": ["CDA 3102"], "coreqs": []},
            
            # Cloud & Distributed Systems
            {"code": "CEN 4083", "name": "Cloud Computing", "credits": 3, "prereqs": ["CNT 4713"], "coreqs": []},
            
            # Modeling & Simulation
            {"code": "CAP 4830", "name": "Modeling & Simulations", "credits": 3, "prereqs": ["COP 3530"], "coreqs": []},
            
            # General Education
            {"code": "ENC 3249", "name": "Technical Writing", "credits": 3, "prereqs": [], "coreqs": []},
            {"code": "CGS 3095", "name": "Technology in Global Arena", "credits": 3, "prereqs": [], "coreqs": []},
            {"code": "CGS 1920", "name": "Intro to Computing", "credits": 3, "prereqs": [], "coreqs": []},
            
            # Capstone
            {"code": "CIS 3950", "name": "Capstone I", "credits": 3, "prereqs": ["CEN 4010"], "coreqs": []},
            {"code": "CIS 4951", "name": "Capstone II", "credits": 3, "prereqs": ["CIS 3950"], "coreqs": []}
        ]
        
        # Insert sample courses
        for course in sample_courses:
            await db.courses.replace_one(
                {"code": course["code"]}, 
                course, 
                upsert=True
            )
        
        return {"status": "success", "message": "Sample data seeded successfully"}
    except Exception as e:
        return {"status": "error", "message": f"Failed to seed data: {str(e)}"}


def _extract_adk_text(events):
    """
    ADK /run returns a list of events. We want human-readable text.
    Strategy:
      1) Walk from the end to the start; find the first event that has any text parts.
      2) If not found, scan everything for text parts.
      3) Fallback: return a compact JSON string.
    """
    try:
        # Helper: join all text parts in an event
        def join_text_parts(ev):
            parts = (ev.get("content") or {}).get("parts") or []
            texts = [p.get("text") for p in parts if isinstance(p, dict) and "text" in p and p.get("text")]
            return "\n".join(texts).strip()

        # 1) Prefer the last event with text (usually the assistant’s final message)
        for ev in reversed(events):
            txt = join_text_parts(ev)
            if txt:
                return txt

        # 2) Otherwise, scan in normal order and return the first text we find
        for ev in events:
            txt = join_text_parts(ev)
            if txt:
                return txt

    except Exception:
        pass

    # 3) Nothing found—return the raw payload (helps debugging)
    import json
    try:
        return json.dumps(events, ensure_ascii=False, indent=2)
    except Exception:
        return str(events)



@app.post("/api/agent/ask")
async def ai_chat(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    q = (body.get("query") or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="Missing 'query'")

    session_id = body.get("session_id") or uuid.uuid4().hex
    user_id    = body.get("user_id") or "dev-user"

    # 1) ensure the ADK session exists
# in your /api/agent/ask handler, replace the session create block with:

    session_url = f"{ADK_BASE}/apps/{ADK_APP}/users/{user_id}/sessions/{session_id}"
    async with httpx.AsyncClient(timeout=30) as client:
        mk = await client.post(session_url, json={})
        # Treat "already exists" as success across implementations.
        ok_statuses = {200, 201, 409}
        if mk.status_code not in ok_statuses:
            # Some ADK builds return 400 with a 'Session already exists' message.
            if mk.status_code == 400 and "Session already exists" in mk.text:
                pass  # acceptable — continue
            else:
                raise HTTPException(
                    status_code=502,
                    detail=f"ADK session create failed: {mk.status_code} {mk.text}"
                )

        # Now send the message
        payload = {
            "appName": ADK_APP,
            "userId": user_id,
            "sessionId": session_id,
            "newMessage": {
                "role": "user",
                "parts": [{"text": q}],
            },
        }
        r = await client.post(f"{ADK_BASE}/run", json=payload)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"ADK proxy failed: {r.status_code} {r.text}")
        data = r.json()


    # 3) extract readable reply
    answer = _extract_adk_text(data) or "(empty reply)"
    return {"response": answer, "session_id": session_id}