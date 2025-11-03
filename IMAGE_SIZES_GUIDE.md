# Multi-Size OG Image System

Your OG images now support multiple sizes perfect for different social media platforms and use cases.

## 🖼 Available Sizes

### 1. **Square (1200x1200)** - Default

- **Best for**: Instagram posts, general social sharing
- **Usage**: `?size=square` or no parameter
- **Dimensions**: 1200×1200px
- **Example**: `https://lunary.app/api/og/cosmic?size=square`

### 2. **Portrait/Story (1080x1920)** - Mobile Optimized

- **Best for**: Instagram Stories, TikTok, mobile screens, phone wallpapers
- **Usage**: `?size=portrait`
- **Dimensions**: 1080×1920px (9:16 aspect ratio)
- **Example**: `https://lunary.app/api/og/cosmic?size=portrait`

### 3. **Landscape (1920x1080)** - Desktop Optimized

- **Best for**: Twitter, LinkedIn, Facebook posts, desktop wallpapers
- **Usage**: `?size=landscape`
- **Dimensions**: 1920×1080px (16:9 aspect ratio)
- **Example**: `https://lunary.app/api/og/cosmic?size=landscape`

## 📱 Responsive Design Features

### **Typography Scaling**

- Font sizes automatically adjust for each format
- Portrait images get larger text for mobile readability
- Landscape images get smaller text to fit more content
- Maintains visual hierarchy across all sizes

### **Smart Spacing**

- Padding adjusts based on image dimensions
- Element spacing optimized for each aspect ratio
- Content stays properly centered and balanced

### **Platform Optimization**

- **Square**: Perfect 1:1 ratio for Instagram posts
- **Portrait**: 9:16 ratio matches phone screens and stories
- **Landscape**: 16:9 ratio ideal for desktop and wide displays

## 🎯 Usage Examples

### All OG Routes Support Multiple Sizes:

```bash
# Cosmic/Astrology Images
https://lunary.app/api/og/cosmic?date=2024-01-15&size=square
https://lunary.app/api/og/cosmic?date=2024-01-15&size=portrait
https://lunary.app/api/og/cosmic?date=2024-01-15&size=landscape

# Crystal Images
https://lunary.app/api/og/crystal?date=2024-01-15&size=portrait
https://lunary.app/api/og/crystal?date=2024-01-15&size=landscape

# Tarot Images
https://lunary.app/api/og/tarot?date=2024-01-15&size=portrait

# Moon Phase Images
https://lunary.app/api/og/moon?date=2024-01-15&size=landscape

# Horoscope Images
https://lunary.app/api/og/horoscope?date=2024-01-15&size=portrait
```

### With Date Parameters:

```bash
# Today's cosmic energy in story format
https://lunary.app/api/og/cosmic?size=portrait

# Specific date in landscape format
https://lunary.app/api/og/crystal?date=2024-12-25&size=landscape

# Moon phase for social media post
https://lunary.app/api/og/moon?date=2024-02-14&size=square
```

## 🎨 Design Specifications

### **Square (1200×1200)**

- Title: 32px
- Content: 64px (crystal name) / 36px (energy text)
- Date: 28px
- Footer: 28px
- Padding: 60px horizontal, 40px vertical

### **Portrait (1080×1920)**

- Title: 32-48px (larger for mobile readability)
- Content: 80px (crystal name) / 44px (energy text)
- Date: 36px
- Footer: 36px
- Padding: 80px horizontal, 60px vertical

### **Landscape (1920×1080)**

- Title: 20-28px (smaller to fit more content)
- Content: 52px (crystal name) / 28-32px (energy text)
- Date: 24px
- Footer: 24px
- Padding: 40px horizontal, 80px vertical

## 🚀 Benefits

1. **Multi-Platform Ready**: One API, multiple perfect formats
2. **Mobile Optimized**: Portrait format perfect for phone screens
3. **Desktop Friendly**: Landscape format ideal for wide displays
4. **Social Media Perfect**: Square format for Instagram posts
5. **Automatic Scaling**: Typography and spacing adjust intelligently
6. **Consistent Branding**: Same design language across all sizes

## 💡 Use Cases

### **Square Images**

- Instagram posts
- General social sharing
- Website thumbnails
- Product previews

### **Portrait Images**

- Instagram/TikTok Stories
- Phone wallpapers
- Mobile app previews
- Vertical social content

### **Landscape Images**

- Twitter posts
- Facebook covers
- Desktop wallpapers
- Blog post headers
- YouTube thumbnails

## 🔧 Implementation

The system automatically:

- Detects the `size` parameter
- Applies appropriate dimensions
- Scales typography responsively
- Adjusts spacing and padding
- Maintains visual consistency

All existing functionality (dates, astronomical data, themes) works perfectly across all sizes!

## 📊 Quick Reference

| Size        | Dimensions | Aspect | Best For         |
| ----------- | ---------- | ------ | ---------------- |
| `square`    | 1200×1200  | 1:1    | Instagram posts  |
| `portrait`  | 1080×1920  | 9:16   | Stories, mobile  |
| `landscape` | 1920×1080  | 16:9   | Desktop, Twitter |

Perfect for creating a complete suite of branded images for any content! 🌙✨
