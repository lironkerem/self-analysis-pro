// js/astrology.js
// AstrologyEngine for Free Astrology API

import { getPlanets, getHouses, getAspects, getNatalWheelChart } from './astroApi.js';

export class AstrologyEngine {
  constructor() {
    console.log('AstrologyEngine initialized (Free Astrology API)');
  }

  /**
   * Analyze natal chart
   * @param {Object} formData
   * @returns {Object} astrologyResults
   */
  async analyze(formData) {
    try {
      const { dateOfBirth, timeOfBirth, locationLat, locationLon } = formData;

      if (!dateOfBirth || !timeOfBirth || !locationLat || !locationLon) {
        throw new Error("Missing required birth data (date, time, location).");
      }

      const [year, month, day] = dateOfBirth.split('-').map(Number);
      const [hour, minute] = timeOfBirth.split(':').map(Number);

      const params = {
        year,
        month,
        day,
        hour,
        min: minute,
        lat: parseFloat(locationLat),
        lon: parseFloat(locationLon)
        // tzone will be auto-resolved by astro-proxy
      };

      // Fetch all astrology data
      const planets = await getPlanets(params);
      const houses = await getHouses(params);
      const aspects = await getAspects(params);
      const natalChart = await getNatalWheelChart(params);

      const results = {
        planets,
        houses,
        aspects,
        natalChart // SVG or chart data
      };

      console.log("AstrologyEngine results:", results);
      return results;
    } catch (err) {
      console.error("AstrologyEngine analyze() failed:", err);
      throw err;
    }
  }
}

// Expose globally for app.js compatibility
window.AstrologyEngine = AstrologyEngine;