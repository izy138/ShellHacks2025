from app.db import db, serialize_doc
from app.models import Course, CurrentCourse, Major, User, Location
# ----------------- Location -----------------
async def insert_location(location: Location):
    await db.locations.insert_one(location.dict())

async def get_location(code: str):
    doc = await db.locations.find_one({"code": code})
    return serialize_doc(doc)

# ----------------- Course -----------------
async def insert_course(course: Course):
    await db.courses.insert_one(course.dict())

async def get_course(code: str):
    doc = await db.courses.find_one({"code": code})
    return serialize_doc(doc)

# ----------------- CurrentCourse -----------------
async def insert_current_course(current_course: CurrentCourse):
    await db.current_courses.insert_one(current_course.dict())

async def get_current_course(code: str):
    doc = await db.current_courses.find_one({"code": code})
    return serialize_doc(doc)

# ----------------- Major -----------------
async def insert_major(major: Major):
    await db.majors.insert_one(major.dict())

async def get_major(major_id: str):
    doc = await db.majors.find_one({"major_id": major_id})
    return serialize_doc(doc)

# ----------------- User -----------------
async def insert_user(user: User):
    await db.users.insert_one(user.dict())

async def get_user(user_id: str):
    doc = await db.users.find_one({"user_id": user_id})
    return serialize_doc(doc)

async def update_user(user_id: str, update_data: dict):
    await db.users.update_one({"user_id": user_id}, {"$set": update_data})
