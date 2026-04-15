import { useState } from "react";
import { Search, ShieldCheck, ShieldAlert, Loader2, UserPlus, Fingerprint } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  createdAt: string;
}

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // FETCH USERS
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await api.get("/users");
      return response.data;
    }
  });

  // MUTATIONS
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/toggle-status`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(res.data.message.toUpperCase() + " // STATUS UPDATE SUCCESS");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "LỖI KHI CẬP NHẬT TRẠNG THÁI // ACCESS ERROR")
  });

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 uppercase font-black tracking-widest text-[10px]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <span className="animate-pulse">DECRYPTING USER DATABASE...</span>
      </div>
    );
  }

  return (
    <div className="uppercase">
      <div className="flex items-center justify-between mb-12 border-b-2 border-primary pb-8 uppercase">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase">USER REGISTRY</h1>
          <span className="text-[10px] font-bold text-muted-foreground tracking-[0.4em] mt-1 uppercase">ACTIVE NODES: {filtered.length}</span>
        </div>
        <div className="p-4 border border-primary/20 bg-primary/5 flex items-center gap-4">
           <Fingerprint className="w-8 h-8 text-primary/40" />
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-primary/60 tracking-widest">SECURITY LEVEL</span>
              <span className="text-xs font-black tracking-tighter">LVL 4 ROOT ACCESS</span>
           </div>
        </div>
      </div>

      <div className="relative mb-8 max-w-sm group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
        <Input 
          placeholder="FILTER IDENTITY ARCHIVE..." 
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
            <TableRow className="border-b-2 border-primary/10">
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest h-16">IDENTITY</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">EMAIL STAMP</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">ACCESS LVL</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">NODE STATUS</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-primary tracking-widest">JOINED DATE</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase text-primary tracking-widest pr-4">PROTOCOLS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((u) => (
              <TableRow key={u.id} className="hover:bg-primary/5 border-b border-primary/10 transition-colors h-20">
                <TableCell className="font-black tracking-tight uppercase italic">{u.name || "UNIDENTIFIED"}</TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge className={`${u.role === "ADMIN" ? "bg-primary text-black" : "bg-secondary text-foreground"} rounded-none border-none font-black text-[9px] uppercase`}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${u.isActive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"} rounded-none border-none font-black text-[9px] uppercase`}>
                    {u.isActive ? "LINK ACTIVE" : "NODE LOCKED"}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={u.role === "ADMIN" || toggleStatusMutation.isPending}
                      className={u.isActive ? "text-primary hover:bg-primary hover:text-black rounded-none" : "text-destructive hover:bg-destructive hover:text-white rounded-none"}
                      onClick={() => toggleStatusMutation.mutate(u.id)}
                    >
                      {toggleStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (u.isActive ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />)}
                    </Button>
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
    </div>
  );
};

export default AdminUsers;
