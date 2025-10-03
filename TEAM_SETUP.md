# Team Setup Guide for FIU AI Agent

## Quick Start for Teammates

### 1. Prerequisites
- Python 3.8+ installed
- Chrome browser
- Git installed

### 2. Clone and Setup
```bash
# Clone the repository
git clone [your-repo-url]
cd ShellHacks2025

# Install dependencies
cd backend
pip install -r requirements.txt
```

### 3. Get Claude API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up for an account
3. Create a new API key
4. Copy the key (starts with `sk-ant-api03-`)

### 4. Create Environment File
```bash
# Create .env file in the project root
cat > .env << 'EOF'
# Claude API Key for AI agent functionality
CLAUDE_API_KEY=your_claude_api_key_here

# Google API Key for Maps and other Google services
GOOGLE_API_KEY=

# MongoDB connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=shellhacks2025

# Backend API base URL
API_BASE=http://127.0.0.1:8000/api
EOF
```

**Important**: Replace `your_claude_api_key_here` with your actual API key!

### 5. Start Backend Server
```bash
cd backend
python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Keep this terminal open - the server needs to stay running.

### 6. Load Chrome Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `frontend` folder from your project
5. The FIU extension should now appear in your extensions

### 7. Test the AI Integration
1. Open the extension (click the FIU icon in Chrome toolbar)
2. Go to the "Ask Roary" section
3. Click "What should I take next?" button
4. You should see AI recommendations appear!

## Troubleshooting

### Backend Issues
- **Port 8000 in use**: Kill existing processes or use a different port
- **Module not found**: Make sure you're in the `backend` directory and ran `pip install -r requirements.txt`
- **API key error**: Check your `.env` file has the correct `CLAUDE_API_KEY`

### Extension Issues
- **Extension not loading**: Make sure you selected the `frontend` folder, not the root project folder
- **AI not responding**: Check that the backend server is running on port 8000
- **CORS errors**: The backend has CORS enabled for all origins

### API Key Issues
- **Invalid key**: Make sure you copied the full API key from Anthropic Console
- **No credits**: Check your Anthropic account has available credits
- **Rate limits**: Claude has rate limits - if you hit them, wait a few minutes

## Features Available

Once set up, you'll have access to:

✅ **AI Academic Advisor**: Ask Roary questions about courses and planning
✅ **Course Recommendations**: Get personalized suggestions based on your progress
✅ **Prerequisite Checking**: Verify course requirements before enrolling
✅ **Degree Tracking**: Monitor your progress toward graduation
✅ **Campus Navigation**: Get routes between classes
✅ **Class Checklist**: Track completed courses

## Team Development

### Making Changes
1. Make your changes to the code
2. The backend will auto-reload (if using `--reload` flag)
3. Refresh the Chrome extension to see frontend changes
4. Test your changes thoroughly

### Sharing Updates
- Use Git to share code changes
- Update this setup guide if you add new dependencies
- Test on multiple machines to ensure compatibility

## Support

If you run into issues:
1. Check the browser console for JavaScript errors
2. Check the backend terminal for Python errors
3. Verify your API key is working at [Anthropic Console](https://console.anthropic.com/)
4. Make sure all dependencies are installed correctly

Happy coding! 🎓
