# Weekly Newsletter vs Weekly Cosmic Report

## Weekly Newsletter (`/api/newsletter/weekly`)

**Purpose**: General cosmic content for all newsletter subscribers

**Content**:

- General astronomical events (planetary highlights, retrogrades, moon phases)
- Crystal recommendations for the week
- Best days for activities (manifestation, rest, etc.)
- Daily forecasts
- Magical timing guidance

**Audience**: All newsletter subscribers (preference: `weeklyNewsletter: true`)

**Data Source**: General cosmic data (`generateWeeklyContent()`)

**When Sent**: Via newsletter manager (manual or scheduled)

**Example**: "This week features a Full Moon in Leo, Mercury goes retrograde, and Venus enters Scorpio..."

---

## Weekly Cosmic Report (`/api/cron/weekly-cosmic-report`)

**Purpose**: Personalized weekly summary for individual users

**Content**:

- User's personal transits (based on their birth chart)
- Moon phases from their cosmic snapshots
- Tarot patterns from their readings
- Summary of their week's cosmic journey

**Audience**: Push notification subscribers with birthday (preference: `weeklyReport: true`)

**Data Source**: User's cosmic snapshots (`generateWeeklyReport()`)

**When Sent**: Automatically every Sunday at 10 AM UTC via cron

**Example**: "This week featured 3 moon phases and 5 significant transits for you. The dominant themes were transformation, communication, and creativity..."

---

## Key Differences

| Feature             | Weekly Newsletter              | Weekly Cosmic Report              |
| ------------------- | ------------------------------ | --------------------------------- |
| **Personalization** | General content                | Personalized to user              |
| **Data Source**     | General cosmic data            | User's snapshots                  |
| **Audience**        | Newsletter subscribers         | Push subscribers                  |
| **Frequency**       | Manual/scheduled               | Every Sunday                      |
| **Content Focus**   | What's happening cosmically    | What happened for YOU             |
| **Includes**        | Crystals, best days, forecasts | Personal transits, tarot patterns |

Both serve different purposes:

- **Newsletter**: Educational, general cosmic guidance
- **Report**: Personal reflection, your cosmic journey
