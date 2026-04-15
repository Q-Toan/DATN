import { Link, Outlet, useLocation } from "react-router-dom";
import { Package, FolderTree, Users, LayoutDashboard, ArrowLeft, ShoppingCart, Newspaper, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Đơn Hàng", href: "/admin/orders", icon: ShoppingCart },
  { label: "Sản Phẩm", href: "/admin/products", icon: Package },
  { label: "Danh Mục", href: "/admin/categories", icon: FolderTree },
  { label: "Người Dùng", href: "/admin/users", icon: Users },
  { label: "Tin Tức", href: "/admin/posts", icon: Newspaper },
];


const AdminLayout = () => {
  const location = useLocation();
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Absolute block for non-admins
  if (!isAuthenticated || !isAdmin) {
    console.warn("SECURITY_BREACH // ACCESS_DENIED: Non-admin attempted to visit admin area.");
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-primary">Giày Xịn Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden border-b bg-card p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary">Admin</h1>
          <div className="flex gap-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  location.pathname === link.href ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <link.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
