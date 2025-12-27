'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// All categories from the unified loader
const allCategories = [
  { id: 'zodiac', name: 'Zodiac Signs', count: 12 },
  { id: 'crystals', name: 'Crystals', count: 104 },
  { id: 'tarot-major', name: 'Major Arcana', count: 22 },
  { id: 'tarot-wands', name: 'Suit of Wands', count: 14 },
  { id: 'tarot-cups', name: 'Suit of Cups', count: 14 },
  { id: 'tarot-swords', name: 'Suit of Swords', count: 14 },
  { id: 'tarot-pentacles', name: 'Suit of Pentacles', count: 14 },
  { id: 'runes', name: 'Elder Futhark', count: 24 },
  { id: 'chakras', name: 'Chakras', count: 7 },
  { id: 'planetary', name: 'Planetary Bodies', count: 11 },
  { id: 'sabbat', name: 'Sabbats', count: 8 },
  { id: 'numerology-lifepath', name: 'Life Path Numbers', count: 12 },
  { id: 'numerology-angel', name: 'Angel Numbers', count: 13 },
  { id: 'numerology-karmic', name: 'Karmic Debt', count: 4 },
  { id: 'numerology-mirror', name: 'Mirror Hours', count: 12 },
  { id: 'numerology-double', name: 'Double Hours', count: 12 },
  { id: 'houses', name: 'Astrological Houses', count: 12 },
  { id: 'aspects', name: 'Aspects', count: 5 },
  { id: 'lunar', name: 'Moon Phases', count: 8 },
  { id: 'chinese-zodiac', name: 'Chinese Zodiac', count: 12 },
  { id: 'decans', name: 'Zodiac Decans', count: 36 },
  { id: 'cusps', name: 'Zodiac Cusps', count: 12 },
];

// Static sample items for each category (to avoid client-side dynamic imports)
const sampleItems: Record<string, Array<{ slug: string; name: string }>> = {
  zodiac: [
    { slug: 'aries', name: 'Aries' },
    { slug: 'taurus', name: 'Taurus' },
    { slug: 'gemini', name: 'Gemini' },
    { slug: 'cancer', name: 'Cancer' },
    { slug: 'leo', name: 'Leo' },
    { slug: 'virgo', name: 'Virgo' },
    { slug: 'libra', name: 'Libra' },
    { slug: 'scorpio', name: 'Scorpio' },
    { slug: 'sagittarius', name: 'Sagittarius' },
    { slug: 'capricorn', name: 'Capricorn' },
    { slug: 'aquarius', name: 'Aquarius' },
    { slug: 'pisces', name: 'Pisces' },
  ],
  crystals: [
    { slug: 'amethyst', name: 'Amethyst' },
    { slug: 'rose-quartz', name: 'Rose Quartz' },
    { slug: 'clear-quartz', name: 'Clear Quartz' },
    { slug: 'citrine', name: 'Citrine' },
    { slug: 'black-tourmaline', name: 'Black Tourmaline' },
    { slug: 'moonstone', name: 'Moonstone' },
    { slug: 'labradorite', name: 'Labradorite' },
    { slug: 'selenite', name: 'Selenite' },
    { slug: 'obsidian', name: 'Obsidian' },
    { slug: 'carnelian', name: 'Carnelian' },
    { slug: 'lapis-lazuli', name: 'Lapis Lazuli' },
    { slug: 'tigers-eye', name: "Tiger's Eye" },
  ],
  'tarot-major': [
    { slug: 'the-fool', name: 'The Fool' },
    { slug: 'the-magician', name: 'The Magician' },
    { slug: 'the-high-priestess', name: 'The High Priestess' },
    { slug: 'the-empress', name: 'The Empress' },
    { slug: 'the-emperor', name: 'The Emperor' },
    { slug: 'the-hierophant', name: 'The Hierophant' },
    { slug: 'the-lovers', name: 'The Lovers' },
    { slug: 'the-chariot', name: 'The Chariot' },
    { slug: 'strength', name: 'Strength' },
    { slug: 'the-hermit', name: 'The Hermit' },
    { slug: 'wheel-of-fortune', name: 'Wheel of Fortune' },
    { slug: 'justice', name: 'Justice' },
  ],
  'tarot-wands': [
    { slug: 'ace-of-wands', name: 'Ace of Wands' },
    { slug: 'two-of-wands', name: 'Two of Wands' },
    { slug: 'three-of-wands', name: 'Three of Wands' },
    { slug: 'four-of-wands', name: 'Four of Wands' },
    { slug: 'five-of-wands', name: 'Five of Wands' },
    { slug: 'six-of-wands', name: 'Six of Wands' },
    { slug: 'seven-of-wands', name: 'Seven of Wands' },
    { slug: 'eight-of-wands', name: 'Eight of Wands' },
    { slug: 'nine-of-wands', name: 'Nine of Wands' },
    { slug: 'ten-of-wands', name: 'Ten of Wands' },
  ],
  'tarot-cups': [
    { slug: 'ace-of-cups', name: 'Ace of Cups' },
    { slug: 'two-of-cups', name: 'Two of Cups' },
    { slug: 'three-of-cups', name: 'Three of Cups' },
    { slug: 'four-of-cups', name: 'Four of Cups' },
    { slug: 'five-of-cups', name: 'Five of Cups' },
    { slug: 'six-of-cups', name: 'Six of Cups' },
    { slug: 'seven-of-cups', name: 'Seven of Cups' },
    { slug: 'eight-of-cups', name: 'Eight of Cups' },
    { slug: 'nine-of-cups', name: 'Nine of Cups' },
    { slug: 'ten-of-cups', name: 'Ten of Cups' },
  ],
  'tarot-swords': [
    { slug: 'ace-of-swords', name: 'Ace of Swords' },
    { slug: 'two-of-swords', name: 'Two of Swords' },
    { slug: 'three-of-swords', name: 'Three of Swords' },
    { slug: 'four-of-swords', name: 'Four of Swords' },
    { slug: 'five-of-swords', name: 'Five of Swords' },
    { slug: 'six-of-swords', name: 'Six of Swords' },
    { slug: 'seven-of-swords', name: 'Seven of Swords' },
    { slug: 'eight-of-swords', name: 'Eight of Swords' },
    { slug: 'nine-of-swords', name: 'Nine of Swords' },
    { slug: 'ten-of-swords', name: 'Ten of Swords' },
  ],
  'tarot-pentacles': [
    { slug: 'ace-of-pentacles', name: 'Ace of Pentacles' },
    { slug: 'two-of-pentacles', name: 'Two of Pentacles' },
    { slug: 'three-of-pentacles', name: 'Three of Pentacles' },
    { slug: 'four-of-pentacles', name: 'Four of Pentacles' },
    { slug: 'five-of-pentacles', name: 'Five of Pentacles' },
    { slug: 'six-of-pentacles', name: 'Six of Pentacles' },
    { slug: 'seven-of-pentacles', name: 'Seven of Pentacles' },
    { slug: 'eight-of-pentacles', name: 'Eight of Pentacles' },
    { slug: 'nine-of-pentacles', name: 'Nine of Pentacles' },
    { slug: 'ten-of-pentacles', name: 'Ten of Pentacles' },
  ],
  runes: [
    { slug: 'fehu', name: 'Fehu' },
    { slug: 'uruz', name: 'Uruz' },
    { slug: 'thurisaz', name: 'Thurisaz' },
    { slug: 'ansuz', name: 'Ansuz' },
    { slug: 'raidho', name: 'Raidho' },
    { slug: 'kenaz', name: 'Kenaz' },
    { slug: 'gebo', name: 'Gebo' },
    { slug: 'wunjo', name: 'Wunjo' },
    { slug: 'hagalaz', name: 'Hagalaz' },
    { slug: 'nauthiz', name: 'Nauthiz' },
    { slug: 'isa', name: 'Isa' },
    { slug: 'jera', name: 'Jera' },
  ],
  chakras: [
    { slug: 'root', name: 'Root Chakra' },
    { slug: 'sacral', name: 'Sacral Chakra' },
    { slug: 'solar-plexus', name: 'Solar Plexus Chakra' },
    { slug: 'heart', name: 'Heart Chakra' },
    { slug: 'throat', name: 'Throat Chakra' },
    { slug: 'third-eye', name: 'Third Eye Chakra' },
    { slug: 'crown', name: 'Crown Chakra' },
  ],
  planetary: [
    { slug: 'sun', name: 'The Sun' },
    { slug: 'moon', name: 'The Moon' },
    { slug: 'mercury', name: 'Mercury' },
    { slug: 'venus', name: 'Venus' },
    { slug: 'mars', name: 'Mars' },
    { slug: 'jupiter', name: 'Jupiter' },
    { slug: 'saturn', name: 'Saturn' },
    { slug: 'uranus', name: 'Uranus' },
    { slug: 'neptune', name: 'Neptune' },
    { slug: 'pluto', name: 'Pluto' },
    { slug: 'chiron', name: 'Chiron' },
  ],
  sabbat: [
    { slug: 'samhain', name: 'Samhain' },
    { slug: 'yule', name: 'Yule' },
    { slug: 'imbolc', name: 'Imbolc' },
    { slug: 'ostara', name: 'Ostara' },
    { slug: 'beltane', name: 'Beltane' },
    { slug: 'litha', name: 'Litha' },
    { slug: 'lughnasadh', name: 'Lughnasadh' },
    { slug: 'mabon', name: 'Mabon' },
  ],
  'numerology-lifepath': [
    { slug: '1', name: 'Life Path 1' },
    { slug: '2', name: 'Life Path 2' },
    { slug: '3', name: 'Life Path 3' },
    { slug: '4', name: 'Life Path 4' },
    { slug: '5', name: 'Life Path 5' },
    { slug: '6', name: 'Life Path 6' },
    { slug: '7', name: 'Life Path 7' },
    { slug: '8', name: 'Life Path 8' },
    { slug: '9', name: 'Life Path 9' },
    { slug: '11', name: 'Master Number 11' },
    { slug: '22', name: 'Master Number 22' },
    { slug: '33', name: 'Master Number 33' },
  ],
  'numerology-angel': [
    { slug: '111', name: '111 Angel Number' },
    { slug: '222', name: '222 Angel Number' },
    { slug: '333', name: '333 Angel Number' },
    { slug: '444', name: '444 Angel Number' },
    { slug: '555', name: '555 Angel Number' },
    { slug: '666', name: '666 Angel Number' },
    { slug: '777', name: '777 Angel Number' },
    { slug: '888', name: '888 Angel Number' },
    { slug: '999', name: '999 Angel Number' },
    { slug: '000', name: '000 Angel Number' },
    { slug: '1010', name: '1010 Angel Number' },
    { slug: '1212', name: '1212 Angel Number' },
  ],
  'numerology-karmic': [
    { slug: '13', name: 'Karmic Debt 13' },
    { slug: '14', name: 'Karmic Debt 14' },
    { slug: '16', name: 'Karmic Debt 16' },
    { slug: '19', name: 'Karmic Debt 19' },
  ],
  'numerology-mirror': [
    { slug: '01-10', name: 'Mirror Hour 01:10' },
    { slug: '02-20', name: 'Mirror Hour 02:20' },
    { slug: '03-30', name: 'Mirror Hour 03:30' },
    { slug: '04-40', name: 'Mirror Hour 04:40' },
    { slug: '05-50', name: 'Mirror Hour 05:50' },
    { slug: '10-01', name: 'Mirror Hour 10:01' },
    { slug: '12-21', name: 'Mirror Hour 12:21' },
    { slug: '13-31', name: 'Mirror Hour 13:31' },
    { slug: '14-41', name: 'Mirror Hour 14:41' },
    { slug: '15-51', name: 'Mirror Hour 15:51' },
    { slug: '20-02', name: 'Mirror Hour 20:02' },
    { slug: '21-12', name: 'Mirror Hour 21:12' },
  ],
  'numerology-double': [
    { slug: '00-00', name: 'Double Hour 00:00' },
    { slug: '01-01', name: 'Double Hour 01:01' },
    { slug: '02-02', name: 'Double Hour 02:02' },
    { slug: '03-03', name: 'Double Hour 03:03' },
    { slug: '04-04', name: 'Double Hour 04:04' },
    { slug: '05-05', name: 'Double Hour 05:05' },
    { slug: '10-10', name: 'Double Hour 10:10' },
    { slug: '11-11', name: 'Double Hour 11:11' },
    { slug: '12-12', name: 'Double Hour 12:12' },
    { slug: '20-20', name: 'Double Hour 20:20' },
    { slug: '21-21', name: 'Double Hour 21:21' },
    { slug: '22-22', name: 'Double Hour 22:22' },
  ],
  houses: [
    { slug: '1', name: 'First House' },
    { slug: '2', name: 'Second House' },
    { slug: '3', name: 'Third House' },
    { slug: '4', name: 'Fourth House' },
    { slug: '5', name: 'Fifth House' },
    { slug: '6', name: 'Sixth House' },
    { slug: '7', name: 'Seventh House' },
    { slug: '8', name: 'Eighth House' },
    { slug: '9', name: 'Ninth House' },
    { slug: '10', name: 'Tenth House' },
    { slug: '11', name: 'Eleventh House' },
    { slug: '12', name: 'Twelfth House' },
  ],
  aspects: [
    { slug: 'conjunct', name: 'Conjunction' },
    { slug: 'sextile', name: 'Sextile' },
    { slug: 'square', name: 'Square' },
    { slug: 'trine', name: 'Trine' },
    { slug: 'opposite', name: 'Opposition' },
  ],
  lunar: [
    { slug: 'newMoon', name: 'New Moon' },
    { slug: 'waxingCrescent', name: 'Waxing Crescent' },
    { slug: 'firstQuarter', name: 'First Quarter' },
    { slug: 'waxingGibbous', name: 'Waxing Gibbous' },
    { slug: 'fullMoon', name: 'Full Moon' },
    { slug: 'waningGibbous', name: 'Waning Gibbous' },
    { slug: 'lastQuarter', name: 'Last Quarter' },
    { slug: 'waningCrescent', name: 'Waning Crescent' },
  ],
  'chinese-zodiac': [
    { slug: 'rat', name: 'Rat' },
    { slug: 'ox', name: 'Ox' },
    { slug: 'tiger', name: 'Tiger' },
    { slug: 'rabbit', name: 'Rabbit' },
    { slug: 'dragon', name: 'Dragon' },
    { slug: 'snake', name: 'Snake' },
    { slug: 'horse', name: 'Horse' },
    { slug: 'goat', name: 'Goat' },
    { slug: 'monkey', name: 'Monkey' },
    { slug: 'rooster', name: 'Rooster' },
    { slug: 'dog', name: 'Dog' },
    { slug: 'pig', name: 'Pig' },
  ],
  decans: [
    { slug: 'aries-1', name: 'Aries Decan 1' },
    { slug: 'aries-2', name: 'Aries Decan 2' },
    { slug: 'aries-3', name: 'Aries Decan 3' },
    { slug: 'taurus-1', name: 'Taurus Decan 1' },
    { slug: 'taurus-2', name: 'Taurus Decan 2' },
    { slug: 'taurus-3', name: 'Taurus Decan 3' },
    { slug: 'gemini-1', name: 'Gemini Decan 1' },
    { slug: 'gemini-2', name: 'Gemini Decan 2' },
    { slug: 'gemini-3', name: 'Gemini Decan 3' },
    { slug: 'cancer-1', name: 'Cancer Decan 1' },
    { slug: 'cancer-2', name: 'Cancer Decan 2' },
    { slug: 'cancer-3', name: 'Cancer Decan 3' },
  ],
  cusps: [
    { slug: 'aries-taurus', name: 'Cusp of Power' },
    { slug: 'taurus-gemini', name: 'Cusp of Energy' },
    { slug: 'gemini-cancer', name: 'Cusp of Magic' },
    { slug: 'cancer-leo', name: 'Cusp of Oscillation' },
    { slug: 'leo-virgo', name: 'Cusp of Exposure' },
    { slug: 'virgo-libra', name: 'Cusp of Beauty' },
    { slug: 'libra-scorpio', name: 'Cusp of Drama' },
    { slug: 'scorpio-sagittarius', name: 'Cusp of Revolution' },
    { slug: 'sagittarius-capricorn', name: 'Cusp of Prophecy' },
    { slug: 'capricorn-aquarius', name: 'Cusp of Mystery' },
    { slug: 'aquarius-pisces', name: 'Cusp of Sensitivity' },
    { slug: 'pisces-aries', name: 'Cusp of Rebirth' },
  ],
};

const formats = [
  { value: 'square', label: 'Square (1080×1080)', description: 'Instagram' },
  {
    value: 'landscape',
    label: 'Landscape (1200×630)',
    description: 'Twitter/LinkedIn',
  },
  {
    value: 'portrait',
    label: 'Portrait (1080×1350)',
    description: 'Pinterest',
  },
  { value: 'story', label: 'Story (1080×1920)', description: 'TikTok/Stories' },
];

export default function ThematicPreviewPage() {
  const [selectedCategory, setSelectedCategory] = useState('zodiac');
  const [selectedFormat, setSelectedFormat] = useState('square');
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  const [selectedItem, setSelectedItem] = useState<{
    slug: string;
    name: string;
  } | null>(null);

  const items = sampleItems[selectedCategory] || [];
  const categoryInfo = allCategories.find((c) => c.id === selectedCategory);

  // Reset selected item when category changes
  useEffect(() => {
    const nextItems = sampleItems[selectedCategory] || [];
    setSelectedItem(nextItems[0] || null);
  }, [selectedCategory]);

  const getImageUrl = (
    category: string,
    title: string,
    slug: string,
    format: string,
  ) => {
    const params = new URLSearchParams({
      category,
      title,
      slug,
      format,
    });
    return `/api/og/thematic?${params.toString()}`;
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-white p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-light tracking-wide mb-2'>
            Thematic Image Preview
          </h1>
          <p className='text-zinc-400'>
            Preview all OG image types across {allCategories.length} categories
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='pt-6'>
              <p className='text-3xl font-light'>{allCategories.length}</p>
              <p className='text-zinc-400 text-sm'>Categories</p>
            </CardContent>
          </Card>
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='pt-6'>
              <p className='text-3xl font-light'>
                {allCategories.reduce((sum, cat) => sum + cat.count, 0)}
              </p>
              <p className='text-zinc-400 text-sm'>Total Items</p>
            </CardContent>
          </Card>
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='pt-6'>
              <p className='text-3xl font-light'>{formats.length}</p>
              <p className='text-zinc-400 text-sm'>Formats</p>
            </CardContent>
          </Card>
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='pt-6'>
              <p className='text-3xl font-light'>{categoryInfo?.count || 0}</p>
              <p className='text-zinc-400 text-sm'>In Current Category</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className='bg-zinc-900 border-zinc-800 mb-8'>
          <CardContent className='pt-6'>
            <div className='flex flex-wrap gap-4 items-end'>
              {/* Category Select */}
              <div className='flex-1 min-w-[250px]'>
                <label className='block text-sm text-zinc-400 mb-2'>
                  Category ({categoryInfo?.count || 0} items)
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className='bg-zinc-800 border-zinc-700'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='max-h-[400px]'>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Format Select */}
              <div className='flex-1 min-w-[200px]'>
                <label className='block text-sm text-zinc-400 mb-2'>
                  Format
                </label>
                <Select
                  value={selectedFormat}
                  onValueChange={setSelectedFormat}
                >
                  <SelectTrigger className='bg-zinc-800 border-zinc-700'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((fmt) => (
                      <SelectItem key={fmt.value} value={fmt.value}>
                        {fmt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode */}
              <div className='flex gap-2'>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className={
                    viewMode === 'grid'
                      ? 'bg-lunary-primary-600'
                      : 'border-zinc-700'
                  }
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'single' ? 'default' : 'outline'}
                  onClick={() => setViewMode('single')}
                  className={
                    viewMode === 'single'
                      ? 'bg-lunary-primary-600'
                      : 'border-zinc-700'
                  }
                >
                  Single
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {items.map((item) => (
              <Card
                key={item.slug}
                className='bg-zinc-900 border-zinc-800 overflow-hidden cursor-pointer hover:border-zinc-600 transition-colors'
                onClick={() => {
                  setSelectedItem(item);
                  setViewMode('single');
                }}
              >
                <div className='aspect-square relative'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(
                      selectedCategory,
                      item.name,
                      item.slug,
                      'square',
                    )}
                    alt={item.name}
                    className='w-full h-full object-cover'
                    loading='lazy'
                  />
                </div>
                <CardContent className='p-3'>
                  <p className='text-sm text-zinc-300 font-medium'>
                    {item.name}
                  </p>
                  <p className='text-xs text-zinc-500'>{item.slug}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Single View */}
        {viewMode === 'single' && (
          <div className='space-y-6'>
            {/* Item Selector */}
            <Card className='bg-zinc-900 border-zinc-800'>
              <CardContent className='pt-6'>
                <div className='flex flex-wrap gap-2'>
                  {items.map((item) => (
                    <Button
                      key={item.slug}
                      variant={
                        selectedItem?.slug === item.slug ? 'default' : 'outline'
                      }
                      size='sm'
                      onClick={() => setSelectedItem(item)}
                      className={
                        selectedItem?.slug === item.slug
                          ? 'bg-lunary-primary-600'
                          : 'border-zinc-700 hover:border-zinc-500'
                      }
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {selectedItem && (
              <Card className='bg-zinc-900 border-zinc-800'>
                <CardHeader>
                  <CardTitle className='text-lg font-light'>
                    {selectedItem.name} -{' '}
                    {formats.find((f) => f.value === selectedFormat)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex justify-center'>
                    <div
                      className={`relative overflow-hidden rounded-lg border border-zinc-700 ${
                        selectedFormat === 'square'
                          ? 'w-[400px] h-[400px]'
                          : selectedFormat === 'landscape'
                            ? 'w-[600px] h-[315px]'
                            : selectedFormat === 'portrait'
                              ? 'w-[300px] h-[375px]'
                              : 'w-[270px] h-[480px]'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(
                          selectedCategory,
                          selectedItem.name,
                          selectedItem.slug,
                          selectedFormat,
                        )}
                        alt={selectedItem.name}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  </div>

                  {/* Direct Link */}
                  <div className='mt-6 p-4 bg-zinc-800/50 rounded-lg'>
                    <p className='text-xs text-zinc-400 mb-2'>Direct URL:</p>
                    <code className='text-xs text-zinc-300 break-all'>
                      {typeof window !== 'undefined'
                        ? window.location.origin
                        : ''}
                      {getImageUrl(
                        selectedCategory,
                        selectedItem.name,
                        selectedItem.slug,
                        selectedFormat,
                      )}
                    </code>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Formats Preview */}
            {selectedItem && (
              <Card className='bg-zinc-900 border-zinc-800'>
                <CardHeader>
                  <CardTitle className='text-lg font-light'>
                    All Formats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                    {formats.map((fmt) => (
                      <div key={fmt.value} className='space-y-2'>
                        <p className='text-sm text-zinc-400'>
                          {fmt.description}
                        </p>
                        <div
                          className={`relative overflow-hidden rounded border border-zinc-700 ${
                            fmt.value === 'square'
                              ? 'aspect-square'
                              : fmt.value === 'landscape'
                                ? 'aspect-video'
                                : fmt.value === 'portrait'
                                  ? 'aspect-[4/5]'
                                  : 'aspect-[9/16]'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getImageUrl(
                              selectedCategory,
                              selectedItem.name,
                              selectedItem.slug,
                              fmt.value,
                            )}
                            alt={`${selectedItem.name} - ${fmt.label}`}
                            className='w-full h-full object-cover'
                            loading='lazy'
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Links to All Categories */}
        <Card className='bg-zinc-900 border-zinc-800 mt-8'>
          <CardHeader>
            <CardTitle className='text-lg font-light'>
              All Categories Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
              {allCategories.map((cat) => {
                const firstItem = sampleItems[cat.id]?.[0];
                if (!firstItem) return null;
                return (
                  <div
                    key={cat.id}
                    className='cursor-pointer'
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedItem(firstItem);
                      setViewMode('single');
                    }}
                  >
                    <div className='aspect-square relative overflow-hidden rounded-lg border border-zinc-700 hover:border-zinc-500 transition-colors'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(
                          cat.id,
                          firstItem.name,
                          firstItem.slug,
                          'square',
                        )}
                        alt={cat.name}
                        className='w-full h-full object-cover'
                        loading='lazy'
                      />
                    </div>
                    <p className='text-xs text-zinc-400 mt-2 text-center'>
                      {cat.name}
                    </p>
                    <p className='text-xs text-zinc-600 text-center'>
                      {cat.count} items
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
