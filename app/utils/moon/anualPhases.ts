import { monthlyMoonPhases as moonPhases } from "./monthlyPhases";
import { constellations } from "../constellations";

export const moonPhasesWithConstellations = {
  january: {
    new: {
      phase: moonPhases.new,
      constellation: [constellations.sagittarius, constellations.capricorn],
      information: {
        sagittarius: {
          details: "New Moon in Sagittarius focuses on new beginnings in adventure, philosophy, and freedom. It's a time to set goals related to travel, learning, and expanding horizons.",
          crystals: ["Lapis Lazuli", "Amethyst"]
        },
        capricorn: {
          details: "New Moon in Capricorn emphasizes setting practical, long-term goals and building a disciplined approach to achieve success.",
          crystals: ["Garnet", "Onyx"]
        }
      }
    },
    firstQuarter: {
      phase: moonPhases.firstQuarter,
      constellation: [constellations.pisces],
      information: {
        pisces: {
          details: "First Quarter in Pisces involves facing emotional and spiritual challenges. It's a time to grow through compassion, creativity, and intuition, making decisions that align with your inner self.",
          crystals: ["Aquamarine", "Moonstone"]
        }
      }
    },
    full: {
      phase: moonPhases.full,
      constellation: [constellations.leo, constellations.cancer],
      information: {
        leo: {
          details: "Full Moon in Leo brings clarity and completion in creative projects and personal expression. It's a time to celebrate achievements with confidence and generosity.",
          crystals: ["Sunstone", "Citrine"]
        },
        cancer: {
          details: "Full Moon in Cancer focuses on emotional fulfillment and home life, emphasizing nurturing relationships and personal well-being.",
          crystals: ["Moonstone", "Pearl"]
        }
      }
    },
    lastQuarter: {
      phase: moonPhases.lastQuarter,
      constellation: [constellations.virgo],
      information: {
        virgo: {
          details: "Last Quarter in Virgo is about releasing perfectionist tendencies and focusing on practical improvements. It's a time to clear out what no longer serves you and refine your routines for better efficiency.",
          crystals: ["Peridot", "Jade"]
        }
      }
    }
  },
  february: {
    new: {
      phase: moonPhases.new,
      constellation: [constellations.capricorn, constellations.aquarius],
      information: {
        capricorn: {
          details: "New Moon in Capricorn encourages setting ambitious, disciplined goals. It's a time to focus on career plans and structured growth.",
          crystals: ["Garnet", "Onyx"]
        },
        aquarius: {
          details: "New Moon in Aquarius inspires innovative and humanitarian intentions. Embrace new ideas and focus on community-oriented projects.",
          crystals: ["Amethyst", "Aquamarine"]
        }
      }
    },
    firstQuarter: {
      phase: moonPhases.firstQuarter,
      constellation: [constellations.taurus],
      information: {
        taurus: {
          details: "First Quarter in Taurus involves practical challenges and decisions related to security and stability. It's a time to build solid foundations and take steady actions towards your goals.",
          crystals: ["Rose Quartz", "Emerald"]
        }
      }
    },
    full: {
      phase: moonPhases.full,
      constellation: [constellations.leo],
      information: {
        leo: {
          details: "Full Moon in Leo emphasizes the culmination of creative efforts and personal achievements. It's a time to express yourself boldly and celebrate your successes.",
          crystals: ["Sunstone", "Citrine"]
        }
      }
    },
    lastQuarter: {
      phase: moonPhases.lastQuarter,
      constellation: [constellations.libra],
      information: {
        libra: {
          details: "Last Quarter in Libra focuses on releasing imbalances and seeking harmony. It's a time to let go of relationships or situations that disrupt your peace and work towards equilibrium.",
          crystals: ["Lapis Lazuli", "Opal"]
        }
      }
    }
  },
  march: {
    new: {
      phase: moonPhases.new,
      constellation: [constellations.aquarius, constellations.pisces],
      information: {
        aquarius: {
          details: "New Moon in Aquarius sets the stage for innovative, forward-thinking goals. Focus on embracing individuality and social progress.",
          crystals: ["Amethyst", "Aquamarine"]
        },
        pisces: {
          details: "New Moon in Pisces encourages setting intentions around compassion, creativity, and spiritual growth.",
          crystals: ["Aquamarine", "Moonstone"]
        }
      }
    },
    firstQuarter: {
      phase: moonPhases.firstQuarter,
      constellation: [constellations.gemini],
      information: {
        gemini: {
          details: "First Quarter in Gemini challenges you to adapt and communicate effectively. It's a time to make decisions based on clear information and flexibility.",
          crystals: ["Citrine", "Agate"]
        }
      }
    },
    full: {
      phase: moonPhases.full,
      constellation: [constellations.virgo],
      information: {
        virgo: {
          details: "Full Moon in Virgo brings clarity and completion to practical and analytical efforts. It's a time to celebrate accomplishments in health, work, and service.",
          crystals: ["Peridot", "Jade"]
        }
      }
    },
    lastQuarter: {
      phase: moonPhases.lastQuarter,
      constellation: [constellations.sagittarius],
      information: {
        sagittarius: {
          details: "Last Quarter in Sagittarius is about releasing outdated beliefs and expanding your horizons. It's a time to embrace change and seek new philosophical or educational pursuits.",
          crystals: ["Lapis Lazuli", "Amethyst"]
        }
      }
    }
  },
  april: {
    new: {
      phase: moonPhases.new,
      constellation: [constellations.pisces, constellations.aries],
      information: {
        pisces: {
          details: "New Moon in Pisces focuses on setting intentions around emotional healing and spiritual growth. It's a time to tap into creativity and intuition.",
          crystals: ["Aquamarine", "Moonstone"]
        },
        aries: {
          details: "New Moon in Aries is ideal for initiating bold new projects and embracing leadership.",
          crystals: ["Carnelian", "Red Jasper"]
        }
      }
    },
    firstQuarter: {
      phase: moonPhases.firstQuarter,
      constellation: [constellations.cancer],
      information: {
        cancer: {
          details: "First Quarter in Cancer involves addressing emotional and home-related challenges. It's a time to make decisions that nurture your well-being and strengthen family bonds.",
          crystals: ["Moonstone", "Pearl"]
        }
      }
    },
    full: {
      phase: moonPhases.full,
      constellation: [constellations.libra],
      information: {
        libra: {
          details: "Full Moon in Libra emphasizes the culmination of efforts in relationships and balance. It's a time to celebrate harmony and beauty in your partnerships and surroundings.",
          crystals: ["Lapis Lazuli", "Opal"]
        }
      }
    },
    lastQuarter: {
      phase: moonPhases.lastQuarter,
      constellation: [constellations.capricorn],
      information: {
        capricorn: {
          details: "Last Quarter in Capricorn focuses on releasing structures and goals that no longer serve you. It's a time to refine your plans and maintain discipline in pursuit of your true ambitions.",
          crystals: ["Garnet", "Onyx"]
        }
      }
    }
  },
  may: {
    new: {
      phase: moonPhases.new,
      constellation: [constellations.aries, constellations.taurus],
      information: {
        aries: {
          details: "New Moon in Aries encourages setting bold, assertive goals. It's a time to take initiative and embrace new beginnings.",
          crystals: ["Carnelian", "Red Jasper"]
        },
        taurus: {
          details: "New Moon in Taurus is ideal for setting intentions around stability, security, and enjoying life's pleasures.",
          crystals: ["Rose Quartz", "Emerald"]
        }
      }
    },
    firstQuarter: {
      phase: moonPhases.firstQuarter,
      constellation: [constellations.leo],
      information: {
        leo: {
          details: "First Quarter in Leo challenges you to act with courage and creativity. It's a time to face obstacles with confidence and inspire others through your actions.",
          crystals: ["Sunstone", "Citrine"]
        }
      }
    },
    full: {
      phase: moonPhases.full,
      constellation: [constellations.scorpio],
      information: {
        scorpio: {
          details: "Full Moon in Scorpio brings intensity and transformation. It's a time to confront deep emotions, embrace change, and celebrate personal growth.",
          crystals: ["Obsidian", "Malachite"]
        }
      }
    },
    lastQuarter: {
      phase: moonPhases.lastQuarter,
      constellation: [constellations.aquarius],
      information: {
        aquarius: {
          details: "Last Quarter in Aquarius is about releasing outdated ideas and embracing innovation. It's a time to focus on progressive changes and humanitarian efforts.",
          crystals: ["Amethyst", "Aquamarine"]
        }
      }
    }
  },
  june: {
    new: {
      phase: moonPhases.new,
      constellation: [constellations.taurus, constellations.gemini],
      information: {
        taurus: {
          details: "New Moon in Taurus focuses on setting intentions around stability and material comfort. It's a time to build secure foundations.",
          crystals: ["Rose Quartz", "Emerald"]
        },
        gemini: {
          details: "New Moon in Gemini encourages goals related to communication, learning, and adaptability.",
          crystals: ["Citrine", "Agate"]
        }
      }
    },
    firstQuarter: {
      phase: moonPhases.firstQuarter,
      constellation: [constellations.virgo],
      information: {
        virgo: {
          details: "First Quarter in Virgo involves tackling practical and analytical challenges. It's a time to refine your plans and address details with precision.",
          crystals: ["Peridot", "Jade"]
        }
      }
    },
    full: {
      phase: moonPhases.full,
      constellation: [constellations.sagittarius],
      information: {
        sagittarius: {
          details: "Full Moon in Sagittarius emphasizes the completion of educational and philosophical pursuits. It's a time to celebrate knowledge gained and experiences broadened.",
          crystals: ["Lapis Lazuli", "Amethyst"]
        }
      }
    },
    lastQuarter: {
      phase: moonPhases.lastQuarter,
      constellation: [constellations.pisces],
      information: {
        pisces: {
          details: "Last Quarter in Pisces focuses on releasing emotional baggage and embracing spiritual clarity. It's a time to let go of what no longer serves your emotional well-being.",
          crystals: ["Aquamarine", "Moonstone"]
        }
      }
    }
  },
  july: {
    new: {
      phase: moonPhases.new,
      constellation: [constellations.gemini, constellations.cancer],
      information: {
        gemini: {
          details: "New Moon in Gemini sets the stage for new beginnings in communication and intellectual pursuits. It's a time to embrace curiosity and adaptability.",
          crystals: ["Citrine", "Agate"]
        },
        cancer: {
          details: "New Moon in Cancer focuses on setting intentions around home, family, and emotional security.",
          crystals: ["Moonstone", "Pearl"]
        }
      }
    },
    firstQuarter: {
      phase: moonPhases.firstQuarter,
      constellation: [constellations.libra],
      information: {
        libra: {
          details: "First Quarter in Libra challenges you to address imbalances and seek harmony. It's a time to make decisions that promote peace and fairness in your relationships.",
          crystals: ["Lapis Lazuli", "Opal"]
        }
      }
    },
    full: {
      phase: moonPhases.full,
      constellation: [constellations.capricorn],
      information: {
        capricorn: {
          details: "Full Moon in Capricorn brings completion and clarity to career and long-term goals. It's a time to celebrate professional achievements and practical success.",
          crystals: ["Garnet", "Onyx"]
        }
      }
    },
    lastQuarter: {
      phase: moonPhases.lastQuarter,
      constellation: [constellations.aries],
      information: {
        aries: {
          details: "Last Quarter in Aries focuses on releasing impatience and impulsivity. It's a time to refine your actions and embrace strategic planning.",
          crystals: ["Carnelian", "Red Jasper"]
        }
      }
    }
  },
  august: {
    new: {
      phase: moonPhases.new,
      constellation: [constellations.cancer, constellations.leo],
      information: {
        cancer: {
          details: "New Moon in Cancer emphasizes new beginnings in home life and emotional well-being. It's a time to nurture your personal space and family connections.",
          crystals: ["Moonstone", "Pearl"]
        },
        leo: {
          details: "New Moon in Leo encourages setting intentions around creativity, self-expression, and confidence.",
          crystals: ["Sunstone", "Citrine"]
        }
      }
    },
    firstQuarter: {
      phase: moonPhases.firstQuarter,
      constellation: [constellations.scorpio],
      information: {
        scorpio: {
          details: "First Quarter in Scorpio challenges you to confront intense emotions and transformative situations. It's a time to embrace change and grow through emotional depth.",
          crystals: ["Obsidian", "Malachite"]
        }
      }
    },
    full: {
      phase: moonPhases.full,
      constellation: [constellations.aquarius],
      information: {
        aquarius: {
          details: "Full Moon in Aquarius brings clarity and completion to innovative and humanitarian efforts. It's a time to celebrate social progress and community achievements.",
          crystals: ["Amethyst", "Aquamarine"]
        }
      }
    },
    lastQuarter: {
      phase: moonPhases.lastQuarter,
      constellation: [constellations.taurus],
      information: {
        taurus: {
          details: "Last Quarter in Taurus focuses on releasing material attachments and embracing simplicity. It's a time to refine your values and seek stability.",
          crystals: ["Rose Quartz", "Emerald"]
        }
      }
    }
  },
  september: {
    new: {
      phase: moonPhases.new,
      constellation: [constellations.leo, constellations.virgo],
      information: {
        leo: {
          details: "New Moon in Leo sets the stage for new beginnings in creative projects and personal expression. It's a time to embrace your talents and lead with confidence.",
          crystals: ["Sunstone", "Citrine"]
        },
        virgo: {
          details: "New Moon in Virgo encourages setting intentions around organization, health, and service.",
          crystals: ["Peridot", "Jade"]
        }
      }
    },
    firstQuarter: {
      phase: moonPhases.firstQuarter,
      constellation: [constellations.sagittarius],
      information: {
        sagittarius: {
          details: "First Quarter in Sagittarius challenges you to expand your horizons and seek adventure. It's a time to face obstacles with optimism and embrace new experiences.",
          crystals: ["Lapis Lazuli", "Amethyst"]
        }
      }
    },
    full: {
      phase: moonPhases.full,
      constellation: [constellations.pisces],
      information: {
        pisces: {
          details: "Full Moon in Pisces brings emotional clarity and spiritual fulfillment. It's a time to celebrate creative accomplishments and deep connections.",
          crystals: ["Aquamarine", "Moonstone"]
        }
      }
    },
    lastQuarter: {
      phase: moonPhases.lastQuarter,
      constellation: [constellations.gemini],
      information: {
        gemini: {
          details: "Last Quarter in Gemini focuses on releasing outdated ideas and embracing adaptability. It's a time to refine your communication and stay open to new perspectives.",
          crystals: ["Citrine", "Agate"]
        }
      }
    }
  },
  october: {
    new: {
      phase: moonPhases.new,
      constellation: [constellations.virgo, constellations.libra],
      information: {
        virgo: {
          details: "New Moon in Virgo emphasizes new beginnings in health, organization, and service. It's a time to set practical, detail-oriented goals.",
          crystals: ["Peridot", "Jade"]
        },
        libra: {
          details: "New Moon in Libra encourages setting intentions around balance, relationships, and beauty.",
          crystals: ["Lapis Lazuli", "Opal"]
        }
      }
    },
    firstQuarter: {
      phase: moonPhases.firstQuarter,
      constellation: [constellations.capricorn],
      information: {
        capricorn: {
          details: "First Quarter in Capricorn challenges you to tackle practical and career-related obstacles. It's a time to make decisions that support your long-term goals and ambitions.",
          crystals: ["Garnet", "Onyx"]
        }
      }
    },
    full: {
      phase: moonPhases.full,
      constellation: [constellations.aries],
      information: {
        aries: {
          details: "Full Moon in Aries brings clarity and completion to personal initiatives and leadership efforts. It's a time to celebrate bold actions and individual achievements.",
          crystals: ["Carnelian", "Red Jasper"]
        }
      }
    },
    lastQuarter: {
      phase: moonPhases.lastQuarter,
      constellation: [constellations.cancer],
      information: {
        cancer: {
          details: "Last Quarter in Cancer focuses on releasing emotional burdens and embracing nurturing qualities. It's a time to refine your emotional well-being and strengthen family bonds.",
          crystals: ["Moonstone", "Pearl"]
        }
      }
    }
  },
  november: {
    new: {
      phase: moonPhases.new,
      constellation: [constellations.libra, constellations.scorpio],
      information: {
        libra: {
          details: "New Moon in Libra sets the stage for new beginnings in relationships and harmony. It's a time to set intentions around balance and fairness.",
          crystals: ["Lapis Lazuli", "Opal"]
        },
        scorpio: {
          details: "New Moon in Scorpio encourages setting goals related to transformation, emotional depth, and personal power.",
          crystals: ["Obsidian", "Malachite"]
        }
      }
    },
    firstQuarter: {
      phase: moonPhases.firstQuarter,
      constellation: [constellations.aquarius],
      information: {
        aquarius: {
          details: "First Quarter in Aquarius challenges you to innovate and embrace change. It's a time to tackle obstacles with creativity and seek progress.",
          crystals: ["Amethyst", "Aquamarine"]
        }
      }
    },
    full: {
      phase: moonPhases.full,
      constellation: [constellations.taurus],
      information: {
        taurus: {
          details: "Full Moon in Taurus brings clarity and completion to material and financial efforts. It's a time to celebrate stability and enjoy the fruits of your labor.",
          crystals: ["Rose Quartz", "Emerald"]
        }
      }
    },
    lastQuarter: {
      phase: moonPhases.lastQuarter,
      constellation: [constellations.leo],
      information: {
        leo: {
          details: "Last Quarter in Leo focuses on releasing ego-driven desires and embracing humility. It's a time to refine your self-expression and lead with authenticity.",
          crystals: ["Sunstone", "Citrine"]
        }
      }
    }
  },
  december: {
    new: {
      phase: moonPhases.new,
      constellation: [constellations.scorpio, constellations.ophiuchus],
      information: {
        scorpio: {
          details: "New Moon in Scorpio emphasizes new beginnings in transformation and emotional depth. It's a time to set intentions around personal growth and healing.",
          crystals: ["Obsidian", "Malachite"]
        },
        ophiuchus: {
          details: "New Moon in Ophiuchus encourages setting goals related to wisdom, healing, and rebirth.",
          crystals: ["Serpentine", "Chrysocolla"]
        }
      }
    },
    firstQuarter: {
      phase: moonPhases.firstQuarter,
      constellation: [constellations.pisces],
      information: {
        pisces: {
          details: "First Quarter in Pisces challenges you to address emotional and spiritual obstacles. It's a time to make decisions that align with your intuition and creativity.",
          crystals: ["Aquamarine", "Moonstone"]
        }
      }
    },
    full: {
      phase: moonPhases.full,
      constellation: [constellations.gemini],
      information: {
        gemini: {
          details: "Full Moon in Gemini brings clarity and completion to communication and intellectual efforts. It's a time to celebrate learning and share your knowledge.",
          crystals: ["Citrine", "Agate"]
        }
      }
    },
    lastQuarter: {
      phase: moonPhases.lastQuarter,
      constellation: [constellations.virgo],
      information: {
        virgo: {
          details: "Last Quarter in Virgo focuses on releasing perfectionist tendencies and embracing practical improvements. It's a time to refine your routines and clear out what no longer serves you.",
          crystals: ["Peridot", "Jade"]
        }
      }
    }
  }
};

// console.log(moonPhasesWithConstellations);
