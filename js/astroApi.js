// js/astroApi.js - client wrapper for the Vercel astro-proxy
// FIX #8: Added retry logic for failed API calls

const PROXY = '/api/astro-proxy';

// FIX #8: Helper function with retry logic
async function callAstroWithRetry(endpoint, params, retries = 2) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, params })
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(err.message || 'Astrology API error');
      }
      
      return await res.json();
    } catch (error) {
      console.error(`Astrology API attempt ${attempt + 1} failed:`, error.message);
      
      // If last attempt, throw the error
      if (attempt === retries - 1) {
        throw error;
      }
      
      // Wait before retry (exponential backoff: 1s, 2s)
      const waitTime = 1000 * (attempt + 1);
      console.log(`Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Original function without retry (kept for compatibility)
async function callAstro(endpoint, params) {
  const res = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, params })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(err.message || 'Astrology API error');
  }
  return res.json();
}

// Public API functions now use retry logic
export async function getPlanets(params) {
  return callAstroWithRetry('western/planets', params);
}

export async function getHouses(params) {
  return callAstroWithRetry('western/houses', params);
}

export async function getAspects(params) {
  return callAstroWithRetry('western/aspects', params);
}

export async function getNatalWheelChart(params) {
  return callAstroWithRetry('western/natal-wheel-chart', params);
}