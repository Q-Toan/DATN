import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] bg-background flex flex-col justify-center overflow-hidden border-b border-primary/10">
      {/* BACKGROUND TEXT - FRAGMENTED */}
      <div className="absolute inset-0 flex flex-col justify-center pointer-events-none opacity-[0.03] select-none">
        <span className="text-[25vw] font-black tracking-tighter leading-none -ml-20">URBAN</span>
        <span className="text-[25vw] font-black tracking-tighter leading-none self-end -mr-20">MOTION</span>
      </div>

      <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* ASYMMETRIC CONTENT BLOCK */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="space-y-0 relative">
            <h2 className="text-primary text-xs font-black tracking-[0.5em] mb-4 animate-in fade-in slide-in-from-left-4 duration-300">
              ©2026 EDITION / ARCHIVE 01
            </h2>
            <h1 className="text-massive font-black italic text-glow animate-in fade-in slide-in-from-left-8 duration-400 delay-100">
              SPEED.<br />
              <span className="text-foreground not-italic ml-8 md:ml-16">LIMIT.</span><br />
              <span className="text-primary tracking-[-0.05em]">ZERO.</span>
            </h1>
          </div>

          <div className="mt-12 max-w-md animate-in fade-in slide-in-from-up-4 duration-500 delay-200">
            <p className="text-muted-foreground text-sm font-medium leading-relaxed border-l-2 border-primary pl-6">
              ENGINEERED FOR THE URBAN FRAGMENT. DISRUPTING THE SYMMETRY OF PERFORMANCE FOOTWEAR. 
              NO COMPROMISE. NO RESTRAINT.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary text-black font-black tracking-tighter hover:scale-105 active:scale-95 transition-all h-14 px-10">
                VIEW ARCHIVE
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-foreground font-black tracking-tighter hover:bg-foreground hover:text-background h-14 px-10">
                LATEST DROP
              </Button>
            </div>
          </div>
        </div>

        {/* ASYMMETRIC VISUAL - STAGGERED */}
        <div className="lg:col-span-4 relative mt-12 lg:mt-0 group">
          <div className="relative z-20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500 ease-out animate-in zoom-in fade-in duration-500 delay-300">
            <img 
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" 
              alt="Ultimate Urban Shoe" 
              className="w-full drop-shadow-[0_0_50px_rgba(var(--primary),0.3)] filter brightness-110"
            />
          </div>
          
          {/* ASYMMETRIC DECORATION */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-primary/10 -rotate-6 z-10 pointer-events-none group-hover:rotate-6 transition-transform duration-500" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border-2 border-primary/10 rotate-12 z-10 pointer-events-none group-hover:rotate-45 transition-transform duration-500" />
          
          <div className="absolute top-0 right-0 bg-primary px-4 py-2 text-black font-black text-xs rotate-12 z-30">
            $199.00
          </div>
          <div className="absolute bottom-0 left-0 border-2 border-primary px-4 py-2 text-primary font-black text-xs -rotate-12 z-30">
            IN STOCK
          </div>
        </div>
      </div>

      {/* FOOTER INDICATOR */}
      <div className="absolute bottom-12 right-12 hidden lg:flex flex-col items-end gap-2 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
        <div className="w-24 h-[1px] bg-primary/30 mb-2" />
        <span>SCROLL TO EXPLORE</span>
        <span>01 // 05</span>
      </div>
    </section>
  );
};


export default HeroSection;

