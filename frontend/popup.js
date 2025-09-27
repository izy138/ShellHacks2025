// popup.js - Chrome Extension Popup Logic

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Dropdown toggle functionality
function toggleDropdown(sectionName) {
    const content = document.getElementById(sectionName + '-content');
    const arrow = document.getElementById(sectionName + '-arrow');
    const header = arrow.parentElement;

    const isExpanded = content.classList.contains('expanded');

    if (isExpanded) {
        // Collapse
        content.classList.remove('expanded');
        arrow.classList.remove('rotated');
        header.classList.remove('active');
    } else {
        // Expand
        content.classList.add('expanded');
        arrow.classList.add('rotated');
        header.classList.add('active');
    }
}

// Make toggleDropdown globally available
window.toggleDropdown = toggleDropdown;

// API Functions
async function fetchMajorCourses(majorId = 'COMPSC:BS') {
    const url = `${API_BASE_URL}/majors/${majorId}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const majorData = await response.json();
        return majorData;
    } catch (error) {
        console.error('Error fetching major courses:', error);
        showNotification('Failed to load course data from API');
        return null;
    }
}

async function fetchCourseDetails(courseCode) {
    const url = `${API_BASE_URL}/courses/${courseCode}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                // Course not found, return basic info
                return {
                    code: formattedCode,
                    name: formattedCode,
                    credits: 3,
                    prereqs: [],
                    coreqs: []
                };
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const courseData = await response.json();
        return courseData;
    } catch (error) {
        console.error(`Error fetching course ${formattedCode}:`, error);
        // Return basic course info as fallback
        return {
            code: formattedCode,
            name: formattedCode,
            credits: 3,
            prereqs: [],
            coreqs: []
        };
    }
}

// Load courses from API and populate checklist
async function loadCoursesFromAPI() {
    const courseGrid = document.querySelector('.course-grid');
    if (!courseGrid) {
        console.error('Course grid not found!');
        return;
    }

    // Show loading indicator
    courseGrid.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Loading courses from API...</div>';

    let majorData;
    try {
        majorData = await fetchMajorCourses();
        if (!majorData) {
            showFallbackCourses(courseGrid);
            return;
        }
    } catch (error) {
        console.error('Error fetching major data:', error);
        showFallbackCourses(courseGrid);
        return;
    }

    // Clear loading indicator
    courseGrid.innerHTML = '';

    // Load completed courses from storage
    const completedCourses = await getCompletedCourses();
    
    if (majorData.required_courses && Array.isArray(majorData.required_courses)) {
        for (const courseCode of majorData.required_courses) {
            const courseDetails = await fetchCourseDetails(courseCode);
            const isCompleted = completedCourses.includes(courseCode);
            
            const courseItem = createCourseItem(courseCode, courseDetails, isCompleted);
            courseGrid.appendChild(courseItem);
        }
    } else {
        courseGrid.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No courses found for this major.</div>';
    }

    // Add event listeners to new checkboxes
    addCheckboxEventListeners();
    updateProgress();
}

// Show fallback courses if API fails
function showFallbackCourses(courseGrid) {
    const fallbackCourses = [
        { code: 'COP 2210', name: 'Programming I', credits: 3 },
        { code: 'COP 3337', name: 'Programming II', credits: 3 },
        { code: 'COP 3530', name: 'Data Structures', credits: 3 },
        { code: 'MAC 2311', name: 'Calculus I', credits: 4 },
        { code: 'MAC 2312', name: 'Calculus II', credits: 4 },
        { code: 'STA 3033', name: 'Probability & Statistics', credits: 3 }
    ];
    
    courseGrid.innerHTML = '';
    fallbackCourses.forEach(course => {
        const courseItem = createCourseItem(course.code, course, false);
        courseGrid.appendChild(courseItem);
    });
    
    addCheckboxEventListeners();
    updateProgress();
}

// Create a course item element
function createCourseItem(courseCode, courseDetails, isCompleted = false) {
    const courseItem = document.createElement('div');
    courseItem.className = `course-checkbox-item ${isCompleted ? 'completed' : ''}`;
    
    const courseName = courseDetails ? courseDetails.name : courseCode;
    const courseCredits = courseDetails ? courseDetails.credits : 3;
    
    courseItem.innerHTML = `
        <input type="checkbox" ${isCompleted ? 'checked' : ''} data-course-code="${courseCode}">
        <span>${courseCode}<br><small>${courseName} (${courseCredits} credits)</small></span>
    `;
    
    return courseItem;
}

// Add event listeners to all checkboxes
function addCheckboxEventListeners() {
    document.querySelectorAll('.course-checkbox-item input').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const item = this.closest('.course-checkbox-item');
            const courseCode = this.getAttribute('data-course-code');

            if (this.checked) {
                item.classList.add('completed');
                saveCompletedCourse(courseCode);
            } else {
                item.classList.remove('completed');
                removeCompletedCourse(courseCode);
            }
            updateProgress();
        });
    });
}

// Get completed courses from storage
async function getCompletedCourses() {
    try {
        const userData = getUserData();
        return userData.completedCourses || [];
    } catch (error) {
        console.error('Error getting completed courses:', error);
        return [];
    }
}

// Save completed course to Chrome storage
function saveCompletedCourse(courseCode) {
    try {
        const userData = getUserData();
        if (!userData.completedCourses.includes(courseCode)) {
            userData.completedCourses.push(courseCode);
            saveUserData(userData);
            console.log('Saved completed course:', courseCode);
        }
    } catch (error) {
        console.error('Error saving completed course:', error);
    }
}

// Remove completed course from user data
function removeCompletedCourse(courseCode) {
    try {
        const userData = getUserData();
        const index = userData.completedCourses.indexOf(courseCode);
        if (index > -1) {
            userData.completedCourses.splice(index, 1);
            saveUserData(userData);
            console.log('Removed completed course:', courseCode);
        }
    } catch (error) {
        console.error('Error removing completed course:', error);
    }
}

// Update progress function
function updateProgress() {
    const total = document.querySelectorAll('.course-checkbox-item').length;
    const completed = document.querySelectorAll('.course-checkbox-item.completed').length;
    const percentage = Math.floor((completed / total) * 100);

    // Update progress displays
    console.log(`Progress: ${completed}/${total} (${percentage}%)`);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: #27ae60;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        font-size: 0.8rem;
        z-index: 1000;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Load courses from API
    loadCoursesFromAPI();

    // AI Agent functionality
    const aiButton = document.querySelector('.ai-button');
    const aiInput = document.querySelector('.ai-input');
    
    if (aiButton && aiInput) {
        aiButton.addEventListener('click', function () {
            const query = aiInput.value.trim();
            if (query) {
                alert(`AI: Looking up information about "${query}"...`);
                aiInput.value = '';
            }
        });

        // Allow Enter key to submit AI query
        aiInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                aiButton.click();
            }
        });
    }
});
