import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Newspaper } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  content: string;
  thumbnail?: string;
  author?: string;
  isActive: boolean;
  createdAt: string;
}

const AdminPosts = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post> | null>(null);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  // FETCH BLOGS
  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["admin-blogs"],
    queryFn: async () => {
      const response = await api.get("/blogs");
      return response.data;
    }
  });

  // MUTATIONS
  const createMutation = useMutation({
    mutationFn: (newPost: Partial<Post>) => api.post("/blogs", newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast.success("BÀI VIẾT ĐÃ ĐƯỢC XUẤT BẢN // BROADCAST INITIATED");
      setIsDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI XUẤT BẢN // POST ERROR")
  });

  const updateMutation = useMutation({
    mutationFn: (updatedPost: Partial<Post>) => api.patch(`/blogs/${updatedPost.id}`, updatedPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast.success("BÀI VIẾT ĐÃ ĐƯỢC CẬP NHẬT // CONTENT PATCHED");
      setIsDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI CẬP NHẬT // PATCH ERROR")
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/blogs/${id}/toggle`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast.success(`BÀI VIẾT HIỆN ĐANG ${res.data.isActive ? "HIỂN THỊ" : "TẠM ẨN"} // TOGGLE SYNCED`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI THAY ĐỔI // SYNC ERROR")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/blogs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast.success("BÀI VIẾT ĐÃ BỊ XÓA VĨNH VIỄN // CONTENT PURGED");
      setIsConfirmDeleteOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI XÓA // PURGE ERROR")
  });

  const filtered = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPosts = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAdd = () => {
    setCurrentPost({
      title: "",
      content: "",
      thumbnail: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop",
      author: "ADMIN SYSTEM",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (post: Post) => {
    setCurrentPost(post);
    setIsDialogOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setIdToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleDelete = () => {
    if (idToDelete) {
      deleteMutation.mutate(idToDelete);
    }
  };

  const handleSave = () => {
    if (!currentPost?.title || !currentPost?.content) {
      toast.error("VUI LÒNG ĐIỀN ĐỦ NỘI DUNG // NULL ENTRY ERROR");
      return;
    }

    if (currentPost.id) {
      updateMutation.mutate(currentPost);
    } else {
      createMutation.mutate(currentPost);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 uppercase font-black tracking-widest text-[10px]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <span className="animate-pulse">SYNCHRONIZING CONTENT ARCHIVE...</span>
      </div>
    );
  }

  return (
    <div className="uppercase">
      <div className="flex items-center justify-between mb-12 border-b-2 border-primary pb-8 uppercase">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase">CONTENT CENTRAL</h1>
          <span className="text-[10px] font-bold text-muted-foreground tracking-[0.4em] mt-1 uppercase">ARCHIVE LOGS: {filtered.length}</span>
        </div>
        <Button onClick={handleAdd} className="bg-primary text-black rounded-none h-14 px-8 font-black tracking-widest text-xs hover:bg-white transition-all uppercase">
          <Plus className="h-4 w-4 mr-2" /> CREATE NEW ENTRY
        </Button>
      </div>

      <div className="relative mb-8 max-w-sm group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
        <Input 
          placeholder="SEARCH CONTENT DB..." 
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
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">PREVIEW</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">CONTENT TITLE</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">DATETIME</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">STATUS</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase text-primary tracking-widest pr-4">PROTOCOLS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPosts.map((p) => (
              <TableRow key={p.id} className="hover:bg-primary/5 border-b border-primary/10 transition-colors h-24">
                <TableCell>
                  <img src={p.thumbnail} alt={p.title} className="w-16 h-12 rounded-none object-cover border border-primary/20 grayscale hover:grayscale-0 transition-all duration-500" />
                </TableCell>
                <TableCell className="font-black text-sm tracking-tight uppercase italic max-w-[300px]">{p.title}</TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("en-GB")}</TableCell>
                <TableCell>
                   <Badge className={`${p.isActive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"} rounded-none border-none font-black text-[9px] uppercase`}>
                    {p.isActive ? "BROADCAST ON" : "LINK TERMINATED"}
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
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive hover:text-white rounded-none" onClick={() => openDeleteConfirm(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
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
                PREV ENTRY
              </Button>
              <Button
                variant="outline"
                className="rounded-none border-primary/20 h-10 px-6 hover:bg-primary hover:text-black transition-all"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                NEXT ENTRY
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-background border-4 border-primary rounded-none p-0 overflow-hidden uppercase">
           <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
           <DialogHeader className="p-10 border-b border-primary/20">
            <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase">{currentPost?.id ? "PATCH ENTRY" : "INITIALIZE ENTRY"}</DialogTitle>
          </DialogHeader>
          <div className="p-10 space-y-8 relative">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] font-black text-primary tracking-widest uppercase mb-2 block">[ENTRY TITLE]</Label>
                <Input
                  id="title"
                  value={currentPost?.title || ""}
                  onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                  className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 font-mono text-sm uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-[10px] font-black text-primary tracking-widest uppercase mb-2 block">[BODY FRAGMENT]</Label>
                <Textarea
                  id="content"
                  value={currentPost?.content || ""}
                  onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                  className="bg-secondary/50 border-primary/20 rounded-none h-40 focus:border-primary focus:ring-0 font-mono text-xs uppercase resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="text-[10px] font-black text-primary tracking-widest uppercase mb-2 block">[THUMBNAIL URI]</Label>
                <Input
                  id="thumbnail"
                  value={currentPost?.thumbnail || ""}
                  onChange={(e) => setCurrentPost({ ...currentPost, thumbnail: e.target.value })}
                  className="bg-secondary/50 border-primary/20 rounded-none h-14 focus:border-primary focus:ring-0 font-mono text-xs text-muted-foreground uppercase"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-10 bg-secondary/20 border-t border-primary/20 flex flex-row gap-4">
             <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-none border-primary/40 font-black h-16 uppercase tracking-widest hover:bg-primary/5 transition-all">TERMINATE</Button>
             <Button onClick={handleSave} className="flex-1 bg-primary text-black rounded-none font-black h-16 uppercase tracking-widest hover:bg-white transition-all uppercase italic">
               {createMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin" /> : "COMMIT ENTRY"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent className="bg-background border-4 border-destructive rounded-none p-10 uppercase">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black italic tracking-tighter text-destructive uppercase">PURGE CONFIRMATION</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-bold tracking-widest text-muted-foreground uppercase leading-loose">
               HÀNH ĐỘNG NÀY SẼ XÓA VĨNH VIỄN BẢN GHI KHỎI LƯU TRỮ TRUNG TÂM. DỮ LIỆU SẼ KHÔNG THỂ KHÔI PHỤC. // OPERATION IRREVERSIBLE
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-4">
            <AlertDialogCancel className="flex-1 rounded-none border-primary/20 h-14 font-black tracking-widest uppercase">ABORT PURGE</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="flex-1 bg-destructive text-white rounded-none h-14 font-black tracking-widest uppercase hover:bg-white hover:text-destructive transition-all">EXECUTE PURGE</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPosts;
