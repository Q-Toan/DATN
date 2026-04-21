import { useState } from "react";
import { Search, Plus, ArrowUpRight, ArrowDownLeft, Loader2, History, FileText, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  stock: number;
}

interface InventoryLog {
  id: string;
  productId: string;
  type: "IMPORT" | "EXPORT";
  quantity: number;
  reason: string;
  createdAt: string;
  product: {
    name: string;
  };
}

const AdminInventory = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [formData, setFormData] = useState({ productId: "", quantity: 1, reason: "" });

  // FETCH HISTORY
  const { data: history = [], isLoading } = useQuery<InventoryLog[]>({
    queryKey: ["admin-inventory-history"],
    queryFn: async () => {
      const response = await api.get("/inventory/history");
      return response.data;
    }
  });

  // FETCH PRODUCTS (for select)
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["admin-all-products"],
    queryFn: async () => {
      const response = await api.get("/products", { params: { limit: 100, admin: true } });
      return response.data.products;
    }
  });

  // MUTATIONS
  const importMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post("/inventory/import", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-history"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("PHIẾU NHẬP ĐÃ ĐƯỢC XỬ LÝ // IMPORT SUCCESS");
      setIsImportOpen(false);
      setFormData({ productId: "", quantity: 1, reason: "" });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI KHI NHẬP KHO // IMPORT ERROR")
  });

  const exportMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post("/inventory/export", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-history"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("PHIẾU XUẤT ĐÃ ĐƯỢC XỬ LÝ // EXPORT SUCCESS");
      setIsExportOpen(false);
      setFormData({ productId: "", quantity: 1, reason: "" });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI KHI XUẤT KHO // EXPORT ERROR")
  });

  const filteredHistory = history.filter(log => 
    log.product?.name.toLowerCase().includes(search.toLowerCase()) ||
    log.reason.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 uppercase">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <span className="text-[10px] font-black tracking-widest text-primary animate-pulse">LOADING LOGISTICS LOGS...</span>
      </div>
    );
  }

  return (
    <div className="uppercase">
      <div className="flex items-center justify-between mb-12 border-b-2 border-primary pb-8 uppercase">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase">INVENTORY CONTROL</h1>
          <span className="text-[10px] font-bold text-muted-foreground tracking-[0.4em] mt-1 uppercase">LOGISTICS ARCHIVE // TOTAL ENTRIES: {history.length}</span>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setIsExportOpen(true)} variant="outline" className="border-destructive text-destructive rounded-none h-14 px-8 font-black tracking-widest text-xs hover:bg-destructive hover:text-white transition-all uppercase">
            <ArrowUpRight className="h-4 w-4 mr-2" /> CREATE EXPORT SLIP
          </Button>
          <Button onClick={() => setIsImportOpen(true)} className="bg-primary text-black rounded-none h-14 px-8 font-black tracking-widest text-xs hover:bg-white transition-all uppercase">
            <Plus className="h-4 w-4 mr-2" /> CREATE IMPORT SLIP
          </Button>
        </div>
      </div>

      <div className="relative mb-8 max-w-sm group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
        <Input 
          placeholder="FILTER LOGISTICS LOGS..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-12 bg-secondary/50 border-primary/20 rounded-none h-12 focus:border-primary focus:ring-0 font-mono text-xs uppercase" 
        />
        <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-focus-within:w-full transition-all duration-500" />
      </div>

      <div className="bg-background border-2 border-primary/10 rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow className="border-b-2 border-primary/10">
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest h-16">TIMESTAMP</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">TYPE</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">ASSET NAME</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">QUANTITY</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest pr-4">LOG REASON</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((log) => (
              <TableRow key={log.id} className="hover:bg-primary/5 border-b border-primary/10 transition-colors h-20">
                <TableCell className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                  {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <Badge className={`${log.type === "IMPORT" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"} rounded-none border-none font-black text-[9px] uppercase flex items-center w-fit gap-1`}>
                    {log.type === "IMPORT" ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    {log.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-black text-xs tracking-tight uppercase italic">{log.product?.name || "REMOVED ASSET"}</TableCell>
                <TableCell className="font-mono text-xs font-bold">
                  {log.type === "IMPORT" ? "+" : "-"}{log.quantity}
                </TableCell>
                <TableCell className="text-[10px] font-medium text-muted-foreground uppercase italic pr-4">
                  {log.reason || "SYSTEM_PROTOCOL_EXECUTION"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* IMPORT DIALOG */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background border-4 border-primary rounded-none p-0 overflow-hidden uppercase">
           <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
           <DialogHeader className="p-10 border-b border-primary/20">
            <div className="flex items-center gap-4 text-primary mb-2">
              <ArrowDownLeft className="h-8 w-8" />
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">IMPORT SLIP</DialogTitle>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">ADD STOCK TO EXISTING INVENTORY ARCHIVE</p>
          </DialogHeader>
          <div className="p-10 space-y-8 relative">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary tracking-widest uppercase mb-2 block">[TARGET ASSET]</Label>
                <Select value={formData.productId} onValueChange={(val) => setFormData({...formData, productId: val})}>
                  <SelectTrigger className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:ring-0 uppercase">
                    <SelectValue placeholder="SELECT PRODUCT" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-primary uppercase">
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="font-bold uppercase italic">{p.name} (CURRENT: {p.stock})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-primary tracking-widest uppercase mb-2 block">[QUANTITY]</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                    className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 font-mono text-sm uppercase"
                  />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black text-primary tracking-widest uppercase mb-2 block">[PROTOCOL REASON]</Label>
                   <Input
                    placeholder="E.G. NEW ARRIVAL"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-10 bg-secondary/20 border-t border-primary/20 flex flex-row gap-4">
            <Button variant="outline" onClick={() => setIsImportOpen(false)} className="flex-1 rounded-none border-primary/40 font-black h-16 uppercase tracking-widest hover:bg-primary/5">TERMINATE</Button>
            <Button 
              onClick={() => importMutation.mutate(formData)} 
              disabled={importMutation.isPending}
              className="flex-1 bg-primary text-black rounded-none font-black h-16 uppercase tracking-widest hover:bg-white transition-all"
            >
              {importMutation.isPending ? <Loader2 className="animate-spin" /> : "EXECUTE IMPORT"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EXPORT DIALOG */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background border-4 border-destructive rounded-none p-0 overflow-hidden uppercase">
           <div className="absolute inset-0 bg-destructive/5 pointer-events-none" />
           <DialogHeader className="p-10 border-b border-destructive/20">
            <div className="flex items-center gap-4 text-destructive mb-2">
              <ArrowUpRight className="h-8 w-8" />
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">EXPORT SLIP</DialogTitle>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">DEDUCT STOCK FOR MANUAL DISTRIBUTION</p>
          </DialogHeader>
          <div className="p-10 space-y-8 relative">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-destructive tracking-widest uppercase mb-2 block">[TARGET ASSET]</Label>
                <Select value={formData.productId} onValueChange={(val) => setFormData({...formData, productId: val})}>
                  <SelectTrigger className="bg-secondary/50 border-destructive/20 rounded-none h-14 focus:ring-0 uppercase">
                    <SelectValue placeholder="SELECT PRODUCT" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-destructive uppercase">
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="font-bold uppercase italic">{p.name} (CURRENT: {p.stock})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-destructive tracking-widest uppercase mb-2 block">[QUANTITY]</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                    className="bg-secondary/50 border-destructive/20 rounded-none h-14 focus:border-destructive focus:ring-0 font-mono text-sm uppercase"
                  />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black text-destructive tracking-widest uppercase mb-2 block">[PROTOCOL REASON]</Label>
                   <Input
                    placeholder="E.G. STOCK DAMAGE"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="bg-secondary/50 border-destructive/20 rounded-none h-14 focus:border-destructive focus:ring-0 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-10 bg-secondary/20 border-t border-destructive/20 flex flex-row gap-4">
            <Button variant="outline" onClick={() => setIsExportOpen(false)} className="flex-1 rounded-none border-destructive/40 font-black h-16 uppercase tracking-widest hover:bg-destructive/5">TERMINATE</Button>
            <Button 
              onClick={() => exportMutation.mutate(formData)} 
              disabled={exportMutation.isPending}
              className="flex-1 bg-destructive text-white rounded-none font-black h-16 uppercase tracking-widest hover:bg-red-700 transition-all"
            >
              {exportMutation.isPending ? <Loader2 className="animate-spin" /> : "EXECUTE EXPORT"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInventory;
