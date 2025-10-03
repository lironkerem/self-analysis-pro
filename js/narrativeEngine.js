// narrativeEngine.js
// Generates narrative summaries from Numerology, Astrology, Tarot, and Tree of Life results

export const narrativeEngine = {
  generateQuickSummary({ numerology, astrology, tarot }) {
    let summary = "Your Quick Summary:\n";

    if (numerology) {
      summary += `Numerology highlights your Life Path Number as ${numerology.lifePath || "N/A"}.\n`;
    }

    if (astrology && astrology.planets) {
      const sun = astrology.planets.data.find(p => p.name === "Sun");
      const moon = astrology.planets.data.find(p => p.name === "Moon");
      if (sun) summary += `Astrology shows your Sun is in ${sun.sign}, `;
      if (moon) summary += `and your Moon is in ${moon.sign}.\n`;
    }

    if (tarot && tarot.cards) {
      summary += `Your Tarot draw reveals: ${tarot.cards.map(c => c.name).join(", ")}.\n`;
    }

    return summary.trim();
  },

  generatePersonalStory({ numerology, astrology, tarot, treeOfLife }) {
    let story = "Your Personal Analysis Story:\n\n";

    // --- Numerology Section ---
    if (numerology) {
      story += `Based on Numerology, your Life Path Number is ${numerology.lifePath || "N/A"}, ` +
               `which symbolizes ${numerology.description || "unique qualities that shape your journey"}.\n\n`;
    }

    // --- Astrology Section ---
    if (astrology) {
      story += "Astrological Insights:\n";

      if (astrology.planets?.data?.length) {
        story += "- Planetary Positions:\n";
        astrology.planets.data.forEach(planet => {
          story += `   • ${planet.name}: ${planet.sign} at ${planet.degree}°\n`;
        });
      }

      if (astrology.houses?.data?.length) {
        story += "- House Cusps:\n";
        astrology.houses.data.forEach(house => {
          story += `   • House ${house.house}: ${house.sign} at ${house.degree}°\n`;
        });
      }

      if (astrology.aspects?.data?.length) {
        story += "- Aspects:\n";
        astrology.aspects.data.forEach(aspect => {
          story += `   • ${aspect.aspecting_body} ${aspect.type} ${aspect.aspected_body}\n`;
        });
      }

      story += "\n";
    }

    // --- Tarot Section ---
    if (tarot && tarot.cards?.length) {
      story += "Your Tarot reading suggests:\n";
      tarot.cards.forEach(card => {
        story += `   • ${card.name}: ${card.meaning}\n`;
      });
      story += "\n";
    }

    // --- Tree of Life Section ---
    if (treeOfLife) {
      story += "Tree of Life Analysis:\n";
      story += `   • Path: ${treeOfLife.path || "Unknown"}\n`;
      story += `   • Interpretation: ${treeOfLife.interpretation || "No data"}\n\n`;
    }

    return story.trim();
  }
};
