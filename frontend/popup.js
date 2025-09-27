// popup.js - Chrome Extension Popup Logic

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Tab switching functionality
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked tab
    event.target.classList.add('active');
}

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

// API Functions
async function fetchMajorCourses(majorId = 'COMPSC:BS') {
    console.log('fetchMajorCourses called with majorId:', majorId);
    console.log('API_BASE_URL:', API_BASE_URL);
    const url = `${API_BASE_URL}/majors/${majorId}`;
    console.log('Fetching from URL:', url);
    
    try {
        console.log('Making fetch request...');
        const response = await fetch(url);
        console.log('Response received:', response);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Parsing JSON response...');
        const majorData = await response.json();
        console.log('Major data parsed:', majorData);
        return majorData;
    } catch (error) {
        console.error('Error fetching major courses:', error);
        console.error('Error details:', error.message);
        showNotification('Failed to load course data from API');
        return null;
    }
}

async function fetchCourseDetails(courseCode) {
    console.log('fetchCourseDetails called for:', courseCode);
    const url = `${API_BASE_URL}/courses/${courseCode}`;
    console.log('Fetching course from URL:', url);
    
    try {
        const response = await fetch(url);
        console.log('Course response for', courseCode, ':', response.status);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('Course not found, returning basic info for:', courseCode);
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
        console.log('Course data for', courseCode, ':', courseData);
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
    console.log('loadCoursesFromAPI called');
    const courseGrid = document.querySelector('.course-grid');
    console.log('Course grid found:', courseGrid);
    if (!courseGrid) {
        console.error('Course grid not found!');
        return;
    }

    // Show loading indicator
    courseGrid.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Loading courses from API...</div>';

    let majorData;
    try {
        majorData = await fetchMajorCourses();
        console.log('Major data received:', majorData);
        if (!majorData) {
            console.log('No major data, showing fallback courses');
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

    // Create course items from API data
    console.log('Checking majorData.required_courses:', majorData.required_courses);
    console.log('Is array?', Array.isArray(majorData.required_courses));
    
    if (majorData.required_courses && Array.isArray(majorData.required_courses)) {
        console.log('Processing', majorData.required_courses.length, 'courses');
        console.log('Course codes:', majorData.required_courses);
        
        for (const courseCode of majorData.required_courses) {
            console.log('Fetching details for course:', courseCode);
            const courseDetails = await fetchCourseDetails(courseCode);
            console.log('Course details for', courseCode, ':', courseDetails);
            const isCompleted = completedCourses.includes(courseCode);
            
            console.log('Creating course item for:', courseCode);
            const courseItem = createCourseItem(courseCode, courseDetails, isCompleted);
            console.log('Course item created:', courseItem);
            courseGrid.appendChild(courseItem);
            console.log('Course item appended to grid');
        }
        
        console.log('All courses processed. Course grid children count:', courseGrid.children.length);
    } else {
        console.log('No required courses found in major data');
        console.log('majorData structure:', majorData);
        courseGrid.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No courses found for this major.</div>';
    }

    // Add event listeners to new checkboxes
    addCheckboxEventListeners();
    updateProgress();
}

// Show fallback courses if API fails
function showFallbackCourses(courseGrid) {
    console.log('Showing fallback courses');
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
    console.log('createCourseItem called with:', { courseCode, courseDetails, isCompleted });
    
    const courseItem = document.createElement('div');
    courseItem.className = `course-checkbox-item ${isCompleted ? 'completed' : ''}`;
    
    const courseName = courseDetails ? courseDetails.name : courseCode;
    const courseCredits = courseDetails ? courseDetails.credits : 3;
    
    console.log('Course item details:', { courseName, courseCredits });
    
    courseItem.innerHTML = `
        <input type="checkbox" ${isCompleted ? 'checked' : ''} data-course-code="${courseCode}">
        <span>${courseCode}<br><small>${courseName} (${courseCredits} credits)</small></span>
    `;
    
    console.log('Course item HTML created:', courseItem.innerHTML);
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
    return new Promise((resolve) => {
        if (chrome && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get(['completedCourses'], function (result) {
                resolve(result.completedCourses || []);
            });
        } else {
            // Fallback to localStorage if Chrome storage is not available
            const completed = JSON.parse(localStorage.getItem('completedCourses') || '[]');
            resolve(completed);
        }
    });
}

// Toggle dropdown functionality
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

// Update progress function
function updateProgress() {
    const total = document.querySelectorAll('.course-checkbox-item').length;
    const completed = document.querySelectorAll('.course-checkbox-item.completed').length;
    const percentage = Math.floor((completed / total) * 100);

    // Update progress displays
    console.log(`Progress: ${completed}/${total} (${percentage}%)`);
}

// Course completion functionality
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, starting course loading...');
    
    // Test API connection first
    console.log('Testing API connection...');
    fetch('http://127.0.0.1:8000/api/majors/COMPSC:BS')
        .then(response => {
            console.log('Test API response:', response);
            console.log('Test API status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Test API data:', data);
        })
        .catch(error => {
            console.error('Test API error:', error);
        });
    
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

        // Allow Enter key to submit AI query (Shift+Enter for new line)
        aiInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                aiButton.click();
            }
        });
    }
});

// Save completed course to Chrome storage
function saveCompletedCourse(courseCode) {
    if (chrome && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(['completedCourses'], function (result) {
            const completed = result.completedCourses || [];
            if (!completed.includes(courseCode)) {
                completed.push(courseCode);
                chrome.storage.sync.set({ completedCourses: completed });
            }
        });
    } else {
        // Fallback to localStorage
        const completed = JSON.parse(localStorage.getItem('completedCourses') || '[]');
        if (!completed.includes(courseCode)) {
            completed.push(courseCode);
            localStorage.setItem('completedCourses', JSON.stringify(completed));
        }
    }
}

// Save completed course to user data
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

// Load progress from Chrome storage
function loadProgress() {
    if (chrome && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(['completedCourses'], function (result) {
            const completed = result.completedCourses || [];
            updateCourseCheckboxes(completed);
        });
    } else {
        // Fallback to localStorage
        const completed = JSON.parse(localStorage.getItem('completedCourses') || '[]');
        updateCourseCheckboxes(completed);
    }
}

// Update course checkboxes based on completed courses
function updateCourseCheckboxes(completed) {
    document.querySelectorAll('.course-checkbox-item input').forEach(checkbox => {
        const item = checkbox.closest('.course-checkbox-item');
        const courseCode = item.querySelector('span').textContent.split('\n')[0].trim();

        if (completed.includes(courseCode)) {
            checkbox.checked = true;
            item.classList.add('completed');
        }
    });

    updateProgress();
}

// Update progress display
function updateProgress() {
    const total = document.querySelectorAll('.course-checkbox-item').length;
    const completed = document.querySelectorAll('.course-checkbox-item.completed').length;
    const percentage = Math.floor((completed / total) * 100);

    // Update progress displays
    console.log(`Progress: ${completed}/${total} (${percentage}%)`);
}

// Open PantherSoft registration
function openRegistration() {
    chrome.tabs.create({
        url: 'https://my.fiu.edu'
    });
}

// Sync data from PantherSoft
function syncData() {
    // Send message to content script to scrape data
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0].url.includes('fiu.edu')) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'syncData' }, function (response) {
                if (response && response.courses) {
                    // Process scraped course data
                    processSyncedData(response.courses);
                }
            });
        } else {
            // If not on FIU site, open it first
            chrome.tabs.create({
                url: 'https://my.fiu.edu'
            });
        }
    });
}

// Process synced data from PantherSoft
function processSyncedData(courses) {
    // Update completed courses based on scraped data
    const completedCourses = courses.filter(course => course.status === 'Enrolled' || course.grade);
    const courseCodes = completedCourses.map(course => course.code);

    if (chrome && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ completedCourses: courseCodes }, function () {
            loadProgress(); // Reload UI
            showNotification('Data synced successfully!');
        });
    } else {
        // Fallback to localStorage
        localStorage.setItem('completedCourses', JSON.stringify(courseCodes));
        loadProgress(); // Reload UI
        showNotification('Data synced successfully!');
    }
}

// Note: openMaps function removed - now using embedded Google Maps iframe

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

// Check if user is on FIU website and show relevant features
if (chrome && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiu.edu')) {
            // User is on FIU site - show enhanced features
            document.body.classList.add('on-fiu-site');
        }
    });
}

// Handle messages from content script
if (chrome && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'courseDataFound') {
            processSyncedData(request.data);
        }
    });
}
