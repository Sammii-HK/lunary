# OG Images Summary

All OG images are tagged with `lunary.app` branding at the bottom and use consistent styling.

## Available OG Image Generators

### 1. **Tarot Pattern** - `/api/og/tarot-pattern`

- **Use**: Share tarot pattern analysis
- **Params**: `pattern`, `cards`, `themes`
- **Example**: `/api/og/tarot-pattern?pattern=Transformation&cards=Death, Tower, Wheel&themes=Change, Release`

### 2. **Birth Chart** - `/api/og/birth-chart`

- **Use**: Share birth chart highlights (Sun/Moon/Rising)
- **Params**: `sun`, `moon`, `rising`, `name`
- **Example**: `/api/og/birth-chart?sun=Leo&moon=Cancer&rising=Scorpio&name=Your Chart`

### 3. **Tarot Spread** - `/api/og/tarot-spread`

- **Use**: Share tarot spread readings
- **Params**: `spread`, `card1`, `card2`, `card3`, `interpretation`
- **Example**: `/api/og/tarot-spread?spread=Past Present Future&card1=The Fool&card2=The Magician&card3=The World`

### 4. **Moon Circle** - `/api/og/moon-circle`

- **Use**: Share Moon Circle events (New/Full Moon)
- **Params**: `type`, `sign`, `date`, `ritual`
- **Example**: `/api/og/moon-circle?type=New Moon&sign=Aries&date=Jan 15, 2025&ritual=Set intentions`

### 5. **Cosmic Pulse** - `/api/og/cosmic-pulse`

- **Use**: Share daily cosmic pulse insights
- **Params**: `moon`, `transit`, `prompt`
- **Example**: `/api/og/cosmic-pulse?moon=Scorpio&transit=Venus enters Pisces&prompt=How are you feeling?`

### 6. **Horoscope Reading** - `/api/og/horoscope-reading`

- **Use**: Share personalized horoscope readings
- **Params**: `sign`, `date`, `insight`
- **Example**: `/api/og/horoscope-reading?sign=Leo&date=Jan 15&insight=Today brings clarity`

### 7. **Transit** - `/api/og/transit`

- **Use**: Share significant planetary transits
- **Params**: `planet`, `event`, `date`, `meaning`
- **Example**: `/api/og/transit?planet=Jupiter&event=enters Gemini&date=Jan 20&meaning=Expansion`

### 8. **Crystal** - `/api/og/crystal`

- **Use**: Share crystal recommendations
- **Params**: `crystal`, `reason`, `chakra`
- **Example**: `/api/og/crystal?crystal=Amethyst&reason=For clarity&chakra=Third Eye`

## Existing OG Images

- `/api/og/cosmic` - General cosmic image
- `/api/og/moon` - Moon phase image
- `/api/og/horoscope` - Horoscope image
- `/api/og/social-quote` - Social quote image

## Usage in Code

All OG images can be used in:

- Social sharing buttons
- Email templates
- Blog posts
- Moon Circle emails
- Cosmic Pulse notifications
- Shareable cards feature

## Branding

All images include:

- `lunary.app` watermark at bottom
- Consistent purple/indigo gradient backgrounds
- Professional, mystical aesthetic
- 1200x630px standard OG image size
