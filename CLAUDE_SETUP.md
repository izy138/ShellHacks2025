# Claude AI Integration Setup

This guide will help you connect your FIU AI agent frontend to your Claude API key.

## Prerequisites

1. **Claude API Key**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. **Python Dependencies**: Make sure you have the required packages installed

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Run the setup script to create your `.env` file:

```bash
python setup_env.py
```

This will prompt you for your Claude API key and create a `.env` file with all necessary environment variables.

### 3. Start the Backend Server

```bash
cd backend
python -m uvicorn app.main:app --reload
```

The server will start on `http://127.0.0.1:8000`

### 4. Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `frontend` folder
4. The FIU extension should now appear in your extensions

## How to Use

### In the Chrome Extension

1. **Ask Roary**: Click on the "Ask Roary" section in the side panel
2. **Type your question**: Ask about courses, prerequisites, degree planning, etc.
3. **Get AI responses**: Roary will provide personalized advice based on your academic progress

### Example Questions

- "What courses should I take next semester?"
- "What are the prerequisites for COP 3530?"
- "Am I on track to graduate on time?"
- "What electives should I consider for my Computer Science major?"

### API Endpoints

The backend now provides these AI endpoints:

- `POST /api/ai/chat` - General chat with Roary
- `POST /api/ai/recommendations` - Get course recommendations
- `POST /api/ai/course-requirements` - Check course requirements

## Features

### Personalized Responses
- Roary knows your major, completed courses, and current progress
- Provides tailored advice based on your academic history
- Considers prerequisites and degree requirements

### Smart Course Planning
- Recommends courses based on your completed coursework
- Checks prerequisites before suggesting courses
- Helps plan your semester schedule

### Campus Navigation
- Integrates with Google Maps for route planning
- Shows walking routes between classes
- Provides campus navigation assistance

## Troubleshooting

### Backend Issues
- Make sure your `.env` file has the correct `CLAUDE_API_KEY`
- Check that the backend server is running on port 8000
- Verify all dependencies are installed

### Frontend Issues
- Ensure the Chrome extension is loaded properly
- Check browser console for any JavaScript errors
- Make sure the backend is accessible from the frontend

### API Issues
- Verify your Claude API key is valid and has credits
- Check the backend logs for error messages
- Ensure CORS is properly configured

## Development

### Adding New AI Features

1. **Backend**: Add new endpoints in `backend/app/routes.py`
2. **Claude Service**: Extend `backend/app/services/claude_services.py`
3. **Frontend**: Update the UI in `frontend/content.js` and `frontend/popup.js`

### Testing

Test the integration by:
1. Starting the backend server
2. Loading the Chrome extension
3. Asking Roary questions about your academic progress
4. Checking the browser console and backend logs for any errors

## Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check the backend server logs
3. Verify your Claude API key is working
4. Ensure all dependencies are properly installed
