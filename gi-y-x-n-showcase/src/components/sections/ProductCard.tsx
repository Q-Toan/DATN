import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getAssetUrl } from "@/lib/utils";
import type { Product } from "@/data/mockData";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="group relative bg-card border border-primary/10 overflow-hidden transition-all duration-300 hover:border-primary hover:border-glow">
      {/* SHARP OVERLAY EFFECT */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors z-10 pointer-events-none" />
      
      <Link to={`/products/${product.id}`} className="relative aspect-[4/5] overflow-hidden block">
        <img
          src={getAssetUrl(product.image || (product.images && product.images[0]))}
          alt={product.name}
          className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-200 ease-out"
          loading="lazy"
        />
        
        {/* SHARP BADGES */}
        {product.badge && (
          <div className="absolute top-0 left-0 z-20">
             <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                product.badge === "Hot"
                  ? "bg-accent text-white"
                  : product.badge === "New"
                  ? "bg-primary text-black"
                  : "bg-white text-black"
              }`}>
                {product.badge}
                {product.discount && product.badge === "Sale" ? ` // -${product.discount}%` : ""}
             </div>
          </div>
        )}

        {/* HOVER SCANLINE */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-[200%] -translate-y-full group-hover:translate-y-full transition-transform duration-400 pointer-events-none z-20" />
      </Link>

      <div className="p-4 relative z-20">
        <div className="flex justify-between items-start gap-4 mb-3">
          <Link to={`/products/${product.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-black text-xs tracking-tight uppercase leading-none">
              {product.name}
            </h3>
          </Link>
          <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
            ID / {product.id.slice(-4).toUpperCase()}
          </span>
        </div>
        
        <div className="flex flex-col">
          {product.salePrice ? (
            <div className="flex items-baseline gap-2">
              <span className="text-primary font-black text-lg tracking-tighter tabular-nums">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-muted-foreground text-[10px] line-through tabular-nums">
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-foreground font-black text-lg tracking-tighter tabular-nums">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <button className="w-full mt-4 py-2 border border-primary/20 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-primary hover:text-black transition-all">
          ADD TO CART
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

