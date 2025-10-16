'use client';

import { useState, useEffect } from 'react';

interface DigitalPack {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  imageUrl?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  isActive: boolean;
  createdAt: string;
  metadata?: {
    dateRange?: string;
    format?: string;
    itemCount?: number;
  };
}

interface GeneratePackForm {
  category: string;
  subcategory: string;
  name: string;
  description: string;
  price: number;
  year?: number;
  month?: number;
  quarter?: number;
}

export default function ShopAdminPage() {
  const [packs, setPacks] = useState<DigitalPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<GeneratePackForm>({
    category: 'moon_phases',
    subcategory: '',
    name: '',
    description: '',
    price: 1999, // $19.99 in cents
  });

  const categories = [
    { id: 'moon_phases', name: 'Moon Phases' },
    { id: 'crystals', name: 'Crystals' },
    { id: 'spells', name: 'Spells' },
    { id: 'tarot', name: 'Tarot' },
    { id: 'astrology', name: 'Astrology' },
    { id: 'seasonal', name: 'Seasonal' },
  ];

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from your database
      // For now, using mock data
      setPacks([]);
    } catch (error) {
      console.error('Failed to load packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setGenerating(true);

      const response = await fetch('/api/shop/packs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate pack');
      }

      console.log('Pack generated:', data);

      // Create Stripe product
      const stripeResponse = await fetch('/api/shop/stripe/create-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pack: data.pack,
        }),
      });

      const stripeData = await stripeResponse.json();

      if (!stripeResponse.ok) {
        console.warn('Stripe product creation failed:', stripeData.error);
      } else {
        console.log('Stripe product created:', stripeData);
      }

      alert(`Pack "${form.name}" generated successfully!`);
      setShowForm(false);
      setForm({
        category: 'moon_phases',
        subcategory: '',
        name: '',
        description: '',
        price: 1999,
      });

      // Reload packs
      loadPacks();
    } catch (error: any) {
      console.error('Pack generation failed:', error);
      alert(error.message || 'Pack generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-900 to-slate-800'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-light text-white mb-2'>
              Shop Administration
            </h1>
            <p className='text-slate-300'>
              Manage digital packs and generate new products
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className='px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors'
          >
            {showForm ? 'Cancel' : 'Generate New Pack'}
          </button>
        </div>

        {/* Generate Pack Form */}
        {showForm && (
          <div className='bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-8'>
            <h2 className='text-xl font-medium text-white mb-6'>
              Generate New Digital Pack
            </h2>

            <form onSubmit={handleGeneratePack} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Category */}
                <div>
                  <label className='block text-sm font-medium text-slate-300 mb-2'>
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <label className='block text-sm font-medium text-slate-300 mb-2'>
                    Subcategory
                  </label>
                  <input
                    type='text'
                    value={form.subcategory}
                    onChange={(e) =>
                      setForm({ ...form, subcategory: e.target.value })
                    }
                    placeholder='e.g., 2025, december, q4'
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>

                {/* Price */}
                <div>
                  <label className='block text-sm font-medium text-slate-300 mb-2'>
                    Price (USD) *
                  </label>
                  <input
                    type='number'
                    value={form.price / 100}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: Math.round(parseFloat(e.target.value) * 100),
                      })
                    }
                    step='0.01'
                    min='0'
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    required
                  />
                </div>

                {/* Date Options for Moon Phases/Astrology */}
                {(form.category === 'moon_phases' ||
                  form.category === 'astrology') && (
                  <>
                    <div>
                      <label className='block text-sm font-medium text-slate-300 mb-2'>
                        Year
                      </label>
                      <input
                        type='number'
                        value={form.year || new Date().getFullYear()}
                        onChange={(e) =>
                          setForm({ ...form, year: parseInt(e.target.value) })
                        }
                        min='2024'
                        max='2030'
                        className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-slate-300 mb-2'>
                        Month (optional)
                      </label>
                      <select
                        value={form.month || ''}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            month: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                        className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      >
                        <option value=''>All year</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(2024, i).toLocaleString('default', {
                              month: 'long',
                            })}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-slate-300 mb-2'>
                        Quarter (optional)
                      </label>
                      <select
                        value={form.quarter || ''}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            quarter: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                        className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      >
                        <option value=''>All year</option>
                        <option value='1'>Q1 (Jan-Mar)</option>
                        <option value='2'>Q2 (Apr-Jun)</option>
                        <option value='3'>Q3 (Jul-Sep)</option>
                        <option value='4'>Q4 (Oct-Dec)</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Name */}
              <div>
                <label className='block text-sm font-medium text-slate-300 mb-2'>
                  Pack Name *
                </label>
                <input
                  type='text'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder='e.g., Moon Phases 2025'
                  className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className='block text-sm font-medium text-slate-300 mb-2'>
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe what's included in this pack..."
                  rows={4}
                  className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  required
                />
              </div>

              {/* Submit Button */}
              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={generating}
                  className='px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors'
                >
                  {generating ? (
                    <span className='flex items-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Generating...
                    </span>
                  ) : (
                    'Generate Pack'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Packs */}
        <div className='bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700'>
          <div className='p-6 border-b border-slate-700'>
            <h2 className='text-xl font-medium text-white'>
              Existing Packs ({packs.length})
            </h2>
          </div>

          {loading ? (
            <div className='p-8 text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4'></div>
              <p className='text-slate-300'>Loading packs...</p>
            </div>
          ) : packs.length === 0 ? (
            <div className='p-8 text-center'>
              <p className='text-slate-400'>No packs generated yet.</p>
              <p className='text-slate-500 text-sm mt-2'>
                Use the "Generate New Pack" button to create your first digital
                product.
              </p>
            </div>
          ) : (
            <div className='divide-y divide-slate-700'>
              {packs.map((pack) => (
                <div key={pack.id} className='p-6'>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h3 className='text-lg font-medium text-white'>
                          {pack.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            pack.isActive
                              ? 'bg-green-900 text-green-300'
                              : 'bg-red-900 text-red-300'
                          }`}
                        >
                          {pack.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <p className='text-slate-300 text-sm mb-3'>
                        {pack.description}
                      </p>

                      <div className='flex flex-wrap gap-2 text-xs'>
                        <span className='px-2 py-1 bg-slate-700 text-slate-300 rounded'>
                          {pack.category}
                        </span>
                        {pack.subcategory && (
                          <span className='px-2 py-1 bg-slate-700 text-slate-300 rounded'>
                            {pack.subcategory}
                          </span>
                        )}
                        {pack.metadata?.itemCount && (
                          <span className='px-2 py-1 bg-slate-700 text-slate-300 rounded'>
                            {pack.metadata.itemCount} items
                          </span>
                        )}
                      </div>
                    </div>

                    <div className='text-right'>
                      <div className='text-xl font-bold text-purple-400 mb-2'>
                        {formatPrice(pack.price)}
                      </div>
                      <div className='text-xs text-slate-400'>
                        {new Date(pack.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className='mt-8 bg-slate-800/30 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-white mb-3'>How It Works</h3>
          <div className='space-y-2 text-sm text-slate-300'>
            <p>
              1. <strong>Generate Pack:</strong> Choose a category and provide
              details to automatically generate content
            </p>
            <p>
              2. <strong>Stripe Integration:</strong> Products are automatically
              created in Stripe for secure payments
            </p>
            <p>
              3. <strong>Secure Storage:</strong> Files are stored in Vercel
              Blob with secure download links
            </p>
            <p>
              4. <strong>Auto-Generated:</strong> Content is created
              programmatically based on your specifications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
