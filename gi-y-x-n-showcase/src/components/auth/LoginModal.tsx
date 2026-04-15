import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, User } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { LogIn, Loader2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  children?: React.ReactNode;
}

const LoginModal = ({ children }: LoginModalProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;
      
      login(token, user as User);
      
      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast.success("XÁC THỰC THÀNH CÔNG // ACCESS GRANTED");
      setOpen(false);

      // REDIRECT LOGIC
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/cart");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "XÁC THỰC THẤT BẠI // ACCESS DENIED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="h-14 px-8 border-primary/20 hover:bg-primary hover:text-black font-black tracking-widest text-[10px] uppercase transition-all">
            <LogIn className="w-4 h-4 mr-2" />
            LOGIN SYSTEM
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-background border-primary/50 border-2 rounded-none p-0 overflow-hidden">
        {/* GLITCH OVERLAY BACKGROUND */}
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        
        <DialogHeader className="p-8 border-b border-primary/20 relative">
           <DialogTitle className="text-4xl font-black italic tracking-tighter text-primary uppercase">
            AUTH TERMINAL
          </DialogTitle>
          <div className="text-[10px] font-bold text-muted-foreground mt-2 tracking-widest uppercase">
            ENTER CREDENTIALS TO ACCESS SECURE SESSION
          </div>
        </DialogHeader>

        <form onSubmit={handleLogin} className="p-8 space-y-8 relative">
          <div className="space-y-4">
            <div className="group relative">
              <Label className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2 block">
                [USER ID / EMAIL]
              </Label>
              <Input
                type="email"
                placeholder="USER@SYSTEM.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 transition-all font-mono text-sm placeholder:text-muted-foreground/30 disabled:opacity-50"
              />
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-500" />
            </div>

            <div className="group relative">
              <Label className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2 block">
                [ACCESS KEY / PASSWORD]
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 transition-all font-mono text-sm placeholder:text-muted-foreground/30 disabled:opacity-50"
              />
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-500" />
            </div>
          </div>

          <div className="flex items-center space-x-3 group">
            <Checkbox 
              id="remember" 
              checked={rememberMe} 
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-black rounded-none transition-all"
            />
            <Label 
              htmlFor="remember" 
              className="text-[10px] font-black text-muted-foreground group-hover:text-primary cursor-pointer uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <ShieldCheck className={`w-3 h-3 ${rememberMe ? "text-primary" : "text-primary/20"}`} />
              REMEMBER ACCOUNT DATA
            </Label>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 bg-primary text-black rounded-none font-black text-lg tracking-tighter hover:bg-white transition-all group overflow-hidden relative"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span className="relative z-10 uppercase italic tracking-tighter">LOGIN SYSTEM</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </>
            )}
          </Button>

          <div className="flex justify-between items-center text-[8px] font-black text-muted-foreground tracking-widest uppercase">
            <span>ENCRYPTION: AES-256</span>
            <span>SECURE LOGIN V2.4</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
