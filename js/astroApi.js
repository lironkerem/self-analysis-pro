// js/astroApi.js - Optimized with parallel calls and better error handling
const PROXY = '/api/astro-proxy';

// Enhanced retry logic with exponential backoff
async function callAstroWithRetry(endpoint, params, retries = 2) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, params }),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(err.message || `API error: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      const isLastAttempt = attempt === retries - 1;
      
      if (error.name === 'AbortError') {
        console.error(`Astrology API timeout (attempt ${attempt + 1})`);
        if (isLastAttempt) {
          throw new Error('Request timed out. Please check your connection and try again.');
        }
      } else {
        console.error(`Astrology API attempt ${attempt + 1} failed:`, error.message);
        if (isLastAttempt) throw error;
      }
      
      // Exponential backoff: 2s, 4s
      const waitTime = 2000 * Math.pow(2, attempt);
      console.log(`Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Parallel API call optimization
export async function getAllNatalData(params) {
  try {
    // Call all endpoints in parallel
    const [planets, houses, aspects, natalChart] = await Promise.all([
      callAstroWithRetry('western/planets', params),
      callAstroWithRetry('western/houses', params),
      callAstroWithRetry('western/aspects', params),
      callAstroWithRetry('western/natal-wheel-chart', params)
    ]);

    return { planets, houses, aspects, natalChart };
  } catch (error) {
    console.error('Failed to fetch natal data:', error.message);
    throw error;
  }
}

// Individual API functions (kept for backward compatibility)
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
