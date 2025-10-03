// js/ui.natal.js
// Rendering for the Full Natal Chart Card

export function renderNatalChartBlock(astrologyResults) {
  const container = document.getElementById("natal-chart-output");
  if (!container) {
    console.warn("No #natal-chart-output container found.");
    return;
  }

  // Clear old content
  container.innerHTML = "";

  // === 1. Chart Wheel ===
  if (astrologyResults.natalChart && astrologyResults.natalChart.svg) {
    const chartSection = document.createElement("div");
    chartSection.className = "natal-chart-section";

    const title = document.createElement("h3");
    title.textContent = "Your Natal Chart";
    chartSection.appendChild(title);

    const chartWrapper = document.createElement("div");
    chartWrapper.className = "natal-chart-svg";
    chartWrapper.innerHTML = astrologyResults.natalChart.svg; // SVG from API
    chartSection.appendChild(chartWrapper);

    container.appendChild(chartSection);
  }

  // === 2. Planetary Positions Table ===
  if (astrologyResults.planets && astrologyResults.planets.data) {
    const planetSection = document.createElement("div");
    planetSection.className = "natal-planets-section";

    const title = document.createElement("h4");
    title.textContent = "Planetary Positions";
    planetSection.appendChild(title);

    const table = document.createElement("table");
    table.className = "natal-table planets-table";
    table.innerHTML = `
      <thead>
        <tr><th>Planet</th><th>Sign</th><th>Degree</th><th>House</th></tr>
      </thead>
      <tbody>
        ${astrologyResults.planets.data
          .map(
            (p) => `
          <tr>
            <td>${p.name}</td>
            <td>${p.sign}</td>
            <td>${p.degree}</td>
            <td>${p.house}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    `;
    planetSection.appendChild(table);
    container.appendChild(planetSection);
  }

  // === 3. House Cusps Table ===
  if (astrologyResults.houses && astrologyResults.houses.data) {
    const houseSection = document.createElement("div");
    houseSection.className = "natal-houses-section";

    const title = document.createElement("h4");
    title.textContent = "House Cusps";
    houseSection.appendChild(title);

    const table = document.createElement("table");
    table.className = "natal-table houses-table";
    table.innerHTML = `
      <thead>
        <tr><th>House</th><th>Sign</th><th>Degree</th></tr>
      </thead>
      <tbody>
        ${astrologyResults.houses.data
          .map(
            (h) => `
          <tr>
            <td>${h.house}</td>
            <td>${h.sign}</td>
            <td>${h.degree}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    `;
    houseSection.appendChild(table);
    container.appendChild(houseSection);
  }

  // === 4. Aspects Table ===
  if (astrologyResults.aspects && astrologyResults.aspects.data) {
    const aspectsSection = document.createElement("div");
    aspectsSection.className = "natal-aspects-section";

    const title = document.createElement("h4");
    title.textContent = "Aspects";
    aspectsSection.appendChild(title);

    const table = document.createElement("table");
    table.className = "natal-table aspects-table";
    table.innerHTML = `
      <thead>
        <tr><th>Aspect</th><th>Orb</th><th>Description</th></tr>
      </thead>
      <tbody>
        ${astrologyResults.aspects.data
          .map(
            (a) => `
          <tr>
            <td>${a.aspect}</td>
            <td>${a.orb || "-"}</td>
            <td>${a.type}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    `;
    aspectsSection.appendChild(table);
    container.appendChild(aspectsSection);
  }
}
