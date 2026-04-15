import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Minus, Plus, ChevronLeft, ArrowRight, Loader2, Maximize2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getAssetUrl } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import BlogSection from "@/components/sections/BlogSection";
import ReviewSection from "@/components/sections/ReviewSection";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

// ASSET HELPERS

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      const data = response.data;
      
      // Auto-select first options if not set
      if (data.sizes?.length > 0 && !selectedSize) setSelectedSize(data.sizes[0]);
      if (data.colors?.length > 0 && !selectedColor) setSelectedColor(data.colors[0]);
      
      return data;
    },
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 pt-52">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <span className="text-xs font-black tracking-[0.5em] text-primary/40 animate-pulse uppercase">DECRYPTING ASSET DATA...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-32 text-center pt-52">
          <h1 className="text-massive opacity-10 select-none leading-none mb-12 uppercase italic">404 NOT FOUND</h1>
          <h2 className="text-4xl font-black text-foreground mb-12 uppercase tracking-tighter italic">PRODUCT_NOT_EXIST // ERROR REF 0x23</h2>
          <Button 
            className="h-16 px-12 bg-primary text-black rounded-none font-black tracking-widest text-sm hover:bg-white transition-all uppercase"
            onClick={() => navigate("/products")}
          >
            <ChevronLeft className="h-5 w-5 mr-3" /> 
            BACK TO ARCHIVE
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-52 pb-12 uppercase">
        {/* TOP INTERFACE */}
        <div className="container mx-auto px-6 mb-2 flex justify-between items-end border-b border-primary/20 pb-1 uppercase">
           <div className="flex flex-col">
             <Link to="/products" className="flex items-center gap-1 text-[8px] font-black text-primary/40 hover:text-primary transition-colors tracking-widest uppercase mb-1 group">
               <ChevronLeft className="w-2 h-2 group-hover:-translate-x-1 transition-transform" />
               BACK
             </Link>
             <h1 className="text-xl md:text-2xl lg:text-3xl font-black italic tracking-tighter text-foreground leading-none uppercase">
               {product.name}
             </h1>
           </div>
           <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] font-black text-primary/40 tracking-[0.4em] mb-2 uppercase">SYNC STATUS: ACTIVE</span>
              <span className="text-[10px] font-black text-muted-foreground uppercase">REF ID: {product.id.substring(0, 16)}</span>
           </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 container mx-auto px-6 mb-8">
          {/* IMAGE GRID */}
          <div className="lg:col-span-5 space-y-2">
            <div className="relative aspect-square max-h-[380px] bg-secondary/20 border border-primary/10 overflow-hidden group">
               <div className="absolute inset-0 bg-primary/5 pointer-events-none z-10" />
               <img 
                 src={getAssetUrl(product.images?.[0] || product.image)} 
                 alt={product.name} 
                 className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
               />
               <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  <Badge className="bg-primary text-black text-xs font-black rounded-none px-4 py-2 uppercase tracking-widest border-none">
                    {typeof product.category === 'object' ? product.category.name : product.category}
                  </Badge>
                  <div className="bg-black/80 backdrop-blur-md p-2 border border-primary/20 flex flex-col items-center justify-center">
                     <span className="text-[8px] font-black text-primary uppercase">STOCK</span>
                     <span className="text-base font-black">{product.stock}</span>
                  </div>
               </div>
               <button className="absolute bottom-4 right-4 z-20 bg-black/80 p-4 text-primary hover:bg-primary hover:text-black transition-all">
                  <Maximize2 className="w-4 h-4" />
               </button>
            </div>
          </div>

          {/* DETAIL CONTROLS */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            <div className="mb-3">
               <span className="text-[8px] font-black text-primary tracking-[0.4em] mb-0.5 block uppercase leading-none">DESCRIPTION</span>
               <p className="text-xs font-medium text-foreground/70 leading-relaxed uppercase tracking-tight line-clamp-2">
                 {product.description || "TRANG THIẾT BỊ CAO CẤP PHỤC VỤ CÁC HOẠT ĐỘNG THỂ THAO VÀ THỜI TRANG ĐƯỜNG PHỐ."}
               </p>
            </div>

            <div className="space-y-3">
               <div className="flex items-end justify-between border-b border-primary pb-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary tracking-[0.4em] mb-1 uppercase">UNIT PRICE</span>
                    <span className="text-2xl md:text-3xl font-black tracking-tighter leading-none">
                       {formatPrice(product.price)}
                    </span>
                  </div>
               </div>

               {/* SELECTION MODAL TRIGGER */}
               <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                 <DialogTrigger asChild>
                    <Button className="w-full h-10 bg-primary text-black rounded-none group relative overflow-hidden transition-all duration-500">
                       <span className="relative z-10 text-lg font-black tracking-tighter italic uppercase flex items-center gap-2">
                         ADD TO BAG <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" />
                       </span>
                       <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Button>
                 </DialogTrigger>
                 <DialogContent className="max-w-lg bg-background border-primary border-4 rounded-none p-0 overflow-hidden uppercase">
                    <DialogHeader className="p-5 border-b border-primary/20">
                       <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none">CONFIGURATION</DialogTitle>
                       <p className="text-[10px] font-black text-muted-foreground tracking-[0.3em] mt-1 uppercase">SPECIFY PARAMETERS FOR PROCUREMENT</p>
                    </DialogHeader>

                    <div className="p-5 space-y-4">
                       {/* SIZE SELECTION */}
                       <div className="space-y-4">
                         <div className="flex justify-between items-center uppercase">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">SELECT SIZE ID</span>
                            <span className="text-[10px] text-muted-foreground italic uppercase">Current: EU {selectedSize}</span>
                         </div>
                         <div className="grid grid-cols-4 gap-2">
                            {(product.sizes || []).map((s) => (
                              <button
                                key={s}
                                onClick={() => setSelectedSize(s)}
                                className={`h-8 border font-black text-[10px] transition-all flex items-center justify-center ${
                                  selectedSize === s 
                                    ? "bg-primary text-black border-primary" 
                                    : "bg-secondary/30 border-primary/10 text-foreground hover:border-primary"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                         </div>
                       </div>

                       {/* COLOR SELECTION */}
                        <div className="space-y-4">
                           <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">COLOR SPECTRUM</span>
                           <div className="flex flex-wrap gap-2">
                              {(product.colors || []).map((c) => (
                                <button
                                  key={c}
                                  onClick={() => setSelectedColor(c)}
                                  className={`h-8 px-4 border font-black text-[10px] transition-all flex items-center justify-center uppercase ${
                                    selectedColor === c 
                                      ? "bg-primary text-black border-primary" 
                                      : "bg-secondary/30 border-primary/10 text-foreground hover:border-primary"
                                  }`}
                                >
                                  {c}
                                </button>
                              ))}
                           </div>
                           <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Active: {selectedColor}</span>
                        </div>

                       {/* QUANTITY */}
                       <div className="space-y-4">
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">LOAD UNITS</span>
                          <div className="flex items-center gap-4">
                             <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                                <Minus className="w-4 h-4" />
                             </button>
                             <span className="text-3xl font-black w-12 text-center leading-none tracking-tighter italic">{quantity}</span>
                             <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                                <Plus className="w-4 h-4" />
                             </button>
                          </div>
                       </div>

                       {/* DYNAMIC PRICE & CONFIRM */}
                       <div className="pt-4 border-t border-primary/20 flex flex-col gap-4 items-center">
                          <div className="text-center w-full uppercase">
                             <span className="text-[10px] font-black text-primary tracking-widest uppercase block">TOTAL CALCULATION</span>
                             <span className="text-3xl font-black text-foreground tracking-tighter italic uppercase">{formatPrice((product.salePrice || product.price) * quantity)}</span>
                          </div>
                          <Button 
                            className="w-full h-12 bg-primary text-black rounded-none font-black text-lg italic tracking-tighter uppercase hover:bg-white transition-all flex items-center justify-center gap-4 group uppercase"
                            onClick={handleAddToCart}
                          >
                            CONFIRM DEPOSIT <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                          </Button>
                       </div>
                    </div>
                 </DialogContent>
               </Dialog>

               <div className="flex flex-col gap-2 pt-8 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                  <div className="flex justify-between border-b border-primary/5 pb-2">
                     <span>AUTHENTICITY RATING</span>
                     <span className="text-secondary-foreground uppercase">100% SECURE</span>
                  </div>
                  <div className="flex justify-between border-b border-primary/5 pb-2">
                     <span>SHIPPING VECTOR</span>
                     <span className="text-secondary-foreground uppercase">GLOBAL PRIORITY</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* SOCIAL SECTIONS */}
        <div className="container mx-auto px-6 space-y-32">
          <section className="border-t border-primary/20 pt-24 uppercase">
            <div className="flex items-center gap-4 mb-16">
              <span className="h-px flex-1 bg-primary/20" />
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">COMMUNITY FEEDBACK</h2>
              <span className="h-px flex-1 bg-primary/20" />
            </div>
            <ReviewSection productId={id} hideHeader={true} />
          </section>

          <section className="border-t border-primary/20 pt-24 uppercase">
            <div className="flex items-center gap-4 mb-16">
              <span className="h-px flex-1 bg-primary/20" />
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">LATEST INSIGHTS</h2>
              <span className="h-px flex-1 bg-primary/20" />
            </div>
            <BlogSection hideHeader={true} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
