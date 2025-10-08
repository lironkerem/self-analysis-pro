// js/astrology.js
// AstrologyEngine for Free Astrology API
// FIXED: Dual ruling planets for Scorpio, Aquarius, Pisces

import { getPlanets, getHouses, getAspects, getNatalWheelChart } from './astroApi.js';

export class AstrologyEngine {
  constructor() {
    console.log('AstrologyEngine initialized (Free Astrology API)');
    
    // Updated zodiac data with dual planets
    this.zodiacData = [
      ["Capricorn", 1, 1, "Saturn", "Earth"],
      ["Aquarius", 1, 20, "Saturn, Uranus", "Air"], // DUAL PLANETS
      ["Pisces", 2, 19, "Jupiter, Neptune", "Water"], // DUAL PLANETS
      ["Aries", 3, 21, "Mars", "Fire"],
      ["Taurus", 4, 20, "Venus", "Earth"],
      ["Gemini", 5, 21, "Mercury", "Air"],
      ["Cancer", 6, 21, "Moon", "Water"],
      ["Leo", 7, 23, "Sun", "Fire"],
      ["Virgo", 8, 23, "Mercury", "Earth"],
      ["Libra", 9, 23, "Venus", "Air"],
      ["Scorpio", 10, 23, "Mars, Pluto", "Water"], // DUAL PLANETS
      ["Sagittarius", 11, 22, "Jupiter", "Fire"],
      ["Capricorn", 12, 22, "Saturn", "Earth"]
    ];
    
    // Extended sefira mapping for all planets including Earth
    this.sefiraMapping = {
      "Sun": "Tiferet (Beauty)",
      "Moon": "Yesod (Foundation)",
      "Mercury": "Hod (Splendor)",
      "Venus": "Netzach (Victory)",
      "Mars": "Gevurah (Strength)",
      "Jupiter": "Chesed (Kindness)",
      "Saturn": "Binah (Understanding)",
      "Neptune": "Chokhmah (Wisdom)",
      "Pluto": "Keter (Crown)",
      "Earth": "Malkuth (Kingdom)", // Earth only for Malkuth
      "Uranus": "Chokhmah (Wisdom)"
    };
  }
  
  getZodiacSign(month, day) {
    for (let i = this.zodiacData.length - 1; i >= 0; i--) {
      const [name, m, d, planet, element] = this.zodiacData[i];
      if (month > m || (month === m && day >= d)) {
        return { name, planet, element };
      }
    }
    return { 
      name: this.zodiacData[0][0], 
      planet: this.zodiacData[0][3], 
      element: this.zodiacData[0][4] 
    };
  }
  
  getSefiraFromPlanet(planet) {
    // Handle dual planets - use the first (traditional) planet
    const primaryPlanet = planet.split(',')[0].trim();
    return this.sefiraMapping[primaryPlanet] || "Malkuth (Kingdom)";
  }

  async analyze(formData) {
    try {
      const { dateOfBirth, timeOfBirth, locationLat, locationLon, tzone } = formData;
      
      if (!dateOfBirth) {
        throw new Error("Date of birth is required.");
      }
      
      // Parse DOB and get basic astrology (always works)
      const [year, month, day] = dateOfBirth.split('-').map(Number);
      const zodiac = this.getZodiacSign(month, day);
      const sefira = this.getSefiraFromPlanet(zodiac.planet);
      
      // If no time/location, return basic astrology only
      if (!timeOfBirth || !locationLat || !locationLon || 
          locationLat === "" || locationLon === "" || timeOfBirth === "") {
        console.warn("Returning basic astrology - no time/location for natal chart");
        return {
          zodiac: zodiac,
          sefira: sefira,
          planets: null,
          houses: null,
          aspects: null,
          natalChart: null
        };
      }
      
      // Full natal chart with API
      const [hour, minute] = timeOfBirth.split(':').map(Number);
      const params = {
        year, month, day, hour,
        min: minute,
        lat: parseFloat(locationLat),
        lon: parseFloat(locationLon),
        tzone: tzone || 0
      };
      
      const planets = await getPlanets(params);
      const houses = await getHouses(params);
      const aspects = await getAspects(params);
      const natalChart = await getNatalWheelChart(params);
      
      return {
        zodiac: zodiac,
        sefira: sefira,
        planets,
        houses,
        aspects,
        natalChart
      };
    } catch (err) {
      console.error("AstrologyEngine analyze() failed:", err);
      throw err;
    }
  }
}