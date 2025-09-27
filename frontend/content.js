// content.js - Content Script for FIU Website Integration

// This script runs on FIU pages to extract course data and enhance the interface

(function () {
    'use strict';

    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeExtension);
    } else {
        initializeExtension();
    }

    function initializeExtension() {
        console.log('FIU Degree Tracker: Initializing on', window.location.href);

        // Check what FIU page we're on and add appropriate functionality
        if (window.location.href.includes('my.fiu.edu')) {
            handleMyFIUPage();
        } else if (window.location.href.includes('panthersoft')) {
            handlePantherSoftPage();
        }

        // Add floating action button for quick access
        addFloatingActionButton();

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener(handlePopupMessages);
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

    function addFloatingActionButton() {
        // Create floating button for quick access to extension
        const fab = document.createElement('div');
        fab.id = 'fiu-tracker-fab';
        fab.innerHTML = '🎓';
        fab.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transition: all 0.3s ease;
        `;

        fab.addEventListener('click', function () {
            // Open extension popup or show quick info
            showQuickInfo();
        });

        fab.addEventListener('mouseenter', function () {
            fab.style.transform = 'scale(1.1)';
        });

        fab.addEventListener('mouseleave', function () {
            fab.style.transform = 'scale(1)';
        });

        document.body.appendChild(fab);
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

        switch (request.action) {
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
                break;
        }
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