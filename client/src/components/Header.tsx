import { useLocation } from "wouter";
import { LayoutDashboard, Users, Shield, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config/app";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/students', label: 'Students', icon: Users }
  ];

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="w-[90%] mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => setLocation("/")}>
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="md:hidden">{APP_CONFIG.shortName}</span>
              <span className="hidden md:inline">{APP_CONFIG.name}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Navigation Menu */}
            <nav className="flex gap-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => setLocation(path)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                    location === path
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </nav>

            {/* Admin Settings Icon */}
            {user?.role === "admin" && (
              <div className="border-l pl-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={location === "/admin/settings" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setLocation("/admin/settings")}
                    >
                      <Settings className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Settings</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>System Settings</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* User section */}
            <div className="flex items-center gap-2 border-l pl-4">
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user?.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
