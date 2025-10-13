// /api/astro-proxy.js - SIMPLIFIED VERSION
// No external dependencies, basic timezone handling

export default async function handler(req, res) {
  console.log('=== Astro Proxy Function Started ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request - returning 200');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body:', req.body);
    const { endpoint, params } = req.body;

    if (!endpoint || !params) {
      console.error('Missing endpoint or params');
      return res.status(400).json({ error: 'Missing endpoint or params' });
    }

    // Check API key
    console.log('Checking FREE_ASTRO_API_KEY...');
    console.log('FREE_ASTRO_API_KEY exists:', !!process.env.FREE_ASTRO_API_KEY);
    
    if (!process.env.FREE_ASTRO_API_KEY) {
      console.error('FREE_ASTRO_API_KEY not set in environment');
      return res.status(500).json({ error: 'Astrology API not configured' });
    }

    let apiParams;

    // Handle timezone endpoint differently (it uses dateOfBirth string)
    if (endpoint === 'timezone') {
      console.log('Timezone endpoint - parsing dateOfBirth:', params.dateOfBirth);
      
      const date = new Date(params.dateOfBirth);
      apiParams = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: 12, // Use noon for timezone lookup
        min: 0,
        lat: parseFloat(params.lat),
        lon: parseFloat(params.lon)
      };
    } else {
      // Handle astrology endpoints (planets, houses, aspects, natal-wheel-chart)
      apiParams = {
        year: parseInt(params.year),
        month: parseInt(params.month),
        day: parseInt(params.day),
        hour: parseInt(params.hour),
        min: parseInt(params.min),
        lat: parseFloat(params.lat),
        lon: parseFloat(params.lon),
        tzone: parseFloat(params.tzone || 0)
      };
    }

    // Validate required fields
    if (isNaN(apiParams.year) || isNaN(apiParams.month) || isNaN(apiParams.day) ||
        isNaN(apiParams.hour) || isNaN(apiParams.min) || 
        isNaN(apiParams.lat) || isNaN(apiParams.lon)) {
      console.error('Invalid parameter types:', apiParams);
      return res.status(400).json({ 
        error: 'Invalid parameter types',
        params: apiParams
      });
    }

    console.log('Calling Free Astrology API:', `https://json.freeastrologyapi.com/${endpoint}`);
    console.log('With formatted params:', apiParams);

    // Call Free Astrology API
    const response = await fetch(`https://json.freeastrologyapi.com/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.FREE_ASTRO_API_KEY
      },
      body: JSON.stringify(apiParams)
    });

    console.log('Free Astrology API response status:', response.status);

    const responseText = await response.text();
    console.log('Free Astrology API raw response:', responseText);

    if (!response.ok) {
      console.error('Free Astrology API error:', response.status, responseText);
      return res.status(response.status).json({ 
        error: 'Free Astrology API error', 
        status: response.status,
        details: responseText 
      });
    }

    const data = JSON.parse(responseText);
    console.log('Free Astrology API success - data received');
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('!!! Astro Proxy Critical Error !!!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}