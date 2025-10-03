// UI Management and Form Handling with Tarot Integration
class UIManager {
  constructor() {
    this.tarot = new TarotEngine();
    this.initializeExpandableCards();
  }
  
  initializeExpandableCards() { 
    setTimeout(() => {
      document.querySelectorAll('.expandable-card').forEach(card => { 
        const header = card.querySelector('.expandable-header'); 
        const content = card.querySelector('.expandable-content'); 
        if (!header || !content) return;
        
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        
        const isExpanded = card.classList.contains('expanded'); 
        content.style.display = isExpanded ? 'block' : 'none'; 
        
        const toggle = () => { 
          const expanded = card.classList.contains('expanded'); 
          card.classList.toggle('expanded'); 
          content.style.display = expanded ? 'none' : 'block'; 
          card.setAttribute('aria-expanded', (!expanded).toString()); 
        }; 
        
        newHeader.addEventListener('click', toggle); 
        newHeader.addEventListener('keydown', (e) => { 
          if (e.key === 'Enter' || e.key === ' ') { 
            e.preventDefault(); 
            toggle(); 
          } 
        }); 
      }); 
    }, 100);
  }
  
  populateResults(results, narrativeResults) { 
    this.updateQuickSummary(results, narrativeResults); 
    this.updateDeepAnalysis(results); 
    this.generateNumerologyCards(results);
    
    if (narrativeResults && narrativeResults.fullNarrative) {
      const narrativeContent = document.getElementById('personal-narrative-content');
      if (narrativeContent) {
        narrativeContent.textContent = narrativeResults.fullNarrative;
      }
    }
  }
  
  updateQuickSummary(results, narrativeResults) { 
    if (narrativeResults) {
      const numContent = document.getElementById('summary-numerology-content');
      if (numContent && narrativeResults.numerologySummary && narrativeResults.numerologySummary.length) {
        numContent.innerHTML = narrativeResults.numerologySummary.join('<br><br>');
      }
      
      const astroContent = document.getElementById('summary-astrology-content');
      if (astroContent) {
        let astroHTML = '';
        
        if (results.zodiac) {
          astroHTML += `<strong>Zodiac Sign:</strong> ${results.zodiac.name || '—'}<br>`;
          astroHTML += `<strong>Ruling Planet:</strong> ${results.zodiac.planet || '—'}<br>`;
          astroHTML += `<strong>Alchemical Element:</strong> ${results.zodiac.element || '—'}<br><br>`;
        }
        
        if (narrativeResults.astrologySummary && narrativeResults.astrologySummary.length) {
          astroHTML += narrativeResults.astrologySummary.join('<br><br>');
        }
        
        astroContent.innerHTML = astroHTML;
      }
      
      const treeContent = document.getElementById('summary-tree-content');
      if (treeContent) {
        let treeHTML = '';
        
        if (results.sefira) {
          treeHTML += `<strong>Prominent Sefira:</strong> ${results.sefira}<br><br>`;
        }
        
        if (narrativeResults.treeSummary) {
          treeHTML += narrativeResults.treeSummary;
        } else {
          treeHTML += 'No Tree of Life summary available.';
        }
        
        treeContent.innerHTML = treeHTML;
      }
    }
  }
  
  updateDeepAnalysis(results) { 
    const deepElements = { 
      'deep-zodiac': results.zodiac?.name || '—', 
      'deep-planet': results.zodiac?.planet || '—', 
      'deep-element': results.zodiac?.element || '—', 
      'deep-sefira': results.sefira || '—' 
    }; 
    
    Object.entries(deepElements).forEach(([id, value]) => { 
      const element = document.getElementById(id); 
      if (element) element.textContent = value; 
    }); 
    
    // Update meanings with Tarot cards
    if (results.zodiac?.name) { 
      const headerEl = document.getElementById('zodiac-meaning-header'); 
      const meaningEl = document.getElementById('zodiac-meaning'); 
      if (headerEl) headerEl.textContent = `The meaning of ${results.zodiac.name}`; 
      if (meaningEl) {
        let html = DataMeanings.getZodiacMeaning(results.zodiac.name);
        
        // Add Tarot cards for zodiac
        const zodiacCards = this.tarot.getCardsForZodiac(results.zodiac.name);
        if (zodiacCards.length > 0) {
          html += '<div style="margin-top: 20px;"><strong>Tarot Correspondences:</strong></div>';
          html += this.tarot.renderCards(zodiacCards);
        }
        
        meaningEl.innerHTML = html;
      }
    } 
    
    if (results.zodiac?.planet) { 
      const headerEl = document.getElementById('planet-meaning-header'); 
      const meaningEl = document.getElementById('planet-meaning'); 
      if (headerEl) headerEl.textContent = `The meaning of ${results.zodiac.planet}`; 
      if (meaningEl) {
        let html = DataMeanings.getPlanetMeaning(results.zodiac.planet);
        
        // Add Tarot card for planet (Major Arcana only)
        const planetCards = this.tarot.getCardsForPlanet(results.zodiac.planet);
        if (planetCards.length > 0) {
          html += '<div style="margin-top: 20px;"><strong>Tarot Correspondence:</strong></div>';
          html += this.tarot.renderCards(planetCards);
        }
        
        meaningEl.innerHTML = html;
      }
    } 
    
    if (results.zodiac?.element) { 
      const headerEl = document.getElementById('element-meaning-header'); 
      const meaningEl = document.getElementById('element-meaning'); 
      if (headerEl) headerEl.textContent = `The meaning of ${results.zodiac.element}`; 
      if (meaningEl) {
        let html = DataMeanings.getElementMeaning(results.zodiac.element);
        
        // Add Tarot cards for element (10 numbered + 4 court)
        const elementCards = this.tarot.getCardsForElement(results.zodiac.element);
        if (elementCards.length > 0) {
          html += '<div style="margin-top: 20px;"><strong>Tarot Suit Correspondence:</strong></div>';
          html += this.tarot.renderCards(elementCards);
        }
        
        meaningEl.innerHTML = html;
      }
    } 
    
    if (results.sefira) { 
      const headerEl = document.getElementById('sefira-meaning-header'); 
      const meaningEl = document.getElementById('sefira-meaning'); 
      if (headerEl) headerEl.textContent = `The meaning of ${results.sefira}`; 
      if (meaningEl) {
        let html = DataMeanings.getSefiraMeaning(results.sefira);
        
        // Add Tarot cards for sefira (4 minors matching the element)
        const sefiraName = results.sefira.split('(')[0].trim();
        const element = results.zodiac?.element;
        const sefiraCards = this.tarot.getCardsForSefira(sefiraName, element);
        if (sefiraCards.length > 0) {
          html += '<div style="margin-top: 20px;"><strong>Tarot Correspondences:</strong></div>';
          html += this.tarot.renderCards(sefiraCards);
        }
        
        meaningEl.innerHTML = html;
      }
    } 
  }
  
  generateNumerologyCards(results) { 
    const container = document.getElementById('numerology-cards-container'); 
    if (!container) return; 
    
    const cardConfigs = [
      { key: 'firstName', title: 'Life Lessons', explanation: 'Life Lessons are derived from the consonants in your full birth name. They represent the recurring challenges and opportunities for growth that your soul specifically chose for this lifetime.' }, 
      { key: 'lastName', title: 'Spiritual Support', explanation: 'Derived from the vowels in your full name, Spiritual Support reflects the inner guidance, resources, and strengths your soul possesses.' }, 
      { key: 'lifePath', title: 'Life Path', explanation: 'The Life Path Number, derived from your birth date, is considered the most fundamental number in the chart. It outlines your primary purpose, life direction, and key lessons.' }, 
      { key: 'expression', title: 'Destiny (Expression)', explanation: 'The Expression or Destiny Number is calculated from the full name and reveals your core abilities, talents, and life mission.' }, 
      { key: 'soulsDirection', title: 'Soul\'s Direction', explanation: 'Soul\'s Direction highlights the ultimate trajectory of your soul. It represents the integration of lessons learned, natural talents, and spiritual inclinations.' }, 
      { key: 'personality', title: 'Personality (Outer)', explanation: 'Derived from the consonants in your name, the Personality Number reveals how others perceive you and the traits you project.' }, 
      { key: 'soulUrge', title: 'Soul\'s Urge (Desire)', explanation: 'Calculated from the vowels in your name, the Soul\'s Urge reflects your inner motivations, drives, and what truly fulfills you.' }, 
      { key: 'maturity', title: 'Maturity Number', explanation: 'The Maturity Number represents the full potential of your life journey. It indicates the qualities, talents, and wisdom you are likely to fully develop later in life.' }, 
      { key: 'balance', title: 'Balance Number', explanation: 'Derived from the initials of your full name, the Balance Number provides insight into how you respond to stress, challenges, or uncertainty.' }, 
      { key: 'birthday', title: 'Birthday', explanation: 'The Birthday Number comes from the day of the month you were born and represents a specific talent, skill, or attribute you bring to life.' }
    ]; 
    
    container.innerHTML = cardConfigs.map(config => { 
      const data = results[config.key]; 
      if (!data) return ''; 
      
      // Get Tarot cards for this number
      const tarotCards = this.tarot.getCardsForNumber(data.value);
      const tarotHTML = tarotCards.length > 0 ? 
        `<div style="margin-top: 20px;"><strong>Tarot Correspondences:</strong></div>${this.tarot.renderCards(tarotCards)}` : '';
      
      return `<section class="expandable-card" data-section="${config.key}">
        <div class="expandable-header" tabindex="0" role="button">
          <span class="chevron">&#9654;</span><span>${config.title}</span>
        </div>
        <div class="expandable-content">
          <div class="calculation-trace">${data.trace || '—'}</div>
          <div class="sum-line">Sum total of numbers = ${data.raw} / Reduced = ${data.value}</div>
          <div class="final-number">FINAL NUMBER = ${data.value}</div>
          <hr>
          <div class="explanation-heading">Explanation for ${config.title}:</div>
          <div class="explanation-text">${config.explanation}</div>
          <div class="explanation-heading">Meaning of the number ${data.value}:</div>
          <div class="explanation-text">${DataMeanings.getNumberMeaning(data.value)}</div>
          ${tarotHTML}
        </div>
      </section>`; 
    }).join(''); 
    
    this.addSpecialNumerologyCards(container, results); 
    this.initializeExpandableCards(); 
  }
  
  addSpecialNumerologyCards(container, results) { 
    const karmicTrace = results.karmicDebt?.length ? 
      results.karmicDebt.map(k => `${k.place}=${k.raw}`).join(' ; ') : 'None'; 
    const karmicMeaning = results.karmicDebt?.length ? 
      "Karmic Debt Numbers indicate unresolved lessons or challenges carried from past lifetimes." : 
      "No karmic debt numbers detected."; 
      
    container.innerHTML += `<section class="expandable-card" data-section="karmic">
      <div class="expandable-header" tabindex="0" role="button">
        <span class="chevron">&#9654;</span><span>Karmic Debt</span>
      </div>
      <div class="expandable-content">
        <div class="calculation-trace">${karmicTrace}</div>
        <div class="sum-line">Karmic Numbers: ${karmicTrace}</div>
        <div class="final-number">KARMIC ANALYSIS = ${results.karmicDebt?.length || 0} numbers found</div>
        <hr>
        <div class="explanation-heading">Explanation for Karmic Debt:</div>
        <div class="explanation-text">${karmicMeaning}</div>
      </div>
    </section>`; 
    
    if (results.pinnacles) { 
      const p = results.pinnacles; 
      const pinnacleTrace = `P1=${p.p1.value}(${p.p1.raw}), P2=${p.p2.value}(${p.p2.raw}), P3=${p.p3.value}(${p.p3.raw}), P4=${p.p4.value}(${p.p4.raw})`; 
      
      // Get tarot for all pinnacles
      let pinnaclesTarot = '';
      [p.p1.value, p.p2.value, p.p3.value, p.p4.value].forEach((val, idx) => {
        const cards = this.tarot.getCardsForNumber(val);
        if (cards.length > 0) {
          pinnaclesTarot += `<div style="margin-top: 15px;"><strong>Pinnacle ${idx + 1} (${val}) Tarot:</strong></div>`;
          pinnaclesTarot += this.tarot.renderCards(cards);
        }
      });
      
      container.innerHTML += `<section class="expandable-card" data-section="pinnacles">
        <div class="expandable-header" tabindex="0" role="button">
          <span class="chevron">&#9654;</span><span>4 Cycles of Pinnacles</span>
        </div>
        <div class="expandable-content">
          <div class="calculation-trace">${pinnacleTrace}</div>
          <div class="sum-line">Four Major Life Phases</div>
          <div class="final-number">PINNACLES = ${p.p1.value}, ${p.p2.value}, ${p.p3.value}, ${p.p4.value}</div>
          <hr>
          <div class="explanation-heading">Explanation for 4 Pinnacle Cycles:</div>
          <div class="explanation-text">The Pinnacle Cycles are four major phases in life, derived from the birth date, that outline opportunities, challenges, and growth patterns in each stage.</div>
          ${pinnaclesTarot}
        </div>
      </section>`; 
    } 
    
    if (results.challenges) { 
      const c = results.challenges; 
      const challengeTrace = `C1=${c.ch1.value}(${c.ch1.raw}), C2=${c.ch2.value}(${c.ch2.raw}), C3=${c.ch3.value}(${c.ch3.raw}), C4=${c.ch4.value}(${c.ch4.raw})`; 
      
      // Get tarot for all challenges
      let challengesTarot = '';
      [c.ch1.value, c.ch2.value, c.ch3.value, c.ch4.value].forEach((val, idx) => {
        const cards = this.tarot.getCardsForNumber(val);
        if (cards.length > 0) {
          challengesTarot += `<div style="margin-top: 15px;"><strong>Challenge ${idx + 1} (${val}) Tarot:</strong></div>`;
          challengesTarot += this.tarot.renderCards(cards);
        }
      });
      
      container.innerHTML += `<section class="expandable-card" data-section="challenges">
        <div class="expandable-header" tabindex="0" role="button">
          <span class="chevron">&#9654;</span><span>Challenge Numbers</span>
        </div>
        <div class="expandable-content">
          <div class="calculation-trace">${challengeTrace}</div>
          <div class="sum-line">Four Life Challenge Areas</div>
          <div class="final-number">CHALLENGES = ${c.ch1.value}, ${c.ch2.value}, ${c.ch3.value}, ${c.ch4.value}</div>
          <hr>
          <div class="explanation-heading">Explanation for Challenge Numbers:</div>
          <div class="explanation-text">Challenge Numbers indicate obstacles, recurring difficulties, or tests of character that require conscious effort and resilience.</div>
          ${challengesTarot}
        </div>
      </section>`; 
    } 
  }
  
  clearResults() { 
    const summaryCards = ['summary-numerology-content', 'summary-astrology-content', 'summary-tree-content'];
    summaryCards.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = 'Run analysis to see your summary.';
    });
    
    const narrativeContent = document.getElementById('personal-narrative-content');
    if (narrativeContent) narrativeContent.textContent = 'Run analysis to see your personalized narrative.';
    
    ['deep-zodiac', 'deep-planet', 'deep-element', 'deep-sefira'].forEach(id => { 
      const element = document.getElementById(id); 
      if (element) element.textContent = '—'; 
    }); 
    
    ['zodiac', 'planet', 'element', 'sefira'].forEach(type => { 
      const headerEl = document.getElementById(`${type}-meaning-header`); 
      const meaningEl = document.getElementById(`${type}-meaning`); 
      if (headerEl) headerEl.textContent = ''; 
      if (meaningEl) meaningEl.innerHTML = ''; 
    }); 
    
    const container = document.getElementById('numerology-cards-container'); 
    if (container) container.innerHTML = ''; 
    
    const natalOutput = document.getElementById('natal-chart-output'); 
    if (natalOutput) natalOutput.textContent = 'Enter time of birth and location of birth to generate your complete natal chart.'; 
  }
}

window.UIManager = UIManager;