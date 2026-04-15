import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import ProductSection from "@/components/sections/ProductSection";
import BannerSection from "@/components/sections/BannerSection";
import BlogSection from "@/components/sections/BlogSection";
import ReviewSection from "@/components/sections/ReviewSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["home-products"],
    queryFn: async () => {
      const response = await api.get("/products", {
        params: { limit: 12 }
      });
      return response.data.products;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 pt-40">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <span className="text-xs font-black tracking-[0.5em] text-primary/40 animate-pulse uppercase">SYNCHRONIZING SHOWCASE...</span>
        </main>
        <Footer />
      </div>
    );
  }

  // Fallback or empty state
  const products = data || [];
  const bestSellers = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);
  const featuredProducts = products.slice(8, 12);

  return (
    <div className="min-h-screen bg-background lowercase">
      <Header />

      <main className="space-y-32 md:space-y-64 pb-32 pt-52">
        <section className="animate-in fade-in duration-300">
          <HeroSection />
        </section>

        <section className="container mx-auto px-4 animate-in fade-in slide-in-from-bottom-12 duration-300 delay-100">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-primary/20 pb-8 uppercase">
            <h2 className="text-6xl md:text-8xl font-black text-primary leading-none tracking-tighter uppercase italic">
              BEST<br />SELLERS
            </h2>
            <p className="text-muted-foreground text-xs font-black tracking-widest mt-4 md:mt-0 uppercase">
              01 // POPULAR DEMAND
            </p>
          </div>
          {bestSellers.length > 0 ? (
            <ProductSection products={bestSellers} />
          ) : (
             <div className="h-64 border-2 border-dashed border-primary/10 flex items-center justify-center text-xs font-black text-primary/40 uppercase tracking-widest">
                NO ASSETS LOADED IN CATEGORY // 0x0
             </div>
          )}
        </section>

        <section className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
          <BannerSection
            image="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1400&q=80"
            alt="PROMOTIONAL BANNER 1"
          />
        </section>

        <section className="container mx-auto px-4 animate-in fade-in slide-in-from-bottom-12 duration-300">
          <div className="flex flex-col md:flex-row-reverse justify-between items-end mb-12 border-b border-primary/20 pb-8 gap-4 uppercase">
            <h2 className="text-6xl md:text-8xl font-black text-foreground leading-none tracking-tighter text-right uppercase italic">
              NEW<br />ARRIVALS
            </h2>
            <p className="text-muted-foreground text-xs font-black tracking-widest text-left uppercase">
              02 // LATEST RELEASES
            </p>
          </div>
          {newArrivals.length > 0 ? (
            <ProductSection products={newArrivals} />
          ) : (
            <div className="h-64 border-2 border-dashed border-primary/10 flex items-center justify-center text-xs font-black text-primary/40 uppercase tracking-widest">
               WAITING FOR SHIPMENT // VOID
            </div>
          )}
        </section>

        <section className="clip-path-asymmetric bg-secondary py-24">
          <BannerSection
            image="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1400&q=80"
            alt="PROMOTIONAL BANNER 2"
          />
        </section>

        <section className="container mx-auto px-4 uppercase">
          <div className="mb-24">
             <h2 className="text-massive text-glow opacity-10 leading-none select-none uppercase">FEATURED</h2>
             <div className="-mt-16 md:-mt-32">
                {featuredProducts.length > 0 ? (
                  <ProductSection products={featuredProducts} />
                ) : (
                  <div className="h-64 border-2 border-dashed border-primary/10 flex items-center justify-center text-xs font-black text-primary/40 uppercase tracking-widest mt-32">
                     FEATURED ASSETS NOT FOUND // SCANNING...
                  </div>
                )}
             </div>
          </div>
        </section>

        <section className="bg-primary text-black py-32 uppercase">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
             <div className="space-y-8">
                <h2 className="text-7xl font-black tracking-tighter leading-none uppercase italic">THE BLOG</h2>
                <p className="font-bold text-sm leading-relaxed max-w-sm uppercase">
                   STAY UPDATED WITH THE LATEST TRENDS, PRODUCT DROPS, AND INDUSTRY NEWS. 
                   DIRECT FROM THE SOURCE.
                </p>
             </div>
             <BlogSection hideHeader={true} />
          </div>
        </section>

        <section className="container mx-auto px-4">
          <ReviewSection />
        </section>

        <section className="bg-secondary p-12 md:p-24 border-y border-primary/10">
          <ContactSection />
        </section>
      </main>

      <Footer />
      <FloatingButtons />
    </div>
  );
};

export default Index;
