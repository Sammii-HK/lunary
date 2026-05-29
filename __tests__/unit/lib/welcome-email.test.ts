/**
 * Guards the safety gate on the Day-0 welcome email. The single most important
 * property is that the email CANNOT fire unless WELCOME_EMAIL_ENABLED === 'true'.
 * If this regresses, every email-verifying user gets a real send the moment the
 * code deploys, which is exactly what the gate exists to prevent.
 */

const mockSql = jest.fn();
const mockSendEmail = jest.fn();

jest.mock('@vercel/postgres', () => ({
  sql: (...args: any[]) => mockSql(...args),
}));

jest.mock('@/lib/email', () => ({
  sendEmail: (...args: any[]) => mockSendEmail(...args),
}));

// The template module pulls in React Email; stub it so the unit test stays fast
// and focused on the gating logic rather than HTML rendering.
jest.mock('@/lib/email-templates/trial-nurture', () => ({
  generateTrialWelcomeEmailHTML: jest.fn().mockResolvedValue('<html></html>'),
  generateTrialWelcomeEmailText: jest.fn().mockReturnValue('welcome'),
}));

import { sendWelcomeEmail, isWelcomeEmailEnabled } from '@/lib/email/welcome';

const ORIGINAL_FLAG = process.env.WELCOME_EMAIL_ENABLED;

describe('sendWelcomeEmail safety gate', () => {
  beforeEach(() => {
    mockSql.mockReset();
    mockSendEmail.mockReset();
    delete process.env.WELCOME_EMAIL_ENABLED;
  });

  afterAll(() => {
    if (ORIGINAL_FLAG === undefined) delete process.env.WELCOME_EMAIL_ENABLED;
    else process.env.WELCOME_EMAIL_ENABLED = ORIGINAL_FLAG;
  });

  it('treats a missing flag as OFF', () => {
    delete process.env.WELCOME_EMAIL_ENABLED;
    expect(isWelcomeEmailEnabled()).toBe(false);
  });

  it('treats any non-"true" value as OFF', () => {
    for (const v of ['false', '1', 'TRUE', 'yes', '', ' true ']) {
      process.env.WELCOME_EMAIL_ENABLED = v;
      expect(isWelcomeEmailEnabled()).toBe(false);
    }
    process.env.WELCOME_EMAIL_ENABLED = 'true';
    expect(isWelcomeEmailEnabled()).toBe(true);
  });

  it('does NOT send when the flag is unset (dry-run)', async () => {
    // No prefs row, not already sent.
    mockSql
      .mockResolvedValueOnce({ rows: [] }) // email_preferences lookup
      .mockResolvedValueOnce({ rows: [] }); // idempotency lookup

    const result = await sendWelcomeEmail({
      id: 'user-1',
      email: 'a@b.com',
      name: 'Ada',
    });

    expect(result).toEqual({
      sent: false,
      reason: 'disabled_dry_run',
      dryRun: true,
    });
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('short-circuits with no email and never queries or sends', async () => {
    const result = await sendWelcomeEmail({ id: null, email: null });
    expect(result).toEqual({ sent: false, reason: 'no_email' });
    expect(mockSql).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('does not send to an unsubscribed user even when enabled', async () => {
    process.env.WELCOME_EMAIL_ENABLED = 'true';
    mockSql.mockResolvedValueOnce({ rows: [{ unsubscribed_all: true }] });

    const result = await sendWelcomeEmail({ id: 'user-2', email: 'c@d.com' });

    expect(result).toEqual({
      sent: false,
      reason: 'unsubscribed',
      dryRun: false,
    });
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('does not re-send when already sent (idempotency) even when enabled', async () => {
    process.env.WELCOME_EMAIL_ENABLED = 'true';
    mockSql
      .mockResolvedValueOnce({ rows: [] }) // prefs: not unsubscribed
      .mockResolvedValueOnce({ rows: [{ '?column?': 1 }] }); // already sent

    const result = await sendWelcomeEmail({ id: 'user-3', email: 'e@f.com' });

    expect(result).toEqual({
      sent: false,
      reason: 'already_sent',
      dryRun: false,
    });
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('sends exactly once when enabled, allowed, and not yet sent', async () => {
    process.env.WELCOME_EMAIL_ENABLED = 'true';
    mockSql
      .mockResolvedValueOnce({ rows: [] }) // prefs: not unsubscribed
      .mockResolvedValueOnce({ rows: [] }); // not already sent
    mockSendEmail.mockResolvedValueOnce({ id: 'msg-123' });

    const result = await sendWelcomeEmail({
      id: 'user-4',
      email: 'g@h.com',
      name: 'Grace',
    });

    expect(result).toEqual({ sent: true, messageId: 'msg-123' });
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const arg = mockSendEmail.mock.calls[0][0];
    expect(arg.to).toBe('g@h.com');
    expect(arg.tracking.notificationId).toBe('welcome-day0-user-4');
    expect(arg.tracking.notificationType).toBe('trial_welcome');
  });
});
