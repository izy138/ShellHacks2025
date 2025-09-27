import requests

# Change this if your server is running elsewhere
BASE_URL = "http://127.0.0.1:8000/api"

# Example user data
user_data = {
    "user_id": "u1",
    "major": "CS",
    "taken_classes": ["COP1000"],
    "current_courses": [],
    "blocked_time": {"day": "Mon", "time": "10:00-12:00"}
}

# Example major data
major_data = {
    "major_id": "CS",
    "name": "Computer Science",
    "required_courses": []
}

# Example course data
course_data = {
    "code": "COP1000",
    "name": "Intro to Programming",
    "description": "Learn programming basics.",
    "credits": 3,
    "is_taken": False,
    "prereqs": [],
    "coreqs": []
}

# Upload user
r = requests.post(f"{BASE_URL}/users", json=user_data)
print("User:", r.status_code, r.json())

# Upload major
r = requests.post(f"{BASE_URL}/majors", json=major_data)
print("Major:", r.status_code, r.json())

# Upload course
r = requests.post(f"{BASE_URL}/courses", json=course_data)
print("Course:", r.status_code, r.json())
