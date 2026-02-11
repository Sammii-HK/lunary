/**
 * ~72 static affirmations organized by zodiac sign (6 per sign).
 */

export const AFFIRMATIONS: Record<string, string[]> = {
  Aries: [
    'Your courage lights the way for others. Keep blazing trails.',
    'You have the fire to start anything. Trust your impulse.',
    'Your boldness is a gift. The world needs your pioneering spirit.',
    'Every challenge you face only makes you stronger.',
    'Your passion is contagious. Lead with your heart.',
    "You were born to initiate. Start that thing you've been dreaming about.",
  ],
  Taurus: [
    'Your steadiness is your superpower. You build things that last.',
    'Trust your senses. They guide you to what truly nourishes.',
    "You deserve beauty and comfort. Enjoy what you've cultivated.",
    'Your patience will be rewarded. Growth takes time.',
    'You are grounded and strong. Nothing can shake your foundation.',
    'Your loyalty and devotion make the world a more secure place.',
  ],
  Gemini: [
    'Your curiosity is a gift. Never stop asking questions.',
    'You have the power to connect people and ideas in magical ways.',
    'Your adaptability is your strength. Change is your playground.',
    'Your words have the power to inspire and transform.',
    'Every conversation you have plants seeds of understanding.',
    'Your quick mind is a brilliant tool. Trust your intellect.',
  ],
  Cancer: [
    'Your intuition is a compass. Trust where it leads you.',
    'Your nurturing heart creates safe spaces for everyone around you.',
    "It's okay to feel deeply. Your emotions are your strength.",
    'Your home is wherever you bring your warmth and care.',
    'You hold the emotional wisdom that others need.',
    "Your sensitivity is not weakness—it's your greatest gift.",
  ],
  Leo: [
    "You were born to shine. Don't dim your light for anyone.",
    'Your creativity is a force of nature. Express yourself fully.',
    'Your generous heart inspires others to give more freely.',
    'You deserve to be celebrated. Accept the love that flows to you.',
    'Your confidence lights up every room you enter.',
    'Lead with your heart, and the world will follow.',
  ],
  Virgo: [
    'Your attention to detail makes everything better. You are invaluable.',
    'You heal through your presence and your practical wisdom.',
    "It's okay to rest. You don't have to earn your worthiness.",
    'Your analytical mind is a gift that helps others see clearly.',
    "Perfection isn't the goal—growth is. And you're always growing.",
    'Your service to others is noble. Remember to serve yourself too.',
  ],
  Libra: [
    'You bring harmony wherever you go. The world needs your balance.',
    'Your sense of justice makes the world a fairer place.',
    'Your beauty is in how you see beauty in others.',
    "Trust your ability to find the middle ground. It's a rare skill.",
    'Your relationships are your garden. Keep nurturing them.',
    'You create art in everything you do. Your life is your masterpiece.',
  ],
  Scorpio: [
    'Your depth is your power. Not everyone needs to understand you.',
    'You transform everything you touch. Trust the process of change.',
    'Your intensity is magnetic. Embrace your full emotional range.',
    'You see truths that others miss. Trust your penetrating insight.',
    'Your resilience is legendary. You always rise from the ashes.',
    'Your passion runs deep. Channel it into what truly matters.',
  ],
  Sagittarius: [
    'Your optimism is infectious. Keep spreading hope.',
    'Your adventurous spirit expands the world for everyone around you.',
    'Truth is your North Star. Keep following it fearlessly.',
    'Your wisdom comes from experience. Keep exploring.',
    'Your freedom is sacred. Honor it while honoring your connections.',
    'The horizon is always calling you. Answer with joy.',
  ],
  Capricorn: [
    'Your discipline builds empires. Keep climbing your mountain.',
    "Your wisdom comes from experience. Trust what you've learned.",
    "You don't need external validation. Your work speaks for itself.",
    'Every step forward counts, even the small ones.',
    "Your ambition is matched by your integrity. That's rare.",
    'You build things that stand the test of time. Be proud.',
  ],
  Aquarius: [
    'Your unique perspective is exactly what the world needs right now.',
    'You see the future before anyone else. Trust your vision.',
    'Your independence is your strength. March to your own cosmic beat.',
    'Your humanitarian heart makes ripples that become waves of change.',
    'Being different is your superpower. Celebrate your originality.',
    'Your innovative mind creates solutions no one else can imagine.',
  ],
  Pisces: [
    'Your empathy is a bridge between worlds. It connects hearts.',
    'Your imagination is limitless. Let it guide your dreams.',
    'Your compassion heals without you even trying. You are medicine.',
    'Trust your intuitive gifts. They are more accurate than logic.',
    'Your sensitivity to beauty makes the world more magical.',
    'You dissolve boundaries and connect people to their souls.',
  ],
};

/**
 * Get a random affirmation for a zodiac sign.
 * Uses a seed for deterministic selection.
 */
export function getAffirmationForSign(sign: string, seed: number): string {
  const signAffirmations = AFFIRMATIONS[sign] || AFFIRMATIONS['Aries'];
  const index = Math.abs(seed) % signAffirmations.length;
  return signAffirmations[index];
}
