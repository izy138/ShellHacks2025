
from typing import Dict, List

from fastapi import APIRouter, HTTPException, Query
from app.models import Course, CurrentCourse, Major, User, Location
from app.services.mongo_services import (
    insert_course, get_course,
    insert_current_course, get_current_course,
    insert_major, get_major,
    insert_user, get_user, update_user,
    insert_location, get_location
)
from app.services.google_services import (
    get_route as g_get_route,
    get_route_times as g_get_route_times
)

router = APIRouter(prefix="/api")

@router.post("/locations")
async def create_location(location: Location):
    existing = await get_location(location.code)
    if existing:
        raise HTTPException(status_code=400, detail="location with this code already exists")
    await insert_location(location)
    return {"status": "success"}

@router.get("/locations")
async def list_locations():
    locations = await db.locations.find().to_list(length=100)
    # Only return code, full_name and id for dropdown
    return [{"code": l.get("code"), "full_name": l.get("full_name"), "id": l.get("google_maps_place_id")} for l in locations]

@router.get("/locations/{code}")
async def read_location(code: str):
    location = await get_location(code)
    if not location:
        raise HTTPException(status_code=404, detail="location not found")
    return location

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

# GET all majors for dropdown
from app.db import db

@router.get("/majors")
async def list_majors():
    majors = await db.majors.find().to_list(length=100)
    # Only return major_id and name for dropdown
    return [{"major_id": m.get("major_id"), "name": m.get("name")} for m in majors]

@router.get("/majors/{major_id}")
async def read_major(major_id: str):
    major = await get_major(major_id)
    if not major:
        raise HTTPException(status_code=404, detail="Major not found")
    return major

# ----------------- Users -----------------
@router.post("/users")
async def create_user(user_data: dict):
    # Convert dict to User model with proper Schedule
    from app.models import Schedule
    
    # Ensure schedule is a proper Schedule object
    if isinstance(user_data.get('schedule'), dict):
        user_data['schedule'] = Schedule(**user_data['schedule'])
    elif not user_data.get('schedule'):
        user_data['schedule'] = Schedule()
    
    user = User(**user_data)
    
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
    try:
        print(f"Updating user {user_id} with data: {update_data}")
        
        # Handle schedule conversion if present
        if 'schedule' in update_data and isinstance(update_data['schedule'], dict):
            from app.models import Schedule
            update_data['schedule'] = Schedule(**update_data['schedule'])
        
        # Convert Pydantic models to dicts before passing to update_user
        def convert_to_dict(obj):
            if hasattr(obj, 'dict'):
                return obj.dict()
            elif isinstance(obj, list):
                return [convert_to_dict(item) for item in obj]
            elif isinstance(obj, dict):
                return {k: convert_to_dict(v) for k, v in obj.items()}
            else:
                return obj
        
        update_data = convert_to_dict(update_data)
        await update_user(user_id, update_data)
        print(f"Successfully updated user {user_id}")
        return {"status": "updated"}
    except Exception as e:
        print(f"Error updating user {user_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


#----------------- Route Stuff -----------------
@router.get("/route/get_route")

def get_route_query(place_id_list: List[str] = Query(...)):
    """
    Get route using query parameters.
    Usage: /api/route/get_route?place_id_list=id1&place_id_list=id2&place_id_list=id3
    """
    try:
        # Convert list of place_id strings to list of dicts
        place_ids = [{"place_id": pid} for pid in place_id_list]
        return g_get_route(place_ids)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing route: {str(e)}")

@router.get("/route/get_route/{place_ids}")
def get_route_endpoint(place_ids: str):
    """
    Get route using path parameter with JSON string.
    Usage: /api/route/get_route/[{"place_id":"id1"},{"place_id":"id2"}]
    """
    import json
    try:
        # Decode URL-encoded JSON string
        place_id_list = json.loads(place_ids)
        return g_get_route(place_id_list)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing route: {str(e)}")


@router.get("/route/get_route_travel_time{class_list_string}")
def get_route_times(class_list_string: str):
    class_list = class_list_string.split(',')
    return g_get_route_times(class_list)

