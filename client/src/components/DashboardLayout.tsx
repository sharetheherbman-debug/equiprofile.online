import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  BookTemplate,
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
  Briefcase,
  UserCog,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";
import { ThemeToggle } from "./ThemeToggle";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: CircleDot, label: "My Horses", path: "/horses" },
  { icon: Heart, label: "Health Records", path: "/health" },
  { icon: Activity, label: "Training", path: "/training" },
  {
    icon: BookTemplate,
    label: "Training Templates",
    path: "/training-templates",
  },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: Users, label: "Contacts", path: "/contacts" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: BookOpen, label: "Reports", path: "/reports" },
  { icon: Brain, label: "AI Chat", path: "/ai-chat" },
  { icon: Cloud, label: "Weather", path: "/weather" },
  { icon: Utensils, label: "Feeding Plans", path: "/feeding" },
  { icon: ListChecks, label: "Tasks", path: "/tasks" },
  { icon: Baby, label: "Breeding", path: "/breeding" },
  { icon: DollarSign, label: "Billing", path: "/billing" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

// Extra menu items for Stable plan subscribers
const stableMenuItems = [
  { icon: Building2, label: "Stable Dashboard", path: "/stable-dashboard" },
  { icon: Home, label: "Stable", path: "/stable" },
  { icon: UserCog, label: "Staff", path: "/contacts" },
  { icon: Briefcase, label: "Owners", path: "/contacts" },
];

const adminMenuItems = [
  { icon: Shield, label: "Admin Panel", path: "/admin" },
  { icon: Shield, label: "QA Checklist", path: "/qa-check" },
];

// Bottom nav tabs (5 max for mobile)
const bottomNavItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: CircleDot, label: "Horses", path: "/horses" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
];

// All modules grouped for the "More" sheet
const moreModuleGroups = [
  {
    label: "Health",
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
    label: "Training",
    items: [
      { icon: Dumbbell, label: "Training Log", path: "/training" },
      { icon: BookOpen, label: "Templates", path: "/training-templates" },
      { icon: Users, label: "Lessons", path: "/lessons" },
      { icon: Baby, label: "Breeding", path: "/breeding" },
    ],
  },
  {
    label: "Nutrition",
    items: [
      { icon: Apple, label: "Feeding Plans", path: "/feeding" },
      { icon: FileText, label: "Nutrition Plans", path: "/nutrition-plans" },
      { icon: BookOpen, label: "Nutrition Logs", path: "/nutrition-logs" },
    ],
  },
  {
    label: "Schedule",
    items: [
      { icon: Clock, label: "Appointments", path: "/appointments" },
      { icon: ListChecks, label: "Tasks", path: "/tasks" },
    ],
  },
  {
    label: "AI & Info",
    items: [
      { icon: Brain, label: "AI Assistant", path: "/ai-chat" },
      { icon: Cloud, label: "Weather", path: "/weather" },
      { icon: GitBranch, label: "Pedigree", path: "/pedigree" },
    ],
  },
  {
    label: "Data & Reports",
    items: [
      { icon: FileText, label: "Documents", path: "/documents" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
      { icon: FileText, label: "Reports", path: "/reports" },
      { icon: Tag, label: "Tags", path: "/tags" },
    ],
  },
  {
    label: "Stable & People",
    items: [
      { icon: Home, label: "Stable Management", path: "/stable" },
      { icon: Users, label: "Contacts", path: "/contacts" },
    ],
  },
  {
    label: "Account",
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
  const activeMenuItem = menuItems.find((item) => item.path === location);
  const isMobile = useIsMobile();
  const { isAdminVisible } = useAdminToggle();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  // Check admin unlock status — available to any authenticated user
  const { data: adminStatus } = trpc.adminUnlock.getStatus.useQuery(undefined, {
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Check subscription tier for stable plan features
  const { data: subscriptionStatus } = trpc.user.getSubscriptionStatus.useQuery(
    undefined,
    { staleTime: 5 * 60 * 1000 },
  );
  const isStablePlan = subscriptionStatus?.planTier === "stable";

  // Build fingerprint — shown in sidebar footer for admins only
  const { data: buildInfo } = trpc.system.getBuildInfo.useQuery(undefined, {
    enabled: !!adminStatus?.isUnlocked,
    staleTime: Infinity,
  });

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
          className="border-r-0"
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
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-serif font-semibold tracking-tight truncate text-primary">
                    EquiProfile
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal`}
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
                          className="h-10 transition-all font-normal"
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
              {/* Stable plan menu items */}
              {isStablePlan && (
                <>
                  <div className="my-2 px-2">
                    <div className="h-px bg-border" />
                    {!isCollapsed && (
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-2 px-2 font-semibold">
                        Stable
                      </p>
                    )}
                  </div>
                  {stableMenuItems.map((item) => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={`stable-${item.label}`}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className="h-10 transition-all font-normal"
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
            </div>
            {/* Admin-only build fingerprint */}
            {adminStatus?.isUnlocked && buildInfo && !isCollapsed && (
              <div className="px-1 mb-2 group-data-[collapsible=icon]:hidden">
                <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                  <span className="text-primary font-semibold">
                    Dashboard v2
                  </span>
                  {" · "}
                  {buildInfo.sha !== "unknown" ? `sha:${buildInfo.sha}` : "dev"}
                  {" · "}v{buildInfo.version}
                </p>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
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
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
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
            <ThemeToggle />
          </div>
        )}
        <main className={`flex-1 p-4 ${isMobile ? "pb-20" : ""}`}>
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        {isMobile && (
          <nav
            className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
            aria-label="Mobile navigation"
          >
            <div className="flex items-stretch h-16">
              {bottomNavItems.map((item) => {
                const isActive =
                  location === item.path ||
                  (item.path === "/dashboard" && location === "/");
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
                  <SheetHeader className="pb-2">
                    <SheetTitle className="font-serif text-left">
                      Modules
                    </SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 pb-6">
                    {moreModuleGroups.map((group) => (
                      <div key={group.label}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {group.label}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = location === item.path;
                            return (
                              <button
                                key={item.path}
                                onClick={() => {
                                  setLocation(item.path);
                                  setMoreSheetOpen(false);
                                }}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center min-h-[64px] ${
                                  isActive
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-card hover:bg-accent"
                                }`}
                              >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className="text-[11px] leading-tight font-medium">
                                  {item.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
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
