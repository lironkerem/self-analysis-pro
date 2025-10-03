// api/astro-proxy.js
// Serverless proxy for Free Astrology API with TimeZoneDB + tz-lookup integration

import tzlookup from "tz-lookup";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { endpoint, params } = req.body;

    if (!endpoint || !params) {
      return res.status(400).json({ error: "Missing endpoint or params" });
    }

    // Resolve timezone offset if not already provided
    if (!params.tzone && params.lat && params.lon && params.dateOfBirth) {
      params.tzone = await resolveTzOffset(params.lat, params.lon, params.dateOfBirth);
    }

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
      return res.status(500).json({ error: "Free Astrology API error", details: data });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Astro Proxy Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Resolve timezone offset in hours using tz-lookup + TimeZoneDB
 * @param {number} lat
 * @param {number} lon
 * @param {string} dateStr - format YYYY-MM-DD
 * @returns {Promise<number>} offset in hours
 */
async function resolveTzOffset(lat, lon, dateStr) {
  try {
    const apiKey = process.env.TIMEZONEDB_API_KEY;
    if (!apiKey) {
      console.warn("TIMEZONEDB_API_KEY not set");
      return 0;
    }

    // Get timezone name from lat/lon
    const tzName = tzlookup(lat, lon);

    // Call TimeZoneDB to get offset at given date
    const response = await fetch(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${lat}&lng=${lon}&time=${Math.floor(new Date(dateStr).getTime() / 1000)}`
    );

    const data = await response.json();

    if (data.status === "OK" && typeof data.gmtOffset === "number") {
      return data.gmtOffset / 3600; // convert seconds to hours
    } else {
      console.warn("TimeZoneDB error:", data);
      return 0;
    }
  } catch (err) {
    console.error("resolveTzOffset error:", err);
    return 0;
  }
}