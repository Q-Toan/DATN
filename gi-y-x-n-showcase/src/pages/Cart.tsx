import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import { toast } from "sonner";
import { getAssetUrl } from "@/lib/utils";
import { useState } from "react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice, isLoading: isCartLoading } = useCart();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // CHECKOUT STATES
  const [fullName, setFullName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [couponCode, setCouponCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{ percent: number; code: string } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const response = await api.post("/coupons/validate", { code: couponCode });
      if (response.data.isValid) {
        setDiscountInfo({
          percent: response.data.discountPercent,
          code: response.data.code
        });
        toast.success(`PROTO: COUPON_VALIDATED // -${response.data.discountPercent}%`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "LỖI XÁC THỰC MÃ // INVALID_COUPON");
      setDiscountInfo(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const calculateDiscount = () => {
    if (!discountInfo) return 0;
    return (totalPrice * discountInfo.percent) / 100;
  };

  const finalTotal = totalPrice - calculateDiscount();

  const handleCheckout = async () => {
    if (!isAuthenticated) return;
    
    if (!fullName || !phoneNumber || !address) {
      toast.error("VUI LÒNG CUNG CẤP THÔNG TIN GIAO HÀNG // NULL_DATA_ERR");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const payload = {
        fullName,
        phoneNumber,
        address,
        paymentMethod,
        couponCode: discountInfo?.code
      };
      
      const response = await api.post("/orders/checkout", payload);
      toast.success("HỆ THỐNG ĐÃ KÍCH HOẠT ĐƠN HÀNG // ORDER_SUCCESS");
      clearCart();
      navigate("/order-success", { state: { orderId: response.data.id || response.data._id } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "LỖI THANH TOÁN // CHECKOUT_CRITICAL_FAILURE");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (isCartLoading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-40">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <span className="text-xs font-black tracking-[0.5em] text-primary/40 animate-pulse uppercase">RECONSTRUCTING BAG OBJECT...</span>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 pt-52 pb-24">
        {/* MASSIVE HEADER */}
        <div className="mb-24 relative uppercase">
          <h1 className="text-massive text-glow opacity-5 select-none leading-none">CHECKOUT</h1>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full flex justify-between items-end border-b border-primary/20 pb-8">
            <h2 className="text-6xl md:text-8xl font-black text-primary tracking-tighter uppercase italic">SHOPPING BAG</h2>
            <p className="text-[10px] font-black tracking-[0.5em] text-muted-foreground uppercase hidden md:block">CARGO READY // SEQ 7712</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-primary/10 uppercase">
            <ShoppingBag className="h-24 w-24 mx-auto text-primary/20 mb-8 animate-pulse" />
            <p className="text-2xl font-black text-muted-foreground mb-12 uppercase italic tracking-tighter">Your bag is currently empty // VOID</p>
            <Link to="/products">
              <Button className="h-16 px-12 bg-primary text-black rounded-none font-black tracking-widest text-sm hover:bg-white transition-all group uppercase">
                <ArrowLeft className="h-5 w-5 mr-3 group-hover:-translate-x-2 transition-transform" /> 
                GOTO COLLECTION
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-16 uppercase">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex justify-between items-center text-[10px] font-black text-primary tracking-widest uppercase border-b border-primary/10 pb-4">
                 <span>ASSET LISTING</span>
                 <span>BATCH TOTAL: {items.length}</span>
              </div>

              {items.map((item, index) => {
                if (!item?.product) return null;
                return (
                  <div key={`${item.product.id}-${index}`} className="group relative flex flex-col md:flex-row gap-8 bg-secondary/20 border border-primary/5 p-6 hover:border-primary/40 transition-all duration-500">
                    <Link to={`/products/${item.product.id}`} className="relative w-full md:w-48 aspect-square overflow-hidden bg-black flex-shrink-0 border border-primary/10">
                      <img src={getAssetUrl(item.product.image || (item.product.images && item.product.images[0]))} alt={item.product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                         <div className="space-y-2">
                            <span className="text-[10px] font-black text-primary/40 tracking-widest uppercase">CAT: {typeof item.product.category === 'object' ? item.product.category.name : item.product.category}</span>
                            <Link to={`/products/${item.product.id}`}>
                              <h3 className="text-3xl font-black tracking-tighter uppercase italic group-hover:text-primary transition-colors leading-none">{item.product.name}</h3>
                            </Link>
                            <div className="flex gap-4 mt-2">
                               {item.size && <span className="bg-primary/10 text-primary text-[8px] font-black px-2 py-1 uppercase tracking-widest border border-primary/20">SIZE {item.size}</span>}
                               {item.color && <span className="bg-primary/10 text-primary text-[8px] font-black px-2 py-1 uppercase tracking-widest border border-primary/20">COL {item.color}</span>}
                            </div>
                         </div>
                         <span className="text-2xl font-black tracking-tighter">{formatPrice(item.product.salePrice || item.product.price)}</span>
                      </div>
  
                      <div className="flex items-center justify-between mt-8 md:mt-0 pt-4 border-t border-primary/5">
                        <div className="flex items-center border border-primary/20 bg-background/50 h-12">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size, item.color)} className="h-full px-4 hover:bg-primary hover:text-black transition-all border-r border-primary/20 group uppercase">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center text-sm font-black italic">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size, item.color)} className="h-full px-4 hover:bg-primary hover:text-black transition-all border-l border-primary/20 group uppercase">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <Button variant="ghost" className="text-destructive font-black text-[10px] tracking-widest uppercase hover:bg-destructive/10 rounded-none group" onClick={() => removeFromCart(item.product.id, item.size, item.color)}>
                          <Trash2 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                          PURGE ASSET
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* CHECKOUT PROTOCOL SECTION */}
              {isAuthenticated && (
                <div className="space-y-12 pt-16 border-t-2 border-primary/10">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">[DISPATCH_DETAILS]</h3>
                    <span className="text-[10px] font-bold text-primary/60 tracking-[0.4em] uppercase">SYSTEM_LOCATION_INTAKE // v2.0</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-primary tracking-widest uppercase">[RECEIVER_NAME]</Label>
                        <Input 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="FULL_IDENTITY_HERE"
                          className="bg-secondary/20 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 font-mono text-sm uppercase"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-primary tracking-widest uppercase">[COMM_CHANNEL_PHONE]</Label>
                        <Input 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+84_000_000_000"
                          className="bg-secondary/20 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 font-mono text-sm uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-primary tracking-widest uppercase">[COORDINATES_ADDRESS]</Label>
                        <textarea 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="GEO_LOCATION_PRECISE"
                          className="w-full bg-secondary/20 border border-primary/20 rounded-none h-[124px] p-4 focus:border-primary focus:outline-none font-mono text-sm uppercase resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 space-y-6">
                    <Label className="text-[10px] font-black text-primary tracking-widest uppercase">[EXCHANGE_PROTOCOL // PAYMENT]</Label>
                    <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)} className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 flex items-center space-x-4 border-2 border-primary/10 p-6 group hover:border-primary/40 transition-all cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <RadioGroupItem value="COD" id="cod" className="border-primary text-primary" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <span className="block text-sm font-black italic uppercase tracking-tighter">CASH_ON_DELIVERY</span>
                          <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">SETTLE_ON_ARRIVAL</span>
                        </Label>
                      </div>
                      <div className="flex-1 flex items-center space-x-4 border-2 border-primary/10 p-6 group hover:border-primary/40 transition-all cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <RadioGroupItem value="ONLINE" id="online" className="border-primary text-primary" />
                        <Label htmlFor="online" className="flex-1 cursor-pointer">
                          <span className="block text-sm font-black italic uppercase tracking-tighter">SECURE_ONLINE</span>
                          <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">CRYPTO_OR_FIAT_V3</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-8 uppercase">
                 <Link to="/products" className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> CONTINUE ARCHIVE LOAD
                 </Link>
                 <Button variant="outline" className="text-destructive border-destructive/20 rounded-none font-black text-[10px] tracking-widest uppercase hover:bg-destructive/10" onClick={clearCart}>
                    TERMINATE ALL
                 </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-4 h-fit sticky top-32 uppercase">
              <div className="bg-secondary/30 border-2 border-primary/20 p-8 space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none border-b border-primary/20 pb-4">SUMMARY</h2>
                  
                  <div className="py-6 space-y-4 border-b border-primary/10">
                    <Label className="text-[10px] font-black text-primary tracking-widest uppercase">[PROMO_CODE_VAULT]</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="ENTER_VOUCHER_KEY"
                        className="bg-secondary/20 border-primary/20 rounded-none h-12 focus:border-primary focus:ring-0 font-mono text-[10px] uppercase"
                      />
                      <Button 
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon}
                        className="bg-primary text-black rounded-none h-12 font-black text-[10px] tracking-widest uppercase hover:bg-white transition-all"
                      >
                        {isValidatingCoupon ? <Loader2 className="animate-spin h-4 w-4" /> : "APPLY"}
                      </Button>
                    </div>
                    {discountInfo && (
                      <div className="flex justify-between items-center text-[10px] font-black text-primary animate-pulse italic">
                        <span>COUPON_ACTIVE: {discountInfo.code}</span>
                        <span>-{discountInfo.percent}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-[10px] font-black text-muted-foreground tracking-widest uppercase mt-6">
                    <span>NET TOTAL</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  {discountInfo && (
                    <div className="flex justify-between text-[10px] font-black text-primary tracking-widest uppercase">
                      <span>DISCOUNT_VAL</span>
                      <span>-{formatPrice(calculateDiscount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                    <span>LOGISTICS FEE</span>
                    <span className="text-primary tracking-widest uppercase">GATE PASSED</span>
                  </div>
                  <div className="pt-6 mt-6 border-t-4 border-primary flex justify-between">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">FINAL CALCULATION</span>
                       <span className="text-5xl font-black text-foreground tracking-tighter italic uppercase">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* AUTH GATE FOR CHECKOUT */}
                {isAuthenticated ? (
                  <Button 
                    className="w-full h-20 bg-primary text-black rounded-none font-black text-xl italic tracking-tighter uppercase group relative overflow-hidden uppercase" 
                    onClick={handleCheckout}
                    disabled={isCheckoutLoading}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-4">
                      {isCheckoutLoading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                        <>PROCURE ITEMS <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" /></>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Button>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-destructive/10 border border-destructive/20 p-4 flex gap-3 items-start">
                       <ShieldCheck className="w-5 h-5 text-destructive flex-shrink-0" />
                       <span className="text-[9px] font-black text-destructive uppercase tracking-widest leading-loose">
                         AUTHENTICATION REQUIRED // YOU MUST INITIALIZE A SESSION TO ACCESS CHECKOUT PROTOCOL.
                       </span>
                    </div>
                    <LoginModal>
                      <Button className="w-full h-20 bg-primary text-black rounded-none font-black text-xl italic tracking-tighter uppercase group relative overflow-hidden uppercase">
                        <span className="relative z-10">INITIALIZE TO PROCURE</span>
                        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      </Button>
                    </LoginModal>
                  </div>
                )}
                
                <div className="space-y-2 text-[8px] font-black text-muted-foreground tracking-widest uppercase">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span>SECURE ENCRYPTION ACTIVE</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span>GATEWAY CONNECTED: [VND PROTO]</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
