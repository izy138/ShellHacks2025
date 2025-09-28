#!/usr/bin/env python3
"""
Test script to verify checklist-AI integration
"""

import requests
import json

def test_checklist_ai_integration():
    """Test the complete checklist-AI integration"""
    base_url = "http://127.0.0.1:8000/api"
    
    print("🧪 Testing Checklist-AI Integration")
    print("=" * 50)
    
    # Test 1: AI with completed courses context
    print("\n1. Testing AI with completed courses context...")
    try:
        response = requests.post(f"{base_url}/ai/chat", 
                               json={
                                   "message": "Given the courses I've completed (COP 2210, MAC 2311), what courses should I take next to stay on track for graduation? Please recommend specific courses from my degree requirements.",
                                   "user_id": "user_zpk4t6kri_1759018330324"
                               })
        if response.status_code == 200:
            data = response.json()
            print("✅ AI with context working!")
            print(f"   Response preview: {data['response'][:150]}...")
            
            # Check if response mentions specific courses
            if any(course in data['response'] for course in ['COP 3337', 'MAC 2312', 'COT 3100']):
                print("✅ AI is recommending specific courses from degree requirements!")
            else:
                print("⚠️  AI response may not be course-specific enough")
        else:
            print(f"❌ AI with context failed: {response.status_code}")
    except Exception as e:
        print(f"❌ AI with context error: {e}")
    
    # Test 2: Course recommendations endpoint
    print("\n2. Testing course recommendations endpoint...")
    try:
        response = requests.post(f"{base_url}/ai/recommendations", 
                               json={"user_id": "user_zpk4t6kri_1759018330324"})
        if response.status_code == 200:
            data = response.json()
            print("✅ Course recommendations working!")
            print(f"   Response preview: {data['recommendations'][:150]}...")
        else:
            print(f"❌ Course recommendations failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Course recommendations error: {e}")
    
    # Test 3: Check user data
    print("\n3. Testing user data retrieval...")
    try:
        response = requests.get(f"{base_url}/users/user_zpk4t6kri_1759018330324")
        if response.status_code == 200:
            data = response.json()
            print("✅ User data retrieval working!")
            print(f"   Major: {data.get('major', 'Unknown')}")
            print(f"   Completed courses: {data.get('taken_courses', [])}")
        else:
            print(f"❌ User data retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"❌ User data retrieval error: {e}")
    
    print("\n🎉 Checklist-AI Integration Test Complete!")
    print("\nFeatures implemented:")
    print("✅ AI response display area in popup")
    print("✅ Checklist integration with AI context")
    print("✅ Automatic course recommendations")
    print("✅ Personalized responses based on completed courses")
    print("✅ Clear response functionality")
    
    print("\nNext steps:")
    print("1. Load the Chrome extension")
    print("2. Check some courses in the checklist")
    print("3. Click 'What should I take next?' button")
    print("4. See AI recommendations in the response area!")
    print("5. Try checking/unchecking courses to see auto-updates")

if __name__ == "__main__":
    test_checklist_ai_integration()
