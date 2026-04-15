import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { getAssetUrl } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface BlogSectionProps {
  hideHeader?: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  thumbnail: string;
  author: string;
  createdAt: string;
}

const BlogSection = ({ hideHeader = false }: BlogSectionProps) => {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["published-blogs"],
    queryFn: async () => {
      const response = await api.get("/blogs/published");
      return response.data as BlogPost[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 uppercase">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-[10px] font-black tracking-widest text-primary/40 animate-pulse">EXTRACTING BLOG DATA...</span>
      </div>
    );
  }

  if (error || !posts || posts.length === 0) {
    return (
      <div className="py-24 border-2 border-dashed border-primary/10 flex items-center justify-center">
         <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.4em]">NO ARTICLES ARCHIVED // 0xBLOG</span>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-primary/20 pb-8 uppercase">
          <h2 className="text-6xl md:text-8xl font-black text-foreground leading-none tracking-tighter uppercase italic">
            THE<br />BLOG
          </h2>
          <p className="text-muted-foreground text-xs font-black tracking-widest mt-4 md:mt-0 uppercase">
            03 // LATEST INSIGHTS
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <a 
            key={post.id} 
            href="#" 
            className="group relative bg-card border border-primary/10 overflow-hidden transition-all duration-300 hover:border-primary hover:border-glow"
          >
            <div className="aspect-[4/3] overflow-hidden grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-200">
              <img
                src={getAssetUrl(post.thumbnail)}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                 <span className="h-[1px] w-4 bg-primary" />
                 <time className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {new Date(post.createdAt).toLocaleDateString("en-US", { month: 'short', day: '2-digit', year: 'numeric' })}
                 </time>
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight text-card-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="mt-4 text-[11px] font-medium text-muted-foreground line-clamp-2 leading-relaxed uppercase">
                {post.content.substring(0, 100)}...
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default BlogSection;
