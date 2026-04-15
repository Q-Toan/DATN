import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Loader2, MessageSquare, Plus, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ReviewSectionProps {
  productId?: string;
  hideHeader?: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}

const ReviewSection = ({ productId, hideHeader = false }: ReviewSectionProps) => {
  const [current, setCurrent] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const visibleCount = 3;
  
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ["reviews", productId || "global"],
    queryFn: async () => {
      if (!productId) return []; 
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data as Review[];
    },
    enabled: !!productId || false,
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: { productId: string; rating: number; comment: string }) => {
      const response = await api.post("/reviews", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("TRANSMISSION RECEIVED // REVIEW POSTED");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      setIsFormOpen(false);
      setComment("");
      setRating(5);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "TRANSMISSION FAILED // RETRY LATER");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    createReviewMutation.mutate({ productId, rating, comment });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 uppercase">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-[10px] font-black tracking-widest text-primary/40 animate-pulse">EXTRACTING FEEDBACK DATA...</span>
      </div>
    );
  }

  const renderEmptyState = () => (
    <div className="py-24 border-2 border-dashed border-primary/10 flex flex-col items-center justify-center gap-6">
       <MessageSquare className="w-8 h-8 text-primary/20" />
       <div className="text-center mb-4">
          <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.4em] block mb-2">NO FEEDBACK TRANSMISSIONS FOUND</span>
          <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
            {productId ? "HÃY LÀ NGƯỜI ĐẦU TIÊN ĐÁNH GIÁ SẢN PHẨM NÀY // 0xVOID" : "CHƯA CÓ ĐÁNH GIÁ NÀO ĐƯỢC GHI NHẬN // 0xVOID"}
          </span>
       </div>
       {productId && renderReviewDialog()}
    </div>
  );

  const renderReviewDialog = () => (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogTrigger asChild>
        <button 
          className="h-12 px-8 bg-primary text-black rounded-none border border-primary font-black text-xs uppercase tracking-widest hover:bg-transparent hover:text-primary transition-all flex items-center gap-2 group"
          onClick={() => !isAuthenticated && toast.error("ACCESS DENIED // LOGIN TO POST FEEDBACK")}
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          {reviews && reviews.length > 0 ? "WRITE A REVIEW" : "POST FIRST REVIEW"}
        </button>
      </DialogTrigger>
      {isAuthenticated && (
        <DialogContent className="bg-background border-4 border-primary rounded-none p-0 max-w-lg uppercase">
          <DialogHeader className="p-8 border-b border-primary/20">
            <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none">POST_FEEDBACK</DialogTitle>
            <DialogDescription className="text-[10px] font-black text-primary tracking-[0.3em] mt-2 uppercase">
              TRANSMIT YOUR EXPERIENCE TO THE GRID
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-8 space-y-8 text-[10px]">
            <div className="space-y-4">
              <span className="block font-black text-primary tracking-[0.4em] uppercase underline decoration-primary/30 underline-offset-4">RATING_SCALE [1-5]:</span>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="group transition-transform active:scale-95"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= rating ? "fill-primary text-primary" : "text-primary/20 hover:text-primary/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <span className="block font-black text-primary tracking-[0.4em] uppercase underline decoration-primary/30 underline-offset-4">COMMISSION_DATA [TEXT]:</span>
              <Textarea
                placeholder="INPUT YOUR TRANSMISSION HERE..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="min-h-[150px] bg-secondary/20 border-primary/20 rounded-none focus:border-primary focus:ring-0 font-mono tracking-widest uppercase text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={createReviewMutation.isPending}
              className="w-full h-16 bg-primary text-black rounded-none font-black text-lg italic tracking-tighter hover:bg-white transition-all gap-4 group"
            >
              {createReviewMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  TRANSMIT DATA <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );

  if (error || !reviews || reviews.length === 0) {
    return renderEmptyState();
  }

  const maxIndex = Math.max(0, reviews.length - visibleCount);

  return (
    <div className="py-12 uppercase">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-primary/20 pb-8">
          <h2 className="text-6xl md:text-8xl font-black text-foreground leading-none tracking-tighter uppercase italic">
            USER<br />FEEDBACK
          </h2>
          <div className="flex flex-col items-end gap-6 mt-8 md:mt-0">
            <p className="text-muted-foreground text-[10px] font-black tracking-[0.5em] uppercase">
              04 // COMMUNITY REVIEWS
            </p>
            {productId && renderReviewDialog()}
          </div>
        </div>
      )}

      <div className="relative">
        {/* ACTION TRIGGER FOR INLINE VIEW */}
        {hideHeader && productId && (
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] font-black text-primary tracking-widest uppercase">TOTAL_TRANSMISSIONS: {reviews.length}</span>
            {renderReviewDialog()}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-px bg-primary/10 border border-primary/10">
          {reviews.slice(current, current + visibleCount).map((review, i) => (
            <div 
              key={review.id} 
              className={`flex-1 bg-card p-10 relative group transition-all duration-200 ${!productId && i % 2 === 1 ? 'md:translate-y-8' : ''}`}
            >
              <div className="flex flex-col gap-6">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                
                <p className="font-bold text-lg md:text-xl tracking-tight leading-relaxed text-foreground uppercase italic line-clamp-4">
                  "{review.comment.toUpperCase()}"
                </p>

                <div className="flex items-center gap-4 pt-6 border-t border-primary/10">
                  <div className="w-10 h-10 grayscale brightness-110 bg-secondary/50 flex items-center justify-center">
                    {review.user.avatar ? (
                      <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-[8px] text-primary/60 tracking-widest">{review.user.name.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[8px] font-black tracking-[0.3em] text-primary uppercase leading-none mb-1">{review.user.name}</p>
                    <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest italic">VERIFIED_COLLECTOR</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {maxIndex > 0 && (
          <div className="flex justify-end gap-px mt-16">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="bg-card border border-primary/10 p-5 hover:bg-primary hover:text-black transition-all disabled:opacity-20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrent((c) => Math.min(maxIndex, c + 1))}
              disabled={current >= maxIndex}
              className="bg-card border border-primary/10 p-5 hover:bg-primary hover:text-black transition-all disabled:opacity-20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
