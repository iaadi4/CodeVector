import { useState, useEffect } from 'react';
import { ShoppingBag, Search, ChevronRight, Package, Cpu, Sparkles, AlertCircle, ShoppingCart } from 'lucide-react';
import { cn } from './lib/utils';

// Constants
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Types
type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  createdAt: string;
  updatedAt: string;
};

type FetchResponse = {
  products: Product[];
  nextCursor: string | null;
  hasMore: boolean;
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when category changes (reset pagination)
  useEffect(() => {
    setProducts([]);
    setCursor(null);
    setHasMore(true);
    fetchProducts(null, activeCategory);
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async (currentCursor: string | null, category: string | null) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set('limit', '12');
      if (currentCursor) params.set('cursor', currentCursor);
      if (category) params.set('category', category);
      
      const res = await fetch(`${API_URL}/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      
      const data: FetchResponse = await res.json();
      
      setProducts(prev => currentCursor ? [...prev, ...data.products] : data.products);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchProducts(cursor, activeCategory);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 text-primary">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/40 shadow-lg shadow-primary/20">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">CodeVector</span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="h-10 w-64 rounded-full border border-border/50 bg-muted/30 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="relative p-2 rounded-full hover:bg-muted/50 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background"></span>
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
        {/* Hero Section */}
        <section className="relative mb-16 overflow-hidden rounded-3xl bg-gradient-to-br from-card to-card/50 border border-border/50 px-6 py-16 sm:px-12 sm:py-24 text-center md:text-left shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[20rem] w-[20rem] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 mx-auto max-w-3xl md:mx-0">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6 shadow-sm backdrop-blur-md">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Next-Gen Electronics
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 bg-gradient-to-br from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent">
              Empower Your <br className="hidden md:block" /> Digital Lifestyle
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              Discover the latest in premium technology. From high-performance computing to everyday smart devices, curated for excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95">
                Shop Collection
                <ChevronRight className="ml-2 h-4 w-4" />
              </button>
              <button className="inline-flex items-center justify-center rounded-full border border-border/50 bg-background/50 backdrop-blur-md px-8 py-3.5 text-sm font-medium shadow-sm transition-all hover:bg-muted/50 hover:border-border">
                View Deals
              </button>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Browse by Category</h2>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "snap-start flex-shrink-0 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300",
                activeCategory === null
                  ? "bg-foreground text-background shadow-md scale-105"
                  : "bg-card border border-border/50 hover:bg-muted hover:border-border text-muted-foreground hover:text-foreground"
              )}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "snap-start flex-shrink-0 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 capitalize",
                  activeCategory === category
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                    : "bg-card border border-border/50 hover:bg-muted hover:border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        {error && (
          <div className="flex items-center justify-center p-8 mb-8 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {products.length === 0 && !isLoading && !error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-border/50 bg-card/20">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or category selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div 
                key={product.id}
                className="group flex flex-col justify-between rounded-xl border border-border/40 bg-card p-5 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 hover:border-primary/30"
              >
                <div>
                  <div className="mb-3 inline-flex items-center rounded-md bg-muted/50 px-2 py-1 text-xs font-medium capitalize text-muted-foreground">
                    {product.category}
                  </div>
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </div>
                <div className="mt-6 flex items-end justify-between">
                  <p className="text-2xl font-bold tracking-tight">
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-full border border-border/50 bg-card px-8 py-3 text-sm font-medium shadow-sm transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  Load More Products
                  <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card mt-24">
        <div className="container mx-auto px-4 py-8 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Package className="h-5 w-5" />
            <span className="text-lg font-bold tracking-tight text-foreground">CodeVector</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CodeVector. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
