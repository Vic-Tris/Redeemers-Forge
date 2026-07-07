import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Menu, User, Crown, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useUser, useClerk, Show } from "@clerk/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminStatus } from "@/hooks/useAdminStatus";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/stories", label: "Stories" },
  { href: "/devotionals", label: "Devotionals" },
  { href: "/videos", label: "Videos" },
  { href: "/books", label: "Books" },
  { href: "/community", label: "Community" },
];

export function Navbar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAdmin } = useAdminStatus();

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-primary">The Redeemer's Forge</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-primary transition-colors">
                {label}
              </Link>
            ))}
            <Link href="/premium" className="hover:text-secondary transition-colors font-semibold text-secondary">
              Premium ✦
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            onClick={() => setLocation("/search")}
          >
            <Search className="h-5 w-5" />
          </Button>

          <ThemeToggle />

          {/* Auth */}
          {!isLoaded ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : (
            <>
              <Show when="signed-in">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border border-border">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.imageUrl ?? ""} alt={user?.fullName ?? ""} />
                        <AvatarFallback className="text-xs font-serif bg-primary/10 text-primary">{initials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-secondary">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      )}
                    </div>
                    <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => setLocation("/admin")}>
                        <Shield className="mr-2 h-4 w-4" /> Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setLocation("/premium")}>
                      <Crown className="mr-2 h-4 w-4" /> Upgrade
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => signOut({ redirectUrl: basePath || "/" })}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Show>
              <Show when="signed-out">
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">Sign In</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Join Free</Button>
                  </Link>
                </div>
              </Show>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <div className="flex flex-col h-full">
                <div className="font-serif text-lg font-bold text-primary mb-6 pt-2">
                  The Redeemer's Forge
                </div>
                <nav className="flex flex-col gap-1 flex-1">
                  {NAV_LINKS.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-foreground hover:bg-muted hover:text-primary transition-colors font-medium"
                    >
                      {label}
                    </Link>
                  ))}
                  <Link
                    href="/premium"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-secondary hover:bg-secondary/10 transition-colors font-semibold"
                  >
                    ✦ Premium
                  </Link>
                  <Link
                    href="/search"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-foreground hover:bg-muted hover:text-primary transition-colors font-medium flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" /> Search
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-secondary hover:bg-secondary/10 transition-colors font-medium flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                </nav>
                <div className="border-t border-border pt-4 pb-2">
                  <Show when="signed-out">
                    <div className="flex flex-col gap-2">
                      <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full border-primary text-primary">Sign In</Button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full bg-primary text-primary-foreground">Join Free</Button>
                      </Link>
                    </div>
                  </Show>
                  <Show when="signed-in">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.imageUrl ?? ""} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user?.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                        {isAdmin && (
                          <span className="text-xs font-medium text-secondary flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Admin
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => { setMobileOpen(false); signOut({ redirectUrl: basePath || "/" }); }}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                  </Show>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
