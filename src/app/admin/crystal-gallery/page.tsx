'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function CrystalGalleryPage() {
  const [selectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // All crystals from the OG endpoint
  const crystals = [
    {
      name: 'Amethyst',
      color: '#9333EA',
      chakra: 'Crown Chakra',
      keywords: ['Intuition', 'Clarity', 'Protection'],
      element: 'Spirit',
    },
    {
      name: 'Rose Quartz',
      color: '#F472B6',
      chakra: 'Heart Chakra',
      keywords: ['Love', 'Compassion', 'Peace'],
      element: 'Water',
    },
    {
      name: 'Citrine',
      color: '#F59E0B',
      chakra: 'Solar Plexus',
      keywords: ['Abundance', 'Confidence', 'Joy'],
      element: 'Fire',
    },
    {
      name: 'Black Tourmaline',
      color: '#1F2937',
      chakra: 'Root Chakra',
      keywords: ['Protection', 'Grounding', 'Strength'],
      element: 'Earth',
    },
    {
      name: 'Clear Quartz',
      color: '#F3F4F6',
      chakra: 'All Chakras',
      keywords: ['Amplification', 'Clarity', 'Healing'],
      element: 'Light',
    },
    {
      name: 'Moonstone',
      color: '#E5E7EB',
      chakra: 'Sacral Chakra',
      keywords: ['Intuition', 'Cycles', 'Feminine'],
      element: 'Moon',
    },
    {
      name: 'Carnelian',
      color: '#EA580C',
      chakra: 'Sacral Chakra',
      keywords: ['Creativity', 'Courage', 'Passion'],
      element: 'Fire',
    },
  ];

  return (
    <div className='min-h-screen bg-surface-base text-content-primary p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-4'>Crystal Gallery</h1>
          <p className='text-content-muted mb-6'>
            Preview all crystal images with their chakra associations and color
            variations
          </p>
        </div>

        {/* Crystals Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {crystals.map((crystal, index) => {
            // Show 3 daily variations for each crystal
            const variations = [0, 1, 2].map((dayOffset) => {
              const date = new Date();
              date.setDate(date.getDate() + dayOffset);
              return {
                date: date.toISOString().split('T')[0],
                label:
                  dayOffset === 0
                    ? 'Today'
                    : dayOffset === 1
                      ? 'Tomorrow'
                      : 'Day After',
                imageUrl: `/api/og/crystal?date=${date.toISOString().split('T')[0]}&crystal=${encodeURIComponent(crystal.name)}`,
              };
            });

            return (
              <div
                key={crystal.name}
                className='bg-surface-elevated rounded-lg border border-stroke-default overflow-hidden'
              >
                {/* Crystal Header */}
                <div className='p-6 border-b border-stroke-default'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div
                      className='w-4 h-4 rounded-full'
                      style={{ backgroundColor: crystal.color }}
                    ></div>
                    <h3 className='text-xl font-bold text-content-primary'>
                      {crystal.name}
                    </h3>
                  </div>

                  <div className='space-y-2 text-sm'>
                    <div className='flex gap-2'>
                      <span className='text-content-muted'>Chakra:</span>
                      <span className='text-content-primary'>
                        {crystal.chakra}
                      </span>
                    </div>
                    <div className='flex gap-2'>
                      <span className='text-content-muted'>Element:</span>
                      <span className='text-content-primary'>
                        {crystal.element}
                      </span>
                    </div>
                    <div className='flex gap-2 items-start'>
                      <span className='text-content-muted'>Keywords:</span>
                      <div className='flex flex-wrap gap-1'>
                        {crystal.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className='px-2 py-1 bg-surface-card rounded text-xs text-content-secondary'
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Variations */}
                <div className='p-4'>
                  <h4 className='text-sm font-medium mb-4 text-content-secondary'>
                    Daily Background Variations:
                  </h4>
                  <div className='grid grid-cols-3 gap-2'>
                    {variations.map((variation) => (
                      <div key={variation.date} className='text-center'>
                        <div className='relative aspect-square rounded border border-stroke-strong mb-2'>
                          <Image
                            src={variation.imageUrl}
                            alt={`${crystal.name} - ${variation.label}`}
                            fill
                            style={{ objectFit: 'cover' }}
                            className='rounded'
                          />
                        </div>
                        <div className='text-xs text-content-muted'>
                          {variation.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className='mt-8 flex gap-4 justify-center'>
          <a
            href='/admin/daily-posts-preview'
            className='px-6 py-3 bg-lunary-primary-600 hover:bg-layer-high rounded-md text-white font-medium transition-colors'
          >
            ← Daily Posts Preview
          </a>
          <a
            href='/admin/tarot-gallery'
            className='px-6 py-3 bg-lunary-primary hover:bg-lunary-primary-400 rounded-md text-white font-medium transition-colors'
          >
            View Tarot Gallery →
          </a>
        </div>
      </div>
    </div>
  );
}
