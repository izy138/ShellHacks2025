// content.js - Content Script for FIU Website Integration

// This script runs on FIU pages to extract course data and enhance the interface

(function () {
    'use strict';

    // Prevent duplicate initialization
    if (window.fiuTrackerInitialized) {
        console.log('FIU Degree Tracker: Already initialized');
        return;
    }
    window.fiuTrackerInitialized = true;

    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeExtension);
    } else {
        initializeExtension();
    }

    function initializeExtension() {
        console.log('FIU Degree Tracker: Initializing on', window.location.href);
        console.log('Extension ID:', chrome.runtime.id);
        console.log('Current URL:', window.location.href);

        // Create the side panel
        createSidePanel();

        // Add toggle button
        addToggleButton();

        // Check what FIU page we're on and add appropriate functionality
        if (window.location.href.includes('my.fiu.edu')) {
            handleMyFIUPage();
        } else if (window.location.href.includes('panthersoft')) {
            handlePantherSoftPage();
        }

        // Listen for messages from background script
        chrome.runtime.onMessage.addListener(handlePopupMessages);
        
        // Send ready message to background script
        chrome.runtime.sendMessage({ action: 'contentScriptReady' })
            .catch(error => console.log('Background script not ready:', error));
            
        // Test network connectivity immediately
        testNetworkConnectivity();
        
        // Add a simple visual indicator that the extension is working
        addExtensionIndicator();
    }
    
    async function testNetworkConnectivity() {
        console.log('Testing network connectivity...');
        try {
            const response = await fetch('http://127.0.0.1:8000/', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Network test response:', response.status, response.ok);
            if (response.ok) {
                const data = await response.json();
                console.log('Network test data:', data);
            }
        } catch (error) {
            console.error('Network test failed:', error);
        }
    }
    
    function addExtensionIndicator() {
        // Add a small indicator that the extension is loaded
        const indicator = document.createElement('div');
        indicator.id = 'fiu-extension-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #013677;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        indicator.textContent = '🎓 FIU Extension Loaded';
        document.body.appendChild(indicator);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 3000);
    }

    function handleMyFIUPage() {
        console.log('FIU Degree Tracker: On MyFIU page');

        // Add degree tracker widget to dashboard
        addDashboardWidget();

        // Monitor for navigation changes (SPA behavior)
        observePageChanges();
    }

    function handlePantherSoftPage() {
        console.log('FIU Degree Tracker: On PantherSoft page');

        // Extract course registration data
        if (window.location.href.includes('class_search') ||
            window.location.href.includes('enrollment')) {
            extractCourseData();
            enhanceRegistrationInterface();
        }

        // Extract transcript data if on grades page
        if (window.location.href.includes('grades') ||
            window.location.href.includes('transcript')) {
            extractTranscriptData();
        }
    }

    function createSidePanel() {
        // Remove existing panel if it exists
        const existingPanel = document.getElementById('fiu-tracker-side-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // Create the side panel container
        const sidePanel = document.createElement('div');
        sidePanel.id = 'fiu-tracker-side-panel';
        sidePanel.className = 'fiu-tracker-side-panel';
        
        // Create the side panel content directly
        sidePanel.innerHTML = createSidePanelContent();
        
        // Add event listeners for dropdown functionality
        addDropdownEventListeners(sidePanel);
        
        // Set the banner image dynamically
        setBannerImage(sidePanel);
        
        // Load the popup.js functionality
        loadPopupFunctionality(sidePanel);
        
        document.body.appendChild(sidePanel);
    }

    function addToggleButton() {
        // Remove existing toggle if it exists
        const existingToggle = document.getElementById('fiu-tracker-toggle');
        if (existingToggle) {
            existingToggle.remove();
        }

        const toggle = document.createElement('div');
        toggle.id = 'fiu-tracker-toggle';
        toggle.className = 'fiu-tracker-toggle';
        toggle.innerHTML = '🎓';
        
        toggle.addEventListener('click', function() {
            toggleSidePanel();
        });

        document.body.appendChild(toggle);
    }

    function toggleSidePanel() {
        const panel = document.getElementById('fiu-tracker-side-panel');
        const toggle = document.getElementById('fiu-tracker-toggle');
        
        if (panel && toggle) {
            if (panel.classList.contains('show')) {
                // Hide panel
                panel.classList.remove('show');
                panel.classList.add('hide');
                toggle.classList.remove('panel-open');
                document.body.classList.remove('fiu-tracker-panel-open');
                
                // Reset panel position after animation
                setTimeout(() => {
                    panel.style.display = 'none';
                }, 300);
            } else {
                // Show panel
                panel.style.display = 'flex';
                setTimeout(() => {
                    panel.classList.remove('hide');
                    panel.classList.add('show');
                    toggle.classList.add('panel-open');
                    document.body.classList.add('fiu-tracker-panel-open');
                }, 10);
            }
        }
    }

    function createSidePanelContent() {
        return `
            <div class="fiu-tracker-container">
                <div class="fiu-tracker-header">
                    <h1>🎓 FIU Panther Planner</h1>
                </div>

                <div class="fiu-tracker-content">
                    <!-- Major Selector -->
                    <div class="fiu-major-selector">
                        <label for="fiu-major-dropdown">Select Major</label>
                        <select id="fiu-major-dropdown" class="fiu-major-dropdown">
                            <option value="">Select your major...</option>
                            <option value="computer-science" selected>Computer Science</option>
                            <option value="information-technology">Information Technology</option>
                            <option value="cybersecurity">Cybersecurity</option>
                            <option value="software-engineering">Software Engineering</option>
                            <option value="data-science">Data Science</option>
                        </select>
                    </div>

                    <!-- AI Agent Section -->
                    <div class="fiu-ai-agent-section">
                        <div class="fiu-ai-header" id="fiu-ai-header">
                            <h3><img src="chrome-extension://${chrome.runtime.id}/icons/fiu_panther.png" alt="FIU Panther" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;"> Ask Roary</h3>
                            <div class="fiu-ai-arrow" id="fiu-ai-arrow">▼</div>
                        </div>
                        <div class="fiu-ai-content" id="fiu-ai-content">
                            <input type="text" class="fiu-ai-input" placeholder="Ask about courses, prerequisites, or planning...">

                            <div class="fiu-prompt-templates">
                                <button class="fiu-prompt-btn" id="fiu-next-courses-btn">
                                    What should I take next?
                                </button>
                                <button class="fiu-prompt-btn" id="fiu-course-requirements-btn">
                                    Course requirements
                                </button>
                            </div>

                            <button class="fiu-ai-button">Ask AI</button>
                        </div>
                    </div>

                    <!-- Class Checklist -->
                    <div class="fiu-dropdown-section">
                        <div class="fiu-dropdown-header" id="fiu-checklist-header">
                            <div>
                                <div class="fiu-dropdown-title">📚 Class Checklist</div>
                                <div class="fiu-dropdown-subtitle">Track completed courses for your degree</div>
                            </div>
                            <div class="fiu-dropdown-arrow" id="fiu-checklist-arrow">▼</div>
                        </div>
                        <div class="fiu-dropdown-content" id="fiu-checklist-content">
                            <div class="fiu-dropdown-inner">
                                <div class="fiu-search-filters">
                                    <input type="text" class="fiu-filter-input" placeholder="Search courses...">
                                </div>

                                <div class="fiu-course-grid" id="fiu-course-grid">
                                    <div class="fiu-loading-message">Loading courses...</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Schedule -->
                    <div class="fiu-dropdown-section">
                        <div class="fiu-dropdown-header" id="fiu-schedule-header">
                            <div>
                                <div class="fiu-dropdown-title">📅 Schedule</div>
                                <div class="fiu-dropdown-subtitle">Weekly class schedule and calendar</div>
                            </div>
                            <div class="fiu-dropdown-arrow" id="fiu-schedule-arrow">▼</div>
                        </div>
                        <div class="fiu-dropdown-content" id="fiu-schedule-content">
                            <div class="fiu-dropdown-inner">
                                <div class="fiu-schedule-calendar">
                                    <div class="calendar-header">
                                        <h4 style="margin-bottom: 10px; color: #2c3e50; font-size: 0.9rem;">This Week's Schedule</h4>
                                    </div>
                                    <div class="fiu-calendar-grid">
                                        <div class="fiu-day-column">
                                            <div class="fiu-day-header">Mon</div>
                                            <div class="fiu-day-content">
                                                <div class="fiu-schedule-item class">9:30 AM<br>COP 3530</div>
                                                <div class="fiu-schedule-item class">12:30 PM<br>CAI 4002</div>
                                            </div>
                                        </div>
                                        <div class="fiu-day-column">
                                            <div class="fiu-day-header">Tue</div>
                                            <div class="fiu-day-content">
                                                <div class="fiu-schedule-item class">11:00 AM<br>MAD 3512</div>
                                                <div class="fiu-schedule-item class">2:00 PM<br>COT 3541</div>
                                            </div>
                                        </div>
                                        <div class="fiu-day-column">
                                            <div class="fiu-day-header">Wed</div>
                                            <div class="fiu-day-content">
                                                <div class="fiu-schedule-item class">9:30 AM<br>COP 3530</div>
                                                <div class="fiu-schedule-item class">12:30 PM<br>CAI 4002</div>
                                            </div>
                                        </div>
                                        <div class="fiu-day-column">
                                            <div class="fiu-day-header">Thu</div>
                                            <div class="fiu-day-content">
                                                <div class="fiu-schedule-item class">11:00 AM<br>MAD 3512</div>
                                                <div class="fiu-schedule-item class">2:00 PM<br>COT 3541</div>
                                            </div>
                                        </div>
                                        <div class="fiu-day-column">
                                            <div class="fiu-day-header">Fri</div>
                                            <div class="fiu-day-content">
                                                <div class="fiu-schedule-item class">10:00 AM<br>CAP 4052</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Map and Route -->
                    <div class="fiu-dropdown-section">
                        <div class="fiu-dropdown-header" id="fiu-routes-header">
                            <div>
                                <div class="fiu-dropdown-title">🗺️ Map and Route</div>
                                <div class="fiu-dropdown-subtitle">Campus navigation and building routes</div>
                            </div>
                            <div class="fiu-dropdown-arrow" id="fiu-routes-arrow">▼</div>
                        </div>
                        <div class="fiu-dropdown-content" id="fiu-routes-content">
                            <div class="fiu-dropdown-inner">
                                <h4 style="margin-bottom: 10px; color: #2c3e50; font-size: 0.9rem;">Monday Route</h4>

                                <div class="fiu-route-item">
                                    <div class="fiu-route-info">
                                        <div class="fiu-route-time">9:30 AM</div>
                                        <div class="fiu-route-location">COP 3530 - Parking Garage 6</div>
                                    </div>
                                    <div class="fiu-route-status">📍 Start</div>
                                </div>

                                <div class="fiu-route-item">
                                    <div class="fiu-route-info">
                                        <div class="fiu-route-time">11:00 AM</div>
                                        <div class="fiu-route-location">Walk to Academic Health Center</div>
                                    </div>
                                    <div class="fiu-route-status">🚶‍♂️ 8 min</div>
                                </div>

                                <div class="fiu-route-item">
                                    <div class="fiu-route-info">
                                        <div class="fiu-route-time">12:30 PM</div>
                                        <div class="fiu-route-location">CAI 4002 - AHC 5 212A</div>
                                    </div>
                                    <div class="fiu-route-status">📍 Class</div>
                                </div>

                                <div class="embedded-map" style="margin-bottom: 20px;">
                                    <div id="fiu-map" style="width: 100%; height: 200px; border-radius: 8px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #666;">
                                        🗺️ Google Maps Integration
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Major Tracking -->
                    <div class="fiu-dropdown-section">
                        <div class="fiu-dropdown-header" id="fiu-tracking-header">
                            <div>
                                <div class="fiu-dropdown-title">📊 Major Tracking</div>
                                <div class="fiu-dropdown-subtitle">Credits, GPA, semester, prerequisites progress</div>
                            </div>
                            <div class="fiu-dropdown-arrow" id="fiu-tracking-arrow">▼</div>
                        </div>
                        <div class="fiu-dropdown-content" id="fiu-tracking-content">
                            <div class="fiu-dropdown-inner">
                                <div class="fiu-progress-stats">
                                    <h3 style="font-size: 1rem; margin-bottom: 8px;">📊 Academic Progress</h3>
                                    <div class="fiu-stats-grid">
                                        <div class="fiu-stat-item">
                                            <div class="fiu-stat-number">45</div>
                                            <div class="fiu-stat-label">Credits Earned</div>
                                        </div>
                                        <div class="fiu-stat-item">
                                            <div class="fiu-stat-number">3.6</div>
                                            <div class="fiu-stat-label">Current GPA</div>
                                        </div>
                                        <div class="fiu-stat-item">
                                            <div class="fiu-stat-number">4</div>
                                            <div class="fiu-stat-label">Semesters Left</div>
                                        </div>
                                        <div class="fiu-stat-item">
                                            <div class="fiu-stat-number">85%</div>
                                            <div class="fiu-stat-label">Prerequisites</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function loadPopupFunctionality(panel) {
        // Load course data from backend
        loadCourseDataFromBackend(panel);
        
        // Load Google Maps API and initialize
        loadGoogleMapsAPI(panel);
        
        // Add AI functionality
        initializeAI(panel);
    }

    async function loadCourseDataFromBackend(panel) {
        const courseGrid = panel.querySelector('#fiu-course-grid');
        if (!courseGrid) return;

        try {
            // Show loading state
            courseGrid.innerHTML = '<div class="fiu-loading-message">Loading courses from database...</div>';
            
            // Test basic API connectivity first
            console.log('Testing API connectivity...');
            const testResponse = await fetch('http://127.0.0.1:8000/api/courses/COP%202210', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Test API response:', testResponse.status, testResponse.ok);
            if (testResponse.ok) {
                const testData = await testResponse.json();
                console.log('Test API data:', testData);
            }

            // Load all courses from the Computer Science major requirements
            const csMajorCourses = [
                'COP 2210', 'COP 3337', 'COP 3530', 'COP 4338', 'COP 4610',
                'MAC 2311', 'MAC 2312', 'STA 3033', 'COT 3100', 'MAD 2104',
                'CDA 3102', 'CNT 4713', 'CEN 4010', 'CEN 4021', 'CEN 4072',
                'CAI 4002', 'CAI 4105', 'CAI 4304', 'COP 4710', 'COP 4751',
                'CAP 4710', 'CIS 4203', 'CIS 4731', 'COP 4534', 'MAD 3512',
                'COT 3541', 'COP 4655', 'COP 4226', 'CAP 4052', 'CAP 4506',
                'COP 4520', 'COT 4601', 'CAP 4770', 'CAP 4104', 'CAP 4453',
                'CDA 4625', 'CEN 4083', 'CAP 4830', 'ENC 3249', 'CGS 3095',
                'CGS 1920', 'CIS 3950', 'CIS 4951'
            ];

            const courses = [];
            let loadedCount = 0;
            let failedCount = 0;

            console.log(`Attempting to load ${csMajorCourses.length} courses from CS major requirements...`);

            // Try to load each course individually
            for (let i = 0; i < csMajorCourses.length; i++) {
                const courseCode = csMajorCourses[i];
                
                // Update loading message with progress
                if (i % 5 === 0) { // Update every 5 courses
                    courseGrid.innerHTML = `<div class="fiu-loading-message">Loading courses from database... (${i + 1}/${csMajorCourses.length})</div>`;
                }
                try {
                    const url = `http://127.0.0.1:8000/api/courses/${encodeURIComponent(courseCode)}`;
                    console.log(`Fetching course: ${courseCode} from ${url}`);
                    
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    console.log(`Response for ${courseCode}:`, response.status, response.statusText);

                    if (response.ok) {
                        const course = await response.json();
                        console.log(`Loaded course ${courseCode}:`, course);
                        courses.push({
                            code: course.code,
                            name: course.name || course.title || 'Course',
                            completed: false // Default to not completed
                        });
                        loadedCount++;
                    } else {
                        const errorText = await response.text();
                        console.log(`Failed to load ${courseCode}:`, response.status, errorText);
                        failedCount++;
                    }
                } catch (error) {
                    console.error(`Error loading course ${courseCode}:`, error);
                    failedCount++;
                }
            }

            console.log(`Loaded ${loadedCount} courses from backend, ${failedCount} courses not found in database`);

            // Clear loading message
            courseGrid.innerHTML = '';

            if (courses.length > 0) {
                console.log(`Displaying ${courses.length} courses in the UI`);
                // Load completion status from local storage
                const storageKeys = courses.map(course => `course_completion_${course.code}`);
                chrome.storage.local.get(storageKeys, function(result) {
                    console.log('Storage result:', result);
                    courses.forEach(course => {
                        const storageKey = `course_completion_${course.code}`;
                        course.completed = result[storageKey] || false;
                        
                        console.log(`Creating UI element for course: ${course.code} (${course.name})`);
                        
                        const courseItem = document.createElement('div');
                        courseItem.className = `fiu-course-checkbox-item ${course.completed ? 'completed' : ''}`;
                        courseItem.innerHTML = `
                            <input type="checkbox" ${course.completed ? 'checked' : ''} 
                                   onchange="toggleCourseCompletion('${course.code}', this.checked)">
                            <span>${course.code}<br><small>${course.name}</small></span>
                        `;
                        courseGrid.appendChild(courseItem);
                    });
                    console.log(`Added ${courses.length} course items to the grid`);
                });
            } else {
                console.log('No courses found, showing sample data');
                // No courses found in database, show sample data
                loadSampleCourseData(courseGrid);
            }

        } catch (error) {
            console.error('Error loading courses from backend:', error);
            // Fallback to sample data if backend is not available
            loadSampleCourseData(courseGrid);
        }
    }

    function loadSampleCourseData(courseGrid) {
        const courses = [
            { code: 'COP 2210', name: 'Programming I', completed: true },
            { code: 'COP 3337', name: 'Programming II', completed: true },
            { code: 'COP 3530', name: 'Data Structures', completed: false },
            { code: 'MAC 2311', name: 'Calculus I', completed: true },
            { code: 'MAC 2312', name: 'Calculus II', completed: true },
            { code: 'STA 3033', name: 'Probability & Statistics', completed: false }
        ];

        courseGrid.innerHTML = '';
        courses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.className = `fiu-course-checkbox-item ${course.completed ? 'completed' : ''}`;
            courseItem.innerHTML = `
                <input type="checkbox" ${course.completed ? 'checked' : ''}>
                <span>${course.code}<br><small>${course.name}</small></span>
            `;
            courseGrid.appendChild(courseItem);
        });
    }

    async function toggleCourseCompletion(courseCode, completed) {
        try {
            // Since the backend doesn't have a course completion endpoint,
            // we'll store this locally in the extension storage
            const storageKey = `course_completion_${courseCode}`;
            
            // Store in Chrome extension storage
            chrome.storage.local.set({
                [storageKey]: completed
            }, function() {
                console.log(`Course ${courseCode} marked as ${completed ? 'completed' : 'not completed'} (stored locally)`);
            });

            // Also try to update user data if we have a user context
            // This would require a user endpoint that supports course completion tracking
            console.log(`Course completion status saved locally for ${courseCode}: ${completed}`);
            
        } catch (error) {
            console.error('Error updating course completion:', error);
        }
    }

    function loadGoogleMapsAPI(panel) {
        const mapDiv = panel.querySelector('#fiu-map');
        if (!mapDiv) return;

        // Use Google Maps Embed API instead of JavaScript API to avoid CSP issues
        const fiuLocation = '25.7617,-80.1918'; // FIU Miami coordinates
        const mapUrl = `https://www.google.com/maps/embed/v1/view?key=AIzaSyDaK8v3R7sOR-yXymcDVsgQVX2-U8pgJR0&center=${fiuLocation}&zoom=15&maptype=roadmap`;
        
        // Create iframe for embedded map
        const iframe = document.createElement('iframe');
        iframe.src = mapUrl;
        iframe.width = '100%';
        iframe.height = '200px';
        iframe.frameBorder = '0';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        
        // Clear the placeholder content and add the iframe
        mapDiv.innerHTML = '';
        mapDiv.appendChild(iframe);
        
        // Add a title/overlay for context
        const mapTitle = document.createElement('div');
        mapTitle.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(1, 54, 119, 0.9);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            z-index: 10;
        `;
        mapTitle.textContent = '🗺️ FIU Campus';
        
        // Make mapDiv relative positioned to contain the absolute title
        mapDiv.style.position = 'relative';
        mapDiv.appendChild(mapTitle);
        
        console.log('Google Maps embedded successfully');
    }

    function initializeAI(panel) {
        const aiButton = panel.querySelector('.fiu-ai-button');
        const aiInput = panel.querySelector('.fiu-ai-input');
        const nextCoursesBtn = panel.querySelector('#fiu-next-courses-btn');
        const courseRequirementsBtn = panel.querySelector('#fiu-course-requirements-btn');
        
        if (aiButton && aiInput) {
            aiButton.addEventListener('click', async function() {
                const question = aiInput.value.trim();
                if (question) {
                    await sendAIQuestion(question);
                    aiInput.value = ''; // Clear input
                }
            });

            // Enter key support
            aiInput.addEventListener('keypress', async function(e) {
                if (e.key === 'Enter') {
                    const question = aiInput.value.trim();
                    if (question) {
                        await sendAIQuestion(question);
                        aiInput.value = ''; // Clear input
                    }
                }
            });
        }

        if (nextCoursesBtn) {
            nextCoursesBtn.addEventListener('click', async function() {
                await sendAIQuestion('What courses should I take next semester?');
            });
        }

        if (courseRequirementsBtn) {
            courseRequirementsBtn.addEventListener('click', async function() {
                await sendAIQuestion('What are the course requirements for my major?');
            });
        }
    }

    async function sendAIQuestion(question) {
        try {
            showAIResponse('🤔 Thinking...');

            // Get user ID for context (if available)
            let userId = null;
            try {
                // Try to get user ID from localStorage (same as popup.js)
                userId = localStorage.getItem('fiu_degree_tracker_user_id');
            } catch (e) {
                console.log('Could not get user ID:', e);
            }

            const response = await fetch('http://127.0.0.1:8000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: question,
                    user_id: userId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('AI Response:', data);
            
            showAIResponse(data.response || 'Sorry, I couldn\'t process your question right now.');

        } catch (error) {
            console.error('Error sending AI question:', error);
            showAIResponse('Sorry, I\'m having trouble connecting to the AI service. Please try again later.');
        }
    }

    function showAIResponse(response) {
        // Create a simple notification for AI responses
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #013677;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10002;
            font-weight: 600;
            max-width: 300px;
        `;
        notification.textContent = response;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    function setBannerImage(panel) {
        const header = panel.querySelector('.fiu-tracker-header');
        if (header) {
            // Create a beautiful FIU-themed gradient background
            header.style.background = `
                linear-gradient(135deg, 
                    #1e3c72 0%, 
                    #2a5298 25%,
                    #013677 50%,
                    #2a5298 75%,
                    #1e3c72 100%
                )
            `;
            header.style.backgroundSize = '400% 400%';
            header.style.animation = 'fiu-gradient 8s ease infinite';
            
            // Add CSS animation for the gradient
            if (!document.getElementById('fiu-gradient-animation')) {
                const style = document.createElement('style');
                style.id = 'fiu-gradient-animation';
                style.textContent = `
                    @keyframes fiu-gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    function addDropdownEventListeners(panel) {
        // Add event listeners for all dropdown sections
        const dropdownHeaders = panel.querySelectorAll('.fiu-dropdown-header');
        dropdownHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const arrow = this.querySelector('.fiu-dropdown-arrow');
                
                if (content && content.classList.contains('fiu-dropdown-content')) {
                    const isExpanded = content.classList.contains('expanded');
                    
                    if (isExpanded) {
                        content.classList.remove('expanded');
                        this.classList.remove('active');
                        if (arrow) arrow.classList.remove('rotated');
                    } else {
                        content.classList.add('expanded');
                        this.classList.add('active');
                        if (arrow) arrow.classList.add('rotated');
                    }
                }
            });
        });

        // Add event listeners for AI section
        const aiHeader = panel.querySelector('.fiu-ai-header');
        if (aiHeader) {
            aiHeader.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const arrow = this.querySelector('.fiu-ai-arrow');
                
                if (content && content.classList.contains('fiu-ai-content')) {
                    const isCollapsed = content.classList.contains('collapsed');
                    
                    if (isCollapsed) {
                        content.classList.remove('collapsed');
                        if (arrow) arrow.classList.remove('rotated');
                    } else {
                        content.classList.add('collapsed');
                        if (arrow) arrow.classList.add('rotated');
                    }
                }
            });
        }
    }

    function addDashboardWidget() {
        // Find a good place to add our widget on MyFIU dashboard
        const dashboardContainer = document.querySelector('.dashboard-container') ||
            document.querySelector('#main-content') ||
            document.querySelector('main');

        if (!dashboardContainer) return;

        const widget = document.createElement('div');
        widget.id = 'fiu-degree-tracker-widget';
        widget.style.cssText = `
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            max-width: 400px;
        `;

        widget.innerHTML = `
            <h3 style="margin: 0 0 15px 0; font-size: 1.2rem;">🎓 Degree Progress</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;" id="credits-display">45</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Credits Completed</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;" id="gpa-display">3.6</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Current GPA</div>
                </div>
            </div>
            <button id="open-tracker" style="
                width: 100%;
                margin-top: 15px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">Open Full Tracker</button>
        `;

        // Add event listener to open tracker button
        widget.querySelector('#open-tracker').addEventListener('click', function () {
            chrome.runtime.sendMessage({ action: 'openPopup' });
        });

        dashboardContainer.insertBefore(widget, dashboardContainer.firstChild);
    }

    function extractCourseData() {
        console.log('FIU Degree Tracker: Extracting course data...');

        const courses = [];

        // Extract from course search results
        const courseRows = document.querySelectorAll('tr[id*="Class"]');
        courseRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 8) {
                const course = {
                    code: cells[3]?.textContent?.trim(),
                    name: cells[4]?.textContent?.trim(),
                    credits: cells[5]?.textContent?.trim(),
                    status: cells[1]?.textContent?.trim(),
                    instructor: cells[7]?.textContent?.trim(),
                    time: cells[6]?.textContent?.trim()
                };
                if (course.code) courses.push(course);
            }
        });

        // Extract from enrollment/schedule page
        const enrolledRows = document.querySelectorAll('table[id*="enrolled"] tr');
        enrolledRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 6) {
                const course = {
                    code: cells[2]?.textContent?.trim(),
                    name: cells[3]?.textContent?.trim(),
                    credits: cells[4]?.textContent?.trim(),
                    status: 'Enrolled',
                    time: cells[5]?.textContent?.trim()
                };
                if (course.code) courses.push(course);
            }
        });

        console.log('FIU Degree Tracker: Found courses:', courses);

        // Send data to popup if requested
        if (courses.length > 0) {
            chrome.runtime.sendMessage({
                action: 'courseDataFound',
                data: courses
            });
        }

        return courses;
    }

    function extractTranscriptData() {
        console.log('FIU Degree Tracker: Extracting transcript data...');

        const completedCourses = [];

        // Look for grade tables
        const gradeRows = document.querySelectorAll('table tr');
        gradeRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
                const courseCode = cells[0]?.textContent?.trim();
                const grade = cells[2]?.textContent?.trim();
                const credits = cells[3]?.textContent?.trim();

                // Check if it's a valid course with passing grade
                if (courseCode && courseCode.match(/^[A-Z]{3}\s?\d{4}/) &&
                    grade && !['F', 'W', 'I'].includes(grade)) {
                    completedCourses.push({
                        code: courseCode,
                        grade: grade,
                        credits: credits
                    });
                }
            }
        });

        console.log('FIU Degree Tracker: Found completed courses:', completedCourses);

        // Store in extension storage
        if (completedCourses.length > 0) {
            chrome.runtime.sendMessage({
                action: 'transcriptDataFound',
                data: completedCourses
            });
        }
    }

    function enhanceRegistrationInterface() {
        // Add degree tracker info to course listings
        const courseRows = document.querySelectorAll('tr[id*="Class"]');

        courseRows.forEach(row => {
            const courseCodeCell = row.querySelector('td:nth-child(4)');
            if (!courseCodeCell) return;

            const courseCode = courseCodeCell.textContent.trim();

            // Check if this course is part of CS curriculum
            if (isCurriculumCourse(courseCode)) {
                // Add visual indicator
                const indicator = document.createElement('span');
                indicator.style.cssText = `
                    background: #27ae60;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 0.7rem;
                    margin-left: 5px;
                `;
                indicator.textContent = 'CS REQ';
                courseCodeCell.appendChild(indicator);

                // Check prerequisites
                const prereqs = getPrerequisites(courseCode);
                if (prereqs.length > 0) {
                    const prereqInfo = document.createElement('div');
                    prereqInfo.style.cssText = `
                        font-size: 0.8rem;
                        color: #e67e22;
                        margin-top: 3px;
                    `;
                    prereqInfo.textContent = `Prerequisites: ${prereqs.join(', ')}`;
                    courseCodeCell.appendChild(prereqInfo);
                }
            }
        });
    }

    function isCurriculumCourse(courseCode) {
        // CS curriculum courses
        const csCourses = [
            'COP 2210', 'COP 3337', 'COP 3530', 'COP 4338', 'COP 4610', 'COP 4555',
            'COT 3100', 'CDA 3102', 'CNT 4713', 'CEN 4010',
            'MAC 2311', 'MAC 2312', 'STA 3033', 'MAD 2104',
            'CAI 4002', 'CAI 4105', 'CAP 4710', 'CIS 3950', 'CIS 4951'
        ];

        return csCourses.some(course =>
            courseCode.replace(/\s+/g, ' ').includes(course)
        );
    }

    function getPrerequisites(courseCode) {
        // Simplified prerequisite mapping
        const prereqMap = {
            'COP 3337': ['COP 2210'],
            'COP 3530': ['COP 3337'],
            'COP 4338': ['COP 3530', 'CDA 3102'],
            'COP 4610': ['COP 4338'],
            'COT 3100': ['MAC 2311'],
            'CDA 3102': ['COP 3337'],
            'CNT 4713': ['COP 3530'],
            'CAI 4002': ['COP 3530'],
            'MAC 2312': ['MAC 2311']
        };

        const cleanCode = courseCode.replace(/\s+/g, ' ').trim();
        return prereqMap[cleanCode] || [];
    }

    function showQuickInfo() {
        // Create quick info popup
        const existing = document.getElementById('fiu-tracker-quick-info');
        if (existing) {
            existing.remove();
            return;
        }

        const popup = document.createElement('div');
        popup.id = 'fiu-tracker-quick-info';
        popup.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 300px;
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            animation: slideUp 0.3s ease;
        `;

        popup.innerHTML = `
            <style>
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            </style>
            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">🎓 Quick Progress</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #3498db;">45</div>
                    <div style="font-size: 0.8rem; color: #7f8c8d;">Credits</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #27ae60;">85%</div>
                    <div style="font-size: 0.8rem; color: #7f8c8d;">Complete</div>
                </div>
            </div>
            <button id="sync-now" style="
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border: none;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 10px;
            ">🔄 Sync Data</button>
            <button id="close-quick-info" style="
                width: 100%;
                padding: 8px;
                background: #95a5a6;
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
            ">Close</button>
        `;

        // Add event listeners
        popup.querySelector('#sync-now').addEventListener('click', function () {
            extractCourseData();
            extractTranscriptData();
            popup.remove();
            showNotification('Data synced!');
        });

        popup.querySelector('#close-quick-info').addEventListener('click', function () {
            popup.remove();
        });

        document.body.appendChild(popup);

        // Auto close after 10 seconds
        setTimeout(() => {
            if (document.getElementById('fiu-tracker-quick-info')) {
                popup.remove();
            }
        }, 10000);
    }

    function handlePopupMessages(request, sender, sendResponse) {
        console.log('FIU Degree Tracker: Received message:', request);

        try {
        switch (request.action) {
                case 'toggleSidePanel':
                    toggleSidePanel();
                    sendResponse({ success: true });
                    break;
            case 'syncData':
                const courses = extractCourseData();
                sendResponse({ courses: courses });
                break;

            case 'getTranscriptData':
                const transcriptData = extractTranscriptData();
                sendResponse({ transcriptData: transcriptData });
                break;

            case 'highlightCourse':
                highlightCourse(request.courseCode);
                    sendResponse({ success: true });
                break;
                    
                case 'autoSync':
                    // Auto sync when requested by background
                    extractCourseData();
                    extractTranscriptData();
                    sendResponse({ success: true });
                break;
                    
                default:
                    console.log('Unknown action:', request.action);
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
        
        return true; // Keep message channel open for async response
    }

    function highlightCourse(courseCode) {
        // Find and highlight a specific course on the page
        const courseElements = document.querySelectorAll('td');
        courseElements.forEach(cell => {
            if (cell.textContent.includes(courseCode)) {
                cell.style.background = '#fff3cd';
                cell.style.border = '2px solid #ffc107';

                // Scroll into view
                cell.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Remove highlight after 3 seconds
                setTimeout(() => {
                    cell.style.background = '';
                    cell.style.border = '';
                }, 3000);
            }
        });
    }

    function observePageChanges() {
        // Monitor for SPA navigation changes
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Page content changed, re-initialize if needed
                    setTimeout(() => {
                        if (window.location.href.includes('enrollment')) {
                            extractCourseData();
                            enhanceRegistrationInterface();
                        }
                    }, 1000);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10002;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add CSS for animations
    if (!document.getElementById('fiu-tracker-styles')) {
        const styles = document.createElement('style');
        styles.id = 'fiu-tracker-styles';
        styles.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styles);


    }

})();