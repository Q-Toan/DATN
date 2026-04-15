import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Package, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  // Protect the page - if no orderId is present and not in dev, maybe redirect?
  // But for better UX, we'll just show a generic success if accessed directly.
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center pt-52 pb-24 px-6 relative overflow-hidden">
        {/* MASSIVE BACKGROUND TEXT */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
          <h1 className="text-[25vw] font-black tracking-tighter italic leading-none">SUCCESS</h1>
        </div>

        <div className="max-w-4xl w-full relative z-10">
          <div className="flex flex-col items-center text-center space-y-12">
            
            {/* SUCCESS ICON BLOCK */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
              <CheckCircle2 className="w-32 h-32 text-primary relative z-10 stroke-[1px]" />
            </div>

            {/* MAIN ANNOUNCEMENT */}
            <div className="space-y-4">
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
                PROCUREMENT <br />
                <span className="text-primary text-glow">SUCCESSFUL</span>
              </h2>
              <div className="flex items-center justify-center gap-4 text-[10px] font-black tracking-[0.5em] text-muted-foreground uppercase pt-4">
                <span className="w-12 h-[1px] bg-primary/20" />
                SYSTEM STATUS: SETTLED // BATCH ID {Math.floor(Math.random() * 9000) + 1000}
                <span className="w-12 h-[1px] bg-primary/20" />
              </div>
            </div>

            {/* ORDER INFO BLOCK */}
            <div className="w-full bg-secondary/30 border-2 border-primary/20 p-8 md:p-12 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Package className="w-24 h-24 rotate-12" />
              </div>
              
              <div className="space-y-2 text-left relative z-10">
                <span className="text-[10px] font-black text-primary tracking-widest uppercase italic">[TRANSACTION IDENTIFIER]</span>
                <div className="bg-black/50 border border-primary/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <code className="text-xl md:text-2xl font-mono font-black tracking-tighter text-primary">
                    {orderId || "UNSPECIFIED ID 0xFFFFFF"}
                  </code>
                  <div className="text-[8px] font-black text-muted-foreground tracking-[0.3em] uppercase">
                    ENCRYPTION: AES 256 GCM
                  </div>
                </div>
              </div>

              <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-2xl mx-auto italic">
                Your acquisition request has been logged and synchronized with the decentralized logistics network. 
                Our dispatch units are currently preparing your assets for strategic deployment.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
              <Link to="/products" className="flex-1">
                <Button className="w-full h-20 bg-primary text-black rounded-none font-black text-lg italic tracking-tighter uppercase group relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5" /> RETURN TO ARCHIVE
                  </span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Button>
              </Link>
              <Link to="/my-orders" className="flex-1">
                <Button variant="outline" className="w-full h-20 border-2 border-primary/20 bg-transparent text-foreground rounded-none font-black text-lg italic tracking-tighter uppercase group relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    VIEW PROTOCOLS <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Button>
              </Link>
            </div>

            {/* FOOTER DECORATION */}
            <div className="pt-12 flex items-center gap-8">
               <div className="flex flex-col items-center gap-2">
                 <Home className="w-4 h-4 text-primary/40 cursor-pointer hover:text-primary transition-colors" onClick={() => navigate("/")} />
                 <span className="text-[8px] font-bold text-muted-foreground tracking-widest uppercase">ROOT</span>
               </div>
               <div className="w-24 h-[1px] bg-primary/10" />
               <span className="text-[8px] font-black text-primary/40 tracking-[0.6em] uppercase">SECURE GATEWAY V3</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
