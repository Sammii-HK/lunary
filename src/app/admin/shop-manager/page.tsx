'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Store, 
  Package, 
  Plus, 
  Eye, 
  ExternalLink,
  DollarSign,
  Tag,
  Calendar,
  Sparkles,
  CheckCircle,
  XCircle
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
  contentCount: {
    spells: number;
    crystals: number;
    herbs: number;
    rituals: number;
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
    'protection', 'love', 'prosperity', 'healing', 'cleansing',
    'divination', 'manifestation', 'banishing', 'crystals', 'moon'
  ];

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
        body: JSON.stringify({ action: 'get-products' })
      });
      
      const data = await response.json();
      setPacks(data.products || []);
    } catch (error) {
      console.error('Error fetching packs:', error);
    } finally {
      setLoading(false);
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
            specialEvent: specialEvent || undefined
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Pack "${result.pack.fullName}" created and synced to Stripe!`);
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
      currency: 'USD'
    }).format(amount / 100);
  };

  const getTotalValue = () => {
    return packs.reduce((total, pack) => total + (pack.pricing?.amount || 0), 0);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Store className="h-8 w-8" />
          Shop Manager
        </h1>
        <p className="text-muted-foreground">
          Generate grimoire packs with proper naming and sync to Stripe as SSOT
        </p>
      </div>

      {/* Shop Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{packs.length}</p>
                <p className="text-sm text-muted-foreground">Total Packs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{packs.filter(p => p.isPublished).length}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{formatPrice(getTotalValue())}</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{new Set(packs.map(p => p.series)).size}</p>
                <p className="text-sm text-muted-foreground">Series</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Pack Generator</TabsTrigger>
          <TabsTrigger value="catalog">Product Catalog</TabsTrigger>
          <TabsTrigger value="analytics">Shop Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate New Grimoire Pack
              </CardTitle>
              <CardDescription>
                Create a new pack with proper naming, volumes, and automatic Stripe sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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

                <div className="space-y-2">
                  <Label htmlFor="special-event">Special Event (Optional)</Label>
                  <Input
                    id="special-event"
                    placeholder="e.g., Valentine Moon Magic, Samhain Shadows"
                    value={specialEvent}
                    onChange={(e) => setSpecialEvent(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-title">Custom Title (Optional)</Label>
                  <Input
                    id="custom-title"
                    placeholder="Override auto-generated title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-subtitle">Custom Subtitle (Optional)</Label>
                  <Input
                    id="custom-subtitle"
                    placeholder="Override auto-generated subtitle"
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-rituals"
                    checked={includeRituals}
                    onCheckedChange={setIncludeRituals}
                  />
                  <Label htmlFor="include-rituals">Include Full Rituals</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-publish"
                    checked={autoPublish}
                    onCheckedChange={setAutoPublish}
                  />
                  <Label htmlFor="auto-publish">Auto-Publish to Shop</Label>
                </div>
              </div>

              <Button 
                onClick={generateAndSyncPack} 
                disabled={!selectedCategory || generating}
                className="w-full"
                size="lg"
              >
                {generating ? 'Generating & Syncing...' : 'Generate Pack & Sync to Stripe'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Catalog ({packs.length})
              </CardTitle>
              <CardDescription>
                All grimoire packs synced with Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading products...</div>
              ) : packs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No packs created yet</p>
                  <p className="text-sm">Generate your first pack above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {packs.map((pack) => (
                    <div key={pack.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{pack.title}</h3>
                            <Badge variant="outline">{pack.series}</Badge>
                            <Badge variant="secondary">{pack.volume}</Badge>
                            {pack.isPublished ? (
                              <Badge className="bg-green-100 text-green-800">Published</Badge>
                            ) : (
                              <Badge variant="outline">Draft</Badge>
                            )}
                          </div>
                          
                          {pack.subtitle && (
                            <p className="text-sm text-muted-foreground mb-2">{pack.subtitle}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>SKU: {pack.sku}</span>
                            <span>Edition: {pack.edition}</span>
                            <span>
                              Content: {pack.contentCount.spells}S • {pack.contentCount.crystals}C • {pack.contentCount.herbs}H
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatPrice(pack.pricing?.amount || 0)}</p>
                          {pack.pricing?.compareAtPrice && (
                            <p className="text-sm text-muted-foreground line-through">
                              {formatPrice(pack.pricing.compareAtPrice)}
                            </p>
                          )}
                          
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {pack.stripeProductId && (
                              <Button size="sm" variant="outline" asChild>
                                <a 
                                  href={`https://dashboard.stripe.com/products/${pack.stripeProductId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
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

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shop Analytics</CardTitle>
              <CardDescription>
                Performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
