import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/data/mockData";

interface ProductSectionProps {
  products: Product[];
}

const ITEMS_PER_PAGE = 8;

const ProductSection = ({ products }: ProductSectionProps) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const visibleProducts = useMemo(
    () => products.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE),
    [products, page]
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-primary/10 border border-primary/10">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            PAGE {page + 1} // {totalPages}
          </div>
          <div className="flex gap-px bg-primary/20">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="bg-background border border-primary/10 p-3 hover:bg-primary hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-background disabled:hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="bg-background border border-primary/10 p-3 hover:bg-primary hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-background disabled:hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSection;

