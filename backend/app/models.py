from pydantic import BaseModel
from typing import List, Dict, Optional
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
    address: Optional[str] = None
    google_maps_place_id: Optional[str] = None

# ----------------- Schedule -----------------
class Block(BaseModel):
    start_time: time
    end_time: time
    location: Location

class Schedule(BaseModel):
    mon: List[Block] = []
    tue: List[Block] = []
    wed: List[Block] = []
    thu: List[Block] = []
    fri: List[Block] = []
    sat: List[Block] = []
    sun: List[Block] = []

# ----------------- CurrentCourse -----------------
class CurrentCourse(Course):
    schedule: Optional[Schedule]
    professor: str


# ----------------- Major -----------------
class Major(BaseModel):
    major_id: str
    name: str
    required_courses: List[str] = []

# ----------------- User -----------------
class User(BaseModel):
    user_id: str
    schedule: Schedule
    major: str
    taken_courses: List[str] = []  # list of course codes
    current_courses: List[CurrentCourse] = []
