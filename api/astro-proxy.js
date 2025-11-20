// api/astro-proxy.js  –  production-ready, fully patched
// Handles:  health, geocode, timezone, astrology-api  (all in one file)
// CORS & URLs cleaned – no trailing spaces.

import tzlookup from 'tz-lookup';

// 1. CORS whitelist – trailing spaces removed
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://self-analysis-pro.vercel.app',
  'https://lironkerem.wixsite.com'
];

export default async function handler(req, res) {
  // ---------- CORS ----------
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { endpoint, params } = req.body;
    if (!endpoint || !params) return res.status(400).json({ error: 'Missing endpoint or params' });

    // ---------- health check ----------
    if (endpoint === 'health') return res.status(200).json({ status: 'ok', timestamp: Date.now() });

    // ---------- geocode ----------
    if (endpoint === 'geocode') {
      const { q } = params;
      if (!q || q.length < 3) return res.status(400).json({ error: 'Query must be ≥ 3 chars' });
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8000);
      try {
        // URL cleaned – no trailing space
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
        const r = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'SelfAnalysisApp/1.0 (lironkerem@gmail.com)' }
        });
        clearTimeout(t);
        if (!r.ok) throw new Error(`Nominatim ${r.status}`);
        const data = await r.json();
        return res.status(200).json(data);
      } catch (e) {
        clearTimeout(t);
        if (e.name === 'AbortError') return res.status(504).json({ error: 'Geocode timeout' });
        throw e;
      }
    }

    // ---------- timezone resolution (used by astrology) ----------
    if (!params.tzone && params.lat && params.lon && params.dateOfBirth) {
      params.tzone = await resolveTzOffset(params.lat, params.lon, params.dateOfBirth);
    }

    // ---------- Free Astrology API ----------
    if (!process.env.FREE_ASTRO_API_KEY) {
      return res.status(500).json({ error: 'Astrology API not configured' });
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      // URL cleaned – no trailing space
      const url = `https://json.freeastrologyapi.com/${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.FREE_ASTRO_API_KEY
        },
        body: JSON.stringify(params),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: 'Astrology API error', details: data.message || 'Unknown' });
      return res.status(200).json(data);
    } catch (e) {
      clearTimeout(timeout);
      if (e.name === 'AbortError') return res.status(504).json({ error: 'Astrology service timeout' });
      throw e;
    }
  } catch (e) {
    console.error('Astro Proxy Error:', e.message);
    return res.status(500).json({ error: 'Internal server error', message: e.message });
  }
}

/* ----------  helper: resolve timezone offset  ---------- */
async function resolveTzOffset(lat, lon, dateStr) {
  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (isNaN(latitude) || isNaN(longitude)) return 0;

    // 1. fast offline tz-lookup
    let tzName;
    try { tzName = tzlookup(latitude, longitude); } catch { /* ignore */ }

    // 2. TimezoneDB API (if key exists)
    const apiKey = process.env.TIMEZONEDB_API_KEY;
    if (!apiKey) return 0;

    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return 0;
    const timestamp = Math.floor(dateObj.getTime() / 1000);

    // URL cleaned – no trailing space
    const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${latitude}&lng=${longitude}&time=${timestamp}`;

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    try {
      const r = await fetch(url, { signal: controller.signal });
      clearTimeout(t);
      if (!r.ok) return 0;
      const data = await r.json();
      return (data.status === 'OK' && typeof data.gmtOffset === 'number') ? data.gmtOffset / 3600 : 0;
    } catch (e) {
      clearTimeout(t);
      return 0;
    }
  } catch {
    return 0;
  }
}