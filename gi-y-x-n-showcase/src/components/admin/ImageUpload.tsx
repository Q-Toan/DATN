import { useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const ImageUpload = ({ value, onChange, label = "[UPLOAD VECTOR ASSET]" }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("VUI LÒNG CHỌN FILE ẢNH // INVALID FILE TYPE");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("DUNG LƯỢNG ẢNH QUÁ LỚN (>5MB) // FILE TOO LARGE");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      const imageUrl = response.data.url;
      onChange(imageUrl);
      toast.success("TẢI ẢNH THÀNH CÔNG // UPLOAD SUCCESS");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "LỖI KHI TẢI ẢNH // UPLOAD ERROR");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between uppercase">
        <label className="text-[10px] font-black text-primary tracking-widest uppercase mb-2 block">
          {label}
        </label>
        {value && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={removeImage}
            className="h-6 px-2 text-[8px] font-black text-destructive hover:bg-destructive/10 rounded-none tracking-widest uppercase italic"
          >
            <X className="w-3 h-3 mr-1" /> REMOVE ASSET
          </Button>
        )}
      </div>

      <div className="relative group">
        {value ? (
          <div className="relative aspect-video w-full overflow-hidden border-2 border-primary/20 bg-secondary/30 group">
             <img 
               src={value} 
               alt="Upload preview" 
               className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
             />
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-white tracking-tighter uppercase italic">PREVIEW MODE</span>
             </div>
          </div>
        ) : (
          <div className="relative h-40 w-full border-2 border-dashed border-primary/20 bg-secondary/20 flex flex-col items-center justify-center transition-all hover:border-primary/50 group overflow-hidden">
             {/* BACKGROUND DECORATION */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
             </div>

             {uploading ? (
               <div className="flex flex-col items-center gap-3 relative z-10">
                 <Loader2 className="w-8 h-8 text-primary animate-spin" />
                 <span className="text-[10px] font-black text-primary tracking-widest animate-pulse uppercase">UPLOADING TO CLOUD...</span>
               </div>
             ) : (
               <label className="flex flex-col items-center gap-3 cursor-pointer relative z-10">
                 <div className="w-12 h-12 rounded-none border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-300">
                    <Upload className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase group-hover:text-primary transition-colors">SELECT BINARY ASSET</span>
                 <input 
                   type="file" 
                   className="hidden" 
                   onChange={handleFileChange}
                   accept="image/*"
                 />
               </label>
             )}
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center text-[8px] font-black text-muted-foreground/40 tracking-widest uppercase">
        <span>MAX FILE SIZE: 5.0MB</span>
        <span>STATUS: {value ? "SYNCED" : "IDLE"}</span>
      </div>
    </div>
  );
};

export default ImageUpload;
