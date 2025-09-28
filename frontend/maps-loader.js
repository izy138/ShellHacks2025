// maps-loader.js - Backend mediated map fetcher (CSP compliant)
// Exposes window.MapsBackend with helper methods.
(function() {
  // Fixed base API per user request
  const API_ROOT = 'http://127.0.0.1:8000/api';

  function decodePolyline(encoded) {
    if (!encoded) return [];
    let index = 0, lat = 0, lng = 0, coordinates = [];
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;
      shift = 0; result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;
      coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return coordinates;
  }

  function computeBounds(points) {
    if (!points.length) return null;
    let minLat =  90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const p of points) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }
    return { minLat, maxLat, minLng, maxLng };
  }

  function project(points, width, height, padding = 12) {
    const b = computeBounds(points) || { minLat:0, maxLat:0, minLng:0, maxLng:0 };
    const latDiff = b.maxLat - b.minLat || 1e-6;
    const lngDiff = b.maxLng - b.minLng || 1e-6;
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;
    return points.map(pt => {
      const x = padding + ((pt.lng - b.minLng) / lngDiff) * innerW;
      const y = padding + (1 - (pt.lat - b.minLat) / latDiff) * innerH; // invert y
      return { ...pt, x, y };
    });
  }

  function buildPolylinePath(projected) {
    if (!projected.length) return '';
    return projected.map((p,i)=> (i===0?`M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`:`L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)).join(' ');
  }

  function renderStaticMap(containerId, data) {
    try {
      const el = document.getElementById(containerId);
      if (!el) { console.warn('[MapsBackend] container not found', containerId); return; }

      // If backend already supplied svg markup, trust & insert (sanitize minimal)
      if (data && data.svg) {
        el.innerHTML = data.svg; return;
      }

      const encoded = data?.polyline || data?.overviewPolyline || '';
      const rawPoints = data?.points && data.points.length ? data.points : decodePolyline(encoded);
      const width = data?.width || el.clientWidth || 400;
      const height = data?.height || 200;
      const projected = project(rawPoints, width, height);
      const path = buildPolylinePath(projected);

      const markers = projected.map((p,i)=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${i===0?'#2ecc71': (i===projected.length-1?'#e74c3c':'#3498db')}" />`).join('');

      const svg = `\n<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:#fafafa;border:1px solid #ddd;border-radius:8px;">\n  <path d="${path}" fill="none" stroke="#1e40af" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>\n  ${markers}\n</svg>`;
      el.innerHTML = svg;
    } catch (e) {
      console.error('[MapsBackend] renderStaticMap error', e);
    }
  }

  async function fetchMap(params = {}) {
    const { day, placeIds, origin, destination } = params;
    const url = API_ROOT + '/route/get_map'; // adjusted (removed extra /api)
    const payload = { day, place_ids: placeIds, origin, destination };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      document.dispatchEvent(new CustomEvent('map-data-ready', { detail: data }));
      return data;
    } catch (e) {
      console.error('[MapsBackend] fetchMap failed', e);
      throw e;
    }
  }

  async function fetchAndRender(containerId, params) {
    const data = await fetchMap(params);
    renderStaticMap(containerId, data);
    return data;
  }

  window.MapsBackend = {
    fetchMap,
    fetchAndRender,
    renderStaticMap,
    decodePolyline
  };

  console.log('[MapsBackend] Loader ready (backend mediated).');
})();
