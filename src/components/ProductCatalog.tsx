import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';


import { Search, Filter, ShoppingCart, Plus, Trash2, Mic, Camera, Play, Pause, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  brand: string;
  image?: string;
  audioRecording?: string;
  inStock: boolean;
  description: string;
}

interface ProductCatalogProps {
  products: Product[];
  onDeleteProduct: (id: string) => void;
  onBuyProduct: (product: Product) => void;
}

const categories = {
  Biscuit: [
    "Good Day", "Butter & Bake", "Monaco Magic", "Dream Lite", "Hide & Seek", "Marie Gold", "Parle-G"
  ],
  Kurkura: [
    "Rude Bhujia", "Bhujia Dal", "Moon Dal", "Mastana Khush", "Kacha Aam", "Royal Use", "Tooya Chips", "Lage"
  ],
  Cigarette: [
    "Gold Flake", "Super Star", "Advance", "Four Square", "Indie Mint", "Indie Clove", "Gold Flake King",
    "Charm", "Charm King", "Editions", "Black Fite", "Royal White"
  ],
  Pani: ["Bisleri", "Kinley", "Aquafina", "Local Water"], // Example additions
  "Karga Diye Hai": ["Zeera", "Sprite", "Thums Up", "Other"]
};


const brands = [
  "Britannia", "Parle", "Cadbury", "ITC", "PepsiCo", "Coca Cola", "Bisleri", "Local"
];


export function ProductCatalog({ products, onDeleteProduct, onBuyProduct }: ProductCatalogProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  
  // Cost price tracking for profit/loss calculation
  const [productCosts, setProductCosts] = useLocalStorage<Record<string, number>>('product-costs', {});

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || product.subcategory === selectedSubcategory;
    const matchesBrand = !selectedBrand || product.brand === selectedBrand;
    const matchesMinPrice = !priceRange.min || product.price >= parseFloat(priceRange.min);
    const matchesMaxPrice = !priceRange.max || product.price <= parseFloat(priceRange.max);

    return matchesSearch && matchesCategory && matchesSubcategory &&
           matchesBrand && matchesMinPrice && matchesMaxPrice;
  });

  // Group products by category
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Calculate overall totals
  const overallTotals = React.useMemo(() => {
    const totalValue = filteredProducts.reduce((sum, product) => sum + product.price, 0);
    const totalCost = filteredProducts.reduce((sum, product) => {
      const costPrice = productCosts[product.id] || product.price * 0.7;
      return sum + costPrice;
    }, 0);
    const totalProfit = Math.max(0, totalValue - totalCost);
    const totalLoss = Math.max(0, totalCost - totalValue);
    const totalProducts = filteredProducts.length;
    const inStockProducts = filteredProducts.filter(p => p.inStock).length;
    const outOfStockProducts = filteredProducts.filter(p => !p.inStock).length;
    const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
    const profitMargin = totalValue > 0 ? ((totalValue - totalCost) / totalValue) * 100 : 0;
    
    return {
      totalValue,
      totalCost,
      totalProfit,
      totalLoss,
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      avgPrice,
      profitMargin
    };
  }, [filteredProducts, productCosts]);

  const playAudio = (audioUrl: string, productId: string) => {
    if (playingAudio === productId) {
      setPlayingAudio(null);
      return;
    }
    
    const audio = new Audio(audioUrl);
    audio.play();
    setPlayingAudio(productId);
    audio.onended = () => setPlayingAudio(null);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedBrand('');
    setPriceRange({ min: '', max: '' });
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Catalog</h2>
        <Button onClick={() => navigate('/add-product')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Overall Analytics Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Overall Business Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-primary">₹</span>
                <span className="text-sm font-medium text-muted-foreground">Revenue</span>
              </div>
              <p className="text-xl font-bold text-primary">{overallTotals.totalValue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-orange-600">₹</span>
                <span className="text-sm font-medium text-muted-foreground">Cost</span>
              </div>
              <p className="text-xl font-bold text-orange-600">{overallTotals.totalCost.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-success mr-1" />
                <span className="text-sm font-medium text-muted-foreground">Profit</span>
              </div>
              <p className="text-xl font-bold text-success">{overallTotals.totalProfit.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingDown className="h-5 w-5 text-destructive mr-1" />
                <span className="text-sm font-medium text-muted-foreground">Loss</span>
              </div>
              <p className="text-xl font-bold text-destructive">{overallTotals.totalLoss.toLocaleString()}</p>
            </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-primary">₹</span>
              <span className="text-sm font-medium text-muted-foreground">Margin %</span>
            </div>
            <p className={`text-xl font-bold ${overallTotals.profitMargin >= 0 ? 'text-success' : 'text-destructive'}`}>
              {overallTotals.profitMargin.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ShoppingCart className="h-5 w-5 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-muted-foreground">Products</span>
            </div>
            <p className="text-xl font-bold text-blue-600">{overallTotals.totalProducts}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ShoppingCart className="h-5 w-5 text-success mr-1" />
              <span className="text-sm font-medium text-muted-foreground">In Stock</span>
            </div>
            <p className="text-xl font-bold text-success">{overallTotals.inStockProducts}</p>
          </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <h4 className="font-medium">Price Range</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="font-medium">Category</h4>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                  }}
                >
                  <option value="">All Categories</option>
                  {Object.keys(categories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Subcategories */}
              {selectedCategory && (
                <div className="space-y-2">
                  <h4 className="font-medium">Subcategory</h4>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                  >
                    <option value="">All Subcategories</option>
                    {categories[selectedCategory as keyof typeof categories]?.map(subcat => (
                      <option key={subcat} value={subcat}>{subcat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Brands */}
              <div className="space-y-2">
                <h4 className="font-medium">Brand</h4>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or add some products</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedProducts).map(([category, products]) => (
                  <div key={category}>
                    <h3 className="text-xl font-bold mb-4 capitalize">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {products.map(product => (
                        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">{product.brand}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteProduct(product.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="secondary">{product.category}</Badge>
                                {product.subcategory && (
                                  <Badge variant="outline">{product.subcategory}</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                                <Badge variant={product.inStock ? "default" : "secondary"}>
                                  {product.inStock ? "In Stock" : "Out of Stock"}
                                </Badge>
                              </div>

                              {product.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {product.description}
                                </p>
                              )}

                              {/* Photo display */}
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-32 object-cover rounded mt-2"
                                />
                              )}

                              {/* Audio player */}
                              {product.audioRecording && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => playAudio(product.audioRecording!, product.id)}
                                    className="flex items-center gap-1"
                                  >
                                    {playingAudio === product.id ? (
                                      <Pause className="h-4 w-4" />
                                    ) : (
                                      <Play className="h-4 w-4" />
                                    )}
                                    Audio
                                  </Button>
                                </div>
                              )}
                            </div>

                            <Button
                              onClick={() => onBuyProduct(product)}
                              disabled={!product.inStock}
                              className="w-full"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Expenses
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
