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

    // Use provided timezone or default to 0
    if (!params.tzone) {
      params.tzone = 0;
      console.log('No timezone provided, defaulting to 0');
    }

    // Check API key
    console.log('Checking FREE_ASTRO_API_KEY...');
    console.log('FREE_ASTRO_API_KEY exists:', !!process.env.FREE_ASTRO_API_KEY);
    console.log('FREE_ASTRO_API_KEY length:', process.env.FREE_ASTRO_API_KEY?.length);
    
    if (!process.env.FREE_ASTRO_API_KEY) {
      console.error('FREE_ASTRO_API_KEY not set in environment');
      return res.status(500).json({ error: 'Astrology API not configured' });
    }

    // Format params for Free Astrology API
    // Ensure all required fields are present and properly typed
    const apiParams = {
      year: parseInt(params.year),
      month: parseInt(params.month),
      day: parseInt(params.day),
      hour: parseInt(params.hour),
      min: parseInt(params.min),
      lat: parseFloat(params.lat),
      lon: parseFloat(params.lon),
      tzone: parseFloat(params.tzone || 0)
    };

    // Validate required fields
    if (isNaN(apiParams.year) || isNaN(apiParams.month) || isNaN(apiParams.day) ||
        isNaN(apiParams.hour) || isNaN(apiParams.min) || 
        isNaN(apiParams.lat) || isNaN(apiParams.lon) || isNaN(apiParams.tzone)) {
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
