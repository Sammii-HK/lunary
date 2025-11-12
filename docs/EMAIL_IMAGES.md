# Adding Images to Emails

There are several ways to add images to your Lunary emails:

## Method 1: Hosted Images (Recommended)

Host your images on your domain (e.g., `lunary.app`) and reference them in HTML:

```html
<img
  src="https://lunary.app/images/email-header.png"
  alt="Lunary Logo"
  style="max-width: 100%; height: auto;"
/>
```

**Best Practices:**

- Use absolute URLs (https://)
- Host images on your own domain for better deliverability
- Optimize images (compress, use WebP when possible)
- Always include `alt` text for accessibility
- Set `max-width: 100%` for responsive emails

## Method 2: Base64 Inline Images (Small Images Only)

For small images (< 50KB), you can embed them directly:

```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." alt="Small Icon" />
```

**Limitations:**

- Not all email clients support base64 images
- Increases email size significantly
- Gmail has size limits (~100KB total)

## Method 3: Using Brevo Image Hosting

Brevo provides image hosting for transactional emails:

1. Upload images to Brevo dashboard
2. Use the provided URLs in your emails
3. Images are automatically optimized and cached

## Example: Adding Header Image to Newsletter

```typescript
// In your email template function
const emailHeaderImage = 'https://lunary.app/images/newsletter-header.png';

const html = `
  <div class="header">
    <img src="${emailHeaderImage}" alt="Lunary Newsletter" style="max-width: 100%; height: auto; margin-bottom: 20px;" />
    <h1>Weekly Cosmic Insights</h1>
  </div>
`;
```

## Recommended Image Sizes

- **Header/Banner**: 600px wide (max email width)
- **Icons**: 32x32px to 64x64px
- **Product Images**: 300x300px
- **Social Icons**: 24x24px

## Image Optimization Tips

1. **Compress images**: Use tools like TinyPNG or ImageOptim
2. **Use appropriate formats**: PNG for icons, JPG for photos, WebP when supported
3. **Set explicit dimensions**: Helps email clients render correctly
4. **Test across clients**: Gmail, Outlook, Apple Mail, etc.

## Example Implementation

```typescript
// src/lib/email-templates/newsletter.ts
export function generateNewsletterHTML(data: WeeklyCosmicData): string {
  const headerImage = 'https://lunary.app/images/newsletter-header.png';
  const logoImage = 'https://lunary.app/images/logo.png';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .header-image {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto 20px;
          }
          .logo {
            width: 48px;
            height: 48px;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <img src="${headerImage}" alt="Lunary Newsletter Header" class="header-image" />
        <img src="${logoImage}" alt="Lunary Logo" class="logo" />
        <!-- Rest of email content -->
      </body>
    </html>
  `;
}
```

## Testing Images

Always test emails with images:

1. Send test emails to multiple email clients
2. Check if images load correctly
3. Verify fallback text displays if images are blocked
4. Test on mobile devices
