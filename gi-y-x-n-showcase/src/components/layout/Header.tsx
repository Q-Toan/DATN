import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, LogOut, Menu, X, ShoppingBag, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import LoginModal from "@/components/auth/LoginModal";

const navLinks = [
  { id: "01", name: "HOME", href: "/" },
  { id: "02", name: "COLLECTION", href: "/products" },
  { id: "03", name: "ORDERS", href: "/my-orders" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Artificial delay for loading effect
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Perform clean logout
    logout();
    toast.success("HỆ THỐNG ĐÃ ĐĂNG XUẤT // REBOOTING SESSION");
    
    // Use hard reset to prevent state paradoxes and blank screens
    window.location.href = "/";
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled 
          ? "bg-background/95 backdrop-blur-xl py-4 border-b border-primary/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
          : "bg-transparent py-10"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* LOGO: RAW TECH BRUTALISM */}
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex flex-col leading-none">
            <span className="text-4xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors uppercase">
              GIAY <span className="text-primary group-hover:text-foreground">XIN</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="h-[2px] flex-1 bg-primary" />
              <span className="text-[8px] font-black tracking-[0.3em] text-muted-foreground uppercase">ARCHIVE 2026</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-12">
          {/* NAV: ASYMMETRIC RIGHT-ALIGNED */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link, i) => (
              <div key={link.id} className="relative group">
                <Link
                  to={link.href}
                  className={cn(
                    "flex items-baseline gap-2 group transition-all duration-300",
                    i % 2 === 0 ? "hover:-translate-y-1" : "hover:translate-y-1"
                  )}
                >
                  <span className="text-[8px] font-black text-primary opacity-40 group-hover:opacity-100 transition-opacity">
                    [{link.id}]
                  </span>
                  <span className="text-[10px] font-black tracking-[0.4em] text-foreground group-hover:text-primary transition-colors flex items-center uppercase">
                    {link.name}
                  </span>
                </Link>

                {/* DROPDOWN FOR COLLECTION */}
                {link.name === "COLLECTION" && (
                  <div className="absolute top-full left-0 pt-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-background border-2 border-primary w-64 p-6 space-y-4 shadow-[10px_10px_0px_rgba(var(--primary-rgb),0.2)]">
                      <div className="text-[8px] font-black text-primary tracking-[0.4em] uppercase mb-2 border-b border-primary/20 pb-2">CATEGORIES / NULL NULL</div>
                      <Link to="/products?category=Shoes" className="block text-xs font-black tracking-widest hover:text-primary transition-colors uppercase">01 // SHOES</Link>
                      <Link to="/products?category=Clothing" className="block text-xs font-black tracking-widest hover:text-primary transition-colors uppercase">02 // CLOTHING</Link>
                      <Link to="/products?category=Accessories" className="block text-xs font-black tracking-widest hover:text-primary transition-colors uppercase">03 // ACCESSORIES</Link>
                      <Link to="/products" className="block text-[8px] font-black tracking-[0.4em] text-primary/40 pt-4 border-t border-primary/10 uppercase">VIEW ALL SYSTEM ASSETS</Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
          
          {/* UTILITY MODULE */}
          <div className="flex items-center border border-primary/20 bg-background/50 h-14">
            <button className="h-full px-5 hover:bg-primary hover:text-black transition-all border-r border-primary/20 group">
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <Link to="/cart" className="h-full px-5 hover:bg-primary hover:text-black transition-all group flex items-center relative border-r border-primary/20">
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute top-2 right-2 bg-primary text-black text-[8px] font-black w-4 h-4 flex items-center justify-center group-hover:bg-white transition-colors">
                {totalItems}
              </span>
            </Link>

            {/* AUTH SECTION */}
            {isAuthenticated ? (
              <div className="flex items-center h-full">
                <Link 
                  to={isAdmin ? "/admin" : "/profile"} 
                  className="h-full px-5 hover:bg-primary hover:text-black transition-all border-r border-primary/20 flex items-center gap-2 group"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="text-[9px] font-black hidden xl:block uppercase truncate max-w-[80px]">
                    {user?.name || "PROFILE"}
                  </span>
                </Link>
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="h-full px-5 hover:bg-destructive hover:text-white transition-all group flex items-center disabled:opacity-50"
                  title="LOGOUT"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  )}
                </button>
              </div>
            ) : (
              <LoginModal>
                <button className="h-full px-8 hover:bg-primary hover:text-black transition-all font-black text-[10px] tracking-widest uppercase">
                  LOGIN SYSTEM
                </button>
              </LoginModal>
            )}
          </div>

          {/* MOBILE TRIGGER */}
          <button
            className="lg:hidden p-4 border border-primary/20 hover:bg-primary hover:text-black transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV - FULLSCREEN SYSTEM OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background z-[100] flex flex-col p-10 animate-in fade-in duration-300">
          <div className="flex justify-between items-start mb-20">
             <div className="text-3xl font-black italic text-primary tracking-tighter flex flex-col">
               <span>MENU ARCHIVE</span>
               <span className="text-[10px] text-muted-foreground not-italic tracking-[0.5em]">SYSTEM REV 1.4</span>
             </div>
             <button 
               onClick={() => setMobileMenuOpen(false)}
               className="p-4 border border-primary/20 hover:bg-primary hover:text-black transition-all"
             >
               <X className="h-8 w-8" />
             </button>
          </div>

          <nav className="flex flex-col gap-8">
            {navLinks.map((link, i) => (
              <Link 
                key={link.id} 
                to={link.href} 
                className="group flex flex-col"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xs font-black text-primary/40 leading-none">0{i+1}</span>
                <span className="text-6xl md:text-8xl font-black tracking-tighter text-foreground group-hover:text-primary group-hover:italic transition-all duration-300 leading-none">
                  {link.name}
                </span>
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto flex flex-col gap-10">
            {isAuthenticated ? (
               <div className="flex flex-col gap-4">
                 <div className="text-xs font-black text-primary tracking-widest uppercase mb-2 border-b border-primary/20 pb-2">CONNECTED SESSION</div>
                 <Link to="/profile" className="text-4xl font-black tracking-tighter" onClick={() => setMobileMenuOpen(false)}>MY PROFILE</Link>
                 <button onClick={handleLogout} className="text-4xl font-black tracking-tighter text-destructive text-left uppercase">LOGOUT UNSAFE</button>
               </div>
            ) : (
               <div className="flex flex-col gap-4">
                 <LoginModal>
                   <button className="text-7xl font-black text-primary italic tracking-tighter text-left uppercase">LOGIN</button>
                 </LoginModal>
               </div>
            )}

            <div className="pt-8 border-t border-primary/10 flex justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-primary tracking-widest uppercase">ENCRYPTED AUTH</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase">SESSION ACTIVE</span>
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-[10px] font-black hover:text-primary transition-colors">IG</a>
                <a href="#" className="text-[10px] font-black hover:text-primary transition-colors">FB</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

