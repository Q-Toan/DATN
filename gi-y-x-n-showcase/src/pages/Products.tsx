import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, ArrowUpRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart, Product } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { getAssetUrl } from "@/lib/utils";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const categories = [
  { value: "all", label: "TẤT CẢ ARCHIVE" },
  { value: "Shoes", label: "GIÀY KINETIC" },
  { value: "Clothing", label: "TRANG PHỤC" },
  { value: "Accessories", label: "PHỤ KIỆN" },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const initialCategory = searchParams.get("category") || "all";
  const [category, setCategory] = useState(initialCategory);
  
  // Sync state with URL params
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "all";
    if (urlCategory !== category) {
      setCategory(urlCategory);
    }
  }, [searchParams]);

  // Update URL when category changes via Select
  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (val === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", val);
    }
    setSearchParams(searchParams);
  };
  const [sort, setSort] = useState("default");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/products", {
        params: { limit: 100 } // Get a larger set for local filtering/sorting
      });
      return response.data.products;
    },
  });

  const filtered = useMemo(() => {
    let list = Array.isArray(products) ? products : [];
    if (category !== "all") {
      list = list.filter((p: Product) => {
        const pCat = typeof p.category === 'object' ? p.category.name : p.category;
        return pCat === category;
      });
    }
    if (search) list = list.filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()));
    
    if (sort === "price-asc") list = [...list].sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    if (sort === "price-desc") list = [...list].sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    return list;
  }, [search, category, sort, products]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* pt-40 to ensure content starts below fixed navbar */}
      <main className="container mx-auto px-6 pt-52 pb-24">
        {/* MASSIVE HEADER */}
        <div className="mb-24 relative">
          <h1 className="text-massive text-glow opacity-5 select-none leading-none">COLLECTION</h1>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full flex justify-between items-end border-b border-primary/20 pb-8">
            <h2 className="text-6xl md:text-8xl font-black text-primary tracking-tighter uppercase italic">THE CATALOG</h2>
            <p className="text-[10px] font-black tracking-[0.5em] text-muted-foreground uppercase hidden md:block">SYSTEM STATUS: STABLE // ASSETS LOADED</p>
          </div>
        </div>

        {/* Filters: BRUTALIST STYLE */}
        <div className="flex flex-col md:flex-row gap-6 mb-16 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="SEARCH PRODUCT ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-14 h-16 bg-secondary/30 border-primary/20 rounded-none focus:border-primary focus:ring-0 font-mono tracking-widest text-sm uppercase"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-16 w-full md:w-64 bg-secondary/30 border-primary/20 rounded-none font-black text-[10px] tracking-widest uppercase">
                <SlidersHorizontal className="h-4 w-4 mr-3 text-primary" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-primary/20 rounded-none">
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-black">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-16 w-full md:w-56 bg-secondary/30 border-primary/20 rounded-none font-black text-[10px] tracking-widest uppercase">
                <SelectValue placeholder="SORT BY" />
              </SelectTrigger>
              <SelectContent className="bg-background border-primary/20 rounded-none">
                <SelectItem value="default" className="font-black text-[10px] uppercase tracking-widest">DEFAULT ORDER</SelectItem>
                <SelectItem value="price-asc" className="font-black text-[10px] uppercase tracking-widest">PRICE LOW TO HIGH</SelectItem>
                <SelectItem value="price-desc" className="font-black text-[10px] uppercase tracking-widest">PRICE HIGH TO LOW</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <span className="text-xs font-black tracking-[0.5em] text-primary/40 animate-pulse">FETCHING DATA FROM GRID...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-primary/10 pb-4 mb-12">
               <span className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase">FOUND: {filtered.length} ASSETS IN CACHE</span>
               <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">STATUS: SYNCED</span>
            </div>

            {/* Product Grid: SMALLER CARDS AND REASONABLE SPACING */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
              {filtered.map((product: any) => (
                <div key={product.id} className="group relative flex flex-col">
                  {/* BRUTALIST PRODUCT FRAME - SMALLER ASPECT */}
                  <Link to={`/products/${product.id}`} className="relative aspect-[4/5] overflow-hidden border border-primary/10 bg-secondary/20">
                    <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full bg-primary/5 transition-all duration-500 ease-out z-10" />
                    <img 
                      src={getAssetUrl(product.images?.[0] || product.image)} 
                      alt={product.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                      loading="lazy" 
                    />
                    
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
                       <Badge className="bg-black text-primary text-[6px] font-black rounded-none border border-primary/20 uppercase tracking-widest px-1.5 py-0.5">
                         {typeof product.category === 'object' ? product.category.name : product.category}
                       </Badge>
                    </div>
                    
                    <div className="absolute bottom-0 right-0 p-3 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <div className="bg-primary p-2 text-black shadow-2xl">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>

                  <div className="mt-4 flex flex-col gap-2">
                    <Link to={`/products/${product.id}`} className="flex flex-col gap-0.5">
                      <span className="text-[7px] font-black text-primary/50 tracking-[0.2em] uppercase">{product.id.substring(0, 8)} // REF</span>
                      <h3 className="text-sm font-black tracking-tighter text-foreground group-hover:text-primary transition-colors line-clamp-1 uppercase italic">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-end justify-between border-t border-primary/10 pt-2 mt-1">
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-muted-foreground tracking-widest uppercase mb-0.5">UNIT PRICE</span>
                        <span className="text-base font-black text-foreground tracking-tighter">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <Link to={`/products/${product.id}`}>
                        <Button variant="outline" className="rounded-none border-primary/20 hover:bg-primary hover:text-black font-black text-[7px] tracking-widest p-0 w-8 h-8 flex items-center justify-center transition-all uppercase">
                          GO_
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Products;
