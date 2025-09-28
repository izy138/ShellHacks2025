// Fetch all majors from API
// Generic cache utility
function getCachedData(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    try {
        const { data, timestamp } = JSON.parse(cached);
        // 1 hour cache expiration
        if (Date.now() - timestamp < 3600 * 1000) {
            return data;
        }
    } catch (e) {}
    return null;
}

function setCachedData(key, data) {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

async function fetchAllMajors() {
    const cacheKey = 'majorsCache';
    const cachedMajors = getCachedData(cacheKey);
    if (cachedMajors) return cachedMajors;
    try {
        const response = await fetch(`${API_BASE_URL}/majors`);
        if (!response.ok) throw new Error('Failed to fetch majors');
        const majors = await response.json();
        setCachedData(cacheKey, majors);
        return majors;
    } catch (error) {
        console.error('Error fetching all majors:', error);
        return [];
    }
}

// Fetch all courses from API (with cache)
async function fetchAllCourses() {
    const cacheKey = 'coursesCache';
    const cachedCourses = getCachedData(cacheKey);
    if (cachedCourses) return cachedCourses;
    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        if (!response.ok) throw new Error('Failed to fetch courses');
        const courses = await response.json();
        setCachedData(cacheKey, courses);
        return courses;
    } catch (error) {
        console.error('Error fetching all courses:', error);
        return [];
    }
}

// Fetch all locations from API (with cache)
async function fetchAllLocations() {
    const cacheKey = 'locationsCache';
    const cachedLocations = getCachedData(cacheKey);
    if (cachedLocations) return cachedLocations;
    try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        if (!response.ok) throw new Error('Failed to fetch locations');
        let locations = await response.json();
        // Normalize to { code, full_name }
        locations = locations.map(loc => ({
            code: loc.code || '',
            full_name: loc.full_name || '',
            id: loc.id || ''
        }));
        setCachedData(cacheKey, locations);
        return locations;
    } catch (error) {
        console.error('Error fetching all locations:', error);
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

// Google Maps and Polyline functionality (Replaced with custom SVG renderer to avoid CSP issues)
let map = null; // kept for compatibility
let polylines = []; // will hold SVG polyline elements
let routeMarkers = []; // marker metadata

// Decode Google-style encoded polyline
function decodePolyline(encoded) {
    if (!encoded) return [];
    const points = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
        let b, shift = 0, result = 0;
        do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        const dlat = (result & 1) ? ~(result >> 1) : (result >> 1); lat += dlat;
        shift = 0; result = 0;
        do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        const dlng = (result & 1) ? ~(result >> 1) : (result >> 1); lng += dlng;
        points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return points;
}

function initMap() {
    const container = document.getElementById('map');
    if (!container) return;
    // If already initialized, just clear previous drawing
    if (document.getElementById('route-svg')) {
        clearRenderedRoute();
    } else {
        container.innerHTML = '';
        container.style.position = 'relative';
        container.style.background = '#eef2f5';
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
        container.style.overflow = 'hidden';
        container.style.backgroundImage = 'linear-gradient(#fff 0 0), repeating-linear-gradient(0deg,#dfe6ec,#dfe6ec 1px,transparent 1px,transparent 12px), repeating-linear-gradient(90deg,#dfe6ec,#dfe6ec 1px,transparent 1px,transparent 12px)';
        container.style.backgroundBlendMode = 'multiply';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.id = 'route-svg';
        svg.style.display = 'block';
        svg.style.position = 'relative';
        svg.style.zIndex = '2';
        container.appendChild(svg);
    }
    const routeDaySelect = document.getElementById('route-day-select');
    const selectedDay = routeDaySelect ? (routeDaySelect.value || 'mon') : 'mon';
    getUserData().then(userData => {
        const blocks = (userData.schedule && userData.schedule[selectedDay]) ? userData.schedule[selectedDay] : [];
        const placeIds = blocks.map(b => b.location && b.location.id).filter(Boolean);
        if (placeIds.length) {
            fetchAndDisplayRoute(placeIds);
        } else {
            clearRenderedRoute();
        }
    });
}

function clearRenderedRoute() {
    const svg = document.getElementById('route-svg');
    if (svg) svg.innerHTML = '';
    polylines = [];
    routeMarkers = [];
}

function addRouteMarker(position, type) {
    if (!position) return;
    routeMarkers.push({ position, type });
}

// Helper to estimate a zoom level for Static Maps given max span in degrees
function estimateZoom(maxSpanDegrees) {
    if (maxSpanDegrees <= 0) return 18;
    const z = Math.log2(360 / maxSpanDegrees);
    return Math.max(2, Math.min(20, Math.floor(z)));
}

function addMultiplePolylines(polylineData) {
    clearRenderedRoute();
    const container = document.getElementById('map');
    const svgExisting = document.getElementById('route-svg');
    if (!container || !svgExisting) return;
    if (!polylineData || !polylineData.length) return;

    // Decode segments
    const colors = ['#B8860B', '#003366']; // alternate Gold, Blue
    let segments = polylineData.map((seg, i) => {
        const encoded = seg.encodedPolyline || seg.polyline || '';
        const pts = decodePolyline(encoded);
        return { pts, encoded, meta: seg, color: colors[i % colors.length] };
    }).filter(s => s.pts.length);
    // De-duplicate identical polylines
    const seen = new Set();
    segments = segments.filter(s => { if (seen.has(s.encoded)) return false; seen.add(s.encoded); return true; });
    if (!segments.length) return;

    // Compute bounds
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    segments.forEach(seg => seg.pts.forEach(p => { if (p.lat < minLat) minLat = p.lat; if (p.lat > maxLat) maxLat = p.lat; if (p.lng < minLng) minLng = p.lng; if (p.lng > maxLng) maxLng = p.lng; }));
    const latSpan = Math.max(0.00001, maxLat - minLat);
    const lngSpan = Math.max(0.00001, maxLng - minLng);
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Determine map size (match container, clamp to Static Maps limits)
    const contW = container.clientWidth || 400;
    const contH = container.clientHeight || 200;
    const sizeW = Math.min(640, Math.max(100, Math.round(contW)));
    const sizeH = Math.min(640, Math.max(100, Math.round(contH)));
    const SCALE = 2; // static map scale

    // Web Mercator helpers
    const WORLD_TILE_SIZE = 256;
    function mercatorY(lat) {
        const rad = lat * Math.PI / 180;
        return Math.log(Math.tan(Math.PI / 4 + rad / 2));
    }
    function latToPixelY(lat, zoom) {
        const siny = mercatorY(lat);
        const worldPx = WORLD_TILE_SIZE * Math.pow(2, zoom);
        return (worldPx / 2) - (worldPx * siny / (2 * Math.PI));
    }
    function lngToPixelX(lng, zoom) {
        const worldPx = WORLD_TILE_SIZE * Math.pow(2, zoom);
        return (lng + 180) / 360 * worldPx;
    }

    // Compute zoom to fit bounds
    function fitZoom(minLat, maxLat, minLng, maxLng, widthPx, heightPx) {
        // leave padding (10%)
        const paddingFactor = 0.9;
        for (let z = 20; z >= 2; z--) {
            const worldPx = WORLD_TILE_SIZE * Math.pow(2, z);
            const xMin = lngToPixelX(minLng, z);
            const xMax = lngToPixelX(maxLng, z);
            const yMin = latToPixelY(maxLat, z); // note: maxLat -> min y
            const yMax = latToPixelY(minLat, z); // minLat -> max y
            const spanX = (xMax - xMin);
            const spanY = (yMax - yMin);
            if (spanX <= widthPx * paddingFactor && spanY <= heightPx * paddingFactor) {
                return z;
            }
        }
        return 2;
    }

    const mapPixelWidth = sizeW * SCALE;
    const mapPixelHeight = sizeH * SCALE;
    const zoom = fitZoom(minLat, maxLat, minLng, maxLng, mapPixelWidth, mapPixelHeight);

    // Setup / reuse SVG sized to map pixels
    const svg = svgExisting;
    svg.setAttribute('viewBox', `0 0 ${mapPixelWidth} ${mapPixelHeight}`);
    svg.innerHTML = '';

    // Background Static Map (with NO path overlays to avoid duplication) - now sized exactly to container
    const STATIC_KEY = (window.CONFIG && (CONFIG.GOOGLE_MAPS_API_KEY || CONFIG.STATIC_MAPS_API_KEY) && (CONFIG.GOOGLE_MAPS_API_KEY !== 'REPLACE_WITH_REAL_KEY')) ? (CONFIG.GOOGLE_MAPS_API_KEY || CONFIG.STATIC_MAPS_API_KEY) : null;
    if (STATIC_KEY) {
        const base = `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=${zoom}&size=${sizeW}x${sizeH}&scale=${SCALE}&maptype=roadmap`;
        container.style.backgroundImage = `url('${base}&key=${STATIC_KEY}')`;
        container.style.backgroundSize = '100% 100%';
        container.style.backgroundPosition = 'center';
    }

    // Center pixel positions for projection
    const centerPxX = lngToPixelX(centerLng, zoom);
    const centerPxY = latToPixelY(centerLat, zoom);

    function projectPoint(p) {
        const pxX = lngToPixelX(p.lng, zoom);
        const pxY = latToPixelY(p.lat, zoom);
        // translate so center sits in middle of map pixel dimensions
        const screenX = mapPixelWidth / 2 + (pxX - centerPxX);
        const screenY = mapPixelHeight / 2 + (pxY - centerPxY);
        return { x: screenX, y: screenY };
    }

    // Draw polylines aligned with map
    segments.forEach(seg => {
        const projPts = seg.pts.map(projectPoint);
        const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        pl.setAttribute('points', projPts.map(pt => `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`).join(' '));
        pl.setAttribute('fill', 'none');
        pl.setAttribute('stroke', seg.color);
        pl.setAttribute('stroke-width', '7'); // increased thickness
        pl.setAttribute('stroke-linecap', 'round');
        pl.setAttribute('stroke-linejoin', 'round');
        pl.setAttribute('stroke-opacity', '0.95');
        svg.appendChild(pl);
        polylines.push(pl);
    });

    // Markers (ensure: first = green, last = red, all intermediates = grey)
    // Clear any residual markers just in case
    routeMarkers = [];
    const eqPoint = (a, b) => Math.abs(a.lat - b.lat) < 1e-6 && Math.abs(a.lng - b.lng) < 1e-6;

    if (segments.length) {
        const firstPt = segments[0].pts[0];
        const lastSeg = segments[segments.length - 1];
        const lastPt = lastSeg.pts[lastSeg.pts.length - 1];
        // Start
        routeMarkers.push({ position: firstPt, type: 'start' });
        // Intermediate junctions (start of each segment after the first)
        for (let i = 1; i < segments.length; i++) {
            const junction = segments[i].pts[0];
            // Skip if same as global start or global end (avoid duplicates)
            if (!eqPoint(junction, firstPt) && !eqPoint(junction, lastPt)) {
                routeMarkers.push({ position: junction, type: 'waypoint' });
            }
        }
        // End (only if different from start)
        if (!eqPoint(lastPt, firstPt)) {
            routeMarkers.push({ position: lastPt, type: 'end' });
        } else {
            // Edge case: start and end identical (very small / zero-length route) -> keep start only
        }
    }

    routeMarkers.forEach(m => {
        const { x, y } = projectPoint(m.position);
        let color = '#95a5a6', r = 12;
        if (m.type === 'start') { color = '#27ae60'; r = 15; }
        else if (m.type === 'end') { color = '#e74c3c'; r = 15; }
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r);
        c.setAttribute('fill', color); c.setAttribute('stroke', '#ffffff'); c.setAttribute('stroke-width', '2');
        g.appendChild(c);
        const c2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c2.setAttribute('cx', x); c2.setAttribute('cy', y); c2.setAttribute('r', r + 2.5);
        c2.setAttribute('fill', 'none'); c2.setAttribute('stroke', color); c2.setAttribute('stroke-opacity', '0.25'); c2.setAttribute('stroke-width', '2');
        g.appendChild(c2);
        svg.appendChild(g);
    });
}

// Function to fetch real route data from API and display with alternating colors
async function fetchAndDisplayRoute(placeIds) {
    try {
        // Build query string for multiple place IDs
        const queryString = placeIds.map(id => `place_id_list=${encodeURIComponent(id)}`).join('&');
        const url = `${API_BASE_URL}/route/get_route?${queryString}`;
        
        console.log('Fetching route from:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const routeData = await response.json();
        console.log('Route data received:', routeData);
        
        if (routeData.routes && routeData.routes.length > 0) {
            const route = routeData.routes[0];
            
            // Extract legs data for alternating colors
            const legsData = route.legs.map(leg => ({
                encodedPolyline: leg.polyline.encodedPolyline,
                distanceMeters: leg.distanceMeters,
                duration: leg.staticDuration
            }));
            
            // Display route with alternating blue and gold colors
            addMultiplePolylines(legsData);
            
            // Display route info
            displayRouteInfo(route);
            
            console.log('Route displayed with alternating FIU colors');
        } else {
            console.error('No routes found in response');
        }
        
    } catch (error) {
        console.error('Error fetching route:', error);
        // Fallback to sample data
        addRouteSegments();
    }
}

// Function to display route information
function displayRouteInfo(route) {
    // Hide route information popup - commented out by user request
    return;
    
    // Create or update route info display
    let infoDiv = document.getElementById('route-info');
    if (!infoDiv) {
        infoDiv = document.createElement('div');
        infoDiv.id = 'route-info';
        infoDiv.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            font-size: 0.9rem;
            z-index: 1000;
            max-width: 200px;
            border: 1px solid rgba(0, 51, 102, 0.2);
        `;
        document.getElementById('map').parentElement.appendChild(infoDiv);
    }
    
    const totalDistance = (route.distanceMeters / 1000).toFixed(1);
    const totalDuration = Math.round(parseInt(route.duration) / 60);
    
    infoDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px; color: #003366;">🗺️ Route Information</div>
        <div style="margin-bottom: 3px;">Total Distance: ${totalDistance} km</div>
        <div style="margin-bottom: 3px;">Total Duration: ${totalDuration} minutes</div>
        <div style="margin-bottom: 5px;">Legs: ${route.legs.length} segments</div>
        <div style="margin-top: 5px; font-size: 0.8rem; color: #666;">
            <span style="color: #003366; font-weight: bold;">●</span> Blue segments
            <span style="margin-left: 10px; color: #B8860B; font-weight: bold;">●</span> Gold segments
        </div>
        <div style="margin-top: 3px; font-size: 0.8rem; color: #666;">
            <span style="color: #27ae60; font-weight: bold;">●</span> Start
            <span style="margin-left: 10px; color: #e74c3c; font-weight: bold;">●</span> End
            <span style="margin-left: 10px; color: #95a5a6; font-weight: bold;">●</span> Waypoints
        </div>
    `;
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (infoDiv && infoDiv.parentElement) {
            infoDiv.style.opacity = '0';
            setTimeout(() => {
                if (infoDiv && infoDiv.parentElement) {
                    infoDiv.remove();
                }
            }, 500);
        }
    }, 10000);
}

// Example function to add multiple route segments (fallback)
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
    console.log('Added multiple route segments with FIU colors');
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
        // Create user in backend with valid Schedule for schedule property
        const defaultSchedule = {
            "mon": [],
            "tue": [],
            "wed": [],
            "thu": [],
            "fri": [],
            "sat": [],
            "sun": []
        };
        fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, major: '', taken_courses: [], current_courses: [], schedule: defaultSchedule })
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
        console.log(e)
        // If not found, create user in backend with valid Schedule for blocked_time
        const defaultSchedule = {
            "mon": [],
            "tue": [],
            "wed": [],
            "thu": [],
            "fri": [],
            "sat": [],
            "sun": []
        };
        await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, major: '', taken_courses: [], current_courses: [], schedule: defaultSchedule })
        });
        return { user_id: userId, major: '', taken_courses: [], current_courses: [], schedule: defaultSchedule };
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
    // Use and update course cache
    const cacheKey = 'coursesCache';
    let courseCache = getCachedData(cacheKey) || {};
    if (courseCache[courseCode]) {
        console.log('Returning cached course for', courseCode);
        return courseCache[courseCode];
    }
    const url = `${API_BASE_URL}/courses/${encodeURIComponent(courseCode)}`;
    console.log('Fetching course from URL:', url);
    try {
        const response = await fetch(url);
        console.log('Course response for', courseCode, ':', response.status);
        if (!response.ok) {
            if (response.status === 404) {
                console.log('Course not found, returning basic info for:', courseCode);
                // Course not found, return basic info
                const basicInfo = {
                    code: courseCode,
                    name: courseCode,
                    credits: 3,
                    prereqs: [],
                    coreqs: []
                };
                courseCache[courseCode] = basicInfo;
                setCachedData(cacheKey, courseCache);
                return basicInfo;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const courseData = await response.json();
        console.log('Course data for', courseCode, ':', courseData);
        courseCache[courseCode] = courseData;
        setCachedData(cacheKey, courseCache);
        return courseData;
    } catch (error) {
        console.error(`Error fetching course ${courseCode}:`, error);
        // Return basic course info as fallback
        const fallback = {
            code: courseCode,
            name: courseCode,
            credits: 3,
            prereqs: [],
            coreqs: []
        };
        courseCache[courseCode] = fallback;
        setCachedData(cacheKey, courseCache);
        return fallback;
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
        <span>${courseCode}<br><small>${courseName}<br>(${courseCredits} credits)</small></span>
    `;
    
    console.log('Course item HTML created:', courseItem.innerHTML);
    return courseItem;
}

// Add event listeners to all checkboxes
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
                
                // Trigger AI recommendation update if AI response area is visible
                const responseArea = document.getElementById('ai-response-area');
                if (responseArea && responseArea.style.display !== 'none') {
                    // Auto-refresh recommendations when checklist changes
                    setTimeout(async () => {
                        const completedCourses = getCompletedCoursesFromChecklist();
                        const courseList = completedCourses.length > 0 ? completedCourses.join(', ') : 'none yet';
                        const message = `Given the courses I've completed (${courseList}), what courses should I take next to stay on track for graduation? Please recommend specific courses from my degree requirements.`;
                        await sendAIQuery(message);
                    }, 1000); // Small delay to ensure data is saved
                }
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
// Dynamically update credits earned in progress tab
async function updateCreditsEarned() {
    const userData = await getUserData();
    const takenCourses = userData.taken_courses || [];
    let totalCredits = 0;
    for (const code of takenCourses) {
        const course = await fetchCourseDetails(code);
        if (course && course.credits) {
            totalCredits += parseInt(course.credits);
        }
    }
    const creditsElem = document.querySelector('.stat-number[data-stat="credits-earned"]');
    if (creditsElem) {
        creditsElem.textContent = totalCredits;
    }

    // Update progress percentage
    let requiredCourses = [];
    // Try to get required courses from user's major
    if (userData.major) {
        const majorData = await fetchMajorCourses(userData.major);
        if (majorData && Array.isArray(majorData.required_courses)) {
            requiredCourses = majorData.required_courses;
        }
    }
    let percent = 0;
    if (requiredCourses.length > 0) {
        percent = Math.round((takenCourses.length / requiredCourses.length) * 100);
    }
    const progressElem = document.querySelector('.stat-number[data-stat="progress-percentage"]');
    if (progressElem) {
        progressElem.textContent = `${percent}%`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateCreditsEarned();
    // Vertically center schedule modals regardless of scroll
    const modalStyle = document.createElement('style');
    modalStyle.innerHTML = `
        #add-block-modal {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 9999 !important;
            background: #fff;
            box-shadow: 0 2px 16px rgba(0,0,0,0.18);
            border-radius: 12px;
            padding: 24px 18px 12px 18px;
            min-width: 320px;
            max-width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
            display: none;
        }
        #add-block-modal[style*="display: block"] {
            display: block !important;
        }
    `;
    document.head.appendChild(modalStyle);
    // Map and Route: update map when day is selected
    const routeDaySelect = document.getElementById('route-day-select');
    if (routeDaySelect) {
        routeDaySelect.addEventListener('change', async function() {
            const selectedDay = this.value; // e.g. 'mon', 'tue', ...
            const userData = await getUserData();
            const blocks = (userData.schedule && userData.schedule[selectedDay]) ? userData.schedule[selectedDay] : [];
            // Extract place ids from block.location.id
            const placeIds = blocks.map(block => block.location && block.location.id).filter(Boolean);
            // Update route title
            const dayNames = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
            const routeDayTitle = document.getElementById('route-day-title');
            if (routeDayTitle) routeDayTitle.textContent = `${dayNames[selectedDay] || selectedDay} Route`;
            // Call fetchAndDisplayRoute with placeIds
            if (placeIds.length > 0) {
                fetchAndDisplayRoute(placeIds);
            } else {
                clearRenderedRoute();
            }
        });
    }
    // Populate location dropdown in Add Block modal
    async function populateLocationDropdown() {
        const locationSelect = document.getElementById('block-location');
        if (!locationSelect) return;
        locationSelect.innerHTML = '<option value="">Select location...</option>';
        const locations = await fetchAllLocations();
        locations.forEach(loc => {
            const option = document.createElement('option');
            option.value = loc.code;
            option.textContent = loc.full_name || loc.code;
            locationSelect.appendChild(option);
        });
    }

    // Add Block modal logic
    const addBlockBtn = document.getElementById('add-block-btn');
    const addBlockModal = document.getElementById('add-block-modal');
    const closeBlockModal = document.getElementById('close-block-modal');
    const addBlockForm = document.getElementById('add-block-form');

    if (addBlockBtn && addBlockModal) {
        addBlockBtn.addEventListener('click', async function() {
            // Reset modal to add mode
            editBlockState = null;
            await populateLocationDropdown();
            document.getElementById('block-day').value = 'Monday';
            document.getElementById('block-start').value = '';
            document.getElementById('block-end').value = '';
            document.getElementById('block-location').value = '';
            // Remove modal footer if present (reset buttons)
            let modalFooter = addBlockForm.parentElement.querySelector('.modal-footer');
            if (modalFooter) modalFooter.remove();
            // Inject modal footer with Add and Cancel buttons
            modalFooter = document.createElement('div');
            modalFooter.className = 'modal-footer';
            modalFooter.style = 'display:flex;justify-content:center;gap:10px;margin-top:10px;';
            // Add button
            const addBtn = document.createElement('button');
            addBtn.type = 'submit';
            addBtn.style = 'background:#013677;color:#fff;padding:7px 18px;border:none;border-radius:6px;font-weight:600;cursor:pointer;';
            addBtn.textContent = 'Add';
            // Cancel button
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.id = 'close-block-modal';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.style = 'background:#eee;color:#013677;padding:7px 18px;border:none;border-radius:6px;font-weight:600;cursor:pointer;';
            modalFooter.appendChild(addBtn);
            modalFooter.appendChild(cancelBtn);
            addBlockForm.appendChild(modalFooter);
            // Cancel button logic
            cancelBtn.onclick = function() {
                addBlockModal.style.display = 'none';
                editBlockState = null;
                modalFooter.innerHTML = '';
            };
            addBlockModal.style.display = 'block';
        });
    }
    if (closeBlockModal && addBlockModal) {
        closeBlockModal.addEventListener('click', function() {
            addBlockModal.style.display = 'none';
            // Reset modal state
            editBlockState = null;
            // Remove delete button if present
            const deleteBtn = document.getElementById('delete-block-btn');
            if (deleteBtn) deleteBtn.remove();
        });
    }
    if (addBlockForm) {
        // Only one submit handler is set via onsubmit below
    }
    setupMajorDropdown();

    // AI Agent dropdown
    const aiHeader = document.getElementById('ai-header');
    if (aiHeader) {
        aiHeader.addEventListener('click', toggleAIDropdown);
    }

        // --- SCHEDULE CALENDAR POPULATION ---
        async function populateScheduleCalendar() {
            const userData = await getUserData();
            if (!userData.schedule) return;
            // Sanitize schedule: remove null/invalid blocks
            const dayKeys = ['mon','tue','wed','thu','fri','sat','sun'];
            dayKeys.forEach(d => {
                userData.schedule[d] = (userData.schedule[d] || []).filter(b => b && typeof b === 'object' && b.start_time && b.end_time && b.location && b.location.code);
            });
            const days = dayKeys;
            days.forEach(dayKey => {
                const dayDiv = document.querySelector(`.day-content[day="${dayKey}"]`);
                if (!dayDiv) return;
                dayDiv.innerHTML = '';
                const blocks = userData.schedule[dayKey] || [];
                blocks.forEach((block, idx) => {
                    if (!block || !block.location) return; // guard against malformed entry
                    const blockDiv = document.createElement('div');
                    blockDiv.className = 'schedule-item class';
                    blockDiv.innerHTML = `${block.start_time} - ${block.end_time}<br>${block.location.code}`;
                    blockDiv.style.cursor = 'pointer';
                    blockDiv.addEventListener('click', function() {
                        if (!block || !block.location) return; // extra safety
                        openEditBlockModal(dayKey, idx, block);
                    });
                    dayDiv.appendChild(blockDiv);
                });
            });
            // Also update route if the changed day is the currently selected route day
            const routeDaySelect = document.getElementById('route-day-select');
            let selectedDay = 'mon';
            if (routeDaySelect) {
                selectedDay = routeDaySelect.value || 'mon';
            }
            const blocksForRoute = (userData.schedule && userData.schedule[selectedDay]) ? userData.schedule[selectedDay] : [];
            const placeIds = blocksForRoute.filter(b => b && b.location && b.location.id).map(block => block.location.id);
            if (placeIds.length > 0) {
                fetchAndDisplayRoute(placeIds);
            } else {
                clearRenderedRoute();
            }
        }

        // Modal logic for editing/deleting blocks
        let editBlockState = null; // { dayKey, idx, block }
        function openEditBlockModal(dayKey, idx, block) {
            if (!block || !block.location) {
                console.warn('Attempted to edit invalid block, ignoring.');
                return;
            }
            editBlockState = { dayKey, idx, block };
            // Show modal and pre-fill values
            populateLocationDropdown().then(() => {
                document.getElementById('block-day').value = {
                    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
                }[dayKey];
                document.getElementById('block-start').value = block.start_time;
                document.getElementById('block-end').value = block.end_time;
                document.getElementById('block-location').value = block.location.code;
                const submitBtn = addBlockForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = 'Update';
            });
            addBlockModal.style.display = 'block';
            // Remove modal footer if present (reset buttons)
            let modalFooter = addBlockForm.parentElement.querySelector('.modal-footer');
            if (modalFooter) modalFooter.remove();
            modalFooter = document.createElement('div');
            modalFooter.className = 'modal-footer';
            modalFooter.style = 'display:flex;justify-content:center;gap:10px;margin-top:10px;';
            // Update button
            const updateBtn = document.createElement('button');
            updateBtn.type = 'submit';
            updateBtn.style = 'background:#013677;color:#fff;padding:7px 18px;border:none;border-radius:6px;font-weight:600;cursor:pointer;';
            updateBtn.textContent = 'Update';
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.id = 'delete-block-btn';
            deleteBtn.type = 'button';
            deleteBtn.textContent = 'Delete';
            deleteBtn.style = 'background:#e74c3c;color:#fff;padding:7px 18px;border:none;border-radius:6px;font-weight:600;cursor:pointer;';
            // Cancel button
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.id = 'close-block-modal';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.style = 'background:#eee;color:#013677;padding:7px 18px;border:none;border-radius:6px;font-weight:600;cursor:pointer;';
            // Add buttons in order: Update, Delete, Cancel
            modalFooter.appendChild(updateBtn);
            modalFooter.appendChild(deleteBtn);
            modalFooter.appendChild(cancelBtn);
            addBlockForm.appendChild(modalFooter);
            // Cancel button logic
            cancelBtn.onclick = function() {
                addBlockModal.style.display = 'none';
                editBlockState = null;
                modalFooter.innerHTML = '';
            };
            // Delete button logic
            deleteBtn.onclick = async function() {
                const userData = await getUserData();
                userData.schedule[dayKey].splice(idx, 1);
                await saveUserData(userData);
                addBlockModal.style.display = 'none';
                showNotification('Block deleted');
                editBlockState = null;
                modalFooter.innerHTML = '';
                await populateScheduleCalendar();
            };
            // Update button is handled by form submit
        }

        // Patch addBlockForm submit to handle edit
        if (addBlockForm) {
            // Remove any previous submit listeners
            addBlockForm.onsubmit = async function(e) {
                e.preventDefault();
                const day = document.getElementById('block-day').value;
                const start = document.getElementById('block-start').value;
                const end = document.getElementById('block-end').value;
                const locationCode = document.getElementById('block-location').value;
                const locations = await fetchAllLocations();
                const locationObj = locations.find(loc => loc.code === locationCode);
                if (!locationObj) {
                    showNotification('Location not found!');
                    return;
                }
                const dayMap = {
                    Monday: 'mon', Tuesday: 'tue', Wednesday: 'wed', Thursday: 'thu', Friday: 'fri', Saturday: 'sat', Sunday: 'sun'
                };
                const modelDay = dayMap[day];
                const userData = await getUserData();
                if (!userData.schedule) {
                    userData.schedule = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
                }
                if (!userData.schedule[modelDay]) {
                    userData.schedule[modelDay] = [];
                }
                function toMinutes(t) {
                    const [h, m] = t.split(':').map(Number);
                    return h * 60 + m;
                }
                const newStart = toMinutes(start);
                const newEnd = toMinutes(end);
                if (newEnd <= newStart) {
                    showNotification('Time conflict: End time must be after start time.', true);
                    return;
                }
                let conflict = false;
                // If editing, skip conflict check for the block being edited
                const blocksToCheck = editBlockState && modelDay === editBlockState.dayKey ? userData.schedule[modelDay].filter((_, i) => i !== editBlockState.idx) : userData.schedule[modelDay];
                for (const block of blocksToCheck) {
                    const blockStart = toMinutes(block.start_time);
                    const blockEnd = toMinutes(block.end_time);
                    if ((newStart >= blockStart && newStart < blockEnd) ||
                        (newEnd > blockStart && newEnd <= blockEnd) ||
                        (newStart < blockStart && newEnd > blockEnd)) {
                        conflict = true;
                        break;
                    }
                }
                if (conflict) {
                    showNotification('Time conflict: The entered time overlaps with an existing block.', true);
                    return;
                }
                const newBlock = { start_time: start, end_time: end, location: locationObj };
                if (editBlockState) {
                    // Editing existing block: update in place
                    if (modelDay === editBlockState.dayKey) {
                        userData.schedule[modelDay][editBlockState.idx] = newBlock;
                    } else {
                        // Move block to new day
                        userData.schedule[editBlockState.dayKey].splice(editBlockState.idx, 1);
                        userData.schedule[modelDay].push(newBlock);
                    }
                    userData.schedule[modelDay].sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
                    await saveUserData(userData);
                    addBlockModal.style.display = 'none';
                    showNotification('Block updated');
                    editBlockState = null;
                    // Remove delete button after edit
                    let modalFooter = addBlockForm.parentElement.querySelector('.modal-footer');
                    if (modalFooter) {
                        const deleteBtn = modalFooter.querySelector('#delete-block-btn');
                        if (deleteBtn) deleteBtn.remove();
                    }
                    await populateScheduleCalendar();
                    return;
                }
                // Normal add
                userData.schedule[modelDay].push(newBlock);
                userData.schedule[modelDay].sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
                await saveUserData(userData);
                addBlockModal.style.display = 'none';
                showNotification(`Block added to ${day}: ${start}-${end}`);
                await populateScheduleCalendar();
            }
        }
        // Initial population on DOMContentLoaded
        populateScheduleCalendar();

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
    const clearResponseBtn = document.getElementById('clear-response-btn');
    
    if (nextCoursesBtn && aiInput) {
        nextCoursesBtn.addEventListener('click', async () => {
            // Get completed courses from checklist
            const completedCourses = getCompletedCoursesFromChecklist();
            const courseList = completedCourses.length > 0 ? completedCourses.join(', ') : 'none yet';
            
            const message = `Given the courses I've completed (${courseList}), what courses should I take next to stay on track for graduation? Please recommend specific courses from my degree requirements.`;
            aiInput.value = message;
            
            // Automatically send the query
            await sendAIQuery(message);
        });
    }
    
    if (courseRequirementsBtn && aiInput) {
        courseRequirementsBtn.addEventListener('click', () => {
            aiInput.value = "What are the requirements for this course? Include prerequisites and corequisites.";
        });
    }
    
    if (clearResponseBtn) {
        clearResponseBtn.addEventListener('click', clearAIResponse);
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
            updateCreditsEarned();
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
            updateCreditsEarned();
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

// Get completed courses from the checklist
function getCompletedCoursesFromChecklist() {
    const completedCourses = [];
    const checkboxes = document.querySelectorAll('.course-checkbox-item input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        const courseCode = checkbox.getAttribute('data-course-code');
        if (courseCode) {
            completedCourses.push(courseCode);
        }
    });
    
    return completedCourses;
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
function showNotification(message, conflict = false) {
    const notification = document.createElement('div');
    // If message contains 'Time conflict', use red background
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: ${conflict ? '#e74c3c' : '#27ae60'};
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


// --- AI Agent wiring (drop-in) ---
(function () {
    const API_BASE_URL = 'http://127.0.0.1:8000/api'; // keep your current value
  
    const aiButton = document.querySelector('.ai-button');
    const aiInput  = document.querySelector('.ai-input');
    const aiOut    = document.getElementById('ai-output');
    const nextBtn  = document.getElementById('next-courses-btn');
    const reqBtn   = document.getElementById('course-requirements-btn');
  
    if (!aiButton || !aiInput || !aiOut) return;
  
    // ensure black text for output (in case of dark theme)
    aiOut.style.color = '#000';
  
    // simple local storage session so multi-turn works
    const getSessionId = () => {
      try { return localStorage.getItem('adkSessionId') || null; } catch { return null; }
    };
    const setSessionId = (sid) => {
      try { if (sid) localStorage.setItem('adkSessionId', sid); } catch {}
    };
  
    async function sendToAgent(query) {
      aiOut.textContent = 'Thinking…';
      aiButton.disabled = true;
  
      try {
        const body = { query };
        const sid = getSessionId();
        if (sid) body.session_id = sid; // reuse the same ADK session
  
        const res = await fetch(`${API_BASE_URL}/agent/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          aiOut.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
          return;
        }
  
        // persist session id returned by backend
        if (data.session_id) setSessionId(data.session_id);
  
        const answer = data.response ?? data.answer ?? data.output ?? data.result ?? data.text ?? data;
        aiOut.textContent = typeof answer === 'string' ? answer : JSON.stringify(answer, null, 2);

      } catch (e) {
        console.error(e);
        aiOut.textContent = 'Request failed.';
      } finally {
        aiButton.disabled = false;
      }
    }
  
    // Wire the main Ask button
    aiButton.addEventListener('click', async () => {
      const q = (aiInput.value || '').trim();
      if (!q) return;
      await sendToAgent(q);
      aiInput.value = '';
    });
  
    // Enter submits (Shift+Enter = newline)
    aiInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const q = (aiInput.value || '').trim();
        if (!q) return;
        await sendToAgent(q);
        aiInput.value = '';
      }
    });
  
    // Prompt template buttons just fill the input (and optionally auto-send)
    if (nextBtn) {
      nextBtn.addEventListener('click', async () => {
        aiInput.value = 'What should I take next?';
        // If you want it to auto-send, uncomment:
        // aiButton.click();
      });
    }
  
    if (reqBtn) {
      reqBtn.addEventListener('click', () => {
        aiInput.value = 'Course requirements';
        // aiButton.click();
      });
    }
  })();
