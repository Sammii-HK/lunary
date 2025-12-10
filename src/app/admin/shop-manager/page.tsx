'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Store,
  Package,
  Eye,
  ExternalLink,
  DollarSign,
  Tag,
  Calendar,
  Sparkles,
  CheckCircle,
  Trash2,
} from 'lucide-react';

interface ShopPack {
  id: string;
  title: string;
  subtitle?: string;
  fullName: string;
  series: string;
  volume: string;
  edition: string;
  sku: string;
  slug: string;
  category: string;
  stripeProductId?: string;
  stripePriceId?: string;
  pricing: {
    amount: number;
    currency: string;
    compareAtPrice?: number;
  };
  isPublished: boolean;
  contentCount?: {
    spells: number;
    crystals: number;
    herbs: number;
    rituals: number;
    moonPhases?: number;
  };
}

export default function ShopManagerPage() {
  const [packs, setPacks] = useState<ShopPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Pack generation form
  const [selectedCategory, setSelectedCategory] = useState('');
  const [includeRituals, setIncludeRituals] = useState(false);
  const [autoPublish, setAutoPublish] = useState(false);
  const [specialEvent, setSpecialEvent] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');

  const categories = [
    'protection',
    'love',
    'prosperity',
    'healing',
    'cleansing',
    'divination',
    'manifestation',
    'banishing',
    'crystals',
    'moon',
    'spells',
    'tarot',
    'astrology',
    'seasonal',
    'moon_phases',
    'calendar',
  ];

  const updateCategory = async (productId: string, newCategory: string) => {
    try {
      const response = await fetch('/api/admin/shop/update-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          category: newCategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update local state immediately for better UX
        setPacks((prevPacks) =>
          prevPacks.map((pack) =>
            pack.stripeProductId === productId
              ? { ...pack, category: newCategory }
              : pack,
          ),
        );
        // Refresh from server to ensure consistency
        await fetchExistingPacks();
      } else {
        throw new Error(data.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Failed to update category: ${errorMessage}`);
      // Refresh to revert UI state
      await fetchExistingPacks();
    }
  };

  useEffect(() => {
    fetchExistingPacks();
  }, []);

  const fetchExistingPacks = async () => {
    setLoading(true);
    try {
      // Fetch from Stripe as SSOT
      const response = await fetch('/api/grimoire/sync-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-products' }),
      });

      const data = await response.json();
      setPacks(data.products || []);
    } catch (error) {
      console.error('Error fetching packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove "${productName}" from the shop? This will deactivate it in Stripe.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/shop/stripe/create-product?productId=${productId}`,
        {
          method: 'DELETE',
        },
      );

      const data = await response.json();

      if (data.success) {
        alert(`✅ "${productName}" removed from shop`);
        await fetchExistingPacks(); // Refresh the list
      } else {
        alert(`❌ Failed to remove product: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Error removing product');
    }
  };

  const fixCalendar = async (year: number) => {
    try {
      const response = await fetch('/api/admin/shop/fix-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `✅ Calendar for ${year} fixed! It should now appear in the shop.`,
        );
      } else {
        alert(`❌ Failed to fix calendar: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fixing calendar:', error);
      alert('❌ Error fixing calendar');
    }
  };

  const generateAndSyncPack = async () => {
    if (!selectedCategory) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/shop/packs/generate-and-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          includeRituals,
          autoPublish,
          customNaming: {
            title: customTitle || undefined,
            subtitle: customSubtitle || undefined,
            specialEvent: specialEvent || undefined,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `✅ Pack "${result.pack.fullName}" created and synced to Stripe!`,
        );
        await fetchExistingPacks(); // Refresh the list

        // Reset form
        setSelectedCategory('');
        setCustomTitle('');
        setCustomSubtitle('');
        setSpecialEvent('');
        setIncludeRituals(false);
        setAutoPublish(false);
      } else {
        alert(`❌ Failed to create pack: ${result.error}`);
      }
    } catch (error) {
      console.error('Error generating pack:', error);
      alert('❌ Error generating pack');
    } finally {
      setGenerating(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getTotalValue = () => {
    return packs.reduce(
      (total, pack) => total + (pack.pricing?.amount || 0),
      0,
    );
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
          <Store className='h-8 w-8' />
          Shop Manager
        </h1>
        <p className='text-muted-foreground'>
          Generate grimoire packs with proper naming and sync to Stripe as SSOT
        </p>
      </div>

      {/* Shop Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Package className='h-5 w-5 text-lunary-secondary' />
              <div>
                <p className='text-2xl font-bold'>{packs.length}</p>
                <p className='text-sm text-muted-foreground'>Total Packs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-lunary-success' />
              <div>
                <p className='text-2xl font-bold'>
                  {packs.filter((p) => p.isPublished).length}
                </p>
                <p className='text-sm text-muted-foreground'>Published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5 text-lunary-primary-500' />
              <div>
                <p className='text-2xl font-bold'>
                  {formatPrice(getTotalValue())}
                </p>
                <p className='text-sm text-muted-foreground'>Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Tag className='h-5 w-5 text-lunary-rose' />
              <div>
                <p className='text-2xl font-bold'>
                  {new Set(packs.map((p) => p.series)).size}
                </p>
                <p className='text-sm text-muted-foreground'>Series</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='generator' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='generator'>Pack Generator</TabsTrigger>
          <TabsTrigger value='catalog'>Product Catalog</TabsTrigger>
          <TabsTrigger value='analytics'>Shop Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='generator' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5' />
                Generate New Grimoire Pack
              </CardTitle>
              <CardDescription>
                Create a new pack with proper naming, volumes, and automatic
                Stripe sync
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='category'>Category *</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='special-event'>
                    Special Event (Optional)
                  </Label>
                  <Input
                    id='special-event'
                    placeholder='e.g., Valentine Moon Magic, Samhain Shadows'
                    value={specialEvent}
                    onChange={(e) => setSpecialEvent(e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='custom-title'>Custom Title (Optional)</Label>
                  <Input
                    id='custom-title'
                    placeholder='Override auto-generated title'
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='custom-subtitle'>
                    Custom Subtitle (Optional)
                  </Label>
                  <Input
                    id='custom-subtitle'
                    placeholder='Override auto-generated subtitle'
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                  />
                </div>
              </div>

              <div className='flex items-center gap-6'>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='include-rituals'
                    checked={includeRituals}
                    onCheckedChange={setIncludeRituals}
                  />
                  <Label htmlFor='include-rituals'>Include Full Rituals</Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <Switch
                    id='auto-publish'
                    checked={autoPublish}
                    onCheckedChange={setAutoPublish}
                  />
                  <Label htmlFor='auto-publish'>Auto-Publish to Shop</Label>
                </div>
              </div>

              <Button
                onClick={generateAndSyncPack}
                disabled={!selectedCategory || generating}
                className='w-full'
                size='lg'
              >
                {generating
                  ? 'Generating & Syncing...'
                  : 'Generate Pack & Sync to Stripe'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                Fix Calendar Product
              </CardTitle>
              <CardDescription>
                Fix existing calendar products to show in shop (sets
                default_price)
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex gap-2'>
                <Input
                  type='number'
                  placeholder='Year (e.g., 2026)'
                  id='calendar-year'
                  min='2025'
                  max='2100'
                />
                <Button
                  onClick={() => {
                    const yearInput = document.getElementById(
                      'calendar-year',
                    ) as HTMLInputElement;
                    const year = parseInt(yearInput.value);
                    if (year && year >= 2025 && year <= 2100) {
                      fixCalendar(year);
                    } else {
                      alert('Please enter a valid year (2025-2100)');
                    }
                  }}
                >
                  Fix Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='catalog' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                Product Catalog ({packs.length})
              </CardTitle>
              <CardDescription>
                All grimoire packs synced with Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='text-center py-8'>Loading products...</div>
              ) : packs.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <Package className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>No packs created yet</p>
                  <p className='text-sm'>Generate your first pack above</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {packs.map((pack) => (
                    <div key={pack.id} className='border rounded-lg p-4'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <h3 className='font-semibold'>{pack.title}</h3>
                            <Badge variant='outline'>{pack.series}</Badge>
                            <Badge variant='secondary'>{pack.volume}</Badge>
                            {pack.isPublished ? (
                              <Badge className='bg-lunary-success-100 text-lunary-success-800'>
                                Published
                              </Badge>
                            ) : (
                              <Badge variant='outline'>Draft</Badge>
                            )}
                          </div>

                          {pack.subtitle && (
                            <p className='text-sm text-muted-foreground mb-2'>
                              {pack.subtitle}
                            </p>
                          )}

                          <div className='flex items-center gap-4 text-sm text-muted-foreground flex-wrap mb-2'>
                            <span>SKU: {pack.sku || 'N/A'}</span>
                            <span>Edition: {pack.edition || 'N/A'}</span>
                            <span>
                              Content:{' '}
                              {pack.contentCount?.moonPhases
                                ? `${pack.contentCount.moonPhases} Moon Phases`
                                : pack.contentCount
                                  ? `${pack.contentCount.spells || 0}S • ${pack.contentCount.crystals || 0}C • ${pack.contentCount.herbs || 0}H`
                                  : 'No content info'}
                            </span>
                          </div>
                          <div className='flex flex-col gap-2 mt-2'>
                            <span className='text-sm font-medium'>
                              Category:
                            </span>
                            <Select
                              value={pack.category || 'uncategorized'}
                              onValueChange={(value) => {
                                if (pack.stripeProductId) {
                                  updateCategory(pack.stripeProductId, value);
                                }
                              }}
                            >
                              <SelectTrigger className='w-full h-10 text-base cursor-pointer'>
                                <SelectValue placeholder='Select category' />
                              </SelectTrigger>
                              <SelectContent className='z-[100]'>
                                {categories.map((cat) => (
                                  <SelectItem
                                    key={cat}
                                    value={cat}
                                    className='cursor-pointer'
                                  >
                                    {cat.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className='text-right'>
                          <p className='text-lg font-bold'>
                            {formatPrice(pack.pricing?.amount || 0)}
                          </p>
                          {pack.pricing?.compareAtPrice && (
                            <p className='text-sm text-muted-foreground line-through'>
                              {formatPrice(pack.pricing.compareAtPrice)}
                            </p>
                          )}

                          <div className='flex gap-2 mt-2'>
                            <Button size='sm' variant='outline'>
                              <Eye className='h-4 w-4' />
                            </Button>
                            {pack.stripeProductId && (
                              <>
                                <Button size='sm' variant='outline' asChild>
                                  <a
                                    href={`https://dashboard.stripe.com/products/${pack.stripeProductId}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                  >
                                    <ExternalLink className='h-4 w-4' />
                                  </a>
                                </Button>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    deleteProduct(
                                      pack.stripeProductId!,
                                      pack.title,
                                    )
                                  }
                                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                                >
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Shop Analytics</CardTitle>
              <CardDescription>
                Performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-muted-foreground'>
                <DollarSign className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Analytics dashboard coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
