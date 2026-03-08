import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  BookOpen,
  Brain,
  Calendar,
  LayoutDashboard,
  Menu,
  PlusCircle,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";

import { AICoach } from "@/components/AICoach";
import { CalendarView } from "@/components/CalendarView";
import { Dashboard } from "@/components/Dashboard";
import { Statistics } from "@/components/Statistics";
import { TradeForm } from "@/components/TradeForm";
import { TradeJournal } from "@/components/TradeJournal";

type View =
  | "dashboard"
  | "new-trade"
  | "journal"
  | "calendar"
  | "statistics"
  | "ai-coach";

const NAV_ITEMS = [
  {
    view: "dashboard" as View,
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "sidebar.dashboard_link",
  },
  {
    view: "new-trade" as View,
    label: "New Trade",
    icon: PlusCircle,
    ocid: "sidebar.new_trade_link",
  },
  {
    view: "journal" as View,
    label: "Journal",
    icon: BookOpen,
    ocid: "sidebar.journal_link",
  },
  {
    view: "calendar" as View,
    label: "Calendar",
    icon: Calendar,
    ocid: "sidebar.calendar_link",
  },
  {
    view: "statistics" as View,
    label: "Statistics",
    icon: BarChart2,
    ocid: "sidebar.statistics_link",
  },
  {
    view: "ai-coach" as View,
    label: "AI Coach",
    icon: Brain,
    ocid: "sidebar.ai_coach_link",
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  function navigate(view: string) {
    setCurrentView(view as View);
    setMobileOpen(false);
  }

  function renderView() {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onNavigate={navigate} />;
      case "new-trade":
        return <TradeForm onNavigate={navigate} />;
      case "journal":
        return <TradeJournal />;
      case "calendar":
        return <CalendarView />;
      case "statistics":
        return <Statistics />;
      case "ai-coach":
        return <AICoach />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-40 w-64 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-200",
          "lg:relative lg:translate-x-0 lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-sidebar-foreground leading-none">
                MTF Confluence
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                Trading System
              </p>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                type="button"
                key={item.view}
                data-ocid={item.ocid}
                onClick={() => navigate(item.view)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isActive ? "text-primary" : "",
                  )}
                />
                {item.label}
                {item.view === "new-trade" && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-sidebar-border flex-shrink-0">
          <p className="text-[10px] text-muted-foreground text-center">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-border flex-shrink-0 bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="w-8 h-8"
            data-ocid="sidebar.toggle"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-sm">
              MTF Confluence
            </span>
          </div>
        </header>

        {/* Desktop breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 px-6 h-12 border-b border-border flex-shrink-0 bg-background/50">
          <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs font-semibold text-foreground capitalize">
            {currentView.replace("-", " ")}
          </span>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderView()}
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
