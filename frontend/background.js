// background.js - Background Service Worker for FIU Degree Tracker

// Installation and setup
chrome.runtime.onInstalled.addListener(function (details) {
    console.log('FIU Degree Tracker installed');
    
    if (details.reason === 'install') {
        // Initialize with empty data - let API populate it
        chrome.storage.sync.set({
            completedCourses: [],
            lastSync: null
        });
        console.log('Extension initialized');
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('Background received message:', request);

    switch (request.action) {
        case 'courseDataFound':
            handleCourseDataSync(request.data);
            break;
        case 'transcriptDataFound':
            handleTranscriptDataSync(request.data);
            break;
    }

    return true;
});

// Handle course data synchronization from PantherSoft
function handleCourseDataSync(courses) {
    console.log('Syncing course data:', courses);

    const completedCourses = courses
        .filter(course => course.status === 'Enrolled' || course.grade)
        .map(course => course.code);

    chrome.storage.sync.get(['completedCourses'], function (result) {
        const existing = result.completedCourses || [];
        const merged = [...new Set([...existing, ...completedCourses])];

        chrome.storage.sync.set({
            completedCourses: merged,
            lastSync: new Date().toISOString(),
            currentCourses: courses.filter(course => course.status === 'Enrolled')
        });

        showNotification('Course data synced successfully!');
        updateBadge();
    });
}

// Handle transcript data synchronization
function handleTranscriptDataSync(transcriptData) {
    console.log('Syncing transcript data:', transcriptData);

    const completedCourses = transcriptData.map(course => course.code);
    const gpaData = calculateGPA(transcriptData);

    chrome.storage.sync.set({
        completedCourses: completedCourses,
        transcriptData: transcriptData,
        gpa: gpaData,
        lastSync: new Date().toISOString()
    });

    updateBadge();
    showNotification('Transcript data synced!');
}

// Calculate GPA from transcript data
function calculateGPA(transcriptData) {
    const gradePoints = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'D-': 0.7,
        'F': 0.0
    };

    let totalPoints = 0;
    let totalCredits = 0;

    transcriptData.forEach(course => {
        const credits = parseFloat(course.credits) || 0;
        const points = gradePoints[course.grade] || 0;
        totalPoints += points * credits;
        totalCredits += credits;
    });

    return {
        overall: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00',
        totalCredits: totalCredits,
        totalPoints: totalPoints
    };
}

// Update extension badge with progress
function updateBadge() {
    chrome.storage.sync.get(['completedCourses'], function (result) {
        const completed = result.completedCourses || [];
        const totalRequired = 40; // Adjust based on your major requirements
        const percentage = Math.floor((completed.length / totalRequired) * 100);

        chrome.action.setBadgeText({
            text: percentage + '%'
        });

        chrome.action.setBadgeBackgroundColor({
            color: percentage >= 75 ? '#27ae60' : percentage >= 50 ? '#f39c12' : '#e74c3c'
        });
    });
}

// Show system notification
function showNotification(message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'FIU Degree Tracker',
        message: message
    });
}

// Monitor tab updates to detect FIU websites
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('fiu.edu')) {
            chrome.action.setBadgeText({
                text: 'FIU',
                tabId: tabId
            });
            chrome.action.setBadgeBackgroundColor({
                color: '#3498db',
                tabId: tabId
            });
        } else {
            updateBadge();
        }
    }
});

// Initialize badge on startup
updateBadge();