import { Package, FolderTree, Users, TrendingUp, ShoppingCart, Loader2, Activity, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const statusLabels: Record<string, string> = {
  PENDING: "CHỜ XỬ LÝ",
  PROCESSING: "ĐANG XỬ LÝ",
  SHIPPING: "ĐANG GIAO",
  DELIVERED: "ĐÃ GIAO",
  COMPLETED: "HOÀN THÀNH",
  CANCELLED: "ĐÃ HỦY",
};

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/stats");
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6 uppercase font-black tracking-widest text-[10px]">
        <div className="relative">
          <Loader2 className="w-20 h-20 text-primary animate-spin" />
          <Zap className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
           <span className="animate-pulse">INITIALIZING CORE NEURAL NETWORK...</span>
           <span className="text-primary opacity-50 text-[12px]">SYNC STATUS: 42% // SECURE SOCKET ESTABLISHED</span>
        </div>
      </div>
    );
  }

  const { stats, recentOrders } = data;

  const statCards = [
    { label: "ASSET TOTAL", value: stats.totalProducts, icon: Package, sub: "HARDWARE UNITS" },
    { label: "SECTOR GROUPS", value: stats.totalCategories, icon: FolderTree, sub: "DATA CLUSTERS" },
    { label: "NODE USERS", value: stats.totalUsers, icon: Users, sub: "ACTIVE ENTITIES" },
    { label: "LOG ENTRIES", value: stats.totalOrders, icon: ShoppingCart, sub: "TRANSACTIONS" },
  ];

  return (
    <div className="uppercase space-y-16">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b-4 border-primary pb-10">
        <div className="flex flex-col">
          <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">COMMAND CENTER</h1>
          <div className="flex items-center gap-4 mt-4">
             <Badge className="bg-primary text-black rounded-none font-black text-[10px] tracking-widest">SYSTEM STATUS: ONLINE</Badge>
             <span className="text-[10px] font-bold text-muted-foreground tracking-[0.3em] uppercase">VIBRATION PROTOCOL DEK 2026</span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-8 border-l-2 border-primary/20 pl-12 h-20 uppercase font-black">
           <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-primary/60 tracking-widest leading-none">LOCAL TIME</span>
              <span className="text-xl italic tracking-tighter leading-none">{new Date().toLocaleTimeString()}</span>
           </div>
           <Activity className="w-10 h-10 text-primary animate-pulse" />
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-secondary/50 border-2 border-primary/10 p-8 flex flex-col justify-between group hover:border-primary transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 -translate-y-1/2 translate-x-1/2 rounded-full group-hover:bg-primary/20 transition-all duration-500" />
            <div className="flex justify-between items-start mb-12 relative z-10">
               <span className="text-[10px] font-black text-primary tracking-widest">[{s.label}]</span>
               <s.icon className="w-5 h-5 text-primary group-hover:scale-125 transition-transform" />
            </div>
            <div className="flex flex-col relative z-10">
               <span className="text-5xl font-black italic tracking-tighter text-foreground leading-none">{s.value}</span>
               <span className="text-[9px] font-bold text-muted-foreground tracking-[0.2em] mt-3 uppercase opacity-50">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* RECENT ORDERS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 border-b-2 border-primary/20 pb-4 uppercase">
             <ShieldCheck className="w-5 h-5 text-primary" />
             <h2 className="text-xl font-black italic tracking-tighter uppercase">RECENT LOG PROTOCOLS</h2>
          </div>
          <div className="bg-background border-2 border-primary/10 rounded-none overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow className="border-b-2 border-primary/10 h-14">
                  <TableHead className="text-[9px] font-black text-primary uppercase tracking-widest">TRANS ID</TableHead>
                  <TableHead className="text-[9px] font-black text-primary uppercase tracking-widest">CLIENT</TableHead>
                  <TableHead className="text-[9px] font-black text-primary uppercase tracking-widest">STATE</TableHead>
                  <TableHead className="text-right text-[9px] font-black text-primary uppercase tracking-widest pr-4">VALUATION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((o: any) => (
                  <TableRow key={o.id} className="hover:bg-primary/5 h-16 border-b border-primary/10 transition-colors uppercase font-black text-xs">
                    <TableCell className="font-mono text-[10px] text-primary">#{o.id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell className="italic tracking-tight">{o.customerName}</TableCell>
                    <TableCell>
                      <Badge className="rounded-none border-none bg-primary/10 text-primary text-[8px] tracking-widest">
                        {statusLabels[o.status] || o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4 font-mono font-bold">{formatPrice(o.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* REVENUE SUMMARY */}
        <div className="space-y-6">
           <div className="flex items-center gap-4 border-b-2 border-primary/20 pb-4 uppercase">
             <TrendingUp className="w-5 h-5 text-primary" />
             <h2 className="text-xl font-black italic tracking-tighter uppercase">VALUATION SUMMARY</h2>
          </div>
          <div className="bg-primary p-12 flex flex-col items-center justify-center text-black group relative overflow-hidden transition-all duration-500 hover:bg-white">
             <div className="absolute top-0 left-0 w-full h-1 bg-black/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
             <span className="text-[10px] font-black tracking-[0.4em] mb-8 uppercase opacity-60 italic">EXPECTED NET YIELD</span>
             <span className="text-5xl font-black italic tracking-tighter mb-10 leading-none">
                {formatPrice(stats.totalRevenue)}
             </span>
             <div className="w-16 h-1 bg-black/20 mb-10" />
             <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black italic uppercase">BASED ON AGGREGATED LOGS</span>
                <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest">PROTOCOLS: SECURE SYNC V3</span>
             </div>
          </div>
          <div className="bg-secondary/30 border-2 border-primary/10 p-8">
             <div className="flex flex-col gap-4 text-[10px] font-black tracking-widest uppercase">
                <div className="flex justify-between border-b border-primary/10 pb-4">
                   <span className="text-muted-foreground">SYSTEM EFFICIENCY</span>
                   <span className="text-primary italic">98.4%</span>
                </div>
                <div className="flex justify-between border-b border-primary/10 pb-4">
                   <span className="text-muted-foreground">LATENCY CORE</span>
                   <span className="text-primary italic">14ms</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-muted-foreground">UPLOADS NODE</span>
                   <span className="text-primary italic">STABLE</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
