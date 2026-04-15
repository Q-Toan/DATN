interface BannerSectionProps {
  image: string;
  alt: string;
}

const BannerSection = ({ image, alt }: BannerSectionProps) => {
  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[32/9] overflow-hidden group border-y border-primary/20 bg-background">
      <img
        src={image}
        alt={alt}
        className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105 transition-all duration-400 ease-out"
        loading="lazy"
      />
      
      {/* RADIANT SCANLINE EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* ASYMMETRIC TEXT OVERLAY */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="text-center space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-primary text-4xl md:text-7xl font-black italic tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
               DROP INCOMING
            </h3>
            <span className="text-white text-[10px] font-black tracking-[0.5em] block opacity-0 group-hover:opacity-100 transition-opacity delay-100 uppercase">
               SYSTEM VERIFIED // 2026.04
            </span>
         </div>
      </div>
      
      {/* SHARP FRAME */}
      <div className="absolute inset-4 border border-primary/20 pointer-events-none group-hover:inset-6 transition-all duration-300" />

    </div>
  );
};

export default BannerSection;

