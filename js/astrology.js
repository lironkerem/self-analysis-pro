// Astrology Calculation Engine
class AstrologyEngine {
  constructor() {
    this.zodiacData = [
      ["Capricorn", 1, 1, "Saturn", "Earth"],
      ["Aquarius", 1, 20, "Uranus", "Air"],
      ["Pisces", 2, 19, "Neptune", "Water"],
      ["Aries", 3, 21, "Mars", "Fire"],
      ["Taurus", 4, 20, "Venus", "Earth"],
      ["Gemini", 5, 21, "Mercury", "Air"],
      ["Cancer", 6, 21, "Moon", "Water"],
      ["Leo", 7, 23, "Sun", "Fire"],
      ["Virgo", 8, 23, "Mercury", "Earth"],
      ["Libra", 9, 23, "Venus", "Air"],
      ["Scorpio", 10, 23, "Pluto", "Water"],
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
    return this.sefiraMapping[planet] || "Malkuth (Kingdom)";
  }
  
  analyze(dateOfBirth) {
    const numerologyEngine = new NumerologyEngine();
    const dobInfo = numerologyEngine.parseDateOfBirth(dateOfBirth);
    const zodiac = this.getZodiacSign(dobInfo.month, dobInfo.day);
    const sefira = this.getSefiraFromPlanet(zodiac.planet);
    
    return { zodiac, sefira };
  }
}

// Full Natal Chart Manager with ProKerala API Integration
class NatalChartManager {
  constructor(appState) {
    this.appState = appState;
    this.proxyUrl = 'https://prokerala-proxy.vercel.app/api/prokerala';
  }
  
  async generate() {
    const formData = this.appState.formData;
    const output = document.getElementById('natal-chart-output');
    if (!output) return;
    
    if (!formData.dateOfBirth || !formData.timeOfBirth || !formData.locationOfBirth) {
      output.innerHTML = `
        <div class="natal-requirement">
          <h4>Requirements for Full Natal Chart:</h4>
          <ul>
            <li>Date of Birth ${formData.dateOfBirth ? '✅' : '❌'}</li>
            <li>Time of Birth ${formData.timeOfBirth ? '✅' : '❌'}</li>
            <li>Location of Birth ${formData.locationOfBirth ? '✅' : '❌'}</li>
          </ul>
          <p>Please fill in all required fields above to generate your complete natal chart.</p>
        </div>`;
      return;
    }
    
    const locationInput = document.getElementById('location-birth');
    const lat = locationInput?.dataset.lat;
    const lon = locationInput?.dataset.lon;
    
    if (!lat || !lon) {
      output.innerHTML = `
        <div style="color: #ef4444;">
          <p>Location coordinates not found.</p>
          <p>Please select a location from the dropdown when typing your birth city.</p>
        </div>`;
      return;
    }
    
    try {
      output.innerHTML = '<div style="color: var(--primary-color); text-align: center; padding: 20px;">🌟 Generating your complete natal chart...</div>';
      
      const chartData = await this.getFullNatalChart(
        formData.dateOfBirth,
        formData.timeOfBirth,
        parseFloat(lat),
        parseFloat(lon)
      );
      
      this.renderFullNatalChart(chartData);
      
    } catch (error) {
      console.error('Natal chart error:', error);
      output.innerHTML = `
        <div style="color: #ef4444;">
          <h4>Error generating natal chart:</h4>
          <p>${Utils.escapeHtml(error.message)}</p>
          <p><small>Please check your internet connection and try again.</small></p>
        </div>`;
    }
  }
  
 async getFullNatalChart(dob, tob, lat, lon) {
  console.log('Attempting natal chart API call with:', { dob, tob, lat, lon });
  
try {
  const requestData = {
  path: "v2/astrology/planet-position",
    payload: {
      datetime: `${dob}T${tob}:00+00:00`,
      coordinates: `${lat},${lon}`,
      ayanamsa: 1,
      house_system: "placidus"
    }
  };
    console.log('Request payload:', requestData);
      
      const response = await fetch(this.proxyUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`Server error: ${response.status} - ${response.statusText}`);
      }
      
const data = await response.json();
console.log('API response data:', data);
console.log('Full data structure:', JSON.stringify(data, null, 2));

if (!data || !data.data) {
  // Log the actual error from ProKerala
  if (data.errors && data.errors.length > 0) {
    console.error('ProKerala API errors:', data.errors);
    throw new Error(`ProKerala API error: ${JSON.stringify(data.errors)}`);
  }
  throw new Error('No chart data returned from API');
}
      
      return data;
      
   } catch (error) {
  console.error('Full error details:', error);
  
  if (error.message.includes('CORS') || 
      error.message.includes('404') || 
      error.message.includes('Failed to fetch') ||
      error.name === 'TypeError') {
    console.log('Using mock data for testing...');
    return this.getMockNatalChart();
  }
  
  throw error;
}
  }
  
renderFullNatalChart(data) {
  const output = document.getElementById('natal-chart-output');
  if (!output) return;
  
  if (!data || !data.data || !data.data.planet_position) {
    output.innerHTML = '<div style="color: #ef4444;">No chart data available to display.</div>';
    return;
  }
  
  let html = '<div class="natal-chart-container">';
  html += '<h3 style="color: var(--primary-color); text-align: center; margin-bottom: 20px;">🌟 Your Complete Natal Chart 🌟</h3>';
  
  // Planetary Positions Section
  html += '<div class="natal-section">';
  html += '<h4 style="color: var(--primary-color); border-bottom: 2px solid var(--primary-color); padding-bottom: 5px;">Planetary Positions (Vedic/Sidereal)</h4>';
  html += '<table class="natal-table">';
  html += '<tr><th>Planet</th><th>Sign (Rasi)</th><th>House</th><th>Degree</th><th>Retrograde</th></tr>';
  
  data.data.planet_position.forEach(planet => {
    const retrograde = planet.is_retrograde ? '℞' : '';
    html += `<tr>
      <td><strong>${planet.name}</strong></td>
      <td>${planet.rasi.name}</td>
      <td>House ${planet.position}</td>
      <td>${planet.degree.toFixed(2)}°</td>
      <td>${retrograde}</td>
    </tr>`;
  });
  html += '</table></div>';
  
  html += `<div class="natal-footer">
    <p><small>Chart generated on ${new Date().toLocaleString()}</small></p>
    <p><small>Using Vedic/Sidereal positions (Lahiri Ayanamsa)</small></p>
  </div>`;
  
  html += '</div>';
  
  output.innerHTML = html;
}
  
  getMockNatalChart() {
    return {
      data: {
        planets: [
          { name: "Sun", sign: "Gemini", house: "10th", degree: "15.23" },
          { name: "Moon", sign: "Virgo", house: "1st", degree: "8.45" },
          { name: "Mercury", sign: "Taurus", house: "9th", degree: "22.17" },
          { name: "Venus", sign: "Cancer", house: "11th", degree: "3.56" },
          { name: "Mars", sign: "Leo", house: "12th", degree: "18.32" }
        ],
        houses: [
          { house: "1", sign: "Virgo", degree: "8.45" },
          { house: "2", sign: "Libra", degree: "12.23" },
          { house: "3", sign: "Scorpio", degree: "16.17" },
          { house: "4", sign: "Sagittarius", degree: "20.45" }
        ],
        aspects: [
          { planet1: "Sun", aspect: "Trine", planet2: "Moon", orb: "3.2" },
          { planet1: "Venus", aspect: "Square", planet2: "Mars", orb: "1.8" }
        ]
      }
    };
  }
}
window.AstrologyEngine = AstrologyEngine;