// background.js - Background Service Worker for FIU Degree Tracker

// Installation and setup
chrome.runtime.onInstalled.addListener(function (details) {
    console.log('FIU Degree Tracker installed');

    if (details.reason === 'install') {
        // First time installation
        initializeExtension();
    }
});

// Initialize extension with default data
function initializeExtension() {
    const defaultData = {
        completedCourses: [
            'COP 2210', // Programming I
            'COP 3337', // Programming II  
            'MAC 2311', // Calculus I
            'MAC 2312', // Calculus II
            'STA 3033'  // Probability & Statistics
        ],
        currentSemester: 'Fall 2025',
        major: 'Computer Science',
        graduationGoal: 'Fall 2026',
        lastSync: null
    };

    chrome.storage.sync.set(defaultData);
    console.log('Extension initialized with default data');
}

// Handle action button click (toggle side panel)
chrome.action.onClicked.addListener(function(tab) {
    // Check if we're on a supported page
    if (tab.url && (tab.url.includes('fiu.edu') || tab.url.includes('localhost'))) {
        // Send message to content script to toggle side panel
        chrome.tabs.sendMessage(tab.id, { action: 'toggleSidePanel' })
            .catch(error => {
                console.log('Content script not ready, injecting it first...');
                // If content script isn't ready, inject it first
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                }).then(() => {
                    // Wait a bit for the script to initialize, then send message
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tab.id, { action: 'toggleSidePanel' })
                            .catch(err => console.log('Still unable to send message:', err));
                    }, 100);
                }).catch(err => console.log('Failed to inject content script:', err));
            });
    } else {
        // If not on FIU page, open a new tab to FIU
        chrome.tabs.create({
            url: 'https://my.fiu.edu'
        });
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
        case 'openPopup':
            // Toggle side panel instead of opening popup
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleSidePanel' })
                        .catch(error => {
                            console.log('Content script not ready for openPopup:', error);
                        });
                }
            });
            break;
        case 'scheduleNotification':
            scheduleClassReminder(request.classInfo);
            break;
        case 'updateProgress':
            updateProgressData(request.progressData);
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
        const totalRequired = 40;
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

// Schedule class reminders
function scheduleClassReminder(classInfo) {
    const { courseName, time, location } = classInfo;
    const reminderTime = new Date(time);
    reminderTime.setMinutes(reminderTime.getMinutes() - 15);

    chrome.alarms.create(`class-${courseName}`, {
        when: reminderTime.getTime()
    });

    console.log(`Scheduled reminder for ${courseName} at ${reminderTime}`);
}

// Handle alarms (class reminders)
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name.startsWith('class-')) {
        const courseName = alarm.name.replace('class-', '');

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Class Reminder',
            message: `${courseName} starts in 15 minutes!`,
            buttons: [
                { title: 'View Route' },
                { title: 'Dismiss' }
            ]
        });
    }
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
    if (buttonIndex === 0) {
        chrome.tabs.create({
            url: 'https://www.google.com/maps/search/fiu+miami'
        });
    }
    chrome.notifications.clear(notificationId);
});

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

// Periodic data sync
chrome.alarms.create('periodicSync', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === 'periodicSync') {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiu.edu')) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'autoSync' });
            }
        });
    }
});

// Context menu integration
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: 'searchCourse',
        title: 'Search course: "%s"',
        contexts: ['selection']
    });

    chrome.contextMenus.create({
        id: 'addToPlan',
        title: 'Add to degree plan',
        contexts: ['selection']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === 'searchCourse') {
        const courseQuery = info.selectionText;
        chrome.tabs.create({
            url: `https://panthersoft.fiu.edu/search?q=${encodeURIComponent(courseQuery)}`
        });
    }

    if (info.menuItemId === 'addToPlan') {
        const courseCode = info.selectionText.match(/[A-Z]{3}\s?\d{4}/);
        if (courseCode) {
            chrome.storage.sync.get(['plannedCourses'], function (result) {
                const planned = result.plannedCourses || [];
                planned.push(courseCode[0]);
                chrome.storage.sync.set({ plannedCourses: planned });
                showNotification(`Added ${courseCode[0]} to degree plan`);
            });
        }
    }
});

// Update progress data
function updateProgressData(progressData) {
    chrome.storage.sync.set({
        progressData: progressData,
        lastUpdated: new Date().toISOString()
    });
    updateBadge();
}

// Initialize badge on startup
updateBadge();