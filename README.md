# Lunary

[Live site](https://lunary.app/)

## Details

### Time Frame

3 days

### Technologies

- Next
- Typescript
- Material UI
- Astronomy Engine
- Dayjs

### App Overview

Lunary is a lunar diary which displays planetary positions based on date and current time. The main feature of the app is the current moon phase and relevant information about it such as the constellation the moon is in and what this means. It also displays a daily tarot reading.

#### Development Process

This app relies on a lot of information being displayed which is based on moon phases, constellations and planetary positions.
I started by creating all of these constant as objects of data which I could retrieve with keys based on the moons current position.

All information displayed is based solely off of planetary position data retrieved with the astronomy engine package, which I then use to calculate moon phase constellation position and qualities.

Constellations contain information eg:

```JS
export const constellations = {
  aries: {
    name: "Aries",
    element: "Fire",
    quality: "Cardinal",
    rulingPlanet: "Mars",
    symbol: "Ram",
    keywords: ["Courage", "Initiative", "Leadership"],
    information: "Aries is known for its courage, initiative, and leadership. This is a time to take bold actions, start new projects, and assert yourself confidently. Focus on channeling your pioneering spirit and embracing your inner leader.",
    crystals: ["Carnelian", "Red Jasper"]
  },
```

Each Zodiac Constellation then has information specific to each moon phase which may occur within in, this information was created by merging the constellation qualities with the moon phase qualities to get details about the two corresponding:

```JS
  capricorn: {
    newMoon: {
      details: "New Moon in Capricorn is a time to set ambitious goals and focus on long-term achievements. It’s perfect for laying the foundation for future success.",
      crystals: ["Garnet", "Onyx"]
    },
    waxingCrescent: {
      details: "..."
      crystals: ["..."]
    },
    firstQuarter: {...},
    waxingGibbous: {...},
    fullMoon: {...},
    waningGibbous: {...},
    lastQuarter: {...},
    waningCrescent: {...},
```

I work out the planetary constellations from a calculation made from the longitude of the planetary body.

```JS
function getZodiacSign(longitude: number): string {
  const index = Math.floor((longitude < 0 ? longitude + 360 : longitude) / 30) % 12;
  return ZODIAC_SIGNS[index];
}
```

##### Noteworthy Items

The planetary position ephemeris is created entirely by my own script, which parses geo vector data to ecliptic longitude.

Longitude is formatted into degrees and minutes as on astrology charts which is translated to this format with a simple function

```JS
function formatDegree(longitude: number): FormattedDegree {
  const degreesInSign = longitude % 30;
  const degree = Math.floor(degreesInSign);
  const minute = Math.floor((degreesInSign - degree) * 60);
  return { degree, minute };
}
```

I also wanted to work out if a planetary body was in retrograde, so created this script to work out if the current ecliptic longitude is less than the ecliptic longitude 24 hours ago.

```JS
const astroTime = new AstroTime(date);
const astroTimePast = new AstroTime(new Date(date.getTime() - 24 * 60 * 60 * 1000));

const vectorNow = GeoVector(body, astroTime, true);
const vectorPast = GeoVector(body, astroTimePast, true);

const eclipticLongitudeNow = Ecliptic(vectorNow).elon;
const eclipticLongitudePast = Ecliptic(vectorPast).elon;

const retrograde = eclipticLongitudeNow < eclipticLongitudePast;
```

#### Functionality

##### UX Journeys

The app has a minimail steamlined design with only 4 pages:

1.  The main dashboard with planetary positions and moon phase information
2.  Tarot card reading review, to display readings from the past few days
3.  A Grimoire, a reference guide for all information displayed on the app
4.  A Book of Shadows - this is a work in progress but will be place for diary like entries

### Challenges & Achievements

My main achievement was utilising Chat GPT to help create all of the objects of enum data about moon phases, constellations, zodiacs and tarot cards.
Not having to create all of this information by hand sped up the development process and allowed me to concentrate on the creation of the app, instead of merely populating it with data.
All of this information also serves a second purpose as a grimoire of reference material so you can learn about phases, constellations and other items which are not on the current date.

## Future Enhancements

- Add login/profiles to create personalised Tarot readings
- Add a personalised horoscope, as everything is currently seeded with my name.
- Complete the Grimoire
- Add functionality for the Book of Shadows diary entries
