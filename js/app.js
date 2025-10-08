// app.js
// Main application script for Self Analysis App
// FIXED: Step indicators, retry logic, standardized errors

import Utils from './utils.js';
import DataMeanings from './meanings.js';
import PDFAssembler from './PDFAssembler.js';
import { UIManager } from './ui.js';
import './astroApi.js';

import { AstrologyEngine } from './astrology.js';
import { renderNatalChartBlock } from './ui.natal.js';
import NumerologyEngine from './numerology.js';
import TarotEngine from './TarotEngine.js';
import { buildNarrative, getNumerologySummary, getAstrologySummary, getTreeSummary } from './narrativeEngine.js';

class SelfAnalysisApp {
  constructor() {
    this.appState = {
      formData: {},
      analysis: {},
    };
    this.astrologyEngine = new AstrologyEngine();
    this.numerologyEngine = new NumerologyEngine();
    this.tarotEngine = new TarotEngine();
    this.ui = new UIManager();
    this.init();
  }

  init() {
    console.log("Initializing Self Analysis App...");

    const form = document.getElementById("analysis-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAnalyze();
      });
    }

    const clearBtn = document.getElementById("btn-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearAll();
      });
    }

    const pdfBtn = document.getElementById("btn-pdf");
    if (pdfBtn) {
      pdfBtn.addEventListener("click", () => {
        this.downloadPDF();
      });
    }
  }

  collectFormData() {
    const form = document.getElementById("analysis-form");
    if (!form) return;

    const locationInput = document.getElementById("location-birth");

    this.appState.formData = {
      firstName: form.firstName?.value || "",
      middleName: form.middleName?.value || "",
      lastName: form.lastName?.value || "",
      dateOfBirth: form.dateOfBirth?.value || "",
      timeOfBirth: form.timeOfBirth?.value || "",
      locationOfBirth: locationInput?.value || "",
      locationLat: locationInput?.dataset.lat || "",
      locationLon: locationInput?.dataset.lon || "",
      includeY: form.includeY?.checked || false,
      tzone: null,
    };

    console.log("Collected form data:", this.appState.formData);
  }

  // FIX #8: Retry logic for timezone API
  async fetchTimezoneWithRetry(lat, lon, dateStr, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch('/api/astro-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            endpoint: 'timezone',
            params: { lat, lon, dateOfBirth: dateStr }
          })
        });

        if (!response.ok) {
          throw new Error('Timezone API error');
        }

        const data = await response.json();
        return data.tzone || null;
      } catch (err) {
        console.error(`Timezone fetch attempt ${i + 1} failed:`, err);
        
        if (i === retries - 1) {
          console.warn('All timezone fetch attempts failed, defaulting to 0');
          return 0; // Fallback to UTC
        }
        
        // Exponential backoff: wait 1s, 2s, 3s between retries
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
    return 0;
  }

  async handleAnalyze() {
    try {
      const progressWrapper = document.getElementById("progress-wrapper");
      const progressInner = document.getElementById("progress-inner");
      const progressText = document.getElementById("progress-text");
      
      if (progressWrapper) progressWrapper.style.display = "block";
      this.updateProgress(0, "Starting...");
      
      console.log("Running analysis...");
      this.collectFormData();
      this.updateProgress(10, "Collecting data...");

      // Fetch timezone with retry logic
      if (this.appState.formData.locationLat && this.appState.formData.locationLon && this.appState.formData.dateOfBirth) {
        this.appState.formData.tzone = await this.fetchTimezoneWithRetry(
          this.appState.formData.locationLat,
          this.appState.formData.locationLon,
          this.appState.formData.dateOfBirth
        );
        console.log("Fetched timezone offset:", this.appState.formData.tzone);
      } else {
        this.appState.formData.tzone = null;
        console.log("Skipping timezone fetch due to missing data");
      }
      this.updateProgress(20, "Processing numerology...");

      // Numerology analysis
      const numerologyResults = this.numerologyEngine.analyze(this.appState.formData);
      console.log("Numerology results:", numerologyResults);
      this.updateProgress(40, "Calculating astrology...");

      // Astrology analysis with retry
      let astrologyResults = null;
      if (this.appState.formData.dateOfBirth) {
        try {
          astrologyResults = await this.analyzeAstrologyWithRetry(this.appState.formData);
          console.log("Astrology results:", astrologyResults);
        } catch (astroErr) {
          console.warn("Astrology API failed after retries, using basic data:", astroErr);
          
          const [year, month, day] = this.appState.formData.dateOfBirth.split('-').map(Number);
          const zodiac = this.astrologyEngine.getZodiacSign(month, day);
          const sefira = this.astrologyEngine.getSefiraFromPlanet(zodiac.planet);
          
          astrologyResults = {
            zodiac: zodiac,
            sefira: sefira,
            planets: null,
            houses: null,
            aspects: null,
            natalChart: null
          };
          
          // FIX #9: Standardized error modal
          this.showStandardError(
            "Limited Astrology Data",
            "The full natal chart service is temporarily unavailable. We've calculated your zodiac sign, ruling planet(s), and Tree of Life connection. For the complete natal chart, please try again later.",
            "info"
          );
        }
      }
      this.updateProgress(60, "Generating tarot correspondences...");

      // Tarot analysis
      const tarotResults = {
        lifePath: numerologyResults.lifePath ? 
          this.tarotEngine.getCardsForNumber(numerologyResults.lifePath.value) : [],
        expression: numerologyResults.expression ? 
          this.tarotEngine.getCardsForNumber(numerologyResults.expression.value) : [],
        soulUrge: numerologyResults.soulUrge ? 
          this.tarotEngine.getCardsForNumber(numerologyResults.soulUrge.value) : []
      };

      if (astrologyResults && astrologyResults.planets) {
        const sunPlanet = astrologyResults.planets.output?.find(p => p.name === 'Sun');
        if (sunPlanet && sunPlanet.sign) {
          tarotResults.sunSign = this.tarotEngine.getCardsForZodiac(sunPlanet.sign);
        }
      }

      console.log("Tarot results:", tarotResults);
      this.updateProgress(75, "Assembling your narrative...");

      // Store results
      this.appState.analysis = {
        numerology: numerologyResults,
        astrology: astrologyResults,
        tarot: tarotResults,
      };

      // Render natal chart if available
      if (astrologyResults && astrologyResults.planets) {
        console.log("Rendering natal chart:", astrologyResults);
        renderNatalChartBlock(astrologyResults);
      } else {
        console.log("Skipping natal chart - no planets data");
      }
      this.updateProgress(85, "Finalizing display...");
      
      // Render summaries
      this.renderSummaries();
      this.updateProgress(95, "Almost ready...");

      // Enable PDF button
      const pdfBtn = document.getElementById("btn-pdf");
      if (pdfBtn) {
        pdfBtn.disabled = false;
        console.log("PDF button enabled");
      }

      // Complete - trigger step indicator
      this.updateProgress(100, "Complete!");
      
      // FIX #7: Dispatch event for step indicator
      window.dispatchEvent(new Event('analysisComplete'));
      
      setTimeout(() => {
        if (progressWrapper) progressWrapper.style.display = "none";
      }, 500);

    } catch (err) {
      console.error("Analysis failed:", err);
      
      const progressWrapper = document.getElementById("progress-wrapper");
      if (progressWrapper) progressWrapper.style.display = "none";
      
      // FIX #9: Standardized error modal
      this.showStandardError(
        "Analysis Error",
        "An unexpected error occurred during analysis. Please check your internet connection and try again.",
        "error"
      );
    }
  }

  // FIX #8: Astrology analysis with retry logic
  async analyzeAstrologyWithRetry(formData, retries = 2) {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.astrologyEngine.analyze(formData);
      } catch (err) {
        console.error(`Astrology analysis attempt ${i + 1} failed:`, err);
        
        if (i === retries - 1) {
          throw err; // Last attempt failed
        }
        
        // Wait before retry
        await new Promise(r => setTimeout(r, 2000 * (i + 1)));
      }
    }
  }

  updateProgress(percent, message = "") {
    const progressInner = document.getElementById("progress-inner");
    const progressText = document.getElementById("progress-text");
    
    if (progressInner) {
      progressInner.style.width = `${percent}%`;
      progressInner.textContent = `${percent}%`;
    }
    if (progressText && message) {
      progressText.textContent = message;
    }
  }

  renderSummaries() {
    const { numerology, astrology, tarot } = this.appState.analysis;
    
    const user = {
      firstName: numerology?.input?.firstName || "Seeker",
      numerology: {
        lifePath: numerology?.lifePath?.value,
        destiny: numerology?.expression?.value,
        soulUrge: numerology?.soulUrge?.value,
        personality: numerology?.personality?.value
      },
      astrology: {
        sun: astrology?.zodiac?.name?.toLowerCase(),
        moon: astrology?.planets?.output?.find(p => p.name === 'Moon')?.sign?.toLowerCase(),
        rising: astrology?.houses?.output?.house_1?.sign?.toLowerCase()
      },
      tree: astrology?.sefira?.toLowerCase()?.split('(')[0]?.trim()
    };
    
    const numSummary = getNumerologySummary(user.numerology);
    const astroSummary = getAstrologySummary(user.astrology);
    const treeSummary = getTreeSummary(user.tree);
    const fullStory = buildNarrative(user);
    
    const numContent = document.getElementById("summary-numerology-content");
    if (numContent) {
      numContent.classList.remove('placeholder-text');
      let numHTML = numSummary.join("<br>");
      numContent.innerHTML = numHTML;
    }

    const astroContent = document.getElementById("summary-astrology-content");
    if (astroContent) {
      astroContent.classList.remove('placeholder-text');
      let astroHTML = "";
      if (astrology?.zodiac) {
        astroHTML += `<strong>Zodiac Sign:</strong> ${astrology.zodiac.name}<br>`;
        astroHTML += `<strong>Ruling Planet(s):</strong> ${astrology.zodiac.planet}<br>`;
        astroHTML += `<strong>Alchemical Element:</strong> ${astrology.zodiac.element}<br><br>`;
      }
      astroHTML += astroSummary.join("<br>");
      astroContent.innerHTML = astroHTML;
    }

    const treeContent = document.getElementById("summary-tree-content");
    if (treeContent) {
      treeContent.classList.remove('placeholder-text');
      let treeHTML = "";
      if (astrology?.sefira) {
        treeHTML += `<strong>Prominent Sefira:</strong> ${astrology.sefira}<br><br>`;
      }
      treeHTML += treeSummary || "No Tree of Life data available.";
      treeContent.innerHTML = treeHTML;
    }
    
    const storyEl = document.getElementById("personal-narrative-content");
    if (storyEl) {
      storyEl.classList.remove('placeholder-text');
      storyEl.textContent = fullStory;
    }
    
    const uiData = {
      ...numerology,
      zodiac: astrology?.zodiac || null,
      sefira: astrology?.sefira || null
    };
    this.ui.populateResults(uiData, null);
  }

  clearAll() {
    const form = document.getElementById("analysis-form");
    if (form) form.reset();

    const locationInput = document.getElementById("location-birth");
    if (locationInput) {
      locationInput.value = "";
      delete locationInput.dataset.lat;
      delete locationInput.dataset.lon;
    }

    this.appState = {
      formData: {},
      analysis: {}
    };

    const numContent = document.getElementById("summary-numerology-content");
    if (numContent) {
      numContent.classList.add('placeholder-text');
      numContent.textContent = "Run analysis to see your summary.";
    }

    const astroContent = document.getElementById("summary-astrology-content");
    if (astroContent) {
      astroContent.classList.add('placeholder-text');
      astroContent.textContent = "Run analysis to see your summary.";
    }

    const treeContent = document.getElementById("summary-tree-content");
    if (treeContent) {
      treeContent.classList.add('placeholder-text');
      treeContent.textContent = "Run analysis to see your summary.";
    }

    const storyEl = document.getElementById("personal-narrative-content");
    if (storyEl) {
      storyEl.classList.add('placeholder-text');
      storyEl.textContent = "Run analysis to see your personalized narrative.";
    }

    const natalEl = document.getElementById("natal-chart-output");
    if (natalEl) {
      natalEl.classList.add('placeholder-text');
      natalEl.textContent = "Enter time of birth and location to generate your natal chart.";
    }

    const numContainer = document.getElementById("numerology-cards-container");
    if (numContainer) {
      numContainer.classList.add('placeholder-text');
      numContainer.innerHTML = "Run analysis to see your complete Numerology report.";
    }

    const resetTexts = {
      "deep-zodiac": "—",
      "zodiac-meaning-header": "",
      "zodiac-meaning": "",
      "deep-planet": "—",
      "planet-meaning-header": "",
      "planet-meaning": "",
      "deep-element": "—",
      "element-meaning-header": "",
      "element-meaning": "",
      "deep-sefira": "—",
      "sefira-meaning-header": "",
      "sefira-meaning": ""
    };

    for (const [id, text] of Object.entries(resetTexts)) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    }

    this.ui.clearResults();

    const pdfBtn = document.getElementById("btn-pdf");
    if (pdfBtn) pdfBtn.disabled = true;

    console.log("All data cleared, app is fresh and ready.");
  }

  // FIX #9: Standardized error modal
  showStandardError(title, message, type = "error") {
    // Remove existing modal if any
    const existingModal = document.querySelector('.error-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "error-modal";
    
    const iconMap = {
      error: "⚠️",
      info: "ℹ️",
      warning: "⚡"
    };
    
    const colorMap = {
      error: "#d32f2f",
      info: "#1976d2",
      warning: "#f57c00"
    };
    
    overlay.innerHTML = `
      <div class="error-modal-content" style="border-color: ${colorMap[type]};">
        <h3 style="color: ${colorMap[type]};">${iconMap[type]} ${title}</h3>
        <p>${message}</p>
        <button id="close-error-modal" class="btn">Got it</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    const closeBtn = document.getElementById("close-error-modal");
    closeBtn.addEventListener("click", () => {
      overlay.remove();
    });
    
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  downloadPDF() {
    try {
      console.log("PDF generation started...");
      
      const firstName = this.appState.formData?.firstName || "User";
      const filename = `${firstName}_Self-Analysis_Project-Curiosity.pdf`;
      
      const pdf = new PDFAssembler({
        sourcePdfUrl: 'https://raw.githubusercontent.com/lironkerem/Source_PDF/PreRelease/Source_PDF.pdf',
        options: {
          autoDownload: true,
          downloadFilename: filename
        }
      });
      
      pdf.assemble(this.appState);

      console.log("PDF generation completed");
    } catch (err) {
      console.error("PDF generation failed:", err);
      
      // FIX #9: Standardized error for PDF
      this.showStandardError(
        "PDF Generation Failed",
        "Unable to generate your personalized guidebook. Please try again or contact support if the issue persists.",
        "error"
      );
    }
  }
}

// Initialize app
window.addEventListener("DOMContentLoaded", () => {
  window.app = new SelfAnalysisApp();
});