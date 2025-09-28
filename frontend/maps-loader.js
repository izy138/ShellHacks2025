// maps-loader.js
// Loads Google Maps API with key from config.js
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=geometry`;
document.head.appendChild(script);
