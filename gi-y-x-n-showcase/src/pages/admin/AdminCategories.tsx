import { useState } from "react";
import { Plus, Pencil, Eye, EyeOff, Loader2, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);

  // FETCH CATEGORIES
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const response = await api.get("/categories/admin/all");
      return response.data;
    }
  });

  // MUTATIONS
  const createMutation = useMutation({
    mutationFn: (newCat: Partial<Category>) => api.post("/categories", newCat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("DANH MỤC ĐÃ ĐƯỢC KHỞI TẠO // SECTOR CREATED");
      setIsDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI KHI TẠO DANH MỤC // POST ERROR")
  });

  const updateMutation = useMutation({
    mutationFn: (updatedCat: Partial<Category>) => api.patch(`/categories/${updatedCat.id}`, updatedCat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("DANH MỤC ĐÃ ĐƯỢC CẬP NHẬT // SECTOR PATCHED");
      setIsDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI KHI CẬP NHẬT // PATCH ERROR")
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/categories/${id}/toggle`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(`HỆ THỐNG ${res.data.isActive ? "HIỂN THỊ" : "TẠM ẨN"} DANH MỤC // TOGGLE SUCCESS`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI KHI THAY ĐỔI TRẠNG THÁI // TOGGLE ERROR")
  });

  const handleAdd = () => {
    setCurrentCategory({
      name: "",
      slug: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!currentCategory?.name || !currentCategory?.slug) {
      toast.error("VUI LÒNG ĐIỀN ĐỦ THÔNG TIN // NULL_DATA_REJECTION");
      return;
    }

    if (currentCategory.id) {
      updateMutation.mutate(currentCategory);
    } else {
      createMutation.mutate(currentCategory);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 uppercase font-black tracking-widest text-[10px]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <span className="animate-pulse">SYNCHRONIZING CATEGORY SECTORS...</span>
      </div>
    );
  }

  return (
    <div className="uppercase">
      <div className="flex items-center justify-between mb-12 border-b-2 border-primary pb-8">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase">CATEGORY SECTORS</h1>
          <span className="text-[10px] font-bold text-muted-foreground tracking-[0.4em] mt-1 uppercase">TOTAL GROUPS: {categories.length}</span>
        </div>
        <Button onClick={handleAdd} className="bg-primary text-black rounded-none h-14 px-8 font-black tracking-widest text-xs hover:bg-white transition-all">
          <Plus className="h-4 w-4 mr-2" /> INITIALIZE NEW SECTOR
        </Button>
      </div>

      <div className="bg-background border-2 border-primary/10 rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow className="border-b-2 border-primary/10 h-16">
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">SECTOR NAME</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">SLUG PATH</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">LINKED ASSETS</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">STATUS</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase text-primary tracking-widest pr-4">PROTOCOLS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c: Category) => (
              <TableRow key={c.id} className="hover:bg-primary/5 border-b border-primary/10 transition-colors h-20">
                <TableCell className="font-black text-sm tracking-tight uppercase italic">{c.name}</TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="font-mono text-xs">{c._count?.products || 0}</TableCell>
                <TableCell>
                  <Badge className={`${c.isActive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"} rounded-none border-none font-black text-[9px] uppercase`}>
                    {c.isActive ? "LINK ACTIVE" : "SECTOR HIDDEN"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="hover:bg-primary hover:text-black rounded-none transition-all"><Pencil className="h-4 w-4" /></Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={c.isActive ? "text-primary hover:bg-primary hover:text-black" : "text-destructive hover:bg-destructive hover:text-white"}
                      onClick={() => toggleMutation.mutate(c.id)}
                      disabled={toggleMutation.isPending}
                    >
                      {toggleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (c.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />)}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-background border-4 border-primary rounded-none p-0 overflow-hidden uppercase">
           <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
           <DialogHeader className="p-10 border-b border-primary/20">
            <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase">{currentCategory?.id ? "PATCH SECTOR" : "INIT SECTOR"}</DialogTitle>
          </DialogHeader>
          <div className="p-10 space-y-8 relative">
            <div className="grid gap-6">
               <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary tracking-widest mb-2 block">[SECTOR NAME]</Label>
                <Input
                  value={currentCategory?.name || ""}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
                    setCurrentCategory({ ...currentCategory, name, slug });
                  }}
                  className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 font-mono text-sm uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary tracking-widest mb-2 block">[SLUG ID]</Label>
                <Input
                  value={currentCategory?.slug || ""}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
                  className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 font-mono text-xs text-muted-foreground uppercase"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-10 bg-secondary/20 border-t border-primary/20 flex flex-row gap-4">
             <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-none border-primary/40 font-black h-16 uppercase tracking-widest hover:bg-primary/5 transition-all">TERMINATE</Button>
             <Button onClick={handleSave} className="flex-1 bg-primary text-black rounded-none font-black h-16 uppercase tracking-widest hover:bg-white transition-all group overflow-hidden relative">
               {createMutation.isPending || updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                 <>
                   <span className="relative z-10">COMMIT SECTOR</span>
                   <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                 </>
               )}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
