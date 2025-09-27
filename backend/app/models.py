from pydantic import BaseModel
from typing import List, Dict
from datetime import time

# ----------------- Course -----------------
class Course(BaseModel):
    code: str
    name: str
    description: str
    credits: int
    prereqs: List[str] = []
    coreqs: List[str] = []

# ----------------- Location -----------------
class Location(BaseModel):
    code: str
    full_name: str
    address: str
    google_maps_place_id: str

# ----------------- Schedule -----------------
class Block(BaseModel):
    start_time: time
    end_time: time
    location: Location

class Schedule(BaseModel):
    blocks: Dict[str, List[Block]]

# ----------------- CurrentCourse -----------------
class CurrentCourse(Course):
    schedule: Schedule
    professor: str


# ----------------- Major -----------------
class Major(BaseModel):
    major_id: str
    name: str
    required_courses: List[str] = []

# ----------------- User -----------------
class User(BaseModel):
    user_id: str
    blocked_time: Schedule
    major: str
    taken_courses: List[str] = []  # list of course codes
    current_courses: List[CurrentCourse] = []
