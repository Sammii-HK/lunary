/**
 * Notion template purchase delivery email.
 *
 * Sent immediately after a successful template purchase.
 * The plain-text body is watermarked with the buyer's email via Unicode
 * steganography — if this email is ever forwarded or redistributed, the
 * buyer can be identified by running the text through verify-watermark.ts.
 */

import { watermarkForBuyer } from '@/utils/steganography';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

export function generateTemplateDeliveryEmailHTML(
  templateName: string,
  accessToken: string,
): string {
  const accessUrl = `${APP_URL}/download/templates/${accessToken}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your ${templateName} is ready</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #1e1e3f;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a0533,#0d0d2e);padding:32px 40px 24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#8e8eeb;">Lunar Computing, Inc</p>
              <h1 style="margin:0;font-size:22px;font-weight:600;color:#ffffff;line-height:1.3;">Your template is ready ✨</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:15px;color:#a1a1aa;line-height:1.6;">
                Thank you for your purchase! Your <strong style="color:#ffffff;">${templateName}</strong> Notion template is ready to duplicate into your workspace.
              </p>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <a href="${accessUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#6d28d9,#4c1d95);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.02em;">
                      Duplicate your template &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Instructions -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1f;border:1px solid #1e1e3f;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#8e8eeb;">How to use</p>
                    <ol style="margin:0;padding:0 0 0 20px;color:#a1a1aa;font-size:13px;line-height:1.8;">
                      <li>Click the button above</li>
                      <li>Make sure you&rsquo;re logged into the correct Notion workspace</li>
                      <li>Click &ldquo;Duplicate page&rdquo; in the top right corner</li>
                      <li>The template is now yours &mdash; start filling it in!</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">
                This link is personal to your purchase. By purchasing you agreed to our
                <a href="${APP_URL}/legal/template-license" style="color:#8458d8;text-decoration:none;">template licence</a>
                &mdash; redistribution and resale are prohibited.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e1e3f;text-align:center;">
              <p style="margin:0;font-size:11px;color:#3f3f46;">
                &copy; Lunar Computing, Inc &mdash;
                <a href="${APP_URL}" style="color:#8458d8;text-decoration:none;">lunary.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Plain-text version — this is where the per-buyer canary watermark lives.
 * The watermark is invisibly encoded into the opening sentence.
 * If this text is ever shared or redistributed, the buyer is identified.
 */
export function generateTemplateDeliveryEmailText(
  templateName: string,
  accessToken: string,
  buyerEmail: string,
  templateId: string,
): string {
  const accessUrl = `${APP_URL}/download/templates/${accessToken}`;

  const openingSentence = `Your ${templateName} Notion template is ready to duplicate into your workspace.`;

  // Invisibly encode the buyer's email + template + date into the opening sentence.
  const watermarkedOpening = watermarkForBuyer(
    openingSentence,
    templateId,
    buyerEmail,
  );

  return `${watermarkedOpening}

DUPLICATE YOUR TEMPLATE
${accessUrl}

HOW TO USE
1. Click the link above
2. Make sure you're logged into the correct Notion workspace
3. Click "Duplicate page" in the top right corner
4. The template is yours — start filling it in!

This link is personal to your purchase. Redistribution and resale are
prohibited under our template licence: ${APP_URL}/legal/template-license

© Lunar Computing, Inc — lunary.app`;
}
