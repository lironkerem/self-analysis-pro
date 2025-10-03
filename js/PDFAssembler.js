/**
 * PDFAssembler.js - FIXED VERSION
 * Corrected page ordering to match intended layout
 */

(function (global) {
  class PDFAssembler {
    constructor(opts = {}) {
      this.sourcePdfUrl = opts.sourcePdfUrl || null;
      this.sourcePdfArrayBuffer = opts.sourcePdfArrayBuffer || null;
      this.progress = typeof opts.progress === "function" ? opts.progress : () => {};
      this.options = Object.assign(
        {
          autoDownload: false,
          downloadFilename: "Self-Analysis-Report.pdf",
        },
        opts.options || {}
      );

      this.pdfLib =
        global.PDFLib || global.pdfLib || (window && (window.PDFLib || window.pdfLib));
      if (!this.pdfLib) {
        console.error("pdf-lib not found. Include it first.");
      }

      this.maps = {
        numbers: {
          "1": 29,
          "2": 30,
          "3": 31,
          "4": 32,
          "5": 33,
          "6": 34,
          "7": 35,
          "8": 36,
          "9": 37,
          "10": 38,
          "11": 39,
          "22": 40,
          "33": 41,
        },
        zodiac: {
          aries: 45,
          taurus: 46,
          gemini: 47,
          cancer: 48,
          leo: 49,
          virgo: 50,
          libra: 51,
          scorpio: 52,
          sagittarius: 53,
          capricorn: 54,
          aquarius: 55,
          pisces: 56,
        },
        planets: {
          sun: 58,
          mercury: 59,
          venus: 60,
          moon: 61,
          mars: 62,
          jupiter: 63,
          saturn: 64,
        },
        elements: {
          earth: 66,
          air: 67,
          water: 68,
          fire: 69,
        },
        sefira: {
          kether: [73, 74],
          chochma: [75, 76],
          binah: [77, 78],
          chesed: [79, 80],
          gvurah: [81, 82],
          tiferet: [83, 84],
          netzach: [85, 86],
          hod: [87, 88],
          yesod: [89, 90],
          malkut: [91, 92],
        },
      };
    }

    _report(pct, msg) {
      try {
        this.progress(pct, msg);
      } catch {}
    }

    async _fetchArrayBuffer(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.statusText}`);
      return await res.arrayBuffer();
    }

    _resolveNumber(n) {
      const p = this.maps.numbers[String(n)];
      return p ? [p] : [];
    }

    _resolveZodiac(z) {
      const p = this.maps.zodiac[String(z).toLowerCase()];
      return p ? [p] : [];
    }

    _resolvePlanet(pl) {
      const p = this.maps.planets[String(pl).toLowerCase()];
      return p ? [p] : [];
    }

    _resolveElement(el) {
      const p = this.maps.elements[String(el).toLowerCase()];
      return p ? [p] : [];
    }

    _resolveSefira(s) {
      const p = this.maps.sefira[String(s).toLowerCase()];
      return p ? (Array.isArray(p) ? p : [p]) : [];
    }

    async assemble(results = {}) {
      try {
        this._report(5, "Loading source PDF");

        let sourceBytes;
        if (this.sourcePdfArrayBuffer) {
          sourceBytes = this.sourcePdfArrayBuffer;
        } else if (this.sourcePdfUrl) {
          sourceBytes = await this._fetchArrayBuffer(this.sourcePdfUrl);
        } else {
          throw new Error("No Source PDF provided");
        }

        const { PDFDocument } = this.pdfLib;
        const srcPdf = await PDFDocument.load(sourceBytes);
        const outPdf = await PDFDocument.create();

        const copyPage = async (n, label = "Unknown") => {
          if (n == null) {
            console.warn(`Skipping ${label}: no page number provided`);
            return;
          }
          if (n < 1 || n > srcPdf.getPageCount()) {
            throw new Error(
              `Mapping error: page ${n} for ${label} is out of range. Source PDF has ${srcPdf.getPageCount()} pages.`
            );
          }
          const [p] = await outPdf.copyPages(srcPdf, [n - 1]);
          outPdf.addPage(p);
        };

        const addExplainerAndNumber = async (explainerPage, value, label) => {
          if (explainerPage) await copyPage(explainerPage, `${label} explainer`);
          if (value == null) {
            console.warn(`Skipping ${label}: no value provided`);
            return;
          }
          const nums = this._resolveNumber(value);
          if (nums.length === 0) {
            console.warn(`No mapping found for ${label} value: ${value}`);
            return;
          }
          for (const n of nums) await copyPage(n, `${label} number ${value}`);
        };

        // === CORRECTED ORDER ===
        
        this._report(10, "Adding cover pages");
        // 1. Fixed intro pages
        await copyPage(1, "Cover");
        await copyPage(2, "Welcome");
        await copyPage(3, "How to use");
        await copyPage(4, "Overview");
        
        this._report(15, "Adding numerology section");
        // 2. Numerology intro
        await copyPage(5, "Numerology cover");
        await copyPage(6, "Numerology intro 1");
        await copyPage(7, "Numerology intro 2");

        this._report(20, "Processing numerology numbers");
        // 3. Numerology core numbers
        await addExplainerAndNumber(8, results.firstNameFinal, "First Name Final");
        await addExplainerAndNumber(9, results.lastNameFinal, "Last Name Final");
        await addExplainerAndNumber(10, results.expressionFinal, "Expression/Destiny");
        await addExplainerAndNumber(11, results.lifePathFinal, "Life Path");
        await addExplainerAndNumber(12, results.birthdayFinal, "Birthday");
        await addExplainerAndNumber(13, results.soulsDirectionFinal, "Soul's Direction");
        await addExplainerAndNumber(14, results.soulUrgeFinal, "Soul Urge");
        await addExplainerAndNumber(15, results.personalityFinal, "Personality");
        await addExplainerAndNumber(16, results.maturityFinal, "Maturity");
        await addExplainerAndNumber(17, results.balanceFinal, "Balance");

        this._report(35, "Checking karmic debt");
        // 4. Karmic debt check
        const karmicSet = new Set([13, 14, 16, 19]);
        if (
          [results.lifePathFinal, results.expressionFinal, results.soulUrgeFinal, results.birthdayFinal].some((n) =>
            karmicSet.has(Number(n))
          )
        ) {
          await copyPage(18, "Karmic Debt");
        }

        this._report(40, "Adding pinnacles");
        // 5. Pinnacles
        await copyPage(19, "Pinnacles Explainer");
        if (Array.isArray(results.pinnacles)) {
          for (const [i, val] of results.pinnacles.entries()) {
            if (val == null) {
              console.warn(`Skipping Pinnacle ${i + 1}: no value provided`);
              continue;
            }
            const nums = this._resolveNumber(val);
            if (nums.length === 0) {
              console.warn(`No mapping found for Pinnacle ${i + 1} value: ${val}`);
              continue;
            }
            for (const n of nums) await copyPage(n, `Pinnacle ${i + 1}`);
          }
        }

        this._report(50, "Adding challenges");
        // 6. Challenges
        await copyPage(20, "Challenges Explainer");
        if (Array.isArray(results.challenges)) {
          for (const [i, val] of results.challenges.entries()) {
            if (val == null) {
              console.warn(`Skipping Challenge ${i + 1}: no value provided`);
              continue;
            }
            const nums = this._resolveNumber(val);
            if (nums.length === 0) {
              console.warn(`No mapping found for Challenge ${i + 1} value: ${val}`);
              continue;
            }
            for (const n of nums) await copyPage(n, `Challenge ${i + 1}`);
          }
        }

        this._report(60, "Adding numerology reflections");
        // 7. Numerology reflections
        await copyPage(21, "Numerology Reflection 1");
        await copyPage(22, "Numerology Reflection 2");

        this._report(65, "Adding astrology section");
        // 8. Astrology intro
        await copyPage(23, "Astrology Cover");
        await copyPage(24, "Astrology Intro 1");
        await copyPage(25, "Astrology Intro 2");
        
        // 9. Astrology data
        for (const n of this._resolveZodiac(results.zodiac))
          await copyPage(n, "Zodiac Sign");
        for (const n of this._resolvePlanet(results.rulingPlanet))
          await copyPage(n, "Ruling Planet");
        for (const n of this._resolveElement(results.element))
          await copyPage(n, "Element");
        
        // 10. Astrology reflections
        await copyPage(26, "Astrology Reflection 1");
        await copyPage(27, "Astrology Reflection 2");

        this._report(75, "Adding Tree of Life section");
        // 11. Tree of Life intro
        await copyPage(70, "Tree Cover");
        await copyPage(71, "Tree Intro 1");
        await copyPage(72, "Tree Intro 2");
        
        // 12. Tree sefira
        for (const n of this._resolveSefira(results.sefira))
          await copyPage(n, "Sefira");
        
        // 13. Tree reflections
        await copyPage(93, "Tree Reflection 1");
        await copyPage(94, "Tree Reflection 2");

        this._report(85, "Adding tarot section");
        // 14. Tarot
        await copyPage(95, "Tarot Cover");
        await copyPage(96, "Tarot Intro 1");
        await copyPage(97, "Tarot Intro 2");
        await copyPage(98, "Tarot Reflection 1");
        await copyPage(99, "Tarot Reflection 2");

        this._report(95, "Adding end pages");
        // 15. End pages
        await copyPage(100, "End Notes 1");
        await copyPage(101, "End Notes 2");
        await copyPage(102, "Project Curiosity");
        await copyPage(103, "Sign Up");

        this._report(100, "Finalizing PDF");
        const bytes = await outPdf.save();

        if (this.options.autoDownload) {
          const blob = new Blob([bytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = this.options.downloadFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 2000);
        }

        return bytes;
      } catch (err) {
        console.error("Critical PDF Assembly Error:", err);

        const div = document.createElement("div");
        div.style.color = "red";
        div.style.fontWeight = "bold";
        div.style.margin = "20px";
        div.style.padding = "10px";
        div.style.border = "2px solid red";
        div.style.borderRadius = "8px";
        div.innerHTML = `
          An error occurred while generating your personalized PDF.<br>
          Please <a href="https://lironkerem.wixsite.com/project-curiosity" target="_blank" style="color:red; text-decoration:underline;">contact us here</a>
          so we can send you a proper personalized report.<br><br>
          <small>Error details (for support): ${err.message}</small>
        `;
        document.body.appendChild(div);

        throw err;
      }
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = PDFAssembler;
  } else {
    global.PDFAssembler = PDFAssembler;
  }
})(typeof window !== "undefined" ? window : globalThis);