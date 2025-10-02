// Form Management and Application Controller
class FormManager {
  constructor(appState) {
    this.appState = appState;
    this.elements = this.initializeElements();
    this.bindEvents();
    this.setupDateLimits();
  }
  
  initializeElements() {
    return {
      firstName: document.getElementById('first-name'),
      middleName: document.getElementById('middle-name'),
      lastName: document.getElementById('last-name'),
      dateOfBirth: document.getElementById('date-of-birth'),
      timeOfBirth: document.getElementById('time-of-birth'),
      locationBirth: document.getElementById('location-birth'),
      includeY: document.getElementById('include-y'),
      btnAnalyze: document.getElementById('btn-analyze'),
      btnPDF: document.getElementById('btn-pdf'),
      btnClear: document.getElementById('btn-clear'),
      errors: {
        firstName: document.getElementById('first-error'),
        middleName: document.getElementById('middle-error'),
        lastName: document.getElementById('last-error'),
        dateOfBirth: document.getElementById('dob-error'),
        timeOfBirth: document.getElementById('tob-error'),
        locationBirth: document.getElementById('location-error')
      },
      icons: {
        firstName: document.getElementById('first-icon'),
        middleName: document.getElementById('middle-icon'),
        lastName: document.getElementById('last-icon'),
        dateOfBirth: document.getElementById('dob-icon'),
        timeOfBirth: document.getElementById('tob-icon'),
        locationBirth: document.getElementById('location-icon')
      }
    };
  }
  
  setupDateLimits() {
    const today = new Date();
    this.elements.dateOfBirth.setAttribute('max', today.toISOString().split('T')[0]);
  }
  
  bindEvents() {
    this.elements.firstName.addEventListener('input', () => this.validateField('firstName'));
    this.elements.middleName.addEventListener('input', () => this.validateField('middleName'));
    this.elements.lastName.addEventListener('input', () => this.validateField('lastName'));
    this.elements.dateOfBirth.addEventListener('input', () => this.validateField('dateOfBirth'));
    this.elements.timeOfBirth.addEventListener('input', () => this.validateField('timeOfBirth'));
    this.elements.locationBirth.addEventListener('input', () => this.validateField('locationBirth'));
    
    this.elements.btnAnalyze.addEventListener('click', () => this.handleAnalyze());
    this.elements.btnClear.addEventListener('click', () => this.handleClear());
    this.elements.btnPDF.addEventListener('click', () => this.handleGeneratePDF());
    
    Object.keys(this.elements).forEach(key => {
      if (this.elements[key] && typeof this.elements[key].addEventListener === 'function') {
        this.elements[key].addEventListener('input', () => {
          this.syncFormData();
          this.elements.btnPDF.disabled = true;
        });
      }
    });
  }
  
  validateField(fieldName) {
    const element = this.elements[fieldName];
    const errorElement = this.elements.errors[fieldName];
    const iconElement = this.elements.icons[fieldName];
    
    if (!element || !errorElement) return true;
    
    let validation;
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        validation = Validation.validateName(element.value);
        break;
      case 'middleName':
        validation = element.value ? Validation.validateName(element.value) : { valid: true };
        break;
      case 'dateOfBirth':
        validation = Validation.validateDateOfBirth(element.value);
        break;
      case 'timeOfBirth':
        validation = Validation.validateTimeOfBirth(element.value);
        break;
      case 'locationBirth':
        validation = Validation.validateLocation(element.value);
        break;
      default:
        validation = { valid: true };
    }
    
    this.setFieldError(element, errorElement, iconElement, validation.valid ? '' : validation.message);
    return validation.valid;
  }
  
  setFieldError(inputElement, errorElement, iconElement, message) {
    if (message) {
      errorElement.style.display = 'block';
      errorElement.textContent = message;
      inputElement.classList.add('error');
      inputElement.style.border = '2px solid #e74c3c';
    } else {
      errorElement.style.display = 'none';
      errorElement.textContent = '';
      inputElement.classList.remove('error');
      if (inputElement.value) {
        inputElement.style.border = '2px solid #27ae60';
      } else {
        inputElement.style.border = '2px solid #ddd';
      }
    }
  }
  
  syncFormData() {
    this.appState.updateFormData('firstName', this.elements.firstName.value.trim());
    this.appState.updateFormData('middleName', this.elements.middleName.value.trim());
    this.appState.updateFormData('lastName', this.elements.lastName.value.trim());
    this.appState.updateFormData('dateOfBirth', this.elements.dateOfBirth.value.trim());
    this.appState.updateFormData('timeOfBirth', this.elements.timeOfBirth.value.trim());
    this.appState.updateFormData('locationOfBirth', this.elements.locationBirth.value.trim());
    this.appState.updateFormData('includeY', this.elements.includeY.checked);
  }
  
  validateAllFields() {
    return ['firstName', 'middleName', 'lastName', 'dateOfBirth', 'timeOfBirth', 'locationBirth']
      .every(field => this.validateField(field));
  }
  
  async handleAnalyze() {
    this.syncFormData();
    
    if (!this.validateAllFields()) {
      if (window.app && window.app.toast) {
        window.app.toast.show('Please correct errors before analyzing.', 'error');
      }
      return;
    }
    
    if (typeof NumerologyEngine === 'undefined' || typeof AstrologyEngine === 'undefined') {
      console.error('Required engines not loaded');
      return;
    }
    
    try {
      this.elements.btnAnalyze.disabled = true;
      if (window.app && window.app.progress) {
        window.app.progress.show();
        await window.app.progress.animate(1500);
      }
      
      const numerologyEngine = new NumerologyEngine();
      const astrologyEngine = new AstrologyEngine();
      
      const numerologyResults = numerologyEngine.analyze(this.appState.formData);
      const astrologyResults = astrologyEngine.analyze(this.appState.formData.dateOfBirth);
      
      const combinedResults = { ...numerologyResults, ...astrologyResults };
      this.appState.setAnalysisResults(combinedResults);
      
      // Generate narrative using narrativeEngine
      let narrativeResults = null;
      if (typeof buildNarrative !== 'undefined' && typeof getNumerologySummary !== 'undefined') {
        try {
          console.log('=== NARRATIVE GENERATION START ===');
          
          let treeValue = '';
          if (astrologyResults && astrologyResults.sefira) {
            const sefiraFull = String(astrologyResults.sefira);
            treeValue = sefiraFull.split('(')[0].trim().toLowerCase();
            console.log('Extracted tree value:', treeValue, 'from:', sefiraFull);
          }
          
          const userData = {
            firstName: this.appState.formData.firstName,
            numerology: {
              lifePath: numerologyResults.lifePath?.value,
              destiny: numerologyResults.expression?.value,
              soulUrge: numerologyResults.soulUrge?.value,
              personality: numerologyResults.personality?.value
            },
            astrology: {
              sun: astrologyResults.zodiac?.name?.toLowerCase(),
              moon: astrologyResults.zodiac?.name?.toLowerCase(),
              rising: astrologyResults.zodiac?.name?.toLowerCase()
            },
            tree: treeValue
          };
          
          console.log('User data for narrative:', userData);
          
          const treeSummaryResult = getTreeSummary(userData.tree);
          console.log('Tree summary result:', treeSummaryResult);
          
          narrativeResults = {
            fullNarrative: buildNarrative(userData),
            numerologySummary: getNumerologySummary(userData.numerology),
            astrologySummary: getAstrologySummary(userData.astrology),
            treeSummary: treeSummaryResult
          };
          
          console.log('Narrative results:', narrativeResults);
          
          this.appState.narrativeResults = narrativeResults;
        } catch (error) {
          console.error('Narrative generation error:', error);
        }
      } else {
        console.log('Narrative functions not available');
      }
      
      if (window.app && window.app.ui) {
        window.app.ui.populateResults(combinedResults, narrativeResults);
      }
      this.elements.btnPDF.disabled = false;
      
      if (this.appState.formData.dateOfBirth && this.appState.formData.timeOfBirth && this.appState.formData.locationOfBirth) {
        if (window.app && window.app.natalChart) {
          await window.app.natalChart.generate();
        }
      }
      
      if (window.app && window.app.toast) {
        window.app.toast.show('Analysis complete!', 'success');
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      if (window.app && window.app.toast) {
        window.app.toast.show('Analysis failed: ' + error.message, 'error');
      }
    } finally {
      this.elements.btnAnalyze.disabled = false;
    }
  }
  
  handleClear() {
    Object.keys(this.elements).forEach(key => {
      const element = this.elements[key];
      if (element && typeof element.value !== 'undefined') {
        if (element.type === 'checkbox') {
          element.checked = false;
        } else {
          element.value = '';
        }
      }
    });
    
    Object.keys(this.elements.errors).forEach(key => this.validateField(key));
    if (window.app && window.app.ui) {
      window.app.ui.clearResults();
    }
    this.elements.btnPDF.disabled = true;
    if (window.app && window.app.toast) {
      window.app.toast.show('Form cleared.', 'warning');
    }
  }
  
  async handleGeneratePDF() {
    const results = this.appState.getAnalysisResults();
    if (!results) {
      if (window.app && window.app.toast) {
        window.app.toast.show('Please analyze first before generating PDF.', 'error');
      }
      return;
    }
    
    try {
      this.elements.btnPDF.disabled = true;
      if (window.app && window.app.progress) {
        window.app.progress.show();
        await window.app.pdf.generate(results);
      }
      if (window.app && window.app.toast) {
        window.app.toast.show('PDF generated successfully!', 'success');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      if (window.app && window.app.toast) {
        window.app.toast.show('PDF generation failed: ' + error.message, 'error');
      }
    } finally {
      this.elements.btnPDF.disabled = false;
      if (window.app && window.app.progress) {
        window.app.progress.hide();
      }
    }
  }
}

class DevTools {
  constructor() {
    this.panel = document.getElementById('dev-panel');
    this.log = document.getElementById('dev-log');
    this.runBtn = document.getElementById('dev-run');
    this.closeBtn = document.getElementById('dev-close');
    this.bindEvents();
    this.checkAutoRun();
  }
  
  bindEvents() {
    if (this.runBtn) this.runBtn.addEventListener('click', () => this.runSelfTest());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.hide());
    
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        this.toggle();
      }
    });
  }
  
  checkAutoRun() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('selftest') === '1') {
        this.show();
        setTimeout(() => this.runSelfTest(), 200);
      }
    } catch (error) {}
  }
  
  show() {
    if (this.panel) this.panel.style.display = 'block';
  }
  
  hide() {
    if (this.panel) this.panel.style.display = 'none';
  }
  
  toggle() {
    if (this.panel) {
      this.panel.style.display = this.panel.style.display === 'block' ? 'none' : 'block';
    }
  }
  
  logMessage(message) {
    if (this.log) {
      this.log.textContent += message + '\n';
      this.log.scrollTop = this.log.scrollHeight;
    }
    console.log('[DevTools]', message);
  }
  
  async runSelfTest() {
    if (this.log) this.log.textContent = '';
    this.logMessage('Starting self-test...');
    
    try {
      if (typeof NumerologyEngine === 'undefined') {
        throw new Error('NumerologyEngine not loaded');
      }
      
      const numerologyEngine = new NumerologyEngine();
      const testData = {
        firstName: 'John',
        middleName: '',
        lastName: 'Smith',
        dateOfBirth: '1990-05-14',
        includeY: false
      };
      
      this.logMessage(`Testing with data: ${JSON.stringify(testData)}`);
      const results = numerologyEngine.analyze(testData);
      
      this.logMessage(`FirstName raw=${results.firstName.raw}, value=${results.firstName.value}`);
      this.logMessage(`LastName raw=${results.lastName.raw}, value=${results.lastName.value}`);
      this.logMessage(`Expression raw=${results.expression.raw}, value=${results.expression.value}`);
      this.logMessage(`LifePath raw=${results.lifePath.raw}, value=${results.lifePath.value}`);
      
      if (typeof AstrologyEngine !== 'undefined') {
        const astrologyEngine = new AstrologyEngine();
        const astroResults = astrologyEngine.analyze(testData.dateOfBirth);
        
        this.logMessage(`Zodiac: ${astroResults.zodiac.name}`);
        this.logMessage(`Planet: ${astroResults.zodiac.planet}`);
        this.logMessage(`Element: ${astroResults.zodiac.element}`);
        this.logMessage(`Sefira: ${astroResults.sefira}`);
      }
      
      this.logMessage('Self-test completed successfully!');
      if (window.app && window.app.toast) {
        window.app.toast.show('Self-test passed!', 'success');
      }
    } catch (error) {
      this.logMessage(`Error: ${error.message}`);
      if (window.app && window.app.toast) {
        window.app.toast.show('Self-test failed!', 'error');
      }
    }
  }
}

class PDFManager {
  constructor(appState) {
    this.appState = appState;
    // UPDATE THIS URL to your actual GitHub raw URL
    this.sourcePdfUrl = 'https://raw.githubusercontent.com/lironkerem/Source_PDF/PreRelease/Source_PDF.pdf';
  }

  async generate(results) {
    if (!window.PDFAssembler) {
      console.error('PDFAssembler not loaded');
      throw new Error('PDF generation library not available');
    }

    const mappedResults = this.mapResultsToPDFFormat(results);
    console.log('Mapped results for PDF:', mappedResults);

    const assembler = new window.PDFAssembler({
      sourcePdfUrl: this.sourcePdfUrl,
      progress: (pct, msg) => {
        console.log(`PDF Progress: ${pct}% - ${msg}`);
        if (window.app && window.app.progress) {
          window.app.progress.setProgress(pct, msg);
        }
      },
      options: {
        autoDownload: true,
        downloadFilename: `Self-Analysis-${this.appState.formData.firstName || 'Report'}.pdf`
      }
    });

    try {
      await assembler.assemble(mappedResults);
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    }
  }

  mapResultsToPDFFormat(results) {
    let zodiacName = '';
    if (results.zodiac && results.zodiac.name) {
      zodiacName = results.zodiac.name.toLowerCase();
    }

    let sefiraName = '';
    if (results.sefira) {
      sefiraName = results.sefira.split('(')[0].trim().toLowerCase();
    }

    let rulingPlanet = '';
    if (results.zodiac && results.zodiac.planet) {
      rulingPlanet = results.zodiac.planet.toLowerCase();
    }

    let element = '';
    if (results.zodiac && results.zodiac.element) {
      element = results.zodiac.element.toLowerCase();
    }

    let pinnacles = [];
    if (results.pinnacles) {
      pinnacles = [
        results.pinnacles.p1?.value,
        results.pinnacles.p2?.value,
        results.pinnacles.p3?.value,
        results.pinnacles.p4?.value
      ].filter(v => v != null);
    }

    let challenges = [];
    if (results.challenges) {
      challenges = [
        results.challenges.ch1?.value,
        results.challenges.ch2?.value,
        results.challenges.ch3?.value,
        results.challenges.ch4?.value
      ].filter(v => v != null);
    }

    return {
      firstNameFinal: results.firstName?.value,
      lastNameFinal: results.lastName?.value,
      expressionFinal: results.expression?.value,
      lifePathFinal: results.lifePath?.value,
      birthdayFinal: results.birthday?.value,
      soulsDirectionFinal: results.soulsDirection?.value,
      soulUrgeFinal: results.soulUrge?.value,
      personalityFinal: results.personality?.value,
      maturityFinal: results.maturity?.value,
      balanceFinal: results.balance?.value,
      pinnacles: pinnacles,
      challenges: challenges,
      zodiac: zodiacName,
      rulingPlanet: rulingPlanet,
      element: element,
      sefira: sefiraName
    };
  }
}

window.PDFManager = PDFManager;

class SelfAnalysisApp {
  constructor() {
    const requiredClasses = ['AppState', 'ToastManager', 'ProgressManager', 'UIManager', 'PDFManager'];
    for (const className of requiredClasses) {
      if (typeof window[className] === 'undefined') {
        console.error(`${className} not loaded`);
        return;
      }
    }
    
    this.state = new AppState();
    this.toast = new ToastManager();
    this.progress = new ProgressManager();
    this.form = new FormManager(this.state);
    this.ui = new UIManager();
    
    if (typeof NatalChartManager !== 'undefined') {
      this.natalChart = new NatalChartManager(this.state);
    } else {
      console.warn('NatalChartManager not available');
    }
    
    this.pdf = new PDFManager(this.state);
    this.devTools = new DevTools();
  }
  
  init() {
    console.log('Self-Analysis Generator Pro initialized');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    try {
      window.app = new SelfAnalysisApp();
      window.app.init();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }, 100);
});

window.SelfAnalysisApp = SelfAnalysisApp;