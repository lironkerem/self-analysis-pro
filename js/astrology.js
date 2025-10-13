// js/astrology.js
// FIXED: Ensure all required params are sent to API
import { getPlanets, getHouses, getAspects, getNatalWheelChart } from './astroApi.js';

export class AstrologyEngine {
  constructor() {
    console.log('AstrologyEngine initialized (Free Astrology API)');
    
    this.zodiacData = [
      ["Capricorn", 1, 1, "Saturn", "Earth"],
      ["Aquarius", 1, 20, "Saturn, Uranus", "Air"],
      ["Pisces", 2, 19, "Jupiter, Neptune", "Water"],
      ["Aries", 3, 21, "Mars", "Fire"],
      ["Taurus", 4, 20, "Venus", "Earth"],
      ["Gemini", 5, 21, "Mercury", "Air"],
      ["Cancer", 6, 21, "Moon", "Water"],
      ["Leo", 7, 23, "Sun", "Fire"],
      ["Virgo", 8, 23, "Mercury", "Earth"],
      ["Libra", 9, 23, "Venus", "Air"],
      ["Scorpio", 10, 23, "Mars, Pluto", "Water"],
      ["Sagittarius", 11, 22, "Jupiter", "Fire"],
      ["Capricorn", 12, 22, "Saturn", "Earth"]
    ];
    
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
      "Earth": "Malkuth (Kingdom)",
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
    const primaryPlanet = planet.split(',')[0].trim();
    return this.sefiraMapping[primaryPlanet] || "Malkuth (Kingdom)";
  }

  // Helper for fallback when API fails
  getBasicAstrology(dateOfBirth) {
    const [year, month, day] = dateOfBirth.split('-').map(Number);
    const zodiac = this.getZodiacSign(month, day);
    const sefira = this.getSefiraFromPlanet(zodiac.planet);
    
    return {
      zodiac: zodiac,
      sefira: sefira,
      planets: null,
      houses: null,
      aspects: null,
      natalChart: null
    };
  }

  async analyze(formData) {
    try {
      const { dateOfBirth, timeOfBirth, locationLat, locationLon, tzone } = formData;
      
      if (!dateOfBirth) {
        throw new Error("Date of birth is required.");
      }
      
      // Parse DOB
      const [year, month, day] = dateOfBirth.split('-').map(Number);
      const zodiac = this.getZodiacSign(month, day);
      const sefira = this.getSefiraFromPlanet(zodiac.planet);
      
      // Check if we have complete birth data for natal chart
      const hasTime = timeOfBirth && timeOfBirth !== "";
      const hasLocation = locationLat && locationLon && 
                         locationLat !== "" && locationLon !== "" &&
                         !isNaN(parseFloat(locationLat)) && !isNaN(parseFloat(locationLon));
      
      if (!hasTime || !hasLocation) {
        console.warn("⚠️ Incomplete birth data - returning basic astrology only");
        console.warn(`  Time: ${hasTime ? '✅' : '❌'}, Location: ${hasLocation ? '✅' : '❌'}`);
        return {
          zodiac: zodiac,
          sefira: sefira,
          planets: null,
          houses: null,
          aspects: null,
          natalChart: null
        };
      }
      
      // Parse time
      const [hour, minute] = timeOfBirth.split(':').map(Number);
      
      if (isNaN(hour) || isNaN(minute)) {
        console.error("Invalid time format:", timeOfBirth);
        throw new Error("Invalid time of birth format");
      }
      
      // Build API params - ALL required fields
      const params = {
        year: year,
        month: month,
        day: day,
        hour: hour,
        min: minute,
        lat: parseFloat(locationLat),
        lon: parseFloat(locationLon),
        tzone: parseFloat(tzone || 0)
      };
      
      console.log("🚀 Calling Free Astrology API with params:", params);
      
      // Call all endpoints
      const [planets, houses, aspects, natalChart] = await Promise.all([
        getPlanets(params),
        getHouses(params),
        getAspects(params),
        getNatalWheelChart(params)
      ]);
      
      console.log("✅ All astrology API calls successful");
      
      return {
        zodiac: zodiac,
        sefira: sefira,
        planets,
        houses,
        aspects,
        natalChart
      };
    } catch (err) {
      console.error("❌ AstrologyEngine analyze() failed:", err);
      throw err;
    }
  }
}