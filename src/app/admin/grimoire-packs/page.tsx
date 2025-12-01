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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Package,
  Sparkles,
  Download,
  Eye,
  Plus,
  Wand2,
  Gem,
  Search,
  Filter,
  CheckCircle,
} from 'lucide-react';

interface GrimoireData {
  crystals: any[];
  spells: any[];
  count: number;
}

interface PackPreview {
  title: string;
  category: string;
  description: string;
  crystals: any[];
  spells: any[];
  correspondences: any;
  timing: any;
  herbs: any[];
  stripeProductId?: string;
  stripePriceId?: string;
  isActive?: boolean;
}

interface StripeProduct {
  stripeProductId: string;
  stripePriceId: string;
  title: string;
  description: string;
  category: string;
  spellCount: number;
  crystalCount: number;
  herbCount: number;
  metadata: {
    price: number;
    difficulty: string;
    estimatedTime: string;
  };
  isActive: boolean;
  createdAt: string;
}

export default function GrimoirePacksAdmin() {
  const [grimoireData, setGrimoireData] = useState<GrimoireData | null>(null);
  const [stripeProducts, setStripeProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIntention, setSelectedIntention] = useState('');
  const [packPreview, setPackPreview] = useState<PackPreview | null>(null);
  const [customDescription, setCustomDescription] = useState('');
  const [packTitle, setPackTitle] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);

  const categories = [
    'protection',
    'love',
    'prosperity',
    'healing',
    'cleansing',
    'divination',
    'manifestation',
    'banishing',
  ];

  const intentions = [
    'abundance',
    'protection',
    'love',
    'healing',
    'clarity',
    'manifestation',
    'grounding',
    'spiritual growth',
    'courage',
    'wisdom',
    'peace',
    'transformation',
  ];

  // Fetch grimoire data and Stripe products on component mount
  useEffect(() => {
    fetchGrimoireData();
    fetchStripeProducts();
  }, []);

  const fetchGrimoireData = async () => {
    setLoading(true);
    try {
      const [crystalsRes, spellsRes] = await Promise.all([
        fetch('/api/grimoire?type=crystals'),
        fetch('/api/grimoire?type=spells'),
      ]);

      const crystalsData = await crystalsRes.json();
      const spellsData = await spellsRes.json();

      setGrimoireData({
        crystals: crystalsData.crystals || [],
        spells: spellsData.spells || [],
        count: (crystalsData.count || 0) + (spellsData.count || 0),
      });
    } catch (error) {
      console.error('Error fetching grimoire data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStripeProducts = async () => {
    try {
      const response = await fetch('/api/grimoire/sync-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-products' }),
      });
      const data = await response.json();
      setStripeProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching Stripe products:', error);
    }
  };

  const generatePackPreview = async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      // Generate pack using existing API
      const response = await fetch(
        `/api/packs/spells?category=${selectedCategory}&rituals=true`,
      );
      const packData = await response.json();

      // Get relevant crystals from grimoire
      const crystalResponse = await fetch(
        `/api/grimoire?type=crystals&action=filter&category=${getCrystalCategory(selectedCategory)}&intention=${selectedIntention || selectedCategory}`,
      );
      const crystalData = await crystalResponse.json();

      setPackPreview({
        ...packData,
        crystals: crystalData.crystals?.slice(0, 8) || [],
        title: packTitle || packData.title,
      });
    } catch (error) {
      console.error('Error generating pack preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncToStripe = async () => {
    if (!packPreview) return;

    setSyncLoading(true);
    try {
      const response = await fetch('/api/grimoire/sync-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          pack: packPreview,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update pack preview with Stripe IDs
        setPackPreview((prev) =>
          prev
            ? {
                ...prev,
                stripeProductId: result.stripeProductId,
                stripePriceId: result.stripePriceId,
              }
            : null,
        );

        // Refresh Stripe products list
        await fetchStripeProducts();

        alert('✅ Pack synced to Stripe successfully!');
      } else {
        alert('❌ Failed to sync to Stripe: ' + result.error);
      }
    } catch (error) {
      console.error('Error syncing to Stripe:', error);
      alert('❌ Error syncing to Stripe');
    } finally {
      setSyncLoading(false);
    }
  };

  const syncAllFromStripe = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch('/api/grimoire/sync-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-all' }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchStripeProducts();
        alert(`✅ Synced ${result.totalProducts} products from Stripe!`);
      }
    } catch (error) {
      console.error('Error syncing from Stripe:', error);
      alert('❌ Error syncing from Stripe');
    } finally {
      setSyncLoading(false);
    }
  };

  const getCrystalCategory = (spellCategory: string): string => {
    const categoryMap: { [key: string]: string } = {
      protection: 'Protection & Grounding',
      love: 'Love & Heart Healing',
      prosperity: 'Manifestation & Abundance',
      healing: 'Healing & Wellness',
      cleansing: 'Healing & Wellness',
      divination: 'Spiritual & Intuitive',
      manifestation: 'Manifestation & Abundance',
      banishing: 'Protection & Grounding',
    };
    return categoryMap[spellCategory] || 'Protection & Grounding';
  };

  const exportPack = (format: 'json' | 'pdf') => {
    if (!packPreview) return;

    if (format === 'json') {
      const dataStr = JSON.stringify(packPreview, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${packPreview.title.replace(/\s+/g, '-').toLowerCase()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // PDF export would require additional implementation
      alert('PDF export coming soon!');
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
          <BookOpen className='h-8 w-8' />
          Grimoire Pack Generator
        </h1>
        <p className='text-muted-foreground'>
          Create comprehensive magical packs using your grimoire database
        </p>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Gem className='h-5 w-5 text-purple-500' />
              <div>
                <p className='text-2xl font-bold'>
                  {grimoireData?.crystals.length || 0}
                </p>
                <p className='text-sm text-muted-foreground'>Crystals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Wand2 className='h-5 w-5 text-blue-500' />
              <div>
                <p className='text-2xl font-bold'>
                  {grimoireData?.spells.length || 0}
                </p>
                <p className='text-sm text-muted-foreground'>Spells</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Package className='h-5 w-5 text-green-500' />
              <div>
                <p className='text-2xl font-bold'>{grimoireData?.count || 0}</p>
                <p className='text-sm text-muted-foreground'>Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-blue-500' />
              <div>
                <p className='text-2xl font-bold'>{stripeProducts.length}</p>
                <p className='text-sm text-muted-foreground'>Stripe Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='generator' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='generator'>Pack Generator</TabsTrigger>
          <TabsTrigger value='stripe'>Stripe Products</TabsTrigger>
          <TabsTrigger value='browse'>Browse Grimoire</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='generator' className='space-y-6'>
          {/* Pack Generator */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5' />
                Generate New Pack
              </CardTitle>
              <CardDescription>
                Create a comprehensive magical pack using your grimoire database
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='pack-title'>Pack Title (Optional)</Label>
                  <Input
                    id='pack-title'
                    placeholder='Custom pack title...'
                    value={packTitle}
                    onChange={(e) => setPackTitle(e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='category'>Primary Category</Label>
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
                  <Label htmlFor='intention'>
                    Secondary Intention (Optional)
                  </Label>
                  <Select
                    value={selectedIntention}
                    onValueChange={setSelectedIntention}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select intention' />
                    </SelectTrigger>
                    <SelectContent>
                      {intentions.map((intention) => (
                        <SelectItem key={intention} value={intention}>
                          {intention.charAt(0).toUpperCase() +
                            intention.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>
                    Custom Description (Optional)
                  </Label>
                  <Textarea
                    id='description'
                    placeholder='Override default pack description...'
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <Button
                onClick={generatePackPreview}
                disabled={!selectedCategory || loading}
                className='w-full'
              >
                {loading ? 'Generating...' : 'Generate Pack Preview'}
              </Button>
            </CardContent>
          </Card>

          {/* Pack Preview */}
          {packPreview && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span className='flex items-center gap-2'>
                    <Eye className='h-5 w-5' />
                    Pack Preview: {packPreview.title}
                  </span>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => exportPack('json')}
                    >
                      <Download className='h-4 w-4 mr-2' />
                      Export JSON
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => exportPack('pdf')}
                    >
                      <Download className='h-4 w-4 mr-2' />
                      Export PDF
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>{packPreview.description}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Crystals Section */}
                <div>
                  <h4 className='font-semibold mb-3 flex items-center gap-2'>
                    <Gem className='h-4 w-4' />
                    Crystals ({packPreview.crystals?.length || 0})
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {packPreview.crystals?.slice(0, 6).map((crystal, index) => (
                      <div key={index} className='p-3 border rounded-lg'>
                        <h5 className='font-medium'>{crystal.name}</h5>
                        <p className='text-sm text-muted-foreground'>
                          {crystal.properties}
                        </p>
                        <div className='flex flex-wrap gap-1 mt-2'>
                          {crystal.intentions
                            ?.slice(0, 3)
                            .map((intention: string, i: number) => (
                              <Badge
                                key={i}
                                variant='secondary'
                                className='text-xs'
                              >
                                {intention}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spells Section */}
                <div>
                  <h4 className='font-semibold mb-3 flex items-center gap-2'>
                    <Wand2 className='h-4 w-4' />
                    Spells ({packPreview.spells?.length || 0})
                  </h4>
                  <div className='space-y-3'>
                    {packPreview.spells?.slice(0, 3).map((spell, index) => (
                      <div key={index} className='p-3 border rounded-lg'>
                        <h5 className='font-medium'>
                          {spell.title || spell.name}
                        </h5>
                        <p className='text-sm text-muted-foreground'>
                          {spell.purpose}
                        </p>
                        <div className='flex items-center gap-4 mt-2 text-xs text-muted-foreground'>
                          <span>Duration: {spell.duration}</span>
                          <span>Difficulty: {spell.difficulty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correspondences */}
                {packPreview.correspondences && (
                  <div>
                    <h4 className='font-semibold mb-3'>Correspondences</h4>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      {Object.entries(packPreview.correspondences).map(
                        ([key, values]) => (
                          <div key={key} className='space-y-2'>
                            <h5 className='text-sm font-medium capitalize'>
                              {key}
                            </h5>
                            <div className='flex flex-wrap gap-1'>
                              {(values as string[])
                                ?.slice(0, 3)
                                .map((value, i) => (
                                  <Badge
                                    key={i}
                                    variant='outline'
                                    className='text-xs'
                                  >
                                    {value}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='browse' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Search className='h-5 w-5' />
                Browse Grimoire Database
              </CardTitle>
              <CardDescription>
                Explore your complete magical knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-muted-foreground'>
                <BookOpen className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Grimoire browser coming soon!</p>
                <p className='text-sm'>Use the API directly: /api/grimoire</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Filter className='h-5 w-5' />
                Usage Analytics
              </CardTitle>
              <CardDescription>
                Track pack generation and grimoire usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-muted-foreground'>
                <Package className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Analytics dashboard coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
