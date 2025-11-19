"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home,
  ShoppingBag, 
  Users, 
  Printer,
  Layers,
  Image,
  Plus,
  Square,
  ShoppingCart,
  Tablet,
  Code,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  ChefHat,
  Settings,
  LogOut,
  Receipt,
  FileText,
  BarChart3,
  Sun,
  Moon,
  BookOpen,
  Monitor,
  SlidersHorizontal,
  Link2,
  Bell,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface MenuItem {
  label: string;
  icon: any;
  href?: string;
  badge?: string | number;
  badgeColor?: string;
  submenu?: {
    label: string;
    href: string;
    icon: any;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: BarChart3,
    href: '/admin',
    badge: 'Novo',
    badgeColor: 'orange'
  },
  {
    label: 'Cardápio',
    icon: BookOpen,
    submenu: [
      { label: 'Produtos', href: '/admin/items', icon: ShoppingBag },
      { label: 'Grupos e Categorias', href: '/admin/menu-structure', icon: Layers },
      { label: 'Adicionais', href: '/admin/additionals', icon: Plus }
    ]
  },
  {
    label: 'Impressão',
    icon: Printer,
    submenu: [
      { label: 'Fila', href: '/admin/printer-queue', icon: Layers, badge: 'Novo', badgeColor: 'orange' },
      { label: 'Impressoras', href: '/admin/printers', icon: Printer },
      { label: 'Templates', href: '/admin/templates', icon: FileText },
      { label: 'Perfils', href: '/admin/print-config', icon: SlidersHorizontal },
      { label: 'IRP', href: '/admin/product-printers', icon: Link2 }
    ]
  },
  {
    label: 'Operações',
    icon: Receipt,
    submenu: [
      { label: 'Mesas', href: '/admin/tables', icon: Square },
      { label: 'Promoções', href: '/admin/promocoes', icon: Gift }
    ]
  },
  {
    label: 'Restaurante',
    icon: Settings,
    href: '/admin/settings'
  }
];

// Theme Toggle Component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Use useEffect instead of useState
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg"
        disabled
      >
        <Moon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200"
      onClick={toggleTheme}
      type="button"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-orange-500" />
      ) : (
        <Moon className="h-5 w-5 text-orange-500" />
      )}
    </Button>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications?unread=true');
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-expand parent menu when a submenu item is active
  useEffect(() => {
    const newExpandedItems: string[] = [];
    
    menuItems.forEach((item) => {
      if (item.submenu) {
        const hasActiveSubItem = item.submenu.some(subItem => pathname === subItem.href);
        if (hasActiveSubItem) {
          newExpandedItems.push(item.label);
        }
      }
    });
    
    // Always update expandedItems based on current pathname
    // This ensures submenus collapse when navigating to pages without submenus
    setExpandedItems(newExpandedItems);
  }, [pathname]);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href;
  };

  const isParentActive = (item: MenuItem) => {
    if (item.href) return isActive(item.href);
    return item.submenu?.some(subItem => isActive(subItem.href)) || false;
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md relative overflow-hidden border-r border-gray-200/50 dark:border-gray-700/50">
      
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700/60 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/20">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">ComideX</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sistema Japonês</p>
            </div>
          </div>
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>

      {/* Navigation with custom scrollbar */}
      <div className="flex-1 overflow-y-auto px-3 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 #111827' }}>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.includes(item.label);
            const isActiveParent = isParentActive(item);

            return (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (item.href) {
                      handleNavigation(item.href);
                    } else if (item.submenu) {
                      toggleExpanded(item.label);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200",
                    "hover:bg-gray-100 dark:hover:bg-gray-800/60 group relative overflow-hidden",
                    isActiveParent && !item.submenu && "bg-gradient-to-r from-orange-500/20 to-orange-600/10 dark:from-orange-500/15 dark:to-orange-600/10 border-l-4 border-orange-500",
                    isActiveParent && item.submenu && "text-orange-500 dark:text-orange-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      isActiveParent 
                        ? "bg-orange-500/20 text-orange-500 dark:text-orange-400" 
                        : "bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700/60 group-hover:text-gray-900 dark:group-hover:text-white"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      isActiveParent ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                    )}>
                      {item.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge 
                        className={cn(
                          "text-xs px-1.5 py-0",
                          item.badgeColor === 'orange' 
                            ? "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30" 
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {item.submenu && (
                      <ChevronRight 
                        className={cn(
                          "h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )} 
                      />
                    )}
                  </div>
                  
                  {/* Active indicator */}
                  {isActiveParent && !item.submenu && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-orange-500" />
                  )}
                </button>

                {/* Submenu */}
                {item.submenu && isExpanded && (
                  <div className="mt-1 ml-3 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = isActive(subItem.href);
                      
                      return (
                        <button
                          key={subItem.label}
                          onClick={() => handleNavigation(subItem.href)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200",
                            "hover:bg-gray-100 dark:hover:bg-gray-800/60 group",
                            isSubActive && "bg-orange-100 dark:bg-orange-500/15"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "p-1.5 rounded-md transition-all duration-200",
                              isSubActive 
                                ? "bg-orange-500/20 text-orange-500 dark:text-orange-400" 
                                : "bg-transparent text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                            )}>
                              <SubIcon className="h-3.5 w-3.5" />
                            </div>
                            <span className={cn(
                              "text-sm transition-colors",
                              isSubActive 
                                ? "text-orange-500 dark:text-orange-400 font-medium" 
                                : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"
                            )}>
                              {subItem.label}
                            </span>
                          </div>
                          {subItem.badge && (
                            <Badge 
                              className={cn(
                                "text-xs px-1.5 py-0",
                                subItem.badgeColor === 'orange' 
                                  ? "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30" 
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              )}
                            >
                              {subItem.badge}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700/60 relative space-y-2">
        {/* Notifications Button */}
        <Button 
          variant="ghost" 
          className="w-full justify-start px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-xl group relative"
          onClick={() => handleNavigation('/admin/notifications')}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800/60 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-700/60 transition-all">
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-orange-500" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Notificações</span>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                {unreadCount}
              </Badge>
            )}
          </div>
        </Button>
        
        {/* Back to Home Button */}
        <Button 
          variant="ghost" 
          className="w-full justify-start px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-xl group"
          onClick={() => handleNavigation('/')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800/60 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-700/60 transition-all">
              <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-orange-500" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Voltar ao Início</span>
          </div>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-gray-300 dark:border-gray-800"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen fixed left-0 top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition-opacity duration-300",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
        
        {/* Sidebar */}
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-72 transition-transform duration-300",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent />
        </aside>
      </div>
    </>
  );
}