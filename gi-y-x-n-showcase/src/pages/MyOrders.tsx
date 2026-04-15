import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package, Search, ShoppingBag, Eye, Calendar, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPING" | "DELIVERED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const statusLabels: Record<string, string> = {
  PENDING: "CHỜ XỬ LÝ",
  PROCESSING: "ĐANG XỬ LÝ",
  SHIPPING: "ĐANG GIAO HÀNG",
  DELIVERED: "ĐÃ GIAO HÀNG",
  COMPLETED: "HOÀN THÀNH",
  CANCELLED: "ĐÃ HỦY",
};

const MyOrders = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const response = await api.get("/orders/my-orders");
      return response.data;
    },
    enabled: isAuthenticated
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "text-primary border-primary/20 bg-primary/5";
      case "CANCELLED": return "text-destructive border-destructive/20 bg-destructive/5";
      case "SHIPPING": return "text-blue-500 border-blue-500/20 bg-blue-500/5";
      default: return "text-yellow-500 border-yellow-500/20 bg-yellow-500/5";
    }
  };

  if (authLoading || (isAuthenticated && ordersLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 pt-52">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <span className="text-[10px] font-black tracking-[0.5em] text-primary/40 animate-pulse uppercase">SYNCHRONIZING SECURE TUNNEL...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 pt-52 pb-24 uppercase italic">
        {/* PAGE HEADER */}
        <div className="mb-24 relative overflow-hidden">
          <h1 className="text-massive text-glow opacity-5 select-none leading-none uppercase">ARCHIVE</h1>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-primary pb-8 gap-4">
            <div className="space-y-1">
              <h2 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter uppercase italic leading-none">ORDER HISTORY</h2>
              <div className="flex items-center gap-2 text-[10px] font-black text-primary/60 tracking-[0.4em]">
                <Clock className="w-3 h-3" /> SESSION ID: {Math.random().toString(36).substring(7).toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black tracking-[0.4em] text-muted-foreground uppercase block">LOGGED TRANSACTIONS</span>
              <span className="text-4xl font-black text-primary">{orders.length}</span>
            </div>
          </div>
        </div>

        {/* ORDERS GRID/LIST */}
        {orders.length === 0 ? (
          <div className="border-2 border-dashed border-primary/20 p-24 text-center space-y-8">
            <ShoppingBag className="w-24 h-24 text-primary/10 mx-auto" />
            <div className="space-y-2">
               <h3 className="text-4xl font-black tracking-tighter uppercase italic">NO ASSETS ACQUIRED</h3>
               <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase italic">Your transaction log is currently empty.</p>
            </div>
            <Button 
                onClick={() => navigate("/products")}
                className="h-16 px-12 bg-primary text-black rounded-none font-black text-sm hover:bg-white transition-all uppercase italic tracking-widest"
            >
                INITIATE PROCUREMENT
            </Button>
          </div>
        ) : (
          <div className="grid gap-8">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="group relative bg-secondary/20 border-2 border-primary/10 hover:border-primary transition-all p-8 md:p-12"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                   <Package className="w-32 h-32 rotate-12" />
                </div>

                <div className="grid md:grid-cols-4 gap-8 items-center relative z-10">
                  {/* ID & DATE */}
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-primary tracking-[0.4em] block uppercase">[TRANS ID]</span>
                    <h4 className="text-xl font-black tracking-tighter font-mono text-foreground uppercase italic line-clamp-1">
                      #{order.id.slice(-12).toUpperCase()}
                    </h4>
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <Calendar className="w-3 h-3" />
                       <span className="text-[10px] font-bold tracking-widest leading-none">
                         {new Date(order.createdAt).toLocaleDateString("en-GB")}
                       </span>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-primary tracking-[0.4em] block uppercase">[LOG STATUS]</span>
                    <div className={`inline-flex px-4 py-2 border-2 text-[10px] font-black tracking-widest italic uppercase ${getStatusColor(order.status)}`}>
                       {statusLabels[order.status] || order.status}
                    </div>
                  </div>

                  {/* VALUATION */}
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-primary tracking-[0.4em] block uppercase">[VALUATION]</span>
                    <div className="flex items-center gap-2">
                       <CreditCard className="w-4 h-4 text-muted-foreground" />
                       <span className="text-2xl font-black tracking-tighter italic">
                         {formatPrice(order.total)}
                       </span>
                    </div>
                  </div>

                  {/* ACTION */}
                  <div className="flex justify-end">
                    <Button 
                      variant="outline"
                      onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true); }}
                      className="w-full md:w-auto h-16 px-10 border-2 border-primary/20 rounded-none font-black text-xs hover:bg-primary hover:text-black hover:border-primary transition-all uppercase italic tracking-widest flex items-center gap-3"
                    >
                      <Eye className="w-4 h-4" /> VIEW MANIFEST
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ORDER DETAILS DIALOG */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl bg-background border-4 border-primary rounded-none p-0 overflow-hidden uppercase italic">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <DialogHeader className="p-10 border-b-2 border-primary/20 bg-secondary/30 relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">[SECURE MANIFEST LOADED]</span>
              <DialogTitle className="text-5xl font-black italic tracking-tighter uppercase leading-none">TRANS DETAILS</DialogTitle>
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="p-10 space-y-10 relative z-10">
              <div className="grid grid-cols-2 gap-8 text-[10px] font-black tracking-widest border-b border-primary/10 pb-8">
                <div className="space-y-2">
                  <p className="text-primary/60 uppercase tracking-[0.4em]">[REFERENCE]</p>
                  <p className="text-base font-black italic">#{selectedOrder.id.toUpperCase()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-primary/60 uppercase tracking-[0.4em]">[TIMESTAMP]</p>
                  <p className="text-base font-black italic">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="border border-primary/20 bg-secondary/50">
                <Table>
                  <TableHeader className="bg-primary/10">
                    <TableRow className="border-b-2 border-primary/20 h-14">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary italic">ASSET IDENTITY</TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-primary italic">QTY</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-primary italic pr-6">VALUATION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, idx) => (
                      <TableRow key={idx} className="border-b border-primary/10 h-16 hover:bg-primary/5 transition-colors">
                        <TableCell>
                           <div className="flex flex-col">
                              <span className="font-black italic text-sm text-foreground">{item.name}</span>
                              <span className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase">{item.color} // {item.size}</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-center font-black text-sm italic">{item.quantity}</TableCell>
                        <TableCell className="text-right font-black text-sm italic pr-6">{formatPrice(item.price)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-primary/10 h-20">
                      <TableCell colSpan={2} className="font-black text-primary italic tracking-tighter text-lg uppercase pl-6">AGGREGATE TOTAL</TableCell>
                      <TableCell className="text-right font-black text-xl pr-6 italic text-primary">{formatPrice(selectedOrder.total)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter className="p-8 border-t-2 border-primary/20 bg-secondary/30 relative z-10">
            <Button 
                onClick={() => setIsDetailsOpen(false)} 
                className="w-full h-16 bg-primary text-black rounded-none font-black text-sm uppercase tracking-[0.3em] hover:bg-white transition-all italic"
            >
               TERMINATE VIEW // DISCONNECT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default MyOrders;
