https://devpost.com/software/fiu-panther-planner

### Start Backend:
```python -m uvicorn app.main:app --reload```

### Start Extension:
Go to chrome://extensions
Turn on Developer mode of the top right.
Click 'Load Unpacked' at the top left, and select the frontend folder of the project.
Click on chrome extension or go to my.fiu.edu

Google Maps API's used:
Maps Static API, Places API, Geocoding API, Routes API.

### Dependenciesx
This project utilizes the following Python libraries: fastapi, motor, uvicorn, pydantic, python-dotenv, python-multipart, anthropic, requests, google-adk

#### FIU Panther Planner

#### Inspiration
FIU Panther Planner was inspired by the common difficulties students face when trying to understand complex degree requirements, plan conflict-free schedules, track their progress, and navigate campus between classes.

#### What it does
FIU Panther Planner is an all-in-one Chrome extension designed to streamline academic planning. Once a student selects their major, it generates a personalized checklist of all required courses. An intelligent AI agent analyzes their progress to recommend which courses to take next and automatically detects schedule conflicts. The extension also integrates Google Maps to provide the most efficient walking routes between classes, helping students manage their time effectively.

#### How we built it
The planner was built with a modern tech stack. The frontend is a Chrome Extension (Manifest V3) using HTML5, CSS3, and JavaScript. The backend is powered by FastAPI and Python with a MongoDB database. For its AI capabilities, the system integrates Claude 3.5 Sonnet and Google Gemini 2.0 Flash, along with the Google Maps and Anthropic Claude APIs.

#### Challenges we ran into
The primary challenges included integrating the web application into the Chrome extension architecture, ensuring high-quality data for the course checklist, and developing effective tools for the AI agent. Connecting the FastAPI backend to the MongoDB database and making sure all components worked together seamlessly required extensive troubleshooting.

#### Accomplishments we're proud of
We successfully created a comprehensive solution that offers genuinely personalized course recommendations and a clear, visual interface for tracking degree progress. We are proud of achieving a fast, responsive user experience that integrates smoothly with FIU's portal and matches its branding.

#### What we learned
This project provided invaluable experience in full-stack development, particularly with FastAPI and MongoDB integration. We gained hands-on skills in Chrome Extension development, API design, and building AI agentic systems. We also learned the importance of iterative development, starting with an MVP, and the critical value of user testing.

#### What's next for FIU Panther Planner
* **Mobile App:** Develop an iOS/Android companion app for on-the-go planning.
* **Expanded Majors:** Add support for all majors offered at FIU.
* **Advanced Scheduling:** Introduce automatic conflict resolution and optimal schedule generation.
* **Smart Notifications:** Alert students about registration deadlines and course availability.
* **Enhanced AI:** Train the AI on more FIU-specific data for better recommendations.
* **Social Features:** Allow students to share schedules and form study groups.

