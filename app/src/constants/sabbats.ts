const getExactDateOfCelestialEvent = (year: number, event: string) => {
  
};

export const wheelOfTheYearSabbats = [
  {
    name: 'Samhain',
    date: 'October 31st',
    description: 'Often considered the Wiccan New Year, this day marks the end of the harvest and the beginning of winter. It is a time to honor the dead and celebrate the veil between worlds being at its thinnest.'
  },
  {
    name: 'Yule',
    description: 'Celebrates the rebirth of the sun and the longest night of the year. It is a festival of light, symbolizing hope and renewal.',
    // getExactDate: function(year) {
    //   return getExactDateOfCelestialEvent(year, 'winterSolstice');
    // }
    date: 'December 21st',
  },
  {
    name: 'Imbolc',
    date: 'February 1st',
    description: 'Marks the midpoint between winter and spring. Traditionally, it is a time to celebrate the increasing strength of the sun and the preparation for the coming growth of spring.'
  },
  {
    name: 'Ostara',
    description: 'Celebrates the balance of day and night and the coming of spring. It is a festival of fertility, celebrating new growth and renewal.',
    // getExactDate: function(year) {
    //   return getExactDateOfCelestialEvent(year, 'springEquinox');
    // }
    date: 'March 21st',
  },
  {
    name: 'Beltane',
    date: 'May 1st',
    description: 'Celebrates the peak of spring and the coming of summer. This festival is associated with fertility, fire, and abundance.'
  },
  {
    name: 'Litha',
    description: 'Marks the longest day of the year. It is a time of celebration for the fullness of life.',
    // getExactDate: function(year) {
    //   return getExactDateOfCelestialEvent(year, 'summerSolstice');
    // }
    date: 'June 21st',
  },
  {
    name: 'Lammas or Lughnasadh',
    date: 'August 1st',
    description: 'The first of the harvest festivals, celebrating the grain harvest and the first fruits of the year. It is a time of giving thanks and sharing.'
  },
  {
    name: 'Mabon',
    description: 'Celebrates the second harvest and the balance of light and dark. It is a time of thanksgiving and reflection.',
    // getExactDate: function(year) {
    //   return getExactDateOfCelestialEvent(year, 'autumnEquinox');
    // }
    date: 'September 21st',
  }
];

// Hypothetical usage to get the exact date for Yule in 2024
// console.log("Yule Date in 2024:", wheelOfTheYearSabbats[1].getExactDate(2024));
