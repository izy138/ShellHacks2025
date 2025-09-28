# FIU Panther Planner

To add the extension:
Go to chrome://extensions, enable Develope Mode on the top right, and click Load Unpacked and select frontend. 
Go to my.fiu.edu and start the extension. 
Select a major at the top to enable features.

## Inspiration
FIU Panther Planner was inspired by the common struggles FIU students face when navigating their academic journey. We recognized that students often struggle with understanding complex degree requirements and prerequisites, planning optimal course schedules that avoid conflicts, and tracking academic progress across multiple semesters. Additionally, many students find it challenging to navigate campus efficiently between classes and get personalized academic advice when they need it most.

## What it does
FIU Panther Planner is the all-in-one Chrome extension that transforms how college students navigate their academic journey. Simply select your major, and Panther Planner instantly generates a personalized checklist of all required courses, letting you track your progress easily. Our intelligent AI agent analyzes your academic progress and recommends which courses to take next to stay on track, while automatically detecting schedule conflicts to ensure your semester runs smoothly. Build your schedule directly in the extension, and our smart routing feature uses Google Maps to show you the optimal walking path between classes, so you'll never be late again. Plus, stay motivated with real-time tracking of your credits earned and GPA progress toward graduation. FIU Panther Planner turns the chaos of course planning into a streamlined, AI-powered experience that fits right in your browser, because your education deserves better than scattered spreadsheets and guesswork.

**Core Features:**
Degree Progress Tracking: Visual checklist showing completed vs. required courses for any major
AI Academic Advisor (Roary): Personalized course recommendations and academic guidance using Claude AI
Smart Schedule Planning: Intelligent course scheduling with conflict detection
Campus Navigation: Google Maps integration for optimal routes between classes
Real-time Data Sync: Automatically extracts course data from FIU's PantherSoft system
Prerequisite Checking: Validates course eligibility based on completed prerequisites

## How we built it
We built FIU Panther Planner using a modern tech stack designed for performance and scalability. The frontend utilizes Chrome Extension Manifest V3 with HTML5, CSS3, and JavaScript to create a seamless user experience directly within FIU's portal. Our backend is powered by FastAPI and Python 3.13, with MongoDB serving as our database solution and Pydantic for data validation.
For AI capabilities, we integrated Claude 3.5 Sonnet and Google Gemini 2.0 Flash to power our academic advisor. The system also leverages the Google Maps API for campus navigation and the Anthropic Claude API for intelligent course recommendations.
Our development process began with comprehensive data modeling to create detailed course and major schemas. We then built API endpoints to handle all academic data operations before developing the Chrome extension with seamless FIU portal integration. Finally, we implemented our AI system for various course planning use cases and conducted extensive testing with real FIU course data.

**Key Technologies:**
Frontend: Chrome Extension Manifest V3, HTML5, CSS3, JavaScript
Backend: FastAPI, Python 3.13, MongoDB, Pydantic
AI/ML: Claude 3.5 Sonnet, Google Gemini 2.0 Flash, Google ADK
APIs: Google Maps API, Anthropic Claude API
Database: MongoDB with comprehensive course and major data

## Challenges we ran into
Since this was the first hackathon for many team members, we encountered several significant challenges. One major hurdle was successfully integrating our web application to be compatible with the Chrome extension architecture. We also struggled with ensuring we had quality data for our course checklist and making sure our web scraping system would provide compatible data for the course scheduling feature. Additionally, integrating the Google ADK as our AI agent required careful attention to providing sufficient context.
One team member specifically struggled with writing effective tools for the AI agent to use. The project required building an academic advisor that could retrieve course information, calculate the difference between completed courses and remaining requirements, and recommend personalized plans. Finding the right balance between giving the agent enough freedom to edit student schedules while maintaining control and accuracy proved particularly challenging.
Another team member faced the complex task of integrating MongoDB with our FastAPI backend to store course, major, location, and user data. Gathering and uploading all the required data while maintaining database consistency and accessibility across the project was a significant undertaking. Additionally, connecting the frontend functionality to the backend properly required extensive troubleshooting and refinement.

## Accomplishments that we're proud of
We successfully created a comprehensive academic planning solution that addresses real student needs. Our AI advisor provides genuinely personalized course recommendations based on individual progress, while our visual progress tracking offers students a clear, intuitive interface for monitoring degree completion. Despite the complexity of the system, we achieved fast, responsive performance that doesn't slow down FIU's portal, and we designed a professional UI that seamlessly matches FIU's existing branding.

## What we learned
This project provided invaluable learning experiences across multiple domains. We gained extensive experience with FastAPI and MongoDB integration, developing skills in combining frontend and backend technologies to deliver a working product. We also expanded our knowledge of API development and learned how the Google Maps API functions through both independent work and collaboration with teammates.
We gained hands-on experience with the Google ADK framework for building agentic systems, which strengthened their skills in designing and implementing multi-agent workflows. We also learned important database concepts from teammates, improving our ability to structure and query data effectively to support the agent's decision-making processes.
As a team, we identified genuine student pain points in academic planning and mastered Chrome Extension development using Manifest V3, including content scripts and service workers. We learned advanced FastAPI patterns for API design and async operations, gained experience with multiple AI providers and prompt engineering, and developed skills in academic data modeling and MongoDB optimization. The project also taught us the importance of iterative development, starting with an MVP before adding advanced features, and highlighted the critical value of user testing with real FIU students and course data.

## What's next for FIU Panther Planner
Mobile App: Develop iOS/Android companion app for on-the-go planning
Additional Majors: Expand beyond Computer Science to all FIU majors
Advanced Scheduling: Add conflict resolution and optimal schedule generation
Smart Notifications: Alert students about registration deadlines and course availability
Enhanced AI: Train Roary on more FIU-specific data for better recommendations
Social Features: Allow students to share schedules and form study groups

## Dependencies
This project utilizes the following Python libraries: fastapi, motor, uvicorn, pydantic, python-dotenv, python-multipart, anthropic, requests, google-adk