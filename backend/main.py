from typing import Union

from fastapi import FastAPI

import backend.app.google_api as google_api

app = FastAPI()

''' List of Calls between Frontend and Backend

 - Request list of all necessary classes for specific major, along with degree plan
 - Request user's saved schedule (?)
 - Request stuff from AI agent (What things in particular to be determined)

'''

#MAP STUFF

'''
    Since the map is gonna be the same between different use cases (same location in thing)
    the frontend will request what action it's taking, and the backend will return the map
    with the relevant markers/paths on it
'''

    # Show path between all locations in single day
    # Show location of class on map
    
    # How will the AI agent use the map?


'''List of Calls between Backend and Google APIs

 - Route - takes a sequence of classes and returns the route between them
 

'''



@app.get("/")
def read_root():
    return {"Howdy": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}