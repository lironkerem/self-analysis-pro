// app.js - FIXED: Remove timezone fetch, let proxy handle it
import { AstrologyEngine } from './astrology.js';
import { renderNatalChartBlock } from './ui.natal.js';
import { numerologyEngine } from './numerology.js';
import TarotEngine from './TarotEngine.js';
import { narrativeEngine } from './narrativeEngine.js';
import PDFAssembler from './PDFAssembler.js';

class SelfAnalysisApp {
  constructor() {
    this.appState = {
      formData: {},
      analysis: {},
    };
    this.astrologyEngine = new AstrologyEngine();
    this.tarotEngine = new TarotEngine();
    this.init();
  }

  init() {
    console.log("🚀 Initializing Self Analysis App...");

    // Bind form submission
    const form = document.getElementById("analysis-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAnalyze();
      });
    }

    // Bind clear button
    const clearBtn = document.getElementById("btn-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        form.reset();
        this.appState = { formData: {}, analysis: {} };
        console.log("Form cleared");
      });
    }

    // Bind PDF button
    const pdfBtn = document.getElementById("btn-pdf");
    if (pdfBtn) {
      pdfBtn.addEventListener("click", () => {
        this.downloadPDF();
      });
    }
  }

  async handleAnalyze() {
    try {
      console.log("Running analysis...");

      // Collect form data
      this.collectFormData();

      // Validate required fields
      if (!this.appState.formData.firstName || !this.appState.formData.lastName || !this.appState.formData.dateOfBirth) {
        alert("Please fill in all required fields (First Name, Last Name, Date of Birth)");
        return;
      }

      // Show progress
      this.showProgress("Analyzing numerology...", 20);

      // Run numerology (always works)
      const numerologyResults = numerologyEngine.analyze(this.appState.formData);
      console.log("✅ Numerology results:", numerologyResults);
      
      this.showProgress("Analyzing astrology...", 50);

      // Run astrology with retry logic
      let astrologyResults = null;
      try {
        astrologyResults = await this.analyzeAstrologyWithRetry();
        console.log("✅ Astrology results:", astrologyResults);
      } catch (astroError) {
        console.warn("⚠️ Astrology API failed, using basic data:", astroError);
        // Generate basic astrology from DOB only
        astrologyResults = this.astrologyEngine.getBasicAstrology(this.appState.formData.dateOfBirth);
      }

      this.showProgress("Drawing tarot cards...", 80);

      // Run tarot
      const tarotResults = this.tarotEngine.drawCards(this.appState.formData);
      console.log("✅ Tarot results:", tarotResults);

      this.showProgress("Generating narrative...", 90);

      // Store results
      this.appState.analysis = {
        numerology: numerologyResults,
        astrology: astrologyResults,
        tarot: tarotResults,
      };

      // Render UI sections
      this.renderSummaries();
      this.renderDetailedCards();
      
      // Render natal chart if we have planets data
      if (astrologyResults && astrologyResults.planets) {
        console.log("✅ Rendering natal chart");
        renderNatalChartBlock(astrologyResults);
      } else {
        console.log("⚠️ Skipping natal chart - no planets data");
      }

      this.showProgress("Complete!", 100);
      
      // Hide progress after 1 second
      setTimeout(() => {
        this.hideProgress();
      }, 1000);

      // Enable PDF button
      const pdfBtn = document.getElementById("btn-pdf");
      if (pdfBtn) {
        pdfBtn.disabled = false;
        console.log("✅ PDF button enabled");
      }

    } catch (err) {
      console.error("❌ Analysis failed:", err);
      alert("An error occurred during analysis. Please try again.");
      this.hideProgress();
    }
  }

  async analyzeAstrologyWithRetry(maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Astrology analysis attempt ${attempt}/${maxRetries}`);
        const result = await this.astrologyEngine.analyze(this.appState.formData);
        return result;
      } catch (error) {
        console.error(`❌ Astrology analysis attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait before retry
        const waitTime = 2000 * attempt;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  collectFormData() {
    // Get form inputs
    const firstNameInput = document.getElementById("first-name");
    const middleNameInput = document.getElementById("middle-name");
    const lastNameInput = document.getElementById("last-name");
    const dobInput = document.getElementById("date-of-birth");
    const tobInput = document.getElementById("time-of-birth");
    const locationInput = document.getElementById("location-birth");
    const includeYInput = document.getElementById("include-y");

    // Collect data
    this.appState.formData = {
      firstName: firstNameInput?.value?.trim() || "",
      middleName: middleNameInput?.value?.trim() || "",
      lastName: lastNameInput?.value?.trim() || "",
      dateOfBirth: dobInput?.value || "",
      timeOfBirth: tobInput?.value || "",
      locationOfBirth: locationInput?.value || "",
      locationLat: locationInput?.dataset?.lat || "",
      locationLon: locationInput?.dataset?.lon || "",
      includeY: includeYInput?.checked || false,
      // Note: tzone is handled by the proxy automatically
    };

    console.log("📋 Collected form data:", this.appState.formData);
  }

  renderSummaries() {
    const { numerology, astrology, tarot } = this.appState.analysis;

    // Quick summaries
    if (numerology) {
      const numSummary = this.generateNumerologySummary(numerology);
      const numEl = document.getElementById("summary-numerology-content");
      if (numEl) numEl.textContent = numSummary;
    }

    if (astrology) {
      const astroSummary = this.generateAstrologySummary(astrology);
      const astroEl = document.getElementById("summary-astrology-content");
      if (astroEl) astroEl.textContent = astroSummary;
    }

    // Personal narrative
    const personalStory = narrativeEngine.generatePersonalStory({
      numerology,
      astrology,
      tarot,
    });
    const storyEl = document.getElementById("personal-narrative-content");
    if (storyEl) storyEl.textContent = personalStory;
  }

  renderDetailedCards() {
    // Render numerology cards
    // Render astrology cards
    // (Implementation depends on your UI structure)
  }

  generateNumerologySummary(numerology) {
    return `Life Path: ${numerology.lifePath.number} - ${numerology.lifePath.meaning.slice(0, 100)}...\n` +
           `Expression: ${numerology.expression.number} - ${numerology.expression.meaning.slice(0, 100)}...`;
  }

  generateAstrologySummary(astrology) {
    const zodiac = astrology.zodiac;
    return `Zodiac: ${zodiac.name}\nElement: ${zodiac.element}\nRuling Planet: ${zodiac.planet}\n` +
           `Tree of Life: ${astrology.sefira}`;
  }

  showProgress(text, percent) {
    const wrapper = document.getElementById("progress-wrapper");
    const inner = document.getElementById("progress-inner");
    const textEl = document.getElementById("progress-text");
    
    if (wrapper) wrapper.style.display = "block";
    if (inner) {
      inner.style.width = `${percent}%`;
      inner.textContent = `${percent}%`;
    }
    if (textEl) textEl.textContent = text;
  }

  hideProgress() {
    const wrapper = document.getElementById("progress-wrapper");
    if (wrapper) wrapper.style.display = "none";
  }

  downloadPDF() {
    try {
      const pdf = new PDFAssembler(this.appState);
      pdf.generate();
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF.");
    }
  }
}

// Initialize app
window.addEventListener("DOMContentLoaded", () => {
  window.app = new SelfAnalysisApp();
  console.log("✅ Self Analysis App initialized");
});
