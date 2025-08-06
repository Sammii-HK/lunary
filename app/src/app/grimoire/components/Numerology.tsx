const Numerology = () => {
  const coreNumbers = [
    { number: 1, meaning: 'Leadership & New Beginnings', traits: 'Independent, pioneering, ambitious', day: 'Starting projects, taking initiative, leadership activities' },
    { number: 2, meaning: 'Cooperation & Balance', traits: 'Diplomatic, sensitive, cooperative', day: 'Partnerships, teamwork, diplomatic approaches' },
    { number: 3, meaning: 'Creativity & Communication', traits: 'Creative, expressive, optimistic', day: 'Artistic endeavors, social activities, communication' },
    { number: 4, meaning: 'Stability & Foundation', traits: 'Practical, organized, reliable', day: 'Planning, organizing, building foundations' },
    { number: 5, meaning: 'Freedom & Adventure', traits: 'Adventurous, curious, versatile', day: 'Travel, new experiences, embracing change' },
    { number: 6, meaning: 'Nurturing & Responsibility', traits: 'Caring, responsible, family-oriented', day: 'Family matters, healing, acts of service' },
    { number: 7, meaning: 'Spiritual Insight & Wisdom', traits: 'Intuitive, analytical, mystical', day: 'Meditation, study, spiritual pursuits' },
    { number: 8, meaning: 'Material Success & Power', traits: 'Ambitious, authoritative, business-minded', day: 'Business decisions, financial matters, leadership' },
    { number: 9, meaning: 'Completion & Universal Love', traits: 'Compassionate, humanitarian, wise', day: 'Completion, letting go, humanitarian efforts' }
  ];

  const masterNumbers = [
    { number: 11, meaning: 'Master Intuition', description: 'Spiritual illumination, heightened intuition, and psychic abilities' },
    { number: 22, meaning: 'Master Builder', description: 'The ability to turn dreams into reality on a large scale' },
    { number: 33, meaning: 'Master Teacher', description: 'Selfless service to humanity, teaching, and healing on a universal level' }
  ];

  const dayEnergies = [
    { day: 'Sunday', planet: 'Sun ☉', energy: 'Solar vitality, confidence, self-expression' },
    { day: 'Monday', planet: 'Moon ☽', energy: 'Lunar intuition, emotional sensitivity' },
    { day: 'Tuesday', planet: 'Mars ♂', energy: 'Martial action, assertive drive' },
    { day: 'Wednesday', planet: 'Mercury ☿', energy: 'Communication, mental agility' },
    { day: 'Thursday', planet: 'Jupiter ♃', energy: 'Expansion, philosophical thinking' },
    { day: 'Friday', planet: 'Venus ♀', energy: 'Love, beauty, social harmony' },
    { day: 'Saturday', planet: 'Saturn ♄', energy: 'Structure, discipline, reflection' }
  ];

  return (
    <div className='h-[91vh]'>
      <h1 className='text-lg font-bold mb-3 pt-12'>Numerology</h1>
      
      <h2 id='core-numbers' className='text-lg font-bold mb-4 pt-12'>Core Numbers</h2>
      {coreNumbers.map((number) => (
        <div key={number.number} className='mb-3 text-xs'>
          <h3 className='font-bold pb-1'>{number.number} - {number.meaning}</h3>
          <p className='pb-1'>{number.traits}</p>
          <p>Best for: {number.day}</p>
        </div>
      ))}

      <h2 id='master-numbers' className='text-lg font-bold mb-4 pt-12'>Master Numbers</h2>
      {masterNumbers.map((master) => (
        <div key={master.number} className='mb-3 text-xs'>
          <h3 className='font-bold pb-1'>{master.number} - {master.meaning}</h3>
          <p>{master.description}</p>
        </div>
      ))}

      <h2 id='planetary-days' className='text-lg font-bold mb-4 pt-12'>Planetary Days</h2>
      {dayEnergies.map((day) => (
        <div key={day.day} className='mb-3 text-xs'>
          <h3 className='font-bold pb-1'>{day.day} - {day.planet}</h3>
          <p>{day.energy}</p>
        </div>
      ))}

      <h2 id='calculations' className='text-lg font-bold mb-4 pt-12'>Calculations</h2>
      <div className='mb-3 text-xs'>
        <h3 className='font-bold pb-1'>Daily Universal Number</h3>
        <p className='pb-1'>Add all digits of today's date and reduce to single digit (except 11, 22, 33)</p>
        <p className='pb-1'><strong>Example:</strong> December 15, 2024</p>
        <p>1+5+1+2+2+0+2+4 = 17 → 1+7 = 8</p>
      </div>
      
      <div className='mb-3 text-xs'>
        <h3 className='font-bold pb-1'>Personal Day Number</h3>
        <p className='pb-1'>Birth month + birth day + current year + current month + current day</p>
        <p className='pb-1'><strong>Example:</strong> Born June 10, today Dec 15, 2024</p>
        <p>6+10+2024+12+15 = 2067 → 2+0+6+7 = 15 → 1+5 = 6</p>
      </div>
    </div>
  );
};

export { Numerology }; 