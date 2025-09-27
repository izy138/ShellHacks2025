from xml.etree.ElementTree import tostring
import requests
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='.venv/.env')  # Loads variables from .env

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
        response = requests.get(url)

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
    map_response = get_posts()

    if map_response:
        print(map_response)
    else:
        print('Failed to fetch posts from API.')

if __name__ == '__main__':
    main()