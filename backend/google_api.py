from xml.etree.ElementTree import tostring
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Loads variables from .env

api_key = os.getenv("GOOGLE_API_KEY")

def get_route(class_list):
    # Placeholder function to simulate route fetching from Google Maps API
    # In a real implementation, this would involve making an HTTP request to the Google Maps API
    # and processing the response to extract the route information.

    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set.")

    return {
        "routes": [
            {
            "distanceMeters": 772,
            "duration": "165s",
            "polyline": {
                "encodedPolyline": "ipkcFfichVnP@j@BLoFVwM{E?"
            }
            }
        ]
        }
        

def get_route_times(class_list):

    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set.")
    
    # Placeholder to simulate fetching route times between classes
    return {
        "times": [
            {
                "from": class_list[i],
                "to": class_list[i + 1],
                "travel_time": "1000", #Time in seconds
                "distance": "800" #Distance in feet
            } for i in range(len(class_list) - 1)
        ]
    }