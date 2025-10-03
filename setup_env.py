#!/usr/bin/env python3
"""
Setup script to create .env file with Claude API key
Run this script to set up your environment variables
"""

import os

def create_env_file():
    """Create .env file with required environment variables"""
    
    # Check if .env already exists
    if os.path.exists('.env'):
        print("⚠️  .env file already exists!")
        response = input("Do you want to overwrite it? (y/N): ")
        if response.lower() != 'y':
            print("❌ Setup cancelled.")
            return
    
    # Get Claude API key from user
    print("🔑 Please enter your Claude API key:")
    print("   You can get it from: https://console.anthropic.com/")
    claude_key = input("Claude API Key: ").strip()
    
    if not claude_key:
        print("❌ Claude API key is required!")
        return
    
    # Create .env content
    env_content = f"""# Environment variables for ShellHacks2025 project

# Claude API Key for AI agent functionality
CLAUDE_API_KEY={claude_key}

# Google API Key for Maps and other Google services
GOOGLE_API_KEY=

# MongoDB connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=shellhacks2025

# Backend API base URL
API_BASE=http://127.0.0.1:8000/api
"""
    
    # Write .env file
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ .env file created successfully!")
        print("🚀 You can now start your backend server with:")
        print("   cd backend && python -m uvicorn app.main:app --reload")
        
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")

if __name__ == "__main__":
    print("🎓 ShellHacks2025 Environment Setup")
    print("=" * 40)
    create_env_file()
