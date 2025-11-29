'use client';

import { useState, useEffect } from 'react';
import { zodiacSigns } from '../../../../utils/zodiac/zodiac';
import { monthlyMoonPhases } from '../../../../utils/moon/monthlyPhases';
import {
  crystalCategories,
  getCrystalsByCategory,
} from '@/constants/grimoire/crystals';
import { correspondencesData } from '@/constants/grimoire/correspondences';

type CompatibilityType = 'zodiac' | 'element' | 'crystal' | 'moon';

interface CompatibilityResult {
  score: number;
  description: string;
  strengths: string[];
  challenges: string[];
}

// Zodiac compatibility matrix
const zodiacCompatibility: Record<
  string,
  Record<string, CompatibilityResult>
> = {
  Aries: {
    Aries: {
      score: 75,
      description: 'Two Aries create an energetic, competitive dynamic.',
      strengths: ['Shared passion', 'Mutual understanding', 'Adventure'],
      challenges: ['Both want to lead', 'Can be impulsive', 'Need compromise'],
    },
    Taurus: {
      score: 60,
      description: 'Fire meets Earth - different paces can create tension.',
      strengths: ['Balance', 'Stability meets action'],
      challenges: ['Different speeds', 'Aries may feel restricted'],
    },
    Gemini: {
      score: 85,
      description: 'High-energy connection with great communication.',
      strengths: ['Intellectual connection', 'Adventure', 'Communication'],
      challenges: ['Both can be restless', 'Need grounding'],
    },
    Cancer: {
      score: 50,
      description: 'Fire and Water - emotional differences may arise.',
      strengths: ['Aries brings action', 'Cancer brings nurturing'],
      challenges: ['Different emotional needs', 'Aries may be too direct'],
    },
    Leo: {
      score: 90,
      description: 'Two fire signs create passionate, dynamic energy.',
      strengths: ['Shared passion', 'Mutual admiration', 'Adventure'],
      challenges: ['Both want spotlight', 'Ego clashes possible'],
    },
    Virgo: {
      score: 55,
      description: 'Fire and Earth - different approaches to life.',
      strengths: ['Virgo grounds Aries', 'Aries inspires Virgo'],
      challenges: ['Different priorities', 'Communication styles differ'],
    },
    Libra: {
      score: 70,
      description: 'Fire and Air - good balance with some challenges.',
      strengths: ['Libra balances Aries', 'Social connection'],
      challenges: ['Aries may be too direct', 'Libra needs harmony'],
    },
    Scorpio: {
      score: 65,
      description: 'Intense connection with potential for power struggles.',
      strengths: ['Both are passionate', 'Deep connection possible'],
      challenges: ['Power struggles', 'Different emotional styles'],
    },
    Sagittarius: {
      score: 95,
      description: 'Perfect fire sign match - adventure and freedom.',
      strengths: ['Shared values', 'Adventure', 'Freedom'],
      challenges: ['Both can be restless', 'Need commitment'],
    },
    Capricorn: {
      score: 50,
      description: 'Fire and Earth - very different approaches.',
      strengths: ['Capricorn provides structure', 'Aries brings energy'],
      challenges: ['Different speeds', 'Different priorities'],
    },
    Aquarius: {
      score: 80,
      description: 'Fire and Air - innovative and exciting connection.',
      strengths: ['Shared independence', 'Innovation', 'Freedom'],
      challenges: ['Both can be detached', 'Need emotional connection'],
    },
    Pisces: {
      score: 45,
      description: 'Fire and Water - emotional mismatch.',
      strengths: ['Aries inspires Pisces', 'Pisces brings compassion'],
      challenges: ['Different emotional needs', 'Communication gaps'],
    },
  },
  Taurus: {
    Taurus: {
      score: 85,
      description: 'Two Earth signs create stable, sensual connection.',
      strengths: ['Shared values', 'Stability', 'Sensuality'],
      challenges: ['Both can be stubborn', 'Need variety'],
    },
    Gemini: {
      score: 55,
      description: 'Earth and Air - different needs and speeds.',
      strengths: ['Gemini brings variety', 'Taurus brings stability'],
      challenges: ['Different communication styles', 'Different priorities'],
    },
    Cancer: {
      score: 90,
      description: 'Earth and Water - nurturing, stable connection.',
      strengths: ['Emotional security', 'Home life', 'Nurturing'],
      challenges: ['Both can be moody', 'Need communication'],
    },
    Leo: {
      score: 70,
      description: 'Earth and Fire - complementary but different.',
      strengths: ['Leo brings passion', 'Taurus brings stability'],
      challenges: ['Different speeds', 'Different priorities'],
    },
    Virgo: {
      score: 95,
      description: 'Perfect Earth sign match - practical and harmonious.',
      strengths: ['Shared values', 'Practicality', 'Harmony'],
      challenges: ['Both can be critical', 'Need fun'],
    },
    Libra: {
      score: 80,
      description: 'Earth and Air - balanced and harmonious.',
      strengths: ['Shared love of beauty', 'Balance', 'Harmony'],
      challenges: ['Different decision styles', 'Libra needs variety'],
    },
    Scorpio: {
      score: 85,
      description: 'Earth and Water - intense, sensual connection.',
      strengths: ['Deep connection', 'Sensuality', 'Loyalty'],
      challenges: ['Both can be possessive', 'Need trust'],
    },
    Sagittarius: {
      score: 50,
      description: 'Earth and Fire - very different approaches.',
      strengths: ['Sagittarius brings adventure', 'Taurus brings stability'],
      challenges: ['Different speeds', 'Different values'],
    },
    Capricorn: {
      score: 90,
      description: 'Perfect Earth sign match - ambitious and stable.',
      strengths: ['Shared goals', 'Stability', 'Ambition'],
      challenges: ['Both can be work-focused', 'Need romance'],
    },
    Aquarius: {
      score: 60,
      description: 'Earth and Air - different values and needs.',
      strengths: ['Aquarius brings innovation', 'Taurus brings stability'],
      challenges: ['Different priorities', 'Different communication'],
    },
    Pisces: {
      score: 75,
      description: 'Earth and Water - gentle, nurturing connection.',
      strengths: ['Emotional connection', 'Creativity', 'Nurturing'],
      challenges: ['Different practical needs', 'Need grounding'],
    },
  },
  Gemini: {
    Gemini: {
      score: 80,
      description:
        'Two Air signs create intellectual, communicative connection.',
      strengths: ['Communication', 'Intellectual connection', 'Variety'],
      challenges: ['Both can be restless', 'Need commitment'],
    },
    Cancer: {
      score: 60,
      description: 'Air and Water - different emotional needs.',
      strengths: ['Gemini brings lightness', 'Cancer brings depth'],
      challenges: ['Different communication styles', 'Emotional mismatch'],
    },
    Leo: {
      score: 85,
      description: 'Air and Fire - exciting, social connection.',
      strengths: ['Social connection', 'Adventure', 'Communication'],
      challenges: ['Both want attention', 'Need depth'],
    },
    Virgo: {
      score: 70,
      description: 'Air and Earth - complementary but different.',
      strengths: ['Virgo grounds Gemini', 'Gemini brings variety'],
      challenges: ['Different communication styles', 'Different priorities'],
    },
    Libra: {
      score: 95,
      description: 'Perfect Air sign match - harmonious and intellectual.',
      strengths: ['Shared values', 'Communication', 'Harmony'],
      challenges: ['Both can be indecisive', 'Need action'],
    },
    Scorpio: {
      score: 55,
      description: 'Air and Water - different emotional depths.',
      strengths: ['Scorpio brings depth', 'Gemini brings lightness'],
      challenges: ['Different communication styles', 'Trust issues'],
    },
    Sagittarius: {
      score: 90,
      description: 'Perfect Air-Fire match - adventure and freedom.',
      strengths: ['Shared values', 'Adventure', 'Freedom'],
      challenges: ['Both can be restless', 'Need commitment'],
    },
    Capricorn: {
      score: 60,
      description: 'Air and Earth - different approaches to life.',
      strengths: ['Capricorn brings structure', 'Gemini brings flexibility'],
      challenges: ['Different priorities', 'Different communication'],
    },
    Aquarius: {
      score: 90,
      description: 'Perfect Air sign match - innovative and independent.',
      strengths: [
        'Shared independence',
        'Innovation',
        'Intellectual connection',
      ],
      challenges: ['Both can be detached', 'Need emotional connection'],
    },
    Pisces: {
      score: 70,
      description: 'Air and Water - creative but different needs.',
      strengths: ['Creativity', 'Imagination', 'Variety'],
      challenges: ['Different emotional needs', 'Communication gaps'],
    },
  },
  Cancer: {
    Cancer: {
      score: 85,
      description: 'Two Water signs create deep, emotional connection.',
      strengths: ['Emotional understanding', 'Nurturing', 'Intuition'],
      challenges: ['Both can be moody', 'Need boundaries'],
    },
    Leo: {
      score: 65,
      description: 'Water and Fire - different emotional expressions.',
      strengths: ['Leo brings warmth', 'Cancer brings depth'],
      challenges: ['Different emotional needs', 'Different priorities'],
    },
    Virgo: {
      score: 75,
      description: 'Water and Earth - nurturing, practical connection.',
      strengths: ['Virgo grounds Cancer', 'Cancer brings emotion'],
      challenges: ['Different emotional expressions', 'Need communication'],
    },
    Libra: {
      score: 70,
      description: 'Water and Air - balanced but different needs.',
      strengths: ['Libra brings harmony', 'Cancer brings depth'],
      challenges: ['Different communication styles', 'Emotional mismatch'],
    },
    Scorpio: {
      score: 95,
      description: 'Perfect Water sign match - intense and deep.',
      strengths: ['Deep connection', 'Emotional depth', 'Loyalty'],
      challenges: ['Both can be intense', 'Need lightness'],
    },
    Sagittarius: {
      score: 50,
      description: 'Water and Fire - very different emotional needs.',
      strengths: ['Sagittarius brings adventure', 'Cancer brings security'],
      challenges: ['Different needs', 'Different speeds'],
    },
    Capricorn: {
      score: 80,
      description: 'Water and Earth - stable, nurturing connection.',
      strengths: ['Stability', 'Security', 'Mutual support'],
      challenges: ['Different emotional expressions', 'Need communication'],
    },
    Aquarius: {
      score: 55,
      description: 'Water and Air - different emotional approaches.',
      strengths: ['Aquarius brings innovation', 'Cancer brings emotion'],
      challenges: ['Different emotional needs', 'Communication gaps'],
    },
    Pisces: {
      score: 90,
      description: 'Perfect Water sign match - intuitive and compassionate.',
      strengths: ['Emotional connection', 'Intuition', 'Compassion'],
      challenges: ['Both can be dreamy', 'Need grounding'],
    },
  },
  Leo: {
    Leo: {
      score: 80,
      description: 'Two Fire signs create passionate, dramatic connection.',
      strengths: ['Shared passion', 'Mutual admiration', 'Creativity'],
      challenges: ['Both want spotlight', 'Ego clashes'],
    },
    Virgo: {
      score: 60,
      description: 'Fire and Earth - different approaches to life.',
      strengths: ['Virgo grounds Leo', 'Leo inspires Virgo'],
      challenges: ['Different priorities', 'Different communication'],
    },
    Libra: {
      score: 90,
      description: 'Fire and Air - harmonious, social connection.',
      strengths: ['Shared love of beauty', 'Social connection', 'Harmony'],
      challenges: ['Both want attention', 'Need depth'],
    },
    Scorpio: {
      score: 70,
      description: 'Fire and Water - intense but challenging.',
      strengths: ['Both are passionate', 'Deep connection'],
      challenges: ['Power struggles', 'Different emotional styles'],
    },
    Sagittarius: {
      score: 95,
      description: 'Perfect Fire sign match - adventure and passion.',
      strengths: ['Shared values', 'Adventure', 'Passion'],
      challenges: ['Both can be restless', 'Need commitment'],
    },
    Capricorn: {
      score: 65,
      description: 'Fire and Earth - different priorities.',
      strengths: ['Capricorn brings structure', 'Leo brings creativity'],
      challenges: ['Different speeds', 'Different priorities'],
    },
    Aquarius: {
      score: 75,
      description: 'Fire and Air - exciting but different needs.',
      strengths: ['Shared independence', 'Innovation', 'Social connection'],
      challenges: ['Both can be detached', 'Need emotional connection'],
    },
    Pisces: {
      score: 70,
      description: 'Fire and Water - creative but different needs.',
      strengths: ['Creativity', 'Imagination', 'Passion'],
      challenges: ['Different emotional needs', 'Communication gaps'],
    },
  },
  Virgo: {
    Virgo: {
      score: 85,
      description: 'Two Earth signs create practical, harmonious connection.',
      strengths: ['Shared values', 'Practicality', 'Attention to detail'],
      challenges: ['Both can be critical', 'Need fun'],
    },
    Libra: {
      score: 75,
      description: 'Earth and Air - balanced and harmonious.',
      strengths: ['Shared love of beauty', 'Balance', 'Harmony'],
      challenges: ['Different decision styles', 'Different priorities'],
    },
    Scorpio: {
      score: 80,
      description: 'Earth and Water - deep, practical connection.',
      strengths: ['Deep connection', 'Practicality', 'Loyalty'],
      challenges: ['Both can be critical', 'Need lightness'],
    },
    Sagittarius: {
      score: 55,
      description: 'Earth and Fire - very different approaches.',
      strengths: ['Sagittarius brings adventure', 'Virgo brings stability'],
      challenges: ['Different speeds', 'Different values'],
    },
    Capricorn: {
      score: 90,
      description: 'Perfect Earth sign match - practical and ambitious.',
      strengths: ['Shared goals', 'Practicality', 'Ambition'],
      challenges: ['Both can be work-focused', 'Need romance'],
    },
    Aquarius: {
      score: 65,
      description: 'Earth and Air - different values and needs.',
      strengths: ['Aquarius brings innovation', 'Virgo brings practicality'],
      challenges: ['Different priorities', 'Different communication'],
    },
    Pisces: {
      score: 70,
      description: 'Earth and Water - complementary but different.',
      strengths: ['Pisces brings creativity', 'Virgo brings practicality'],
      challenges: ['Different practical needs', 'Need communication'],
    },
  },
  Libra: {
    Libra: {
      score: 85,
      description: 'Two Air signs create harmonious, balanced connection.',
      strengths: ['Shared values', 'Harmony', 'Balance'],
      challenges: ['Both can be indecisive', 'Need action'],
    },
    Scorpio: {
      score: 70,
      description: 'Air and Water - different emotional depths.',
      strengths: ['Scorpio brings depth', 'Libra brings harmony'],
      challenges: ['Different communication styles', 'Trust issues'],
    },
    Sagittarius: {
      score: 85,
      description: 'Air and Fire - exciting, social connection.',
      strengths: ['Shared values', 'Adventure', 'Social connection'],
      challenges: ['Both can be restless', 'Need commitment'],
    },
    Capricorn: {
      score: 70,
      description: 'Air and Earth - balanced but different priorities.',
      strengths: ['Capricorn brings structure', 'Libra brings harmony'],
      challenges: ['Different priorities', 'Different communication'],
    },
    Aquarius: {
      score: 90,
      description: 'Perfect Air sign match - harmonious and independent.',
      strengths: ['Shared independence', 'Harmony', 'Innovation'],
      challenges: ['Both can be detached', 'Need emotional connection'],
    },
    Pisces: {
      score: 75,
      description: 'Air and Water - creative and harmonious.',
      strengths: ['Creativity', 'Harmony', 'Imagination'],
      challenges: ['Different emotional needs', 'Communication gaps'],
    },
  },
  Scorpio: {
    Scorpio: {
      score: 85,
      description: 'Two Water signs create intense, deep connection.',
      strengths: ['Deep connection', 'Emotional depth', 'Loyalty'],
      challenges: ['Both can be intense', 'Need lightness'],
    },
    Sagittarius: {
      score: 50,
      description: 'Water and Fire - very different emotional needs.',
      strengths: ['Sagittarius brings adventure', 'Scorpio brings depth'],
      challenges: ['Different needs', 'Different speeds'],
    },
    Capricorn: {
      score: 85,
      description: 'Water and Earth - intense, stable connection.',
      strengths: ['Deep connection', 'Stability', 'Ambition'],
      challenges: ['Both can be intense', 'Need lightness'],
    },
    Aquarius: {
      score: 60,
      description: 'Water and Air - different emotional approaches.',
      strengths: ['Aquarius brings innovation', 'Scorpio brings depth'],
      challenges: ['Different emotional needs', 'Trust issues'],
    },
    Pisces: {
      score: 90,
      description: 'Perfect Water sign match - intuitive and deep.',
      strengths: ['Emotional connection', 'Intuition', 'Depth'],
      challenges: ['Both can be intense', 'Need grounding'],
    },
  },
  Sagittarius: {
    Sagittarius: {
      score: 85,
      description:
        'Two Fire signs create adventurous, free-spirited connection.',
      strengths: ['Shared values', 'Adventure', 'Freedom'],
      challenges: ['Both can be restless', 'Need commitment'],
    },
    Capricorn: {
      score: 55,
      description: 'Fire and Earth - very different approaches.',
      strengths: ['Capricorn brings structure', 'Sagittarius brings adventure'],
      challenges: ['Different speeds', 'Different values'],
    },
    Aquarius: {
      score: 90,
      description: 'Perfect Fire-Air match - independent and adventurous.',
      strengths: ['Shared independence', 'Adventure', 'Innovation'],
      challenges: ['Both can be detached', 'Need emotional connection'],
    },
    Pisces: {
      score: 65,
      description: 'Fire and Water - creative but different needs.',
      strengths: ['Creativity', 'Adventure', 'Imagination'],
      challenges: ['Different emotional needs', 'Different speeds'],
    },
  },
  Capricorn: {
    Capricorn: {
      score: 85,
      description: 'Two Earth signs create stable, ambitious connection.',
      strengths: ['Shared goals', 'Stability', 'Ambition'],
      challenges: ['Both can be work-focused', 'Need romance'],
    },
    Aquarius: {
      score: 70,
      description: 'Earth and Air - different values but complementary.',
      strengths: ['Aquarius brings innovation', 'Capricorn brings structure'],
      challenges: ['Different priorities', 'Different communication'],
    },
    Pisces: {
      score: 75,
      description: 'Earth and Water - stable, nurturing connection.',
      strengths: ['Stability', 'Creativity', 'Mutual support'],
      challenges: ['Different practical needs', 'Need communication'],
    },
  },
  Aquarius: {
    Aquarius: {
      score: 85,
      description: 'Two Air signs create innovative, independent connection.',
      strengths: [
        'Shared independence',
        'Innovation',
        'Intellectual connection',
      ],
      challenges: ['Both can be detached', 'Need emotional connection'],
    },
    Pisces: {
      score: 75,
      description: 'Air and Water - creative and innovative.',
      strengths: ['Creativity', 'Innovation', 'Imagination'],
      challenges: ['Different emotional needs', 'Communication gaps'],
    },
  },
  Pisces: {
    Pisces: {
      score: 85,
      description:
        'Two Water signs create intuitive, compassionate connection.',
      strengths: ['Emotional connection', 'Intuition', 'Compassion'],
      challenges: ['Both can be dreamy', 'Need grounding'],
    },
  },
};

// Fill in symmetric pairs
Object.keys(zodiacCompatibility).forEach((sign1) => {
  Object.keys(zodiacCompatibility[sign1]).forEach((sign2) => {
    if (!zodiacCompatibility[sign2]) {
      zodiacCompatibility[sign2] = {};
    }
    if (!zodiacCompatibility[sign2][sign1]) {
      zodiacCompatibility[sign2][sign1] = zodiacCompatibility[sign1][sign2];
    }
  });
});

// Element compatibility
const elementCompatibility: Record<
  string,
  Record<string, CompatibilityResult>
> = {
  Fire: {
    Fire: {
      score: 90,
      description: 'Two Fire elements create passionate, energetic connection.',
      strengths: ['Shared passion', 'High energy', 'Adventure'],
      challenges: ['Can burn out quickly', 'Need grounding'],
    },
    Earth: {
      score: 60,
      description: 'Fire and Earth - different speeds and approaches.',
      strengths: ['Earth grounds Fire', 'Fire inspires Earth'],
      challenges: ['Different speeds', 'Different priorities'],
    },
    Air: {
      score: 95,
      description: 'Fire and Air - perfect combination, Air fuels Fire.',
      strengths: ['Air fuels Fire', 'High energy', 'Adventure'],
      challenges: ['Can be too intense', 'Need grounding'],
    },
    Water: {
      score: 45,
      description: 'Fire and Water - can extinguish each other.',
      strengths: ['Water cools Fire', 'Fire warms Water'],
      challenges: ['Opposite needs', 'Different emotional styles'],
    },
  },
  Earth: {
    Earth: {
      score: 90,
      description: 'Two Earth elements create stable, practical connection.',
      strengths: ['Shared stability', 'Practicality', 'Reliability'],
      challenges: ['Can be too grounded', 'Need variety'],
    },
    Air: {
      score: 55,
      description: 'Earth and Air - different needs and approaches.',
      strengths: ['Air brings variety', 'Earth brings stability'],
      challenges: ['Different priorities', 'Different communication'],
    },
    Water: {
      score: 85,
      description: 'Earth and Water - nurturing, fertile combination.',
      strengths: ['Water nourishes Earth', 'Stability', 'Nurturing'],
      challenges: ['Can be too emotional', 'Need boundaries'],
    },
  },
  Air: {
    Air: {
      score: 90,
      description:
        'Two Air elements create intellectual, communicative connection.',
      strengths: ['Shared intellect', 'Communication', 'Variety'],
      challenges: ['Can be too detached', 'Need grounding'],
    },
    Water: {
      score: 60,
      description: 'Air and Water - different emotional needs.',
      strengths: ['Air brings lightness', 'Water brings depth'],
      challenges: ['Different communication styles', 'Emotional mismatch'],
    },
  },
  Water: {
    Water: {
      score: 90,
      description: 'Two Water elements create deep, emotional connection.',
      strengths: ['Emotional depth', 'Intuition', 'Compassion'],
      challenges: ['Can be too emotional', 'Need boundaries'],
    },
  },
};

// Fill in symmetric pairs for elements
Object.keys(elementCompatibility).forEach((elem1) => {
  Object.keys(elementCompatibility[elem1]).forEach((elem2) => {
    if (!elementCompatibility[elem2]) {
      elementCompatibility[elem2] = {};
    }
    if (!elementCompatibility[elem2][elem1]) {
      elementCompatibility[elem2][elem1] = elementCompatibility[elem1][elem2];
    }
  });
});

// Moon phase compatibility
const moonPhaseCompatibility: Record<
  string,
  Record<string, CompatibilityResult>
> = {
  'New Moon': {
    'New Moon': {
      score: 85,
      description: 'Both in new beginnings - powerful fresh start together.',
      strengths: ['Shared new beginnings', 'Fresh energy', 'Manifestation'],
      challenges: ['Both starting fresh', 'Need patience'],
    },
    'Waxing Crescent': {
      score: 80,
      description: 'New meets growth - complementary energies.',
      strengths: ['New beginnings', 'Growth energy', 'Building together'],
      challenges: ['Different phases', 'Need alignment'],
    },
    'First Quarter': {
      score: 75,
      description: 'New meets action - dynamic but different paces.',
      strengths: ['Action energy', 'New beginnings', 'Momentum'],
      challenges: ['Different phases', 'Need balance'],
    },
    'Waxing Gibbous': {
      score: 70,
      description: 'New meets refinement - different focuses.',
      strengths: ['Refinement', 'New energy', 'Building'],
      challenges: ['Different phases', 'Need communication'],
    },
    'Full Moon': {
      score: 65,
      description: 'New meets completion - opposite energies.',
      strengths: ['Completion meets beginning', 'Balance', 'Cycles'],
      challenges: ['Opposite phases', 'Need understanding'],
    },
    'Waning Gibbous': {
      score: 70,
      description: 'New meets release - different focuses.',
      strengths: ['Release energy', 'New beginnings', 'Balance'],
      challenges: ['Different phases', 'Need alignment'],
    },
    'Last Quarter': {
      score: 75,
      description: 'New meets letting go - complementary but different.',
      strengths: ['Letting go', 'New energy', 'Transformation'],
      challenges: ['Different phases', 'Need balance'],
    },
    'Waning Crescent': {
      score: 80,
      description: 'New meets rest - natural cycle completion.',
      strengths: ['Rest and renewal', 'New beginnings', 'Cycles'],
      challenges: ['Different phases', 'Need patience'],
    },
  },
  'Waxing Crescent': {
    'Waxing Crescent': {
      score: 85,
      description: 'Both growing - shared momentum and energy.',
      strengths: ['Shared growth', 'Building together', 'Momentum'],
      challenges: ['Both growing', 'Need patience'],
    },
    'First Quarter': {
      score: 90,
      description: 'Growth meets action - powerful combination.',
      strengths: ['Action and growth', 'Momentum', 'Building'],
      challenges: ['High energy', 'Need balance'],
    },
    'Waxing Gibbous': {
      score: 85,
      description: 'Growth meets refinement - complementary energies.',
      strengths: ['Refinement', 'Growth', 'Building'],
      challenges: ['Different focuses', 'Need communication'],
    },
    'Full Moon': {
      score: 75,
      description: 'Growth meets completion - different phases.',
      strengths: ['Completion', 'Growth', 'Balance'],
      challenges: ['Different phases', 'Need understanding'],
    },
    'Waning Gibbous': {
      score: 70,
      description: 'Growth meets release - different focuses.',
      strengths: ['Release', 'Growth', 'Balance'],
      challenges: ['Different phases', 'Need alignment'],
    },
    'Last Quarter': {
      score: 75,
      description: 'Growth meets letting go - complementary.',
      strengths: ['Letting go', 'Growth', 'Transformation'],
      challenges: ['Different phases', 'Need balance'],
    },
    'Waning Crescent': {
      score: 80,
      description: 'Growth meets rest - natural cycle.',
      strengths: ['Rest', 'Growth', 'Cycles'],
      challenges: ['Different phases', 'Need patience'],
    },
  },
  'First Quarter': {
    'First Quarter': {
      score: 85,
      description: 'Both in action - high energy and momentum.',
      strengths: ['Shared action', 'High energy', 'Momentum'],
      challenges: ['High intensity', 'Need balance'],
    },
    'Waxing Gibbous': {
      score: 90,
      description: 'Action meets refinement - powerful combination.',
      strengths: ['Action and refinement', 'Building', 'Momentum'],
      challenges: ['High energy', 'Need communication'],
    },
    'Full Moon': {
      score: 80,
      description: 'Action meets completion - different phases.',
      strengths: ['Completion', 'Action', 'Balance'],
      challenges: ['Different phases', 'Need understanding'],
    },
    'Waning Gibbous': {
      score: 75,
      description: 'Action meets release - different focuses.',
      strengths: ['Release', 'Action', 'Balance'],
      challenges: ['Different phases', 'Need alignment'],
    },
    'Last Quarter': {
      score: 80,
      description: 'Action meets letting go - complementary.',
      strengths: ['Letting go', 'Action', 'Transformation'],
      challenges: ['Different phases', 'Need balance'],
    },
    'Waning Crescent': {
      score: 75,
      description: 'Action meets rest - different energies.',
      strengths: ['Rest', 'Action', 'Cycles'],
      challenges: ['Different phases', 'Need patience'],
    },
  },
  'Waxing Gibbous': {
    'Waxing Gibbous': {
      score: 85,
      description: 'Both refining - shared focus on improvement.',
      strengths: ['Shared refinement', 'Building', 'Improvement'],
      challenges: ['Both refining', 'Need patience'],
    },
    'Full Moon': {
      score: 90,
      description: 'Refinement meets completion - powerful combination.',
      strengths: ['Completion', 'Refinement', 'Peak energy'],
      challenges: ['High intensity', 'Need balance'],
    },
    'Waning Gibbous': {
      score: 80,
      description: 'Refinement meets release - different focuses.',
      strengths: ['Release', 'Refinement', 'Balance'],
      challenges: ['Different phases', 'Need alignment'],
    },
    'Last Quarter': {
      score: 75,
      description: 'Refinement meets letting go - complementary.',
      strengths: ['Letting go', 'Refinement', 'Transformation'],
      challenges: ['Different phases', 'Need balance'],
    },
    'Waning Crescent': {
      score: 70,
      description: 'Refinement meets rest - different energies.',
      strengths: ['Rest', 'Refinement', 'Cycles'],
      challenges: ['Different phases', 'Need patience'],
    },
  },
  'Full Moon': {
    'Full Moon': {
      score: 90,
      description: 'Both at peak - intense, powerful connection.',
      strengths: ['Peak energy', 'Completion', 'Intensity'],
      challenges: ['High intensity', 'Need balance'],
    },
    'Waning Gibbous': {
      score: 85,
      description: 'Completion meets release - natural transition.',
      strengths: ['Release', 'Completion', 'Balance'],
      challenges: ['Different phases', 'Need alignment'],
    },
    'Last Quarter': {
      score: 80,
      description: 'Completion meets letting go - natural cycle.',
      strengths: ['Letting go', 'Completion', 'Transformation'],
      challenges: ['Different phases', 'Need balance'],
    },
    'Waning Crescent': {
      score: 75,
      description: 'Completion meets rest - natural cycle.',
      strengths: ['Rest', 'Completion', 'Cycles'],
      challenges: ['Different phases', 'Need patience'],
    },
  },
  'Waning Gibbous': {
    'Waning Gibbous': {
      score: 85,
      description: 'Both releasing - shared focus on letting go.',
      strengths: ['Shared release', 'Letting go', 'Balance'],
      challenges: ['Both releasing', 'Need new energy'],
    },
    'Last Quarter': {
      score: 90,
      description: 'Release meets letting go - powerful combination.',
      strengths: ['Letting go', 'Release', 'Transformation'],
      challenges: ['High intensity', 'Need balance'],
    },
    'Waning Crescent': {
      score: 85,
      description: 'Release meets rest - natural transition.',
      strengths: ['Rest', 'Release', 'Cycles'],
      challenges: ['Different phases', 'Need patience'],
    },
  },
  'Last Quarter': {
    'Last Quarter': {
      score: 85,
      description: 'Both letting go - shared transformation.',
      strengths: ['Shared transformation', 'Letting go', 'Release'],
      challenges: ['Both letting go', 'Need new energy'],
    },
    'Waning Crescent': {
      score: 90,
      description: 'Letting go meets rest - natural completion.',
      strengths: ['Rest', 'Letting go', 'Cycles'],
      challenges: ['Different phases', 'Need patience'],
    },
  },
  'Waning Crescent': {
    'Waning Crescent': {
      score: 85,
      description: 'Both resting - shared need for renewal.',
      strengths: ['Shared rest', 'Renewal', 'Cycles'],
      challenges: ['Both resting', 'Need new energy'],
    },
  },
};

// Fill in symmetric pairs for moon phases
Object.keys(moonPhaseCompatibility).forEach((phase1) => {
  Object.keys(moonPhaseCompatibility[phase1]).forEach((phase2) => {
    if (!moonPhaseCompatibility[phase2]) {
      moonPhaseCompatibility[phase2] = {};
    }
    if (!moonPhaseCompatibility[phase2][phase1]) {
      moonPhaseCompatibility[phase2][phase1] =
        moonPhaseCompatibility[phase1][phase2];
    }
  });
});

export default function CompatibilityChart() {
  const [compatibilityType, setCompatibilityType] =
    useState<CompatibilityType>('zodiac');
  const [selection1, setSelection1] = useState<string>('');
  const [selection2, setSelection2] = useState<string>('');

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  const moonPhaseMap: Record<string, string> = {
    newMoon: 'New Moon',
    waxingCrescent: 'Waxing Crescent',
    firstQuarter: 'First Quarter',
    waxingGibbous: 'Waxing Gibbous',
    fullMoon: 'Full Moon',
    waningGibbous: 'Waning Gibbous',
    lastQuarter: 'Last Quarter',
    waningCrescent: 'Waning Crescent',
  };

  const reverseMoonPhaseMap: Record<string, string> = Object.fromEntries(
    Object.entries(moonPhaseMap).map(([key, value]) => [value, key]),
  );

  const getCompatibilityResult = (): CompatibilityResult | null => {
    if (!selection1 || !selection2) return null;

    switch (compatibilityType) {
      case 'zodiac':
        return (
          zodiacCompatibility[selection1]?.[selection2] ||
          zodiacCompatibility[selection2]?.[selection1] ||
          null
        );
      case 'element':
        return (
          elementCompatibility[selection1]?.[selection2] ||
          elementCompatibility[selection2]?.[selection1] ||
          null
        );
      case 'moon':
        // Moon phases are stored with Title Case keys, so use selection directly
        return (
          moonPhaseCompatibility[selection1]?.[selection2] ||
          moonPhaseCompatibility[selection2]?.[selection1] ||
          null
        );
      case 'crystal':
        // Crystal compatibility based on properties and elements
        const crystals1 = getCrystalsByCategory(selection1);
        const crystals2 = getCrystalsByCategory(selection2);
        if (crystals1.length === 0 || crystals2.length === 0) return null;

        // Simple compatibility based on shared properties
        const props1 = new Set(
          crystals1.flatMap((c) => c.properties.map((p) => p.toLowerCase())),
        );
        const props2 = new Set(
          crystals2.flatMap((c) => c.properties.map((p) => p.toLowerCase())),
        );
        const sharedProps = Array.from(props1).filter((p) => props2.has(p));
        const score = Math.min(95, 60 + sharedProps.length * 5);

        return {
          score,
          description: `Crystal categories ${selection1} and ${selection2} ${
            sharedProps.length > 0
              ? `share ${sharedProps.length} properties`
              : 'have complementary energies'
          }.`,
          strengths: sharedProps.slice(0, 3),
          challenges: ['Different crystal energies', 'Need balance'],
        };
      default:
        return null;
    }
  };

  const getOptions = (): string[] => {
    switch (compatibilityType) {
      case 'zodiac':
        return Object.values(zodiacSigns).map((sign) => sign.name);
      case 'element':
        return Object.keys(correspondencesData.elements);
      case 'moon':
        return Object.keys(monthlyMoonPhases).map(
          (key) => moonPhaseMap[key] || key,
        );
      case 'crystal':
        return crystalCategories;
      default:
        return [];
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 55) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 85) return 'bg-green-500/20 border-green-500/50';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/50';
    if (score >= 55) return 'bg-orange-500/20 border-orange-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const result = getCompatibilityResult();
  const options = getOptions();

  return (
    <article className='space-y-8 pb-16'>
      <header className='mb-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Compatibility Chart
        </h1>
        <p className='text-sm text-zinc-400 leading-relaxed'>
          Explore compatibility between zodiac signs, elements, moon phases, and
          crystal categories. Discover how different cosmic energies interact,
          complement, and challenge each other. Select two items from the same
          category to see their detailed compatibility analysis including
          scores, strengths, and areas for growth.
        </p>
      </header>

      <section id='compatibility-tool' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Select Compatibility Type
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Choose the type of compatibility you want to explore. Each type
            provides unique insights into how different energies interact.
          </p>
        </div>

        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
          <label
            htmlFor='compatibility-type-selector'
            className='block text-sm font-medium text-zinc-300 mb-2'
          >
            Compatibility Type
          </label>
          <select
            id='compatibility-type-selector'
            value={compatibilityType}
            onChange={(e) => {
              setCompatibilityType(e.target.value as CompatibilityType);
              setSelection1('');
              setSelection2('');
            }}
            aria-label='Select compatibility type'
            className='w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          >
            <option value='zodiac'>Zodiac Signs</option>
            <option value='element'>Elements</option>
            <option value='moon'>Moon Phases</option>
            <option value='crystal'>Crystal Categories</option>
          </select>
        </div>

        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Compare Two Items
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Select two items from the chosen category to see their compatibility
            analysis.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <label
              htmlFor='selection-1'
              className='block text-sm font-medium text-zinc-300 mb-2'
            >
              First Selection
            </label>
            <select
              id='selection-1'
              value={selection1}
              onChange={(e) => setSelection1(e.target.value)}
              aria-label='Select first item for compatibility comparison'
              className='w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value=''>Select...</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <label
              htmlFor='selection-2'
              className='block text-sm font-medium text-zinc-300 mb-2'
            >
              Second Selection
            </label>
            <select
              id='selection-2'
              value={selection2}
              onChange={(e) => setSelection2(e.target.value)}
              aria-label='Select second item for compatibility comparison'
              className='w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            >
              <option value=''>Select...</option>
              {options
                .filter((option) => option !== selection1)
                .map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {result && (
          <section
            id='compatibility-result'
            className={`rounded-lg border p-6 ${getScoreBgColor(result.score)}`}
            aria-live='polite'
            aria-atomic='true'
          >
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-medium text-zinc-100'>
                Compatibility: {selection1} & {selection2}
              </h2>
              <div
                className={`text-3xl font-bold ${getScoreColor(result.score)}`}
              >
                {result.score}%
              </div>
            </div>

            <p className='text-sm text-zinc-300 mb-4'>{result.description}</p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div>
                <h3 className='text-sm font-medium text-green-400 mb-2'>
                  Strengths
                </h3>
                <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1'>
                  {result.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className='text-sm font-medium text-orange-400 mb-2'>
                  Challenges
                </h3>
                <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1'>
                  {result.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        <section id='about-compatibility' className='space-y-6'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h2 className='text-xl font-medium text-zinc-100 mb-2'>
              Understanding Compatibility Charts
            </h2>
            <div className='space-y-4 text-sm text-zinc-300 leading-relaxed'>
              <p>
                Compatibility charts provide insights into how different
                energies, elements, and cosmic forces interact. These tools help
                you understand the dynamics between zodiac signs, elements, moon
                phases, and crystal categories.
              </p>
              <div>
                <h3 className='text-lg font-medium text-purple-300 mb-2'>
                  How to Use This Tool
                </h3>
                <ol className='list-decimal list-inside space-y-2 ml-2'>
                  <li>
                    Select a compatibility type (Zodiac Signs, Elements, Moon
                    Phases, or Crystal Categories)
                  </li>
                  <li>Choose two items from the same category to compare</li>
                  <li>
                    Review the compatibility score, description, strengths, and
                    challenges
                  </li>
                  <li>
                    Use this information as a guide, not a definitive answer
                  </li>
                </ol>
              </div>
              <div>
                <h3 className='text-lg font-medium text-purple-300 mb-2'>
                  Interpreting Scores
                </h3>
                <ul className='list-disc list-inside space-y-2 ml-2'>
                  <li>
                    <strong className='text-green-400'>85-100%:</strong>{' '}
                    Excellent compatibility with strong shared strengths
                  </li>
                  <li>
                    <strong className='text-yellow-400'>70-84%:</strong> Good
                    compatibility with some challenges to navigate
                  </li>
                  <li>
                    <strong className='text-orange-400'>55-69%:</strong>{' '}
                    Moderate compatibility requiring understanding and effort
                  </li>
                  <li>
                    <strong className='text-red-400'>Below 55%:</strong>{' '}
                    Challenging compatibility that may require significant work
                  </li>
                </ul>
              </div>
              <p className='text-zinc-400 italic'>
                Remember: Compatibility is just one factor in relationships and
                connections. Individual charts, personal growth, communication,
                and mutual respect play equally important roles. Use these
                insights as a starting point for deeper understanding, not as
                absolute predictions.
              </p>
            </div>
          </div>
        </section>

        {/* SEO Structured Data - BreadcrumbList */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://lunary.app',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Grimoire',
                  item: 'https://lunary.app/grimoire',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: 'Compatibility Chart',
                  item: 'https://lunary.app/grimoire/compatibility-chart',
                },
              ],
            }),
          }}
        />

        {/* SEO Structured Data - Article */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: 'Compatibility Chart - Lunary Grimoire',
              description:
                'Interactive compatibility chart for zodiac signs, elements, moon phases, and crystal categories. Discover how different cosmic energies interact and complement each other.',
              author: {
                '@type': 'Organization',
                name: 'Lunary',
                url: 'https://lunary.app',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Lunary',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://lunary.app/logo.png',
                },
              },
              datePublished: '2024-01-01',
              dateModified: new Date().toISOString().split('T')[0],
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': 'https://lunary.app/grimoire/compatibility-chart',
              },
              image: 'https://lunary.app/api/og/cosmic',
              keywords: [
                'zodiac compatibility',
                'astrology compatibility',
                'element compatibility',
                'moon phase compatibility',
                'crystal compatibility',
                'cosmic compatibility',
                'astrological relationships',
                'zodiac sign relationships',
              ],
            }),
          }}
        />

        {/* SEO Structured Data - WebApplication */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Compatibility Chart - Lunary Grimoire',
              description:
                'Interactive compatibility chart for zodiac signs, elements, moon phases, and crystal categories. Discover how different energies interact and complement each other.',
              applicationCategory: 'AstrologyApplication',
              operatingSystem: 'Web',
              browserRequirements: 'Requires JavaScript',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'Zodiac sign compatibility analysis',
                'Element compatibility (Fire, Earth, Air, Water)',
                'Moon phase compatibility',
                'Crystal category compatibility',
                'Detailed compatibility scores (0-100%)',
                'Strengths and challenges analysis',
                'Interactive comparison tool',
              ],
              screenshot: 'https://lunary.app/api/og/cosmic',
            }),
          }}
        />

        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'How accurate are compatibility charts?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Compatibility charts provide insights into how different energies, elements, and cosmic forces interact. However, compatibility is just one factor in relationships and connections. Individual charts, personal growth, and communication play equally important roles.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What types of compatibility can I check?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'You can check compatibility between zodiac signs, elements (Fire, Earth, Air, Water), moon phases (New Moon, Full Moon, etc.), and crystal categories. Each type provides unique insights into how different energies interact.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How do I interpret compatibility scores?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Scores of 85% or higher indicate excellent compatibility with shared strengths. Scores of 70-84% show good compatibility with some challenges to navigate. Scores below 70% may require more effort and understanding, but can still work with mutual respect and communication.',
                  },
                },
              ],
            }),
          }}
        />
      </section>
    </article>
  );
}
