from xml.etree.ElementTree import tostring
import requests
import os
from dotenv import load_dotenv

import app.google_api as google_api

load_dotenv()  # Loads variables from .env

api_key = os.getenv("GOOGLE_API_KEY")

def get_posts():

    origin_ID = "ChIJbWv74i-_2YgRqsagPWgY2Qs"
    dest_Id = "ChIJh1r4NS6_2YgR-jjbTyCaHZI"

    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set.")

    url_request = (
        "https://maps.googleapis.com/maps/api/distancematrix/json?destinations=place_id:"
        + dest_Id
        + "&origins=place_id:"
        + origin_ID
        + "&units=imperial&key="
        + api_key
        + "&mode=walking"
    )

    url = url_request
    print(url)

    try:
        response = requests.post(url)

        if response.status_code == 200:
            posts = response.json()
            return posts
        else:
            print('Error:', response.status_code)
            return None
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None

def main():
    # route_info = google_api.get_route([{"place_id": "ChIJbWv74i-_2YgRqsagPWgY2Qs"}, {"place_id": "ChIJh1r4NS6_2YgR-jjbTyCaHZI"}])
    # print (route_info)
    print()
    print(google_api.get_route([
        {"place_id": "ChIJo6bEHZq_2YgRGzXukZLjhIs"},
        {"place_id": "ChIJhQ84ooC_2YgRwg5aW-ElL28"},
        {"place_id": "ChIJxZbHujq_2YgRdqaxvf4LcBQ"}
        ]))
if __name__ == '__main__':
    main()