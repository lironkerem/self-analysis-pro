// app.js
// Main application script for Self Analysis App

import { AstrologyEngine } from './astrology.js';
import { renderNatalChartBlock } from './ui.natal.js';
import { numerologyEngine } from './numerology.js';
import { tarotEngine } from './tarotEngine.js';
import { narrativeEngine } from './narrativeEngine.js';
import { PDFAssembler } from './PDFAssembler.js';

class SelfAnalysisApp {
  constructor() {
    this.appState = {
      formData: {},
      analysis: {},
    };
    this.astrologyEngine = new AstrologyEngine();
    this.init();
  }

  init() {
    console.log("Initializing Self Analysis App...");

    // Bind form submission
    const form = document.getElementById("analysis-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAnalyze();
      });
    }

    // Bind PDF download
    const pdfBtn = document.getElementById("download-pdf");
    if (pdfBtn) {
      pdfBtn.addEventListener("click", () => {
        this.downloadPDF();
      });
    }
  }

  async handleAnalyze() {
    try {
      console.log("Running analysis...");

      // Gather form data
      this.collectFormData();

      // Run engines
      const numerologyResults = numerologyEngine.analyze(this.appState.formData);
      const astrologyResults = await this.astrologyEngine.analyze(this.appState.formData);
      const tarotResults = tarotEngine.drawCards(this.appState.formData);

      // Store results
      this.appState.analysis = {
        numerology: numerologyResults,
        astrology: astrologyResults,
        tarot: tarotResults,
      };

      // Render natal chart output (planets, houses, aspects, chart SVG)
      if (astrologyResults) {
        renderNatalChartBlock(astrologyResults);
      }

      // Generate narrative summaries
      this.renderSummaries();

    } catch (err) {
      console.error("Analysis failed:", err);
      alert("An error occurred during analysis. Please try again.");
    }
  }

  collectFormData() {
    const form = document.getElementById("analysis-form");
    if (!form) return;

    this.appState.formData = {
      name: form.name?.value || "",
      dateOfBirth: form.dateOfBirth?.value || "",
      timeOfBirth: form.timeOfBirth?.value || "",
      locationOfBirth: form.locationOfBirth?.value || "",
      locationLat: form.locationLat?.value || "",
      locationLon: form.locationLon?.value || "",
    };

    console.log("Collected form data:", this.appState.formData);
  }

  renderSummaries() {
    const { numerology, astrology, tarot } = this.appState.analysis;

    const quickSummary = narrativeEngine.generateQuickSummary({
      numerology,
      astrology,
      tarot,
    });

    const personalStory = narrativeEngine.generatePersonalStory({
      numerology,
      astrology,
      tarot,
    });

    const quickSummaryEl = document.getElementById("quick-summary");
    if (quickSummaryEl) {
      quickSummaryEl.textContent = quickSummary;
    }

    const personalStoryEl = document.getElementById("personal-story");
    if (personalStoryEl) {
      personalStoryEl.textContent = personalStory;
    }
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
});
