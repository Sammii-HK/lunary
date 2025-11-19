export interface EventTiming {
  eventType: 'moon_phase' | 'ingress' | 'retrograde' | 'aspect' | 'seasonal';
  eventName: string;
  exactTime: Date;
  notificationTime: Date;
}

export function calculateMoonPhaseTime(
  phaseName: string,
  date: Date,
): Date | null {
  if (!phaseName.includes('New') && !phaseName.includes('Full')) {
    return null;
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const approximateTime = new Date(year, month, day, 12, 0, 0);

  return approximateTime;
}

export function calculateIngressTime(
  planet: string,
  sign: string,
  date: Date,
): Date | null {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const approximateTime = new Date(year, month, day, 12, 0, 0);

  return approximateTime;
}

export function shouldSendNotificationNow(
  eventTiming: EventTiming,
  bufferMinutes: number = 5,
): boolean {
  const now = new Date();
  const notificationTime = new Date(eventTiming.notificationTime);
  const bufferMs = bufferMinutes * 60 * 1000;

  const timeDiff = Math.abs(now.getTime() - notificationTime.getTime());

  return timeDiff <= bufferMs;
}

export function getNextNotificationTime(
  eventTiming: EventTiming,
  bufferMinutes: number = 5,
): Date {
  const notificationTime = new Date(eventTiming.notificationTime);
  notificationTime.setMinutes(notificationTime.getMinutes() - bufferMinutes);
  return notificationTime;
}
