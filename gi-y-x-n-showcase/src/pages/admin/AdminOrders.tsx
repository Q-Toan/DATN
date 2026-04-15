import { useState } from "react";
import { Search, Eye, Loader2, PackageOpen, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

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
  userId: string;
  user: {
    name: string;
    email: string;
  };
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

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // FETCH ORDERS
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const response = await api.get("/orders/admin/all");
      return response.data;
    }
  });

  // MUTATIONS
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api.patch(`/orders/admin/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("TRẠNG THÁI ĐƠN HÀNG ĐÃ CẬP NHẬT // ORDER LOG SYNCED");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI CẬP NHẬT // SYNC ERROR")
  });

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const viewDetails = (order: Order) => {
    setCurrentOrder(order);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-primary/10 text-primary";
      case "SHIPPING": return "bg-blue-500/10 text-blue-500";
      case "PROCESSING": return "bg-orange-500/10 text-orange-500";
      case "CANCELLED": return "bg-destructive/10 text-destructive";
      default: return "bg-yellow-500/10 text-yellow-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 uppercase font-black tracking-widest text-[10px]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <span className="animate-pulse">FETCHING LOGISTICS DATA...</span>
      </div>
    );
  }

  return (
    <div className="uppercase">
      <div className="flex items-center justify-between mb-12 border-b-2 border-primary pb-8 uppercase">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase">ORDER LOGISTICS</h1>
          <span className="text-[10px] font-bold text-muted-foreground tracking-[0.4em] mt-1 uppercase">TRANSACTIONS: {filtered.length}</span>
        </div>
        <div className="p-4 border border-primary/20 bg-primary/5 flex items-center gap-4">
           <CreditCard className="w-8 h-8 text-primary/40" />
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-primary/60 tracking-widest">FINANCE STATUS</span>
              <span className="text-xs font-black tracking-tighter">SECURE PAY V3</span>
           </div>
        </div>
      </div>

      <div className="relative mb-8 max-w-sm group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
        <Input 
          placeholder="SEARCH TRANSACTION ID..." 
          value={search} 
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }} 
          className="pl-12 bg-secondary/50 border-primary/20 rounded-none h-12 focus:border-primary focus:ring-0 font-mono text-xs uppercase" 
        />
        <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-focus-within:w-full transition-all duration-500" />
      </div>

      <div className="bg-background border-2 border-primary/10 rounded-none overflow-hidden text-xs">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow className="border-b-2 border-primary/10 h-16">
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">TRANS ID</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">CLIENT IDENTITY</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">TIMESTAMP</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">VALUATION</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">LOG STATUS</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase text-primary tracking-widest pr-4">PROTOCOLS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((o) => (
              <TableRow key={o.id} className="hover:bg-primary/5 border-b border-primary/10 transition-colors h-24">
                <TableCell className="font-mono text-[10px] text-primary font-bold">#{o.id.slice(-8).toUpperCase()}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-black tracking-tight uppercase italic">{o.user?.name || "GUEST USER"}</span>
                    <span className="font-mono text-[9px] text-muted-foreground">{o.user?.email}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">
                   {new Date(o.createdAt).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell className="font-mono font-bold text-sm">{formatPrice(o.total)}</TableCell>
                <TableCell>
                  <Select
                    value={o.status}
                    disabled={updateStatusMutation.isPending}
                    onValueChange={(value) => updateStatusMutation.mutate({ id: o.id, status: value })}
                  >
                    <SelectTrigger className={`h-10 w-[160px] rounded-none border-none font-black text-[9px] uppercase tracking-widest ${getStatusColor(o.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-primary bg-background uppercase font-black text-[9px]">
                      {Object.entries(statusLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val} className="focus:bg-primary focus:text-black">
                           {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right pr-4">
                    <Button variant="ghost" size="icon" onClick={() => viewDetails(o)} className="hover:bg-primary hover:text-black rounded-none transition-all"><Eye className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

         {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-8 border-t border-primary/10 bg-secondary/20 uppercase font-black text-[10px] tracking-widest">
            <p className="text-muted-foreground">
              SECTOR {currentPage} // {totalPages}
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="rounded-none border-primary/20 h-10 px-6 hover:bg-primary hover:text-black transition-all"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                PREV TRANS
              </Button>
              <Button
                variant="outline"
                className="rounded-none border-primary/20 h-10 px-6 hover:bg-primary hover:text-black transition-all"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                NEXT TRANS
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-background border-4 border-primary rounded-none p-0 overflow-hidden uppercase">
           <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
           <DialogHeader className="p-10 border-b border-primary/20">
            <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase">TRANS MANIFEST</DialogTitle>
          </DialogHeader>
          {currentOrder && (
            <div className="p-10 space-y-8 relative">
              <div className="grid grid-cols-2 gap-8 text-[10px] font-bold tracking-widest">
                <div className="space-y-1">
                  <p className="text-primary/60">[CLIENT NAME]</p>
                  <p className="text-sm font-black italic">{currentOrder.user?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-primary/60">[ACCESS POINT]</p>
                  <p className="text-sm font-black italic">{currentOrder.user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-primary/60">[TIMESTAMP]</p>
                  <p className="text-sm font-black italic">{new Date(currentOrder.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-primary/60">[SECTOR ID]</p>
                  <p className="text-sm font-black italic">#{currentOrder.id.toUpperCase()}</p>
                </div>
              </div>
              
              <div className="border border-primary/20 bg-secondary/20">
                <Table>
                  <TableHeader className="bg-primary/5">
                    <TableRow className="border-b border-primary/20 h-12">
                      <TableHead className="text-[8px] font-black uppercase tracking-widest">ASSET</TableHead>
                      <TableHead className="text-center text-[8px] font-black uppercase tracking-widest">QTY</TableHead>
                      <TableHead className="text-right text-[8px] font-black uppercase tracking-widest pr-4">VALUATION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrder.items.map((item, idx) => (
                      <TableRow key={idx} className="border-b border-primary/10 h-14">
                        <TableCell>
                           <div className="flex flex-col">
                              <span className="font-black italic text-[11px]">{item.name}</span>
                              <span className="text-[8px] text-muted-foreground uppercase">{item.color} // {item.size}</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs">{item.quantity}</TableCell>
                        <TableCell className="text-right font-mono text-xs pr-4">{formatPrice(item.price)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-primary/5 h-16">
                      <TableCell colSpan={2} className="font-black text-primary italic tracking-tighter">AGGREGATE TOTAL</TableCell>
                      <TableCell className="text-right font-black text-sm pr-4 italic">{formatPrice(currentOrder.total)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter className="p-10 bg-secondary/20 border-t border-primary/20">
            <Button onClick={() => setIsDialogOpen(false)} className="w-full h-16 bg-primary text-black rounded-none font-black h-16 uppercase tracking-widest hover:bg-white transition-all uppercase italic">
               TERMINATE VIEW
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
