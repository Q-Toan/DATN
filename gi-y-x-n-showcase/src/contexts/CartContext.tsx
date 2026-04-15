import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  images?: string[];
  description: string;
  category: string | Category;
  stock?: number;
}

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();

  // Load cart from backend if authenticated, otherwise from localStorage
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get("/cart");
          const backendItems = response.data.items
            .filter((item: any) => item.product) // Filter out items with missing products
            .map((item: any) => ({
              id: item.id,
              product: item.product,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
            }));
          setItems(backendItems);
          toast.success("GIỎ HÀNG ĐÃ ĐƯỢC ĐỒNG BỘ // SYNC SUCCESS");
        } catch (error) {
          // Silent failure in production
        }
      } else {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      }
      setIsLoading(false);
    };

    fetchCart();
  }, [isAuthenticated, token]);

  // Persist local cart
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  const addToCart = async (product: Product, quantity = 1, size?: string, color?: string) => {
    if (isAuthenticated) {
      try {
        const payload = { productId: product.id, quantity, size: size || undefined, color: color || undefined };
        
        const postResponse = await api.post("/cart/add", payload);

        // Refresh cart from server to ensure consistency
        const response = await api.get("/cart");
        
        const backendItems = response.data.items.map((item: any) => ({
          id: item.id,
          product: item.product,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }));
        
        setItems(backendItems);
        toast.success("ĐÃ THÊM VÀO GIỎ HÀNG HỆ THỐNG // OBJECT LOADED");
      } catch (error: any) {
        toast.error(`KHÔNG THỂ CẬP NHẬT GIỎ HÀNG // ${error.response?.data?.message || "SYNC ERROR"}`);
      }
    } else {
      setItems((prev) => {
        // For local cart, treat different size/color combinations as different items
        const existing = prev.find(
          (i) => i.product.id === product.id && i.size === size && i.color === color
        );
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id && i.size === size && i.color === color 
              ? { ...i, quantity: i.quantity + quantity } 
              : i
          );
        }
        return [...prev, { product, quantity, size, color }];
      });
      toast.info("ĐÃ THÊM VÀO GIỎ HÀNG TẠM THỜI // LOCAL CACHE UPDATED");
    }
  };

  const removeFromCart = async (productId: string, size?: string, color?: string) => {
    if (isAuthenticated) {
      try {
        // Backend handles deletion via update with quantity 0
        await api.put("/cart/update", { productId, quantity: 0, size, color });
        setItems((prev) => prev.filter((i) => !(i.product?.id === productId && i.size === size && i.color === color)));
        toast.success("ĐÃ XÓA SẢN PHẨM KHỎI GIỎ HÀNG // PURGE SUCCESS");
      } catch (error) {
        toast.error("KHÔNG THỂ XÓA SẢN PHẨM // PURGE ERROR");
      }
    } else {
      setItems((prev) => prev.filter((i) => !(i.product?.id === productId && i.size === size && i.color === color)));
      toast.info("ĐÃ XÓA KHỎI BỘ NHỚ TẠM // CACHE PURGED");
    }
  };

  const updateQuantity = async (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) return removeFromCart(productId, size, color);
    
    if (isAuthenticated) {
      try {
        await api.put("/cart/update", { 
          productId, 
          quantity,
          size,
          color
        });
        setItems((prev) =>
          prev.map((i) => (i.product?.id === productId && i.size === size && i.color === color ? { ...i, quantity } : i))
        );
      } catch (error) {
        toast.error("KHÔNG THỂ CẬP NHẬT SỐ LƯỢNG // UPDATE ERROR");
      }
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product?.id === productId && i.size === size && i.color === color ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    toast.warning("GIỎ HÀNG ĐÃ ĐƯỢC LÀM TRỐNG // FLUSH COMPLETE");
  };

  const totalItems = items.reduce((sum, i) => sum + (i?.quantity || 0), 0);
  const totalPrice = items.reduce(
    (sum, i) => {
      const price = i?.product?.salePrice || i?.product?.price || 0;
      return sum + price * (i?.quantity || 0);
    },
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, isLoading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
