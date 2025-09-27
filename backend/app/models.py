from pydantic import BaseModel
from typing import List, Optional
from datetime import time

# ----------------- Course -----------------
class Course(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    credits: int
    is_taken: bool = False
    prereqs: List[str] = []
    coreqs: List[str] = []

# ----------------- CurrentCourse -----------------
class CurrentCourse(Course):
    start_time: time
    end_time: time
    location: dict  # e.g., {"building": "Engineering Hall", "address": "123 College Ave", "google_maps_place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4"}
    professor: str

# ----------------- Major -----------------
class Major(BaseModel):
    major_id: str
    name: str
    required_courses: List[Course] = []

# ----------------- User -----------------
class User(BaseModel):
    user_id: str
    blocked_time: dict = {}  # e.g., {"day": "Mon", "time": "10:00-12:00"}
    major: str
    taken_classes: List[str] = []  # list of course codes
    current_courses: List[CurrentCourse] = []
