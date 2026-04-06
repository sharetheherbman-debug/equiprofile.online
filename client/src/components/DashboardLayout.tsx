import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { useAdminToggle } from "@/hooks/useAdminToggle";

import {
  LayoutDashboard,
  LogOut,
  PanelLeft,
  CircleDot,
  Heart,
  Activity,
  Utensils,
  Cloud,
  FileText,
  Settings,
  Shield,
  MessageSquare,
  ListChecks,
  Baby,
  Calendar,
  Users,
  MoreHorizontal,
  Dumbbell,
  Apple,
  BarChart3,
  DollarSign,
  Stethoscope,
  Syringe,
  Scissors,
  Pill,
  XCircle,
  GitBranch,
  BookOpen,
  Tag,
  Clock,
  Brain,
  Home,
  Building2,
  UserCog,
  Navigation,
  ShoppingCart,
  Wrench,
  Trophy,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationCenter } from "./NotificationCenter";
import { TrialBanner } from "./TrialBanner";

// Standard plan primary nav
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: CircleDot, label: "My Horses", path: "/horses" },
  { icon: Heart, label: "Health Records", path: "/health" },
  { icon: Utensils, label: "Feeding Plans", path: "/feeding" },
  { icon: Activity, label: "Training", path: "/training" },
  { icon: Cloud, label: "Weather", path: "/weather" },
  { icon: Brain, label: "AI Chat", path: "/ai-chat" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: ListChecks, label: "Tasks", path: "/tasks" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: BookOpen, label: "Reports", path: "/reports" },
  { icon: Users, label: "Contacts", path: "/contacts" },
  { icon: DollarSign, label: "Billing", path: "/billing" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

// Stable plan primary nav — shown instead of (not in addition to) standard nav for stable users
const stableNavItems = [
  { icon: Building2, label: "Stable Dashboard", path: "/stable-dashboard" },
  { icon: CircleDot, label: "Horses", path: "/horses" },
  { icon: UserCog, label: "Staff", path: "/staff" },
  { icon: Users, label: "Owners & Clients", path: "/contacts" },
  { icon: Calendar, label: "Yard Calendar", path: "/calendar" },
  { icon: Activity, label: "Training", path: "/training" },
  { icon: Heart, label: "Health Records", path: "/health" },
  { icon: ListChecks, label: "Tasks", path: "/tasks" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: BarChart3, label: "Reports", path: "/stable-reports" },
  { icon: Brain, label: "AI Chat", path: "/ai-chat" },
  { icon: Cloud, label: "Weather", path: "/weather" },
  { icon: Home, label: "Stable Profile", path: "/stable" },
  { icon: Wrench, label: "Stable Setup", path: "/stable-setup" },
  { icon: DollarSign, label: "Billing", path: "/billing" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const adminMenuItems = [
  { icon: Shield, label: "Admin Panel", path: "/admin" },
  { icon: Shield, label: "QA Checklist", path: "/qa-check" },
];

// Bottom nav tabs — plan-aware (5 primary actions + More)
const standardBottomNavItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: CircleDot, label: "Horses", path: "/horses" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: ListChecks, label: "Tasks", path: "/tasks" },
];

const stableBottomNavItems = [
  { icon: Building2, label: "Stable", path: "/stable-dashboard" },
  { icon: CircleDot, label: "Horses", path: "/horses" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: ListChecks, label: "Tasks", path: "/tasks" },
];

// All modules grouped for the "More" sheet — organised for clarity
const moreModuleGroups = [
  {
    label: "Core",
    iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
    items: [
      { icon: Brain, label: "AI Assistant", path: "/ai-chat" },
      { icon: Cloud, label: "Weather", path: "/weather" },
      { icon: Users, label: "Contacts", path: "/contacts" },
      { icon: Clock, label: "Appointments", path: "/appointments" },
    ],
  },
  {
    label: "Health",
    iconBg: "bg-gradient-to-br from-rose-500 to-red-600",
    items: [
      { icon: Stethoscope, label: "Health Hub", path: "/health" },
      { icon: Syringe, label: "Vaccinations", path: "/vaccinations" },
      { icon: Scissors, label: "Dental Care", path: "/dental" },
      { icon: Activity, label: "Hoof Care", path: "/hoofcare" },
      { icon: Pill, label: "Dewormings", path: "/dewormings" },
      { icon: Heart, label: "Treatments", path: "/treatments" },
      { icon: XCircle, label: "X-Rays", path: "/xrays" },
    ],
  },
  {
    label: "Training & Activity",
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    items: [
      { icon: Dumbbell, label: "Training Log", path: "/training" },
      { icon: BookOpen, label: "Templates", path: "/training-templates" },
      { icon: Navigation, label: "GPS Tracking", path: "/ride-tracking" },
      { icon: Trophy, label: "Competitions", path: "/competitions" },
      { icon: Users, label: "Lessons", path: "/lessons" },
      { icon: Baby, label: "Breeding", path: "/breeding" },
    ],
  },
  {
    label: "Nutrition",
    iconBg: "bg-gradient-to-br from-lime-500 to-green-600",
    items: [
      { icon: Apple, label: "Feeding Plans", path: "/feeding" },
      { icon: FileText, label: "Nutrition Plans", path: "/nutrition-plans" },
      { icon: BookOpen, label: "Nutrition Logs", path: "/nutrition-logs" },
      { icon: ShoppingCart, label: "Feed Costs", path: "/feed-costs" },
    ],
  },
  {
    label: "Data & Reports",
    iconBg: "bg-gradient-to-br from-indigo-500 to-violet-600",
    items: [
      { icon: FileText, label: "Documents", path: "/documents" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
      { icon: FileText, label: "Reports", path: "/reports" },
      { icon: Tag, label: "Tags", path: "/tags" },
      { icon: GitBranch, label: "Pedigree", path: "/pedigree" },
      { icon: Shield, label: "Equine Passport", path: "/equine-passport" },
    ],
  },
  {
    label: "Stable & People",
    iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600",
    items: [
      { icon: Home, label: "Stable Management", path: "/stable" },
      { icon: UserCog, label: "Staff", path: "/staff" },
      { icon: MessageSquare, label: "Messages", path: "/messages" },
    ],
  },
  {
    label: "Account",
    iconBg: "bg-gradient-to-br from-slate-500 to-gray-600",
    items: [
      { icon: Settings, label: "Settings", path: "/settings" },
      { icon: DollarSign, label: "Billing", path: "/billing" },
    ],
  },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Sign in to continue
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Access to this dashboard requires authentication. Continue to
              launch the login flow.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { isAdminVisible } = useAdminToggle();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  // Check admin unlock status — available to any authenticated user
  const { data: adminStatus } = trpc.adminUnlock.getStatus.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  // Check subscription tier for stable plan features
  const { data: subscriptionStatus } = trpc.user.getSubscriptionStatus.useQuery(
    undefined,
    { staleTime: 5 * 60 * 1000 },
  );
  const isStablePlan = subscriptionStatus?.planTier === "stable";
  const bothDashboardsUnlocked = !!subscriptionStatus?.bothDashboardsUnlocked;

  // Determine which dashboard view is active for users with both dashboards
  const isOnStablePages = location.startsWith("/stable");

  // Plan-aware nav and bottom nav
  const activeNavItems = bothDashboardsUnlocked
    ? (isOnStablePages ? stableNavItems : menuItems)
    : (isStablePlan ? stableNavItems : menuItems);
  const bottomNavItems = bothDashboardsUnlocked
    ? (isOnStablePages ? stableBottomNavItems : standardBottomNavItems)
    : (isStablePlan ? stableBottomNavItems : standardBottomNavItems);
  const activeMenuItem = activeNavItems.find((item) => item.path === location);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-white/5 bg-sidebar"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="/logo.png"
                    alt="EquiProfile"
                    className="h-10 w-auto object-contain shrink-0"
                  />
                  <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent truncate">
                    EquiProfile
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {bothDashboardsUnlocked && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={!isOnStablePages}
                      onClick={() => setLocation("/dashboard")}
                      tooltip="Standard Dashboard"
                      className={`h-10 transition-all font-medium ${!isOnStablePages ? "bg-primary/10 text-primary font-semibold" : ""}`}
                    >
                      <LayoutDashboard className={`h-4 w-4 ${!isOnStablePages ? "text-primary" : ""}`} />
                      <span>Standard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isOnStablePages}
                      onClick={() => setLocation("/stable-dashboard")}
                      tooltip="Stable Dashboard"
                      className={`h-10 transition-all font-medium ${isOnStablePages ? "bg-primary/10 text-primary font-semibold" : ""}`}
                    >
                      <Building2 className={`h-4 w-4 ${isOnStablePages ? "text-primary" : ""}`} />
                      <span>Stable</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <div className="my-2 px-2">
                    <div className="h-px bg-border" />
                  </div>
                </>
              )}
              {activeNavItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-medium ${isActive ? "bg-primary/10 text-primary font-semibold" : ""}`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {/* Admin menu items */}
              {adminStatus?.isUnlocked && (
                <>
                  <div className="my-2 px-2">
                    <div className="h-px bg-border" />
                  </div>
                  {adminMenuItems.map((item) => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className={`h-10 transition-all font-medium ${isActive ? "bg-primary/10 text-primary font-semibold" : ""}`}
                        >
                          <item.icon
                            className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                          />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </>
              )}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <div className="flex items-center justify-between gap-2 px-1 mb-2 group-data-[collapsible=icon]:justify-center">
              <ThemeToggle />
              <NotificationCenter />
            </div>
            {/* Admin-only build fingerprint removed — version info stays internal */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarImage src={user?.profileImageUrl ?? undefined} alt={user?.name ?? ""} />
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b border-white/5 h-14 items-center justify-between bg-background/90 px-2 backdrop-blur-md sticky top-0 z-40" style={{ paddingTop: 'var(--safe-area-top, 0px)' }}>
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <NotificationCenter />
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-7 w-7 border ml-1 cursor-pointer">
                    <AvatarImage src={user?.profileImageUrl ?? undefined} alt={user?.name ?? ""} />
                    <AvatarFallback className="text-[10px] font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 border-b mb-1">
                    <p className="text-sm font-medium truncate">{user?.name || "-"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || "-"}</p>
                  </div>
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
        <main className="flex-1 p-3 sm:p-5 md:p-6 overflow-x-hidden" style={isMobile ? { paddingBottom: 'calc(5rem + var(--safe-area-bottom, 0px))' } : undefined}>
          <TrialBanner />
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        {isMobile && (
          <nav
            className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
            style={{ paddingBottom: 'var(--safe-area-bottom, 0px)' }}
            aria-label="Mobile navigation"
          >
            <div className="flex items-stretch h-16">
              {bottomNavItems.map((item) => {
                const isActive =
                  location === item.path ||
                  (item.path === "/dashboard" && location === "/") ||
                  (item.path === "/stable-dashboard" && location === "/");
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => setLocation(item.path)}
                    className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors min-h-[44px] ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 ${isActive ? "text-primary" : ""}`}
                    />
                    <span className="text-[10px] leading-none">
                      {item.label}
                    </span>
                  </button>
                );
              })}
              {/* More sheet trigger */}
              <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
                <SheetTrigger asChild>
                  <button
                    className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                    aria-label="More modules"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="text-[10px] leading-none">More</span>
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="max-h-[80vh] overflow-y-auto rounded-t-xl"
                >
                  <SheetHeader className="pb-3">
                    <SheetTitle className="font-serif text-left text-base">
                      All Features
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                      Navigate to any feature in the app
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-5" style={{ paddingBottom: 'calc(1.5rem + var(--safe-area-bottom, 0px))' }}>
                    {moreModuleGroups.map((group) => {
                      // Filter stable-only items for non-stable users
                      const items = group.items.filter((item) => {
                        if (
                          !isStablePlan &&
                          (item.label === "Breeding" ||
                            item.label === "Lessons" ||
                            item.label === "Stable Management" ||
                            item.label === "Staff" ||
                            item.label === "Messages")
                        )
                          return false;
                        return true;
                      });
                      if (items.length === 0) return null;
                      return (
                        <div key={group.label}>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 px-0.5">
                            {group.label}
                          </p>
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {items.map((item) => {
                              const Icon = item.icon;
                              const isActive = location === item.path;
                              return (
                                <button
                                  key={item.path}
                                  onClick={() => {
                                    setLocation(item.path);
                                    setMoreSheetOpen(false);
                                  }}
                                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all text-center active:scale-95 ${
                                    isActive
                                      ? "border-primary/40 bg-primary/10 text-primary"
                                      : "border-border/60 bg-card hover:bg-accent/60"
                                  }`}
                                >
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-primary/20" : group.iconBg}`}>
                                    <Icon className="h-4 w-4 text-white" />
                                  </div>
                                  <span className="text-[10px] leading-tight font-medium">
                                    {item.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {/* Sign Out — always visible at the bottom of the More sheet */}
                    <div className="pt-2 border-t">
                      <button
                        onClick={() => {
                          logout();
                          setMoreSheetOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        )}
      </SidebarInset>
    </>
  );
}

// Named export for compatibility with existing imports
export { DashboardLayout };
