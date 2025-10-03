// js/astroApi.js - client wrapper for the Vercel astro-proxy
const PROXY = '/api/astro-proxy';

async function callAstro(endpoint, params) {
  const res = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, params })
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({ message: 'Unknown error' }));
    throw new Error(err.message || 'Astrology API error');
  }
  return res.json();
}

export async function getPlanets(params) {
  return callAstro('western/planets', params);
}

export async function getHouses(params) {
  return callAstro('western/houses', params);
}

export async function getAspects(params) {
  return callAstro('western/aspects', params);
}

export async function getNatalWheelChart(params) {
  return callAstro('western/natal-wheel-chart', params);
}
