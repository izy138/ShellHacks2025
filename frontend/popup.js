// Fetch all majors from API
async function fetchAllMajors() {
    try {
        const response = await fetch(`${API_BASE_URL}/majors`);
        if (!response.ok) throw new Error('Failed to fetch majors');
        return await response.json();
    } catch (error) {
        console.error('Error fetching all majors:', error);
        return [];
    }
}

// Populate major dropdown and handle change
async function setupMajorDropdown() {
    const majorDropdown = document.getElementById('major-dropdown');
    if (!majorDropdown) return;
    const majors = await fetchAllMajors();
    console.log('Fetched majors:', majors);
    majorDropdown.innerHTML = '<option value="">Select your major...</option>';
    majors.forEach(major => {
        const option = document.createElement('option');
        option.value = major.major_id;
        option.textContent = major.name;
        majorDropdown.appendChild(option);
    });
    // Set current major if available
    const userData = await getUserData();
    if (userData.major) {
        majorDropdown.value = userData.major;
    }
    majorDropdown.addEventListener('change', async function () {
        const selectedMajor = this.value;
        if (selectedMajor) {
            const userData = await getUserData();
            userData.major = selectedMajor;
            await saveUserData(userData);
            location.reload(); // reload to update checklist
        }
    });
}
// popup.js - Chrome Extension Popup Logic

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Google Maps and Polyline functionality
let map;
let polylines = [];

function initMap() {
    // FIU coordinates
    const fiuLocation = { lat: 25.7565, lng: -80.3760 };
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: fiuLocation,
        mapTypeId: 'roadmap'
    });
    
    // Add FIU marker
    new google.maps.Marker({
        position: fiuLocation,
        map: map,
        title: 'Florida International University'
    });
    
    // Add encoded polyline route
    addEncodedPolyline();
}

function addEncodedPolyline() {
    // Encoded polyline for FIU campus route
    const encodedPolyline = "icg|CdlpiNbAEV?pBGZI|HYDbB@lEDT@n@|@EAYdA??HbACvA?J??@jB@AIZ?B^?z@C@L?Kr@A\\ZFVL@B|@C@JNH?lAZRFNJD@h@HDBH@LFHN@A?PTvDBF]DEd@Ce@BEDG\\@l@a@@g@\\K^Ur@@ZBTWTCXB\\LTFBVfA?rBl@B";
    
    try {
        // Decode the polyline
        const path = google.maps.geometry.encoding.decodePath(encodedPolyline);
        
        // Create polyline with different colors for segments
        const polyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 3
        });
        
        polyline.setMap(map);
        polylines.push(polyline);
        
        console.log('Added encoded polyline route to map');
        
        // Fit map to show the entire route
        const bounds = new google.maps.LatLngBounds();
        path.forEach(point => bounds.extend(point));
        map.fitBounds(bounds);
        
    } catch (error) {
        console.error('Error adding polyline:', error);
    }
}

function addMultiplePolylines(polylineData) {
    // Clear existing polylines
    polylines.forEach(polyline => polyline.setMap(null));
    polylines = [];
    
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    
    polylineData.forEach((data, index) => {
        try {
            const path = google.maps.geometry.encoding.decodePath(data.encodedPolyline);
            const color = colors[index % colors.length];
            
            const polyline = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: color,
                strokeOpacity: 1.0,
                strokeWeight: 3
            });
            
            polyline.setMap(map);
            polylines.push(polyline);
            
        } catch (error) {
            console.error(`Error adding polyline ${index}:`, error);
        }
    });
}

// Example function to add multiple route segments
function addRouteSegments() {
    const routeData = [
        {
            encodedPolyline: "icg|CdlpiNbAEV?pBGZI|HYDbB@lEDT@n@|@EAYdA??HbACvA?J??@jB@AIZ?B^?z@C@L?Kr@A\\ZFVL@B|@C@JNH?lAZRFNJD@h@HDBH@LFHN@A?PTvDBF]DEd@Ce@BEDG\\@l@a@@g@\\K^Ur@@ZBTWTCXB\\LTFBVfA?rBl@B",
            name: "Main Campus Route"
        },
        {
            encodedPolyline: "icg|CdlpiNbAEV?pBGZI|HYDbB@lEDT@n@|@EAYdA??HbACvA?J??@jB@AIZ?B^?z@C@L?Kr@A\\ZFVL@B|@C@JNH?lAZRFNJD@h@HDBH@LFHN@A?PTvDBF]DEd@Ce@BEDG\\@l@a@@g@\\K^Ur@@ZBTWTCXB\\LTFBVfA?rBl@B",
            name: "Alternative Route"
        }
    ];
    
    addMultiplePolylines(routeData);
    console.log('Added multiple route segments with different colors');
}

// User ID Management
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Only store user ID in localStorage, sync all user info with backend
function getUserId() {
    let userId = localStorage.getItem('fiu_degree_tracker_user_id');
    if (!userId) {
        userId = generateUserId();
        localStorage.setItem('fiu_degree_tracker_user_id', userId);
        // Create user in backend with valid Schedule for blocked_time
        const defaultSchedule = {
            blocks: {
                "Monday": [],
                "Tuesday": [],
                "Wednesday": [],
                "Thursday": [],
                "Friday": [],
                "Saturday": [],
                "Sunday": []
            }
        };
        fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, major: 'COMPSC:BS', taken_courses: [], current_courses: [], blocked_time: defaultSchedule })
        }).then(res => {
            if (!res.ok) console.error('Failed to create user in backend');
        });
        console.log('Generated new user ID:', userId);
    }
    return userId;
}

async function getUserData() {
    const userId = getUserId();
    try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!res.ok) throw new Error('User not found');
        return await res.json();
    } catch (e) {
        // If not found, create user in backend with valid Schedule for blocked_time
        const defaultSchedule = {
            blocks: {
                "Monday": [],
                "Tuesday": [],
                "Wednesday": [],
                "Thursday": [],
                "Friday": [],
                "Saturday": [],
                "Sunday": []
            }
        };
        await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, major: 'COMPSC:BS', taken_courses: [], current_courses: [], blocked_time: defaultSchedule })
        });
        return { user_id: userId, major: 'COMPSC:BS', taken_courses: [], current_courses: [], blocked_time: defaultSchedule };
    }
}

async function saveUserData(data) {
    const userId = getUserId();
    await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    console.log('Synced user data to backend for:', userId);
}

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
async function fetchMajorCourses(majorId) {
    if (!majorId) {
        console.warn('No majorId provided to fetchMajorCourses');
        return null;
    }
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
    console.log('fetchCourseDetails called for:', courseCode);
    
    const url = `${API_BASE_URL}/courses/${encodeURIComponent(courseCode)}`;
    console.log('Fetching course from URL:', url);
    
    try {
        const response = await fetch(url);
        console.log('Course response for', courseCode, ':', response.status);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('Course not found, returning basic info for:', courseCode);
                // Course not found, return basic info
                return {
                    code: courseCode,
                    name: courseCode,
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
        console.error(`Error fetching course ${courseCode}:`, error);
        // Return basic course info as fallback
        return {
            code: courseCode,
            name: courseCode,
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
    let userData;
    try {
        userData = await getUserData();
        const selectedMajorId = userData.major || '';
        majorData = await fetchMajorCourses(selectedMajorId);
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

    // Use user.taken_courses for completed courses
    const completedCourses = userData.taken_courses || [];

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
    // After rendering checklist, show yellow warning for completed courses missing prereqs
    setTimeout(async () => {
        const userDataReload = await getUserData();
        const takenCoursesReload = userDataReload.taken_courses || [];
        document.querySelectorAll('.course-checkbox-item input').forEach(async cb => {
            if (cb.checked) {
                const courseItem = cb.closest('.course-checkbox-item');
                const code = cb.getAttribute('data-course-code');
                const details = await fetchCourseDetails(code);
                const prereqsArr = details.prereqs || [];
                let missing = [];
                for (const prereq of prereqsArr) {
                    const opts = prereq.split('|').map(s => s.trim());
                    if (!opts.some(opt => takenCoursesReload.includes(opt))) {
                        missing.push(prereq);
                    }
                }
                if (missing.length > 0) {
                    courseItem.classList.add('prereq-warning');
                } else {
                    courseItem.classList.remove('prereq-warning');
                }
            }
        });
    }, 0);

    // Add search/filter functionality for checklist
    const filterInput = document.querySelector('.filter-input');
    if (filterInput) {
        filterInput.addEventListener('input', function () {
            const query = this.value.trim().toLowerCase();
            document.querySelectorAll('.course-checkbox-item').forEach(item => {
                const code = item.querySelector('input').getAttribute('data-course-code').toLowerCase();
                const name = item.querySelector('span').textContent.toLowerCase();
                if (code.includes(query) || name.includes(query)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    updateProgress();
}

// Show fallback courses if API fails
function showFallbackCourses(courseGrid) {
    console.log('No pending classes for user.');
        courseGrid.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                font-size: 1.2em;
                color: #666;
                background: rgba(255,255,255,0.8);
            ">
                You don't have any pending classes
            </div>
        `;
        courseGrid.style.display = 'flex';
        courseGrid.style.alignItems = 'center';
        courseGrid.style.justifyContent = 'center';
        courseGrid.style.height = '300px';
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
    function addCheckboxEventListeners() {
        document.querySelectorAll('.course-checkbox-item input').forEach(checkbox => {
            checkbox.addEventListener('change', async function () {
                const item = this.closest('.course-checkbox-item');
                const courseCode = this.getAttribute('data-course-code');

                // Get course details to check prereqs
                const courseDetails = await fetchCourseDetails(courseCode);
                const prereqs = courseDetails.prereqs || [];
                // Get user's taken courses
                const userData = await getUserData();
                const takenCourses = userData.taken_courses || [];

                // Check if all prereqs are completed
                let missingPrereqs = [];
                for (const prereq of prereqs) {
                    // Handle prereq alternatives (e.g. "MAC 1140|MAC 1147")
                    const options = prereq.split('|').map(s => s.trim());
                    if (!options.some(opt => takenCourses.includes(opt))) {
                        missingPrereqs.push(prereq);
                    }
                }

                if (this.checked) {
                    if (missingPrereqs.length > 0) {
                        item.classList.add('prereq-warning');
                        alert(`Warning: You have not completed the following prerequisites for ${courseCode}:\n${missingPrereqs.join(', ')}`);
                    } else {
                        item.classList.remove('prereq-warning');
                    }
                    item.classList.add('completed');
                    await saveCompletedCourse(courseCode);
                } else {
                    item.classList.remove('completed');
                    item.classList.remove('prereq-warning');
                    await removeCompletedCourse(courseCode);
                }

                // After any change, check all courses for prereq status and update warning effect
                document.querySelectorAll('.course-checkbox-item input').forEach(async cb => {
                    const courseItem = cb.closest('.course-checkbox-item');
                    const code = cb.getAttribute('data-course-code');
                    const details = await fetchCourseDetails(code);
                    const prereqsArr = details.prereqs || [];
                    const user = await getUserData();
                    const takenArr = user.taken_courses || [];
                    let missing = [];
                    for (const prereq of prereqsArr) {
                        const opts = prereq.split('|').map(s => s.trim());
                        if (!opts.some(opt => takenArr.includes(opt))) {
                            missing.push(prereq);
                        }
                    }
                    if (cb.checked && missing.length > 0) {
                        courseItem.classList.add('prereq-warning');
                    } else {
                        courseItem.classList.remove('prereq-warning');
                    }
                });
                updateProgress();
            });
        });
    }
// Add CSS for prereq-warning (red checkbox + yellow background)
const style = document.createElement('style');
style.innerHTML = `
    .prereq-warning input[type=checkbox] { accent-color: red !important; }
    .prereq-warning { background-color: #fff8b0 !important; border: 2px solid #ffd700 !important; }
`;
document.head.appendChild(style);

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

// AI Agent dropdown functionality
function toggleAIDropdown() {
    const content = document.getElementById('ai-content');
    const arrow = document.getElementById('ai-arrow');

    const isCollapsed = content.classList.contains('collapsed');

    if (isCollapsed) {
        // Expand
        content.classList.remove('collapsed');
        arrow.classList.remove('rotated');
    } else {
        // Collapse
        content.classList.add('collapsed');
        arrow.classList.add('rotated');
    }
}

// Add event listeners for dropdown headers
document.addEventListener('DOMContentLoaded', function() {
    setupMajorDropdown();
    // AI Agent dropdown
    const aiHeader = document.getElementById('ai-header');
    if (aiHeader) {
        aiHeader.addEventListener('click', toggleAIDropdown);
    }

    // Dropdown headers
    const checklistHeader = document.getElementById('checklist-header');
    const routesHeader = document.getElementById('routes-header');
    const scheduleHeader = document.getElementById('schedule-header');
    const trackingHeader = document.getElementById('tracking-header');
    
    if (checklistHeader) {
        checklistHeader.addEventListener('click', () => toggleDropdown('checklist'));
    }
    if (routesHeader) {
        routesHeader.addEventListener('click', () => toggleDropdown('routes'));
    }
    if (scheduleHeader) {
        scheduleHeader.addEventListener('click', () => toggleDropdown('schedule'));
    }
    if (trackingHeader) {
        trackingHeader.addEventListener('click', () => toggleDropdown('tracking'));
    }
    
    // Prompt template buttons
    const nextCoursesBtn = document.getElementById('next-courses-btn');
    const courseRequirementsBtn = document.getElementById('course-requirements-btn');
    const aiInput = document.querySelector('.ai-input');
    
    if (nextCoursesBtn && aiInput) {
        nextCoursesBtn.addEventListener('click', () => {
            aiInput.value = "Given the courses I've completed, what courses should I take next to stay on track for graduation?";
        });
    }
    
    if (courseRequirementsBtn && aiInput) {
        courseRequirementsBtn.addEventListener('click', () => {
            aiInput.value = "What are the requirements for this course? Include prerequisites and corequisites.";
        });
    }
});

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
    
    // Initialize user data
    const userId = getUserId();
    const userData = getUserData();
    console.log('User ID:', userId);
    console.log('User data:', userData);
    
    // Set major dropdown to user's saved major
    const majorDropdown = document.getElementById('major-dropdown');
    if (majorDropdown && userData.major) {
        majorDropdown.value = userData.major;
    }
    
    // Add event listener for major dropdown changes
    if (majorDropdown) {
        majorDropdown.addEventListener('change', function() {
            const selectedMajor = this.value;
            const userData = getUserData();
            userData.major = selectedMajor;
            saveUserData(userData);
            console.log('Saved major selection:', selectedMajor);
            
            // Reload courses for the new major
            loadCoursesFromAPI();
        });
    }
    
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
    
    // Initialize Google Maps when routes dropdown is opened
    const routesHeader = document.getElementById('routes-header');
    if (routesHeader) {
        routesHeader.addEventListener('click', function() {
            // Small delay to ensure the dropdown content is visible
            setTimeout(() => {
                if (document.getElementById('map') && !map) {
                    initMap();
                }
            }, 100);
        });
    }
});

// Save completed course to user data
// Update user.taken_courses in backend when checking/unchecking a class
async function saveCompletedCourse(courseCode) {
    try {
        const userData = await getUserData();
        if (!userData.taken_courses.includes(courseCode)) {
            userData.taken_courses.push(courseCode);
            await saveUserData(userData);
            console.log('Added to taken_courses:', courseCode);
        }
    } catch (error) {
        console.error('Error saving completed course:', error);
    }
}

async function removeCompletedCourse(courseCode) {
    try {
        const userData = await getUserData();
        const index = userData.taken_courses.indexOf(courseCode);
        if (index > -1) {
            userData.taken_courses.splice(index, 1);
            await saveUserData(userData);
            console.log('Removed from taken_courses:', courseCode);
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