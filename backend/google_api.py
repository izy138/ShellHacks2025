from xml.etree.ElementTree import tostring
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Loads variables from .env

api_key = os.getenv("GOOGLE_API_KEY")

def get_route(location_list):
    # Placeholder function to simulate route fetching from Google Maps API
    # In a real implementation, this would involve making an HTTP request to the Google Maps API
    # and processing the response to extract the route information.

    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set.")

    # Assume location_list is a list of dicts: [{"place_id": ...}, ...]
    def make_waypoint(loc):
        return {"location": {"placeId": loc["place_id"]}}

    origin = make_waypoint(location_list[0])
    destination = make_waypoint(location_list[-1])
    intermediates = [make_waypoint(loc) for loc in location_list[1:-1]]

    request = {
        "origin": origin,
        "destination": destination,
        "intermediates": intermediates,
        "travelMode": "WALKING",
        "languageCode": "en-US",
        "units": "IMPERIAL"
        # Add other required fields as needed
    }

    try: 
        response = requests.get(
            "https://routes.googleapis.com/directions/v2:computeRoutes",
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": api_key,
                "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs"
            },
            json=request
        )

        if response.status_code == 200:
            route = response.json()
            print(route)
            return route
        else:
            print('Error:', response.status_code)
            return None
        
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None

    # Placeholder return
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



