// popup.js - Chrome Extension Popup Logic

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

// Course completion functionality
document.addEventListener('DOMContentLoaded', function () {
    // Load saved progress from Chrome storage
    loadProgress();

    // Add event listeners to checkboxes
    document.querySelectorAll('.course-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const courseInfo = this.nextElementSibling;
            const courseCode = courseInfo.querySelector('.course-code').textContent;

            if (this.checked) {
                courseInfo.classList.add('completed');
                saveCompletedCourse(courseCode);
            } else {
                courseInfo.classList.remove('completed');
                removeCompletedCourse(courseCode);
            }
            updateProgress();
        });
    });
});

// Save completed course to Chrome storage
function saveCompletedCourse(courseCode) {
    chrome.storage.sync.get(['completedCourses'], function (result) {
        const completed = result.completedCourses || [];
        if (!completed.includes(courseCode)) {
            completed.push(courseCode);
            chrome.storage.sync.set({ completedCourses: completed });
        }
    });
}

// Remove completed course from Chrome storage
function removeCompletedCourse(courseCode) {
    chrome.storage.sync.get(['completedCourses'], function (result) {
        const completed = result.completedCourses || [];
        const index = completed.indexOf(courseCode);
        if (index > -1) {
            completed.splice(index, 1);
            chrome.storage.sync.set({ completedCourses: completed });
        }
    });
}

// Load progress from Chrome storage
function loadProgress() {
    chrome.storage.sync.get(['completedCourses'], function (result) {
        const completed = result.completedCourses || [];

        document.querySelectorAll('.course-checkbox').forEach(checkbox => {
            const courseInfo = checkbox.nextElementSibling;
            const courseCode = courseInfo.querySelector('.course-code').textContent;

            if (completed.includes(courseCode)) {
                checkbox.checked = true;
                courseInfo.classList.add('completed');
            }
        });

        updateProgress();
    });
}

// Update progress display
function updateProgress() {
    const totalCheckboxes = document.querySelectorAll('.course-checkbox').length;
    const checkedBoxes = document.querySelectorAll('.course-checkbox:checked').length;

    // Calculate credits (assuming 3 credits per course on average)
    const totalCredits = 120; // CS degree total
    const completedCredits = Math.floor((checkedBoxes / totalCheckboxes) * totalCredits);

    // Update progress cards
    const progressCards = document.querySelectorAll('.progress-card .number');
    if (progressCards[0]) progressCards[0].textContent = completedCredits;

    // Calculate semesters remaining
    const remainingCredits = totalCredits - completedCredits;
    const semestersLeft = Math.ceil(remainingCredits / 15); // 15 credits per semester
    if (progressCards[2]) progressCards[2].textContent = semestersLeft;

    // Update prerequisites percentage
    const prereqPercentage = Math.floor((checkedBoxes / totalCheckboxes) * 100);
    if (progressCards[3]) progressCards[3].textContent = prereqPercentage + '%';
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

    chrome.storage.sync.set({ completedCourses: courseCodes }, function () {
        loadProgress(); // Reload UI
        showNotification('Data synced successfully!');
    });
}

// Open Google Maps for route planning
function openMaps() {
    const fiuCoordinates = '25.7617,-80.3756'; // FIU main campus
    const mapsUrl = `https://www.google.com/maps/dir/${fiuCoordinates}/Academic+Health+Center,+Florida+International+University,+Miami,+FL`;

    chrome.tabs.create({
        url: mapsUrl
    });
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

// Check if user is on FIU website and show relevant features
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('fiu.edu')) {
        // User is on FIU site - show enhanced features
        document.body.classList.add('on-fiu-site');
    }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'courseDataFound') {
        processSyncedData(request.data);
    }
});

