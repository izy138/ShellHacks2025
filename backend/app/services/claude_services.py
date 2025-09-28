import os
import anthropic
from dotenv import load_dotenv
from typing import Dict, List, Any

load_dotenv()

# Initialize Claude client
claude_api_key = os.getenv("CLAUDE_API_KEY")
if not claude_api_key or claude_api_key == "your_claude_api_key_here":
    print("⚠️  CLAUDE_API_KEY not set or using placeholder. AI features will be limited.")
    client = None
else:
    client = anthropic.Anthropic(api_key=claude_api_key)

class ClaudeAgent:
    def __init__(self):
        self.client = client
        self.system_prompt = """You are Roary, FIU's AI academic advisor. You help FIU students with:
- Course planning and scheduling
- Degree requirements and prerequisites
- Academic progress tracking
- Campus navigation and routes
- General FIU academic questions

You have access to FIU's course database and can help students:
1. Find courses they should take next based on their completed courses from their checklist
2. Check prerequisites and corequisites for courses
3. Plan their semester schedule
4. Track their degree progress
5. Navigate campus routes between classes

When providing course recommendations:
- Always consider the student's completed courses from their checklist
- Suggest courses that build logically on their completed coursework
- Check prerequisites before recommending courses
- Consider course difficulty and workload balance
- Prioritize courses that are prerequisites for future required courses
- Provide specific course codes and explain why each recommendation makes sense

Always be helpful, friendly, and provide accurate information about FIU academics."""

    async def chat(self, user_message: str, context: Dict[str, Any] = None) -> str:
        """
        Send a message to Claude and get a response
        
        Args:
            user_message: The user's question or message
            context: Additional context about the user (courses, major, etc.)
            
        Returns:
            Claude's response as a string
        """
        if not self.client:
            return """🤖 Hi! I'm Roary, your FIU AI academic advisor! 

I'd love to help you with course planning, prerequisites, and academic advice. However, I need to be properly configured with a Claude API key to provide full functionality.

To set up my AI capabilities:
1. Get a Claude API key from https://console.anthropic.com/
2. Update the CLAUDE_API_KEY in your .env file
3. Restart the backend server

For now, I can still help with basic course information from your database! What would you like to know about your courses?"""
        
        try:
            # Add context to the message if provided
            if context:
                context_info = f"\n\nUser Context:\n"
                if context.get('major'):
                    context_info += f"Major: {context['major']}\n"
                if context.get('completed_courses'):
                    context_info += f"Completed Courses: {', '.join(context['completed_courses'])}\n"
                if context.get('current_courses'):
                    context_info += f"Current Courses: {', '.join(context['current_courses'])}\n"
                
                full_message = context_info + f"\nUser Question: {user_message}"
            else:
                full_message = user_message

            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                system=self.system_prompt,
                messages=[
                    {"role": "user", "content": full_message}
                ]
            )
            
            return response.content[0].text
            
        except Exception as e:
            print(f"Error calling Claude API: {e}")
            return f"I'm sorry, I'm having trouble connecting to my AI service right now. Please try again later. Error: {str(e)}"

    async def get_course_recommendations(self, user_data: Dict[str, Any]) -> str:
        """
        Get course recommendations based on user's academic progress
        
        Args:
            user_data: Dictionary containing user's major, completed courses, etc.
            
        Returns:
            Course recommendations as a string
        """
        if not self.client:
            return "I need to be configured with a Claude API key to provide course recommendations. Please set up your API key first!"
        
        major = user_data.get('major', 'Unknown')
        completed_courses = user_data.get('completed_courses', [])
        
        message = f"""Based on my academic progress, what courses should I take next?

My major: {major}
Courses I've completed: {', '.join(completed_courses) if completed_courses else 'None yet'}

Please recommend 3-4 courses I should consider for next semester from my degree requirements. For each recommendation:
1. Explain why it's a good choice given my completed courses
2. Check if I meet the prerequisites
3. Suggest the optimal order to take them
4. Consider course load and difficulty balance

Focus on courses that build upon what I've already learned and keep me on track for graduation."""
        
        return await self.chat(message, user_data)

    async def check_course_requirements(self, course_code: str, user_data: Dict[str, Any] = None) -> str:
        """
        Check requirements for a specific course
        
        Args:
            course_code: The course code to check (e.g., "COP 3530")
            user_data: User's academic information
            
        Returns:
            Course requirements information
        """
        if not self.client:
            return f"I need to be configured with a Claude API key to check requirements for {course_code}. Please set up your API key first!"
        
        message = f"""What are the requirements for {course_code}? Please include:
- Prerequisites
- Corequisites  
- Credit hours
- Any other important requirements or notes

If you have information about whether I've met the prerequisites based on my completed courses, please let me know."""
        
        return await self.chat(message, user_data)

# Global instance
claude_agent = ClaudeAgent()
