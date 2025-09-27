from pydantic import BaseModel
from typing import List, Optional
from datetime import time

# ----------------- Course -----------------
class Course(BaseModel):
    code: str
    name: str
    description: str
    credits: int
    prereqs: List[str] = []
    coreqs: List[str] = []

# ----------------- Building -----------------
class Building(BaseModel):
    code: str
    full_name: str
    address: str
    google_maps_place_id: str

# ----------------- CurrentCourse -----------------
class CurrentCourse(Course):
    start_time: time
    end_time: time
    location: Building 
    professor: str


# ----------------- Major -----------------
class Major(BaseModel):
    major_id: str
    name: str
    required_courses: List[str] = []

# ----------------- User -----------------
class User(BaseModel):
    user_id: str
    blocked_time: dict = {}  # e.g., {"day": "Mon", "time": "10:00-12:00"}
    major: str
    taken_courses: List[str] = []  # list of course codes
    current_courses: List[CurrentCourse] = []
