// ============================================
// /api/astro-proxy.js
// FIXED: Proper error handling and parameter validation
// ============================================
import tzlookup from "tz-lookup";

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { endpoint, params } = req.body;

    if (!endpoint || !params) {
      console.error("Missing endpoint or params:", { endpoint, params });
      return res.status(400).json({ error: "Missing endpoint or params" });
    }

    // CHECK API KEY
    if (!process.env.FREE_ASTRO_API_KEY) {
      console.error("❌ FREE_ASTRO_API_KEY not set in Vercel environment");
      return res.status(500).json({ 
        error: "Astrology API not configured",
        hint: "Add FREE_ASTRO_API_KEY to Vercel environment variables"
      });
    }

    // VALIDATE REQUIRED PARAMS (using correct Free Astrology API names)
    const apiParams = {
      year: params.year,
      month: params.month,
      date: params.day || params.date, // API uses "date" not "day"
      hours: params.hour || params.hours, // API uses "hours" not "hour"
      minutes: params.min || params.minutes, // API uses "minutes" not "min"
      seconds: params.seconds || 0,
      latitude: params.lat || params.latitude, // API uses "latitude" not "lat"
      longitude: params.lon || params.longitude, // API uses "longitude" not "lon"
      timezone: params.tzone || params.timezone || 0 // API uses "timezone" not "tzone"
    };

    const required = ['year', 'month', 'date', 'hours', 'minutes', 'latitude', 'longitude'];
    const missing = required.filter(key => apiParams[key] === undefined || apiParams[key] === null);
    
    if (missing.length > 0) {
      console.error("❌ Missing required params:", missing);
      console.error("📦 Received params:", params);
      console.error("📦 Transformed params:", apiParams);
      return res.status(400).json({ 
        error: "Missing required parameters",
        missing: missing,
        received: params
      });
    }

    // VALIDATE PARAM TYPES
    const numericParams = ['year', 'month', 'date', 'hours', 'minutes', 'seconds', 'latitude', 'longitude', 'timezone'];
    for (const key of numericParams) {
      if (apiParams[key] !== undefined && isNaN(Number(apiParams[key]))) {
        console.error(`❌ Invalid ${key}: ${apiParams[key]} is not a number`);
        return res.status(400).json({
          error: `Invalid parameter: ${key} must be a number`,
          value: apiParams[key]
        });
      }
    }

    // Convert all params to numbers
    ['year', 'month', 'date', 'hours', 'minutes', 'seconds'].forEach(key => {
      if (apiParams[key] !== undefined) apiParams[key] = Number(apiParams[key]);
    });
    ['latitude', 'longitude', 'timezone'].forEach(key => {
      if (apiParams[key] !== undefined) apiParams[key] = parseFloat(apiParams[key]);
    });

    // Remove tzone resolution code since we're using the transformed params
    console.log("🚀 Calling Free Astrology API: ${endpoint}");
    console.log("📦 Transformed API Params:", JSON.stringify(apiParams, null, 2));

    // Call Free Astrology API
    const response = await fetch(`https://json.freeastrologyapi.com/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.FREE_ASTRO_API_KEY
      },
      body: JSON.stringify(params)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Free Astrology API error (${response.status}):`, data);
      return res.status(response.status).json({ 
        error: "Free Astrology API error", 
        status: response.status,
        details: data 
      });
    }

    console.log(`✅ Success: ${endpoint}`);
    return res.status(200).json(data);

  } catch (error) {
    console.error("❌ Astro Proxy Error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message
    });
  }
}

async function resolveTzOffset(lat, lon, dateStr) {
  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error("Invalid lat/lon");
    }

    // Try tz-lookup first (offline, fast)
    let tzName;
    try {
      tzName = tzlookup(latitude, longitude);
      console.log(`📍 Timezone name: ${tzName}`);
    } catch (e) {
      console.warn("tz-lookup failed:", e.message);
    }

    // Use TimezoneDB if available
    const apiKey = process.env.TIMEZONEDB_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ TIMEZONEDB_API_KEY not set, using offset 0");
      return 0;
    }

    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date");
    }
    
    const timestamp = Math.floor(dateObj.getTime() / 1000);
    const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${latitude}&lng=${longitude}&time=${timestamp}`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`TimezoneDB returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "OK" && typeof data.gmtOffset === "number") {
      const offset = data.gmtOffset / 3600;
      console.log(`✅ Timezone offset from TimezoneDB: ${offset}`);
      return offset;
    }
    
    return 0;
  } catch (err) {
    console.error("resolveTzOffset error:", err.message);
    return 0;
  }
}