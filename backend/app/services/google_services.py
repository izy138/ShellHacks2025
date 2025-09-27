from xml.etree.ElementTree import tostring
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Loads variables from .env

api_key = os.getenv("GOOGLE_API_KEY")

def make_waypoint(placeId):
    return {"via": False,
            "sideOfRoad": False,
            "placeId": placeId
            }

def get_route(location_list):
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set.")

    # Assume location_list is a list of dicts: [{"place_id": ...}, ...]


    origin = make_waypoint(location_list[0])
    destination = make_waypoint(location_list[-1])
    intermediates = [make_waypoint(loc) for loc in location_list[1:-1]]

    request = {
        "origin": origin,
        "destination": destination,
        "intermediates": intermediates,
        "travelMode": "WALK",
        "languageCode": "en-US",
        "units": "IMPERIAL"
        # Add other required fields as needed
    }

    try: 
        response = requests.post(
            "https://routes.googleapis.com/directions/v2:computeRoutes",
            headers={
                "X-Goog-Api-Key": api_key,
                "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.polyline.encodedPolyline,routes.legs.staticDuration,routes.legs.distanceMeters"
            },
            json=request
        )

        if response.status_code == 200:
            route = response.json()
            return route
        else:
            print('Error:', response.status_code, response.text)
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
    
def get_route_times(location_list):

    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set.")

    # Assume location_list is a list of dicts: [{"place_id": ...}, ...]


    origin = make_waypoint(location_list[0])
    destination = make_waypoint(location_list[-1])
    intermediates = [make_waypoint(loc) for loc in location_list[1:-1]]

    request = {
        "origin": origin,
        "destination": destination,
        "intermediates": intermediates,
        "travelMode": "WALK",
        "languageCode": "en-US",
        "units": "IMPERIAL"
        # Add other required fields as needed
    }

    try: 
        response = requests.post(
            "https://routes.googleapis.com/directions/v2:computeRoutes",
            headers={
                "X-Goog-Api-Key": api_key,
                "X-Goog-FieldMask": "routes.legs.duration"
            },
            json=request
        )

        if response.status_code == 200:
            route = response.json()
            return route
        else:
            print('Error:', response.status_code, response.text)
            return None
        
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None

def get_place_id(address):
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set.")

    url_request = (
        "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input="
        + address
        + "&inputtype=textquery&fields=place_id&key="
        + api_key
    )

    url = url_request
    
    try:
        response = requests.get(url)

        if response.status_code == 200:
            places = response.json()
            if places['candidates']:
                print(places['candidates'][0]['place_id'])
                return places['candidates'][0]['place_id']
            else:
                return None
        else:
            print('Error:', response.status_code)
            return None
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None


