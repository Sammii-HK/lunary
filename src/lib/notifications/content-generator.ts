import { NotificationEvent } from './unified-service';

const notificationTemplates: Record<string, string[]> = {
  moon_new: [
    'New Moon arrives - a powerful moment for setting intentions',
    'The New Moon brings fresh energy for new beginnings',
    'New Moon phase begins - time to plant seeds for the future',
  ],
  moon_full: [
    'Full Moon peaks - clarity and release are in focus',
    'Full Moon illuminates what needs to be seen',
    'Full Moon energy reaches its peak - time for completion',
  ],
  ingress: [
    '{planet} enters {sign} - energy shifts toward new themes',
    '{planet} moves into {sign} - amplifying {sign} qualities',
    '{planet} transitions into {sign} - new cosmic influences activate',
  ],
  aspect: [
    '{planetA} and {planetB} form a {aspect} - powerful alignment',
    '{planetA}-{planetB} {aspect} creates dynamic cosmic energy',
    '{planetA} and {planetB} align in {aspect} - significant influence',
  ],
};

export function generateUniqueNotificationText(
  event: NotificationEvent,
  previousTexts: Set<string> = new Set(),
): string {
  const templates = getTemplatesForEvent(event);
  if (templates.length === 0) {
    return getDefaultText(event);
  }

  for (const template of templates) {
    const text = fillTemplate(template, event);
    if (!previousTexts.has(text)) {
      return text;
    }
  }

  return fillTemplate(templates[0], event);
}

function getTemplatesForEvent(event: NotificationEvent): string[] {
  if (event.type === 'moon') {
    if (event.name?.includes('New')) {
      return notificationTemplates.moon_new || [];
    }
    if (event.name?.includes('Full')) {
      return notificationTemplates.moon_full || [];
    }
  }

  if (event.type === 'ingress') {
    return notificationTemplates.ingress || [];
  }

  if (event.type === 'aspect') {
    return notificationTemplates.aspect || [];
  }

  return [];
}

function fillTemplate(template: string, event: NotificationEvent): string {
  let text = template;

  if (event.planet) {
    text = text.replace(/{planet}/g, event.planet);
  }

  if (event.sign) {
    text = text.replace(/{sign}/g, event.sign);
  }

  if (event.planetA) {
    const planetAName = event.planetA?.name || event.planetA || 'Planet';
    text = text.replace(/{planetA}/g, planetAName);
  }

  if (event.planetB) {
    const planetBName = event.planetB?.name || event.planetB || 'Planet';
    text = text.replace(/{planetB}/g, planetBName);
  }

  if (event.aspect) {
    const aspectName =
      event.aspect.charAt(0).toUpperCase() + event.aspect.slice(1);
    text = text.replace(/{aspect}/g, aspectName);
  }

  return text;
}

function getDefaultText(event: NotificationEvent): string {
  switch (event.type) {
    case 'moon':
      return event.name || 'Moon phase shift';
    case 'ingress':
      return `${event.planet || 'Planet'} enters ${event.sign || 'new sign'}`;
    case 'aspect':
      return 'Powerful cosmic alignment';
    default:
      return event.name || 'Cosmic event';
  }
}

export function addContextualInfo(
  baseText: string,
  event: NotificationEvent,
  cosmicData?: any,
): string {
  if (event.type === 'moon') {
    const moonSign = cosmicData?.astronomicalData?.planets?.moon?.sign;
    if (moonSign) {
      return `${baseText} (Moon in ${moonSign})`;
    }
  }

  return baseText;
}
