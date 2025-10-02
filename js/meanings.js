// Data Meanings and Interpretations Database
const DataMeanings = {
  numbers: {
    "1": "Number Symbolism - The first creation, beginning, activity and dynamism.\nRepresents - Entrepreneurship, leadership, new beginnings, individuality, masculine and pioneering energy.",
    "2": "Number Symbolism - Polarity, contrast, the maternal side, emotions and feelings, partnership and love.\nRepresents - Passivity, receptivity, femininity, gentleness, sensitivity, tolerance, cooperation.",
    "3": "Number Symbolism - The child in the sacred triangle, the balance of creation, extroverted and social.\nRepresents - Balance between masculine and feminine, social relationships, expression, communication, joy of life, optimism, creativity.",
    "4": "Number Symbolism - The physical plane, framework and work, discipline, order and organization.\nRepresents - Stability and practicality, laws and norms, morality, conscience and integrity.",
    "5": "Number Symbolism - Movement and freedom, change, travels and dynamic aspect.\nRepresents - Spiritual change, desire to advance beyond routine with spontaneity, need for new experiences.",
    "6": "Number Symbolism - The energy behind natural evolution, balance and harmony, love and beauty.\nRepresents - Art, aesthetics and creativity, ability to accept responsibility, nurturing family.",
    "7": "Number Symbolism - Deep inner world, self-investigation, meditation, philosophy, spirituality.\nRepresents - Mysticism, philosophy, wisdom and spirituality, great inner depth, need for solitude and research.",
    "8": "Number Symbolism - Achieving goals through determination and logic, attraction to power and status.\nRepresents - Practical, ambitious and focused, ability for material world success, seeing the big picture.",
    "9": "Number Symbolism - The bridge between ending and new beginning, universal number, altruism.\nRepresents - Service to others wholeheartedly, interested in humanitarian problems, generosity and honesty.",
    "10": "Number Symbolism - Completeness, ready to begin a new cycle from a complete place.\nRepresents - The end of the circle, return to unity, complete evolutionary development.",
    "11": "Number Symbolism - High inspiration, connections with higher dimensions, spiritual teacher.\nRepresents - Master number, enhanced mystical abilities, enlightened people, high spiritual energy.",
    "22": "Number Symbolism - The master builder, ability to execute enormous projects with others.\nRepresents - Master number, innovative ideas and high ambition, ability to lead large groups and projects.",
    "33": "Number Symbolism - Master Teacher, most spiritually evolved Master Number.\nRepresents - Master number, humanitarian purpose, highest form of teaching and service."
  },

  zodiac: {
    "Aries": {
      expression: "I am",
      title: "Energy bursting outward, pioneer",
      keywords: "Beginning of action, breaking barriers, breakthrough"
    },
    "Taurus": {
      expression: "I have",
      title: "Peaceful lovers of earthly beauty",
      keywords: "Grounded, stable, continuous, calm, secure"
    },
    "Gemini": {
      expression: "I think",
      title: "Restless intelligence of the mind",
      keywords: "Power of mind, adaptive, dual understanding"
    },
    "Cancer": {
      expression: "I feel",
      title: "Hard outside, soft inside",
      keywords: "Strong emotions, deep subconscious connection, secretive"
    },
    "Leo": {
      expression: "I will be",
      title: "Center of attention and power",
      keywords: "Energetic, helpful, supportive, encouraging, noble"
    },
    "Virgo": {
      expression: "I analyze",
      title: "Mad scientist, laser mind",
      keywords: "Analysis into details, focused precision, organized"
    },
    "Libra": {
      expression: "I balance",
      title: "Iron fist in velvet glove",
      keywords: "Strong energy in refined way, desire for balance and harmony"
    },
    "Scorpio": {
      expression: "I desire",
      title: "Desire to experience everything intensely",
      keywords: "Temptation to know more, transformation versus destruction"
    },
    "Sagittarius": {
      expression: "I see",
      title: "Utopian vision, aim high",
      keywords: "Aspiration upward, adaptable, flexible, philosophical"
    },
    "Capricorn": {
      expression: "I use",
      title: "Knowledge to use tools at disposal",
      keywords: "Very practical, high ambition step by step"
    },
    "Aquarius": {
      expression: "I know",
      title: "Spreader of knowledge",
      keywords: "Self-expression and communication, logical rather than emotional"
    },
    "Pisces": {
      expression: "I believe",
      title: "Very deep inner and emotional world",
      keywords: "Hypersensitivity to environment, functioning from another dimension"
    }
  },

  planets: {
    "Sun": {
      keywords: "360-degree angle of vision and control over the environment, center of the universe, the savior, nourishment.",
      advantages: "Light, wisdom, intuition, knowledge, service, giving life, love for humanity, responsibility, authority, rulership, leadership, confidence, organization, loyalty and reliability.",
      disadvantages: "Selfishness, egoism, arrogance, conceit, boasting, know-it-alls, doing everything alone, big-headedness, everything revolves around them."
    },
    "Mercury": {
      keywords: "Intellect, logic, communication, intelligence, information, languages, science, learning, logic, drawing conclusions.",
      advantages: "Practical, intelligent, quick understanding, analysis, logic, intellectual, scientific, high learning ability, open-minded.",
      disadvantages: "Mental illness, mental instability, nervous, confused, argumentative, cynicism, over-criticism, over-analysis and worry, inconsistent."
    },
    "Venus": {
      keywords: "Power of attraction, instincts, emotions, femininity, beauty, art creation, acting from love, forces of nature.",
      advantages: "Love, beauty, charm, gentleness, harmony, art, emotionality, sensitivity, creativity, sentimentality, sophistication, the ability to express emotion without inhibitions, friendliness, power of persuasion, good taste.",
      disadvantages: "Emotional imbalance, jealousy, vengefulness, resentment, lack of morality, lack of responsibility, flirtatiousness."
    },
    "Moon": {
      keywords: "Cyclicality, subconscious, reflection of light, mysterious, hidden, concealed, purification, imagination, intuition, memory, feminine energy.",
      advantages: "Extrasensory abilities, dreams, developed imagination, deep soul, idealist, showing affection, high ability to learn metaphysics and esoterics, ability to receive and contain, deep inner contemplation.",
      disadvantages: "Ungrounded, impractical, superficial, lazy, stubborn, lunatic, inconsistent, changeable, moving from one state to another, lack of concentration, changing moods, fits of rage, madness."
    },
    "Mars": {
      keywords: "To execute, activity, defense, war, courage, motivation, daring, drive, masculinity, inner fire, destruction for the sake of progress.",
      advantages: "Action, initiative, taking risks, changing negative conditions, energy, movement, will, determination, leadership, authority, efficiency, decision, courage.",
      disadvantages: "Tyranny, arrogance, violence, aggression, lack of tact, without thinking, impulsiveness, aggressiveness, rudeness, lack of sensitivity."
    },
    "Jupiter": {
      keywords: "Movement and progress, rising above the current situation, protection, inspiration, help, new experiences, broad heart, abundance.",
      advantages: "Compassion, charity, good-heartedness, kindness, grace, generosity, broad-heartedness, joy, loyalty, open soul, optimism, tolerance, faith, service to others, balanced response, true love for all humanity.",
      disadvantages: "Passivity, lack of energy, lack of honesty, difficulty refusing people, pride, arrogance, boastfulness."
    },
    "Saturn": {
      keywords: "Limitations, obstacles, persistence, endurance power, stubbornness, maintaining form, focusing energy, slowness.",
      advantages: "Stability, slowness, calmness, tranquility, systematicness, discipline, responsibility, traditionalism, ideas, inner contemplation, patience, focus, concentration, systematic and detailed persistence.",
      disadvantages: "Conservative, withdrawal, rigidity, sadness, closed-minded, finding obstacles and negativity in everything, seriousness, excessive routine, pessimism, delay, limitation, repression, impatience."
    },
    "Neptune": {
      keywords: "Intuition, dreams, illusion, spirituality, mysticism, imagination, transcendence, dissolution of boundaries.",
      advantages: "Spiritual insight, psychic abilities, compassion, artistic inspiration, selfless service, connection to the divine, healing abilities.",
      disadvantages: "Confusion, deception, escapism, addiction, lack of boundaries, unrealistic expectations, victimization."
    },
    "Pluto": {
      keywords: "Transformation, regeneration, power, death and rebirth, hidden depths, elimination, renewal.",
      advantages: "Ability to transform, penetrating insight, healing powers, regeneration, psychological depth, ability to eliminate what is no longer needed.",
      disadvantages: "Destructiveness, obsession, compulsion, manipulation, power struggles, extremism, vindictiveness."
    },
    "Uranus": {
      keywords: "Revolution, innovation, sudden change, independence, originality, rebellion, awakening, freedom.",
      advantages: "Originality, inventiveness, independence, humanitarian ideals, ability to break free from limitations, progressive thinking.",
      disadvantages: "Rebelliousness, unpredictability, erratic behavior, detachment, stubbornness, revolutionary extremism."
    }
  },

  elements: {
    "Earth": {
      represents: "Tangible physical world, matter, density, solidity, security, basic needs, foundation stone, practical action, work, health.",
      traits: "<strong>Positive:</strong> Patience, stability, efficiency, action, practicality, perseverance, conservatism, caution, steadiness, methodicalness, modesty.<br><strong>Negative:</strong> Rigidity, coldness, slowness, stubbornness, laziness, perfectionism, selectiveness, routine-bound."
    },
    "Air": {
      represents: "Mental world, thoughts, logic, intellect, communication, information, science, mathematics, analytical analysis, communication.",
      traits: "<strong>Positive:</strong> Intelligence, speech, diplomacy, mental balance, idealistic, inventiveness, learning ability, logical, curious, investigative, sharp, expressive, communicative, sharing knowledge.<br><strong>Negative:</strong> Compromising, naive, indecisive, flirtatious, stubborn in their opinions, outsiders, rebellious, lacking motivation, all talk and no action, pressured, restless, scattered, superficial, changing opinions quickly."
    },
    "Water": {
      represents: "World of emotions, intuition, imagination, creation, association, inner feminine energy, desires, empathy, containment.",
      traits: "<strong>Positive:</strong> Sensitivity, developed imagination, talent, artistry, openness, identification, empathy, intuitive, full of passion, active, healing powers, sympathetic, humble, mystical.<br><strong>Negative:</strong> Changing moods, unrealistic, living in illusion, elusive, stubborn, vindictive, jealous, self-centered, vulnerable, influenced, living in a bubble."
    },
    "Fire": {
      represents: "Abstract spiritual world, energy, life force, development, change, burning, expansion, dynamism, independence, sexuality.",
      traits: "<strong>Positive:</strong> Adventurousness, courage, activity, enthusiasm, happiness, honesty, generosity, leadership, nobility, determination, strong willpower, optimism, aspiration for expansion, independence, freedom, responsibility.<br><strong>Negative:</strong> Audacity, lack of tact, selfishness, snobbery, condescension, dominance, arrogance, boastfulness, conceit, lack of perseverance, lack of consistency."
    }
  },

  sefira: {
    "Keter (Crown)": {
      symbols: "The Point, The Crown, The Swastika.",
      titles: "Existence of Existences, Concealed of the Concealed, Ancient of Ancients, Ancient of Days, The Primordial Point, The Point within the Circle, The Most High, The Vast Countenance, The White Head, The Head which is Not, Macroprosopos, Amen, Lux Occulta, Lux Interna, He, The Divine Spark, The Thousand-petalled Lotus, The Sah, Yechida.",
      keywords: "All that Is, the breath of that which is not, the Source of Energy from the Infinite Unmanifest, Crystallization, The First Motion, That from which we come and to which we shall return, Ascension, Space, Unity, Union."
    },
    "Chokhmah (Wisdom)": {
      symbols: "The Lingam, The Phallus, The Tower, Yod (י), The Inner Robe of Glory, The Standing Stone, The Straight Line, The Uplifted Rod of Power.",
      titles: "Av, Abba, The Supernal Father, Tetragramaton, Power of Yetzira.",
      keywords: "Pure Creative Force, Dynamic Outpouring Energy, The Wellspring, The Fountain and Water of Life, The Great Stimulator, The First Positive, Unorganized and Uncompensated Force, Ejaculation."
    },
    "Binah (Understanding)": {
      symbols: "The Yoni, The Vesica Picis, The Cup, The Chalice, The Outer Robe of Concealment, The Kteis.",
      titles: "Ama, The Dark sterile mother, Ima, The Bright fertile mother, Kursiya, The Throne, Marah, The Great Sea, The Fifty Gates of Understanding, The Mother of Form, The Superior Mother, The Organizer and Compensator.",
      keywords: "Form, Limitation, Constraint, Heaviness, Slowness, Inertia, Incarnation, Fate, Time, Space, Natural Law, The Womb, Enclosure, Containment, Death, Annihilation."
    },
    "Chesed (Kindness)": {
      symbols: "The Solid Figure, The Pyramid, The Square, The Equal-Armed Cross, The Orb, The Wand, The Scepter, The Crook.",
      titles: "Gedulah, Magnificence, Love, Majesty, The Builder, The kindly shepherd, The loving father who is king, The Framework of Manifestation, The receptacle of all Powers.",
      keywords: "Authority, Leadership, Creativity, Inspiration, Vision, Excess, Waste, Birth, Service, Spiritual Love, Mercy, Compassion, Submission, Obliteration, The Annihilation Myth, The Atom Bomb."
    },
    "Gevurah (Strength)": {
      symbols: "The Pentagon, The Five-petalled Tudor Rose, The Sword, The Spear, The Scourge, The Chain.",
      titles: "Din - Justice, Pachad - Fear, The warrior King, The Destroyer, The Eliminator of the Useless, The Clarifier, The Power of Judgment.",
      keywords: "Power, Strength, Severity, Justice, Cruelty, Oppression, Catabolism, Necessary Destruction, Domination, Retribution, Execution."
    },
    "Tiferet (Beauty)": {
      symbols: "The Cube, The truncated pyramid, The Lamen, The rose-cross, The Calvary cross, Vav (ו).",
      titles: "Zair anpin - the Lesser Countenance, the Microprospus, Melech - King, Adam - Man, the Son, Rachamim - Compassion, Charity, the scarified Gods, Redemption, Healing.",
      keywords: "Harmony, Integrity, Balance, Wholeness, Centrality, the Solar-Plexus, the Sun, Gold, the Son of God, a King, the Great Work, the Elemental Kings, the Higher Self, Self-importance, Self-sacrifice, the Philosopher's Stone."
    },
    "Netzach (Victory)": {
      symbols: "The Rose, the Lamp, the Girdle.",
      titles: "Nature, Love, the Arts, The group-mind, Feelings, Emotions, Moods, Instincts, Intuition, Firmness.",
      keywords: "Life-Force, Beauty, Passion, Pleasure, Luxury, Sensuality, Desire, Joy, Excitement, Lust, Libido, Nurture, Drive, Empathy, Sympathy, Ecstatic Magic, Dance."
    },
    "Hod (Splendor)": {
      symbols: "Names and Versicles, the Apron.",
      titles: "Reason, the Individual-Mind, Science, Magic, Language, Visualization.",
      keywords: "Logic, the Sciences, Mathematics, Speech, Words, Communication, Conceptualization, the Law, Protocol, Trickery, Philosophy, Ownership, Territory, Ritual Magic, Occult Knowledge, Esoteric Philosophy."
    },
    "Yesod (Foundation)": {
      symbols: "The Perfumes, the Sandals.",
      titles: "The Astral-Light, the Treasure-house of images, the Receptacle of the Emanations, the Cyclic energies underlying Matter, the Aether-Currents.",
      keywords: "Imagination, the Unconscious-Mind, Dreams, the Astral-Plane, the Aether, Glue, Interface, Perception, Cosmetics, Appearance, Instinct, Illusion, Hidden Infrastructure, Divination, Mirrors and Crystals, Psychism, the Genitals, Secret Door, Tunnel, the Shamanic Tunnel, Sex and Reproduction."
    },
    "Malkuth (Kingdom)": {
      symbols: "The Altar of the Double-Cube, the Equal-armed Cross, The Magic circle, the Mystic circle, the Triangle of art, He final (ה).",
      titles: "The Gate, the Gate of Death, the Gate of the Shadow of Death, the Gate of Tears, the Gate of Justice, the Gate of Prayer, the Gate of the Daughter of the Mighty-ones, the Gate of the Garden of Eden, the Inferior Mother, Malka - Queen, Kala - Bride, the Virgin, Keter below, the Completion.",
      keywords: "The Real-World, Physical Matter, The Earth on which we walk, Mother Earth, Planet Earth, the 4 Elements, what we perceive with our 5 Senses, Practicality, Stability, Solidity, Heaviness, Dense Matter."
    }
  },

  // Helper methods to retrieve meanings
  getNumberMeaning(number) {
    return this.numbers[String(number)] || "Meaning not available for this number.";
  },

  getZodiacMeaning(sign) {
    const m = this.zodiac[sign];
    return m ? `<strong>Expression:</strong> ${m.expression}<br><strong>Title:</strong> ${m.title}<br><strong>Keywords:</strong> ${m.keywords}` : "";
  },

  getPlanetMeaning(planet) {
    const m = this.planets[planet];
    return m ? `<strong>Keywords:</strong> ${m.keywords}<br><strong>Advantages:</strong> ${m.advantages}<br><strong>Disadvantages:</strong> ${m.disadvantages}` : "";
  },

  getElementMeaning(element) {
    const m = this.elements[element];
    return m ? `<strong>Represents:</strong> ${m.represents}<br><strong>Character Traits:</strong><br>${m.traits}` : "";
  },

  getSefiraMeaning(sefira) {
    const m = this.sefira[sefira];
    return m ? `<strong>Symbols:</strong> ${m.symbols}<br><strong>Associated Titles:</strong> ${m.titles}<br><strong>Keywords:</strong> ${m.keywords}` : "";
  }
};