import type { NotificationCopy } from './copy-library';

type PredictiveEventType =
  | 'retrograde_start'
  | 'retrograde_end'
  | 'sign_ingress';

/**
 * Generate notification copy for predictive transit alerts.
 */
export function getPredictiveNotificationCopy(
  eventType: PredictiveEventType,
  planet: string,
  sign: string,
  daysUntil: number,
  userName?: string,
  isPersonal?: boolean,
): NotificationCopy {
  const namePrefix = userName ? `${userName}, ` : '';
  const timeLabel = daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;

  switch (eventType) {
    case 'retrograde_start': {
      if (isPersonal) {
        return {
          title: 'Lunary',
          body: `${namePrefix}${timeLabel}: ${planet} retrograde begins in ${sign} — time to slow down and review`,
        };
      }
      return {
        title: 'Lunary',
        body: `${timeLabel}: ${planet} retrograde begins — time to back up and wrap up loose ends`,
      };
    }

    case 'retrograde_end': {
      if (isPersonal) {
        return {
          title: 'Lunary',
          body: `${namePrefix}${timeLabel}: ${planet} stations direct in ${sign} — momentum returns to your chart`,
        };
      }
      return {
        title: 'Lunary',
        body: `${timeLabel}: ${planet} stations direct — forward motion resumes`,
      };
    }

    case 'sign_ingress': {
      const signThemes = getSignTheme(sign);

      if (isPersonal) {
        return {
          title: 'Lunary',
          body: `${namePrefix}${timeLabel}: ${planet} enters your sign — ${signThemes.personal}`,
        };
      }
      return {
        title: 'Lunary',
        body: `${timeLabel}: ${planet} enters ${sign} — ${signThemes.general}`,
      };
    }

    default:
      return {
        title: 'Lunary',
        body: `${timeLabel}: A significant cosmic shift is approaching`,
      };
  }
}

function getSignTheme(sign: string): {
  personal: string;
  general: string;
} {
  const themes: Record<string, { personal: string; general: string }> = {
    Aries: {
      personal: 'fresh energy and initiative come into focus',
      general: 'bold beginnings and new initiatives',
    },
    Taurus: {
      personal: 'stability and sensual pleasures are highlighted',
      general: 'grounding energy and material focus',
    },
    Gemini: {
      personal: 'communication and curiosity are amplified',
      general: 'ideas flow and connections multiply',
    },
    Cancer: {
      personal: 'home and emotional depth call to you',
      general: 'nurturing energy and emotional awareness',
    },
    Leo: {
      personal: 'creativity and self-expression shine',
      general: 'confidence and creative expression',
    },
    Virgo: {
      personal: 'clarity and refinement support your path',
      general: 'practical improvements and health focus',
    },
    Libra: {
      personal: 'relationships and harmony come into focus',
      general: 'balance, beauty, and partnership themes',
    },
    Scorpio: {
      personal: 'transformation and deep truth emerge',
      general: 'intensity and transformative power',
    },
    Sagittarius: {
      personal: 'adventure and philosophical growth beckon',
      general: 'expansion, travel, and higher learning',
    },
    Capricorn: {
      personal: 'ambition and structure support your goals',
      general: 'discipline, achievement, and long-term plans',
    },
    Aquarius: {
      personal: 'innovation and community inspire you',
      general: 'unconventional ideas and social awareness',
    },
    Pisces: {
      personal: 'intuition and spiritual depth deepen',
      general: 'dreaminess, compassion, and creative flow',
    },
  };

  return (
    themes[sign] ?? {
      personal: 'new cosmic themes activate your chart',
      general: 'shifting cosmic energy',
    }
  );
}
