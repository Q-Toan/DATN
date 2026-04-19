import { useState } from "react";
import { Search, Plus, Pencil, Eye, EyeOff, Loader2 } from "lucide-react";
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
import ImageUpload from "@/components/admin/ImageUpload";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  images: string[];
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);

  // FETCH PRODUCTS
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", currentPage, search],
    queryFn: async () => {
      const response = await api.get("/products", {
        params: { page: currentPage, limit: ITEMS_PER_PAGE, search, admin: true }
      });
      return response.data;
    }
  });

  // FETCH CATEGORIES (for Select)
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin-categories-active"],
    queryFn: async () => {
      const response = await api.get("/categories");
      return response.data;
    }
  });

  // MUTATIONS
  const createMutation = useMutation({
    mutationFn: (newProduct: Partial<Product>) => api.post("/products", newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("HỆ THỐNG ĐÃ KHỞI TẠO TÀI SẢN // ASSET CREATED");
      setIsDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI KHI TẠO TÀI SẢN // POST ERROR")
  });

  const updateMutation = useMutation({
    mutationFn: (updatedProduct: Partial<Product>) => api.patch(`/products/${updatedProduct.id}`, updatedProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("HỆ THỐNG ĐÃ CẬP NHẬT TÀI SẢN // ASSET PATCHED");
      setIsDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI KHI CẬP NHẬT // PATCH ERROR")
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/products/${id}/toggle`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(`TÀI SẢN ĐANG ${res.data.isActive ? "HIỂN THỊ" : "TẠM ẨN"} // TOGGLE SUCCESS`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI KHI THAY ĐỔI TRẠNG THÁI // TOGGLE ERROR")
  });

  const handleAdd = () => {
    setCurrentProduct({
      name: "",
      description: "TRANG THIẾT BỊ CAO CẤP PHỤC VỤ CÁC HOẠT ĐỘNG THỂ THAO VÀ THỜI TRANG ĐƯỜNG PHỐ.",
      price: 0,
      stock: 50,
      categoryId: "",
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"],
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!currentProduct?.name || !currentProduct?.price || !currentProduct?.categoryId) {
      toast.error("VUI LÒNG ĐIỀN ĐẦY ĐỦ THÔNG TIN // NULL PTR ERROR");
      return;
    }

    if (currentProduct.id) {
      updateMutation.mutate(currentProduct);
    } else {
      createMutation.mutate(currentProduct);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 uppercase">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <span className="text-[10px] font-black tracking-widest text-primary animate-pulse">RECONSTRUCTING ASSET TABLE...</span>
      </div>
    );
  }

  const products = data?.products || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1 };

  return (
    <div className="uppercase">
      <div className="flex items-center justify-between mb-12 border-b-2 border-primary pb-8 uppercase">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase">ASSET MANAGEMENT</h1>
          <span className="text-[10px] font-bold text-muted-foreground tracking-[0.4em] mt-1 uppercase">ARCHIVE v2.0 // TOTAL: {pagination.total}</span>
        </div>
        <Button onClick={handleAdd} className="bg-primary text-black rounded-none h-14 px-8 font-black tracking-widest text-xs hover:bg-white transition-all uppercase">
          <Plus className="h-4 w-4 mr-2" /> CREATE NEW ASSET
        </Button>
      </div>

      <div className="relative mb-8 max-w-sm group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
        <Input 
          placeholder="SEARCH ASSET ARCHIVE..." 
          value={search} 
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }} 
          className="pl-12 bg-secondary/50 border-primary/20 rounded-none h-12 focus:border-primary focus:ring-0 font-mono text-xs uppercase" 
        />
        <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-focus-within:w-full transition-all duration-500" />
      </div>

      <div className="bg-background border-2 border-primary/10 rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow className="border-b-2 border-primary/10">
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest h-16">PREVIEW</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">ASSET NAME</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">CAT SECTOR</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">VALUATION</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">AVAILABILITY</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase text-primary tracking-widest pr-4">PROTOCOLS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p: Product) => (
              <TableRow key={p.id} className="hover:bg-primary/5 border-b border-primary/10 transition-colors h-24">
                <TableCell>
                  <img src={getAssetUrl(p.images?.[0])} alt={p.name} className="w-14 h-14 rounded-none object-cover border border-primary/20 grayscale hover:grayscale-0 transition-all duration-500" />
                </TableCell>
                <TableCell className="font-black text-sm tracking-tight uppercase italic">{p.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-none border-primary/20 font-black text-[9px] uppercase">
                    {typeof p.category === 'object' ? p.category.name : (p.category || "UNCLASSIFIED")}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs font-bold">{formatPrice(p.price)}</TableCell>
                <TableCell>
                  <Badge className={`${p.isActive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"} rounded-none border-none font-black text-[9px] uppercase`}>
                    {p.isActive ? `ONLINE // ${p.stock}` : "HIDDEN OFFLINE"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="hover:bg-primary hover:text-black rounded-none transition-all"><Pencil className="h-4 w-4" /></Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={p.isActive ? "text-primary hover:bg-primary hover:text-black" : "text-destructive hover:bg-destructive hover:text-white"}
                      onClick={() => toggleMutation.mutate(p.id)}
                      disabled={toggleMutation.isPending}
                    >
                      {toggleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (p.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />)}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-8 border-t border-primary/10 bg-secondary/20">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
               SECTOR {currentPage} // {pagination.totalPages}
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="rounded-none border-primary/20 font-black text-[9px] uppercase tracking-[0.2em] h-10 px-6 hover:bg-primary hover:text-black transition-all"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                PREV SECTOR
              </Button>
              <Button
                variant="outline"
                className="rounded-none border-primary/20 font-black text-[9px] uppercase tracking-[0.2em] h-10 px-6 hover:bg-primary hover:text-black transition-all"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages}
              >
                NEXT SECTOR
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT/CREATE DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-background border-4 border-primary rounded-none p-0 overflow-hidden uppercase">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <DialogHeader className="p-10 border-b border-primary/20">
            <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase">{currentProduct?.id ? "UPDATE ASSET" : "INITIALIZE ASSET"}</DialogTitle>
          </DialogHeader>
          <div className="p-10 space-y-8 relative">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black text-primary tracking-widest uppercase mb-2 block">[ASSET NAME]</Label>
                <Input
                  id="name"
                  value={currentProduct?.name || ""}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 font-mono text-sm uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="category" className="text-[10px] font-black text-primary tracking-widest uppercase mb-2 block">[CATEGORIZATION]</Label>
                    <Select
                      value={currentProduct?.categoryId}
                      onValueChange={(value) => setCurrentProduct({ ...currentProduct, categoryId: value })}
                    >
                      <SelectTrigger className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:ring-0 uppercase">
                        <SelectValue placeholder="SELECT CATEGORY" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-primary uppercase">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="focus:bg-primary focus:text-black hover:bg-primary hover:text-black font-bold uppercase">{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="stock" className="text-[10px] font-black text-primary tracking-widest uppercase mb-2 block">[AVAILABILITY QTY]</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={currentProduct?.stock || 0}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                      className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 font-mono text-sm uppercase"
                    />
                 </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price" className="text-[10px] font-black text-primary tracking-widest uppercase mb-2 block">[VALUATION VND]</Label>
                <Input
                  id="price"
                  type="number"
                  value={currentProduct?.price || ""}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                  className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 font-mono text-sm uppercase"
                />
              </div>
              <div className="grid gap-2">
                <ImageUpload
                  value={currentProduct?.images?.[0] || ""}
                  onChange={(url) => setCurrentProduct({ ...currentProduct, images: [url] })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-10 bg-secondary/20 border-t border-primary/20 flex flex-row gap-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-none border-primary/40 font-black h-16 uppercase tracking-widest hover:bg-primary/5">TERMINATE</Button>
            <Button onClick={handleSave} className="flex-1 bg-primary text-black rounded-none font-black h-16 uppercase tracking-widest hover:bg-white transition-all uppercase">
              {updateMutation.isPending || createMutation.isPending ? <Loader2 className="animate-spin" /> : "COMMIT ASSET"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
