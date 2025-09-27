from fastapi import APIRouter, HTTPException
from app.models import Course, CurrentCourse, Major, User
from app.services.mongo_services import (
    insert_course, get_course,
    insert_current_course, get_current_course,
    insert_major, get_major,
    insert_user, get_user, update_user
)
import google_api

router = APIRouter(prefix="/api")

# ----------------- Courses -----------------
@router.post("/courses")
async def create_course(course: Course):
    existing = await get_course(course.code)
    if existing:
        raise HTTPException(status_code=400, detail="Course with this code already exists")
    await insert_course(course)
    return {"status": "success"}

@router.get("/courses/{code}")
async def read_course(code: str):
    course = await get_course(code)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

 # ----------------- Majors -----------------
@router.post("/majors")
async def create_major(major: Major):
    existing = await get_major(major.major_id)
    if existing:
        raise HTTPException(status_code=400, detail="Major with this id already exists")
    await insert_major(major)
    return {"status": "success"}

@router.get("/majors/{major_id}")
async def read_major(major_id: str):
    major = await get_major(major_id)
    if not major:
        raise HTTPException(status_code=404, detail="Major not found")
    return major

# ----------------- Users -----------------
@router.post("/users")
async def create_user(user: User):
    existing = await get_user(user.user_id)
    if existing:
        raise HTTPException(status_code=400, detail="User with this id already exists")
    await insert_user(user)
    return {"status": "success"}

@router.get("/users/{user_id}")
async def read_user(user_id: str):
    user = await get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}")
async def edit_user(user_id: str, update_data: dict):
    await update_user(user_id, update_data)
    return {"status": "updated"}


#----------------- Route Stuff -----------------
@router.get("/route/get_route/{class_id_list}")
def get_route(class_list_string: str):
    class_list = class_list_string.split(',')
    return google_api.get_route(class_list)

@router.get("/route/get_route_travel_time{class_list_string}")
def get_route_times(class_list_string: str):
    class_list = class_list_string.split(',')
    return google_api.get_route_times(class_list)