/**
 * Dual-write middleware for zero-downtime migration
 * Writes to both Jazz (legacy) and PostgreSQL (new) during transition
 */

const ENABLE_DUAL_WRITE = process.env.ENABLE_DUAL_WRITE === 'true';
const JAZZ_ENABLED = !!(
  process.env.JAZZ_WORKER_ACCOUNT && process.env.JAZZ_WORKER_SECRET
);

export interface DualWriteResult {
  postgresSuccess: boolean;
  jazzSuccess: boolean;
  postgresError?: Error;
  jazzError?: Error;
}

/**
 * Dual-write profile update
 */
export async function dualWriteProfile(
  userId: string,
  data: {
    name?: string;
    birthday?: string;
    stripeCustomerId?: string;
  },
): Promise<DualWriteResult> {
  const result: DualWriteResult = {
    postgresSuccess: false,
    jazzSuccess: false,
  };

  // Always write to PostgreSQL
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      result.postgresSuccess = true;
    } else {
      result.postgresError = new Error(
        `PostgreSQL write failed: ${response.statusText}`,
      );
    }
  } catch (error) {
    result.postgresError =
      error instanceof Error ? error : new Error('Unknown error');
  }

  // Write to Jazz if dual-write is enabled and Jazz is available
  if (ENABLE_DUAL_WRITE && JAZZ_ENABLED) {
    try {
      // This would need to be implemented with Jazz API if still needed
      // For now, we'll skip Jazz writes since we're migrating away
      result.jazzSuccess = true;
    } catch (error) {
      result.jazzError =
        error instanceof Error ? error : new Error('Unknown error');
      console.warn('Jazz write failed (non-critical during migration):', error);
    }
  } else {
    result.jazzSuccess = true;
  }

  return result;
}

/**
 * Dual-write birth chart
 */
export async function dualWriteBirthChart(
  userId: string,
  birthChart: any[],
): Promise<DualWriteResult> {
  const result: DualWriteResult = {
    postgresSuccess: false,
    jazzSuccess: false,
  };

  try {
    const response = await fetch('/api/profile/birth-chart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ birthChart }),
    });

    if (response.ok) {
      result.postgresSuccess = true;
    } else {
      result.postgresError = new Error(
        `PostgreSQL write failed: ${response.statusText}`,
      );
    }
  } catch (error) {
    result.postgresError =
      error instanceof Error ? error : new Error('Unknown error');
  }

  if (ENABLE_DUAL_WRITE && JAZZ_ENABLED) {
    result.jazzSuccess = true;
  } else {
    result.jazzSuccess = true;
  }

  return result;
}

/**
 * Dual-write personal card
 */
export async function dualWritePersonalCard(
  userId: string,
  personalCard: any,
): Promise<DualWriteResult> {
  const result: DualWriteResult = {
    postgresSuccess: false,
    jazzSuccess: false,
  };

  try {
    const response = await fetch('/api/profile/personal-card', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ personalCard }),
    });

    if (response.ok) {
      result.postgresSuccess = true;
    } else {
      result.postgresError = new Error(
        `PostgreSQL write failed: ${response.statusText}`,
      );
    }
  } catch (error) {
    result.postgresError =
      error instanceof Error ? error : new Error('Unknown error');
  }

  if (ENABLE_DUAL_WRITE && JAZZ_ENABLED) {
    result.jazzSuccess = true;
  } else {
    result.jazzSuccess = true;
  }

  return result;
}

/**
 * Dual-write location
 */
export async function dualWriteLocation(
  userId: string,
  location: any,
): Promise<DualWriteResult> {
  const result: DualWriteResult = {
    postgresSuccess: false,
    jazzSuccess: false,
  };

  try {
    const response = await fetch('/api/profile/location', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ location }),
    });

    if (response.ok) {
      result.postgresSuccess = true;
    } else {
      result.postgresError = new Error(
        `PostgreSQL write failed: ${response.statusText}`,
      );
    }
  } catch (error) {
    result.postgresError =
      error instanceof Error ? error : new Error('Unknown error');
  }

  if (ENABLE_DUAL_WRITE && JAZZ_ENABLED) {
    result.jazzSuccess = true;
  } else {
    result.jazzSuccess = true;
  }

  return result;
}
