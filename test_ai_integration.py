#!/usr/bin/env python3
"""
Test script to verify Claude AI integration is working
"""

import requests
import json

def test_ai_endpoints():
    """Test all AI endpoints"""
    base_url = "http://127.0.0.1:8000/api"
    
    print("🧪 Testing Claude AI Integration")
    print("=" * 40)
    
    # Test 1: Basic chat
    print("\n1. Testing basic chat...")
    try:
        response = requests.post(f"{base_url}/ai/chat", 
                               json={"message": "Hello Roary! Can you help me with course planning?"})
        if response.status_code == 200:
            data = response.json()
            print("✅ Basic chat working!")
            print(f"   Response: {data['response'][:100]}...")
        else:
            print(f"❌ Basic chat failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Basic chat error: {e}")
    
    # Test 2: Course recommendations (with valid user)
    print("\n2. Testing course recommendations...")
    try:
        response = requests.post(f"{base_url}/ai/recommendations", 
                               json={"user_id": "user_zpk4t6kri_1759018330324"})
        if response.status_code == 200:
            data = response.json()
            print("✅ Course recommendations working!")
            print(f"   Response: {data['recommendations'][:100]}...")
        else:
            print(f"❌ Course recommendations failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Course recommendations error: {e}")
    
    # Test 3: Course requirements
    print("\n3. Testing course requirements...")
    try:
        response = requests.post(f"{base_url}/ai/course-requirements", 
                               json={"course_code": "COP 3530"})
        if response.status_code == 200:
            data = response.json()
            print("✅ Course requirements working!")
            print(f"   Response: {data['requirements'][:100]}...")
        else:
            print(f"❌ Course requirements failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Course requirements error: {e}")
    
    # Test 4: Backend health
    print("\n4. Testing backend health...")
    try:
        response = requests.get("http://127.0.0.1:8000/")
        if response.status_code == 200:
            print("✅ Backend is running!")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Backend health check error: {e}")
    
    print("\n🎉 AI Integration Test Complete!")
    print("\nNext steps:")
    print("1. Add your real Claude API key to the .env file")
    print("2. Restart the backend server")
    print("3. Load the Chrome extension")
    print("4. Test the AI features in the browser!")

if __name__ == "__main__":
    test_ai_endpoints()
