import {
  InteractionResponseData,
  DiscordEmbed,
  ApplicationCommandOption,
} from './types';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://lunary.app';

async function getCosmicData(date?: string) {
  const dateStr = date || new Date().toISOString().split('T')[0];
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://lunary.app';

  try {
    const response = await fetch(
      `${baseUrl}/api/og/cosmic-post?date=${dateStr}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch cosmic data: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching cosmic data:', error);
    return null;
  }
}

function createAppLink(campaign: string): string {
  return `${APP_URL}?utm_source=discord&utm_medium=bot&utm_campaign=${campaign}`;
}

export async function handleMoonCommand(): Promise<InteractionResponseData> {
  const cosmicData = await getCosmicData();

  if (!cosmicData) {
    return {
      content: 'Unable to fetch moon phase data at this time.',
    };
  }

  const moonPhase = cosmicData.astronomicalData?.moonPhase;
  const primaryEvent = cosmicData.primaryEvent;

  const embed: DiscordEmbed = {
    title: `${moonPhase?.name || 'Moon Phase'}`,
    description: primaryEvent?.energy || 'Current lunar energy',
    color: 0x8b5cf6,
    fields: [
      {
        name: 'Illumination',
        value: `${moonPhase?.illumination || 0}%`,
        inline: true,
      },
      {
        name: 'Age',
        value: `${moonPhase?.age || 0} days`,
        inline: true,
      },
    ],
    footer: {
      text: 'Get personalized moon guidance',
    },
    url: createAppLink('moon_command'),
  };

  return {
    embeds: [embed],
  };
}

export async function handleEventsCommand(): Promise<InteractionResponseData> {
  const cosmicData = await getCosmicData();

  if (!cosmicData) {
    return {
      content: 'Unable to fetch cosmic events at this time.',
    };
  }

  const events: Array<{ name: string; type: string; priority: number }> = [];
  const primaryEvent = cosmicData.primaryEvent;

  if (primaryEvent) {
    events.push({
      name: primaryEvent.name,
      type: primaryEvent.type || 'general',
      priority: primaryEvent.priority || 0,
    });
  }

  if (cosmicData.retrogradeEvents?.length > 0) {
    events.push(...cosmicData.retrogradeEvents.slice(0, 3));
  }

  if (cosmicData.aspectEvents?.length > 0) {
    events.push(...cosmicData.aspectEvents.slice(0, 2));
  }

  if (cosmicData.ingressEvents?.length > 0) {
    events.push(...cosmicData.ingressEvents.slice(0, 2));
  }

  const fields = events.slice(0, 5).map((event) => ({
    name: event.name,
    value: `Type: ${event.type} | Priority: ${event.priority}`,
    inline: false,
  }));

  const embed: DiscordEmbed = {
    title: "Today's Cosmic Events",
    description: cosmicData.highlights?.[0] || 'Cosmic energies are flowing',
    color: 0xec4899,
    fields: fields.length > 0 ? fields : undefined,
    footer: {
      text: 'View all events in the Lunary app',
    },
    url: createAppLink('events_command'),
  };

  return {
    embeds: [embed],
  };
}

export async function handleRetrogradeCommand(): Promise<InteractionResponseData> {
  const cosmicData = await getCosmicData();

  if (!cosmicData) {
    return {
      content: 'Unable to fetch retrograde data at this time.',
    };
  }

  const retrogrades = cosmicData.retrogradeEvents || [];
  const retrogradeIngress = cosmicData.retrogradeIngress || [];

  if (retrogrades.length === 0 && retrogradeIngress.length === 0) {
    return {
      embeds: [
        {
          title: 'No Active Retrogrades',
          description:
            'All planets are moving forward! This is a great time for action and new beginnings.',
          color: 0x00ff00,
          footer: {
            text: 'Track planetary movements in Lunary',
          },
          url: createAppLink('retrograde_command'),
        },
      ],
    };
  }

  const fields = [
    ...retrogrades.slice(0, 3).map((event: any) => ({
      name: `${event.planet || 'Planet'} Retrograde`,
      value: event.description || event.name || 'Active retrograde period',
      inline: false,
    })),
    ...retrogradeIngress.slice(0, 2).map((event: any) => ({
      name: `${event.planet || 'Planet'} Retrograde Starting`,
      value: event.description || event.name || 'Retrograde beginning',
      inline: false,
    })),
  ];

  const embed: DiscordEmbed = {
    title: 'Active Retrogrades',
    description: 'Planetary retrogrades invite reflection and review',
    color: 0xff6b6b,
    fields: fields.slice(0, 5),
    footer: {
      text: 'Get personalized retrograde guidance',
    },
    url: createAppLink('retrograde_command'),
  };

  return {
    embeds: [embed],
  };
}

export async function handleHoroscopeCommand(
  options?: ApplicationCommandOption[],
): Promise<InteractionResponseData> {
  const signOption = options?.find((opt) => opt.name === 'sign');
  const sign = signOption?.value as string | undefined;

  if (!sign) {
    return {
      content: 'Please specify a zodiac sign. Usage: `/horoscope sign:Aries`',
    };
  }

  const validSigns = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];

  const normalizedSign =
    sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();

  if (!validSigns.includes(normalizedSign)) {
    return {
      content: `Invalid sign. Please use one of: ${validSigns.join(', ')}`,
    };
  }

  const cosmicData = await getCosmicData();
  const horoscope = cosmicData?.horoscope;

  if (!horoscope) {
    return {
      content: `Unable to fetch horoscope for ${normalizedSign} at this time.`,
    };
  }

  const embed: DiscordEmbed = {
    title: `${normalizedSign} Daily Horoscope`,
    description:
      horoscope.reading ||
      horoscope.generalAdvice ||
      'Trust your intuition today.',
    color: 0x8b5cf6,
    fields: [
      {
        name: 'Moon Phase',
        value: horoscope.moonPhase || 'Current phase',
        inline: true,
      },
      {
        name: 'Date',
        value: horoscope.date || new Date().toLocaleDateString(),
        inline: true,
      },
    ],
    footer: {
      text: 'Get personalized horoscope in Lunary',
    },
    url: createAppLink('horoscope_command'),
  };

  return {
    embeds: [embed],
  };
}

export async function handleCosmicCommand(): Promise<InteractionResponseData> {
  const cosmicData = await getCosmicData();

  if (!cosmicData) {
    return {
      content: 'Unable to fetch cosmic data at this time.',
    };
  }

  const primaryEvent = cosmicData.primaryEvent;
  const moonPhase = cosmicData.astronomicalData?.moonPhase;

  const embed: DiscordEmbed = {
    title: primaryEvent?.name || "Today's Cosmic Energy",
    description:
      primaryEvent?.energy ||
      cosmicData.highlights?.[0] ||
      'Cosmic energies are flowing',
    color: 0xec4899,
    fields: [
      {
        name: 'Moon Phase',
        value: moonPhase?.name || 'Current phase',
        inline: true,
      },
      {
        name: 'Event Type',
        value: primaryEvent?.type || 'general',
        inline: true,
      },
    ],
    footer: {
      text: 'Explore your personalized cosmic state',
    },
    url: createAppLink('cosmic_command'),
  };

  return {
    embeds: [embed],
  };
}

export async function handleShareReadingCommand(): Promise<InteractionResponseData> {
  const cosmicData = await getCosmicData();
  const moonPhase =
    cosmicData?.astronomicalData?.moonPhase?.name || 'current moon';

  return {
    embeds: [
      {
        title: 'Share Your Reading',
        description: `Got a tarot reading or cosmic insight you'd like to share with the community?\n\n**How to share:**\n1. Get your reading: [Open Lunary App](${createAppLink('share_reading_command')})\n2. Click "Share" in the app\n3. Copy your share link\n4. Post it here in the channel!\n\nWe'd love to see what the cards revealed for you during this ${moonPhase}!`,
        color: 0x8b5cf6,
        fields: [
          {
            name: 'Tag Your Posts',
            value: 'Use #lunaryreading so others can find your shares',
            inline: false,
          },
        ],
        footer: {
          text: 'Share your cosmic journey with the community',
        },
      },
    ],
  };
}

export async function handleAppCommand(): Promise<InteractionResponseData> {
  return {
    embeds: [
      {
        title: 'Open Lunary App',
        description:
          'Get personalized cosmic guidance, tarot readings, horoscopes, and more!',
        color: 0x8b5cf6,
        fields: [
          {
            name: 'Features',
            value:
              '• Personalized horoscopes\n• Tarot readings\n• Moon phase tracking\n• Birth chart analysis\n• Cosmic event notifications',
            inline: false,
          },
        ],
        footer: {
          text: 'Start your cosmic journey',
        },
        url: createAppLink('app_command'),
      },
    ],
  };
}

export async function handleCommand(
  commandName: string,
  options?: ApplicationCommandOption[],
): Promise<InteractionResponseData> {
  switch (commandName) {
    case 'moon':
      return handleMoonCommand();
    case 'events':
      return handleEventsCommand();
    case 'retrograde':
      return handleRetrogradeCommand();
    case 'horoscope':
      return handleHoroscopeCommand(options);
    case 'cosmic':
      return handleCosmicCommand();
    case 'share-reading':
      return handleShareReadingCommand();
    case 'app':
      return handleAppCommand();
    default:
      return {
        content: `Unknown command: ${commandName}`,
      };
  }
}
