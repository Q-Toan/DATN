import { Facebook, Mail, MapPin, Phone, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-primary/20 text-foreground pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Col 1 - Brand */}
          <div className="space-y-8">
            <div className="group inline-block">
              <span className="text-4xl font-black italic tracking-tighter text-primary">SNEAKER SHOWCASE /</span>
              <div className="h-1 w-0 group-hover:w-full bg-primary transition-all duration-300" />
            </div>
            <p className="text-[11px] font-bold text-muted-foreground leading-relaxed uppercase tracking-widest max-w-xs">
              AUTHENTIC SNEAKERS. ENGINEERED PERFORMANCE. STREETWEAR ESSENTIALS. 
              ESTABLISHED 2026 // SYSTEM VERIFIED.
            </p>
            <div className="flex gap-6 items-center">
              <a href="#" className="hover:text-primary transition-colors duration-300" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary transition-colors duration-300" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary transition-colors duration-300" aria-label="Youtube"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Col 2 - Categories */}
          <div>
            <h3 className="text-[10px] font-black tracking-[0.4em] text-primary uppercase mb-8">NAVIGATION</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-xs font-bold hover:text-primary transition-colors">BEST SELLERS</a></li>
              <li><a href="#" className="text-xs font-bold hover:text-primary transition-colors">NEW ARRIVALS</a></li>
              <li><a href="#" className="text-xs font-bold hover:text-primary transition-colors">FEATURED DROPS</a></li>
              <li><a href="#" className="text-xs font-bold hover:text-primary transition-colors">SALE ARCHIVE</a></li>
            </ul>
          </div>

          {/* Col 3 - Studio */}
          <div>
            <h3 className="text-[10px] font-black tracking-[0.4em] text-primary uppercase mb-8">STUDIO</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-xs font-bold hover:text-primary transition-colors">ABOUT US</a></li>
              <li><a href="#" className="text-xs font-bold hover:text-primary transition-colors">CAREERS</a></li>
              <li><a href="#" className="text-xs font-bold hover:text-primary transition-colors">SUSTAINABILITY</a></li>
              <li><a href="#" className="text-xs font-bold hover:text-primary transition-colors">TERMS OF SERVICE</a></li>
            </ul>
          </div>

          {/* Col 4 - Global Support */}
          <div>
            <h3 className="text-[10px] font-black tracking-[0.4em] text-primary uppercase mb-8">SUPPORT</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-xs font-bold leading-tight uppercase">123 URBAN ARCHIVE, SUITE 8, SAIGON CITY</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-xs font-bold uppercase">+84 1900 1234</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-xs font-bold uppercase">STUDIO@SNEAKERSHOWCASE.IO</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-primary/20 pt-12 gap-8">
           <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              © 2026 SNEAKERSHOWCASE STUDIO // ALL RIGHTS RESERVED
           </div>
           <div className="flex gap-8 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              <a href="#" className="hover:text-primary transition-colors">PRIVACY POLICY</a>
              <a href="#" className="hover:text-primary transition-colors">COOKIE SETTINGS</a>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
