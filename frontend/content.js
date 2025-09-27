// content.js - Content Script for FIU Website Integration

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

        // Only run on PantherSoft pages
        if (window.location.href.includes('panthersoft')) {
            handlePantherSoftPage();
        }

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener(handlePopupMessages);
    }

    function handlePantherSoftPage() {
        console.log('FIU Degree Tracker: On PantherSoft page');

        // Extract course registration data
        if (window.location.href.includes('class_search') ||
            window.location.href.includes('enrollment')) {
            extractCourseData();
        }
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

        // Send data to background script
        if (courses.length > 0) {
            chrome.runtime.sendMessage({
                action: 'courseDataFound',
                data: courses
            });
        }

        return courses;
    }

    function handlePopupMessages(request, sender, sendResponse) {
        console.log('FIU Degree Tracker: Received message:', request);

        switch (request.action) {
            case 'syncData':
                const courses = extractCourseData();
                sendResponse({ courses: courses });
                break;
        }
    }

})();