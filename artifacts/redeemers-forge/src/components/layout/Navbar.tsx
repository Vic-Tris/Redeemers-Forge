import { Link } from "wouter";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "@/components/ui/button";
import { Search, Bell, Menu, User } from "lucide-react";
import { useGetMyProfile } from "@workspace/api-client-react";

export function Navbar() {
  const { data: profile } = useGetMyProfile();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-primary">The Redeemer's Forge</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/stories" className="hover:text-primary transition-colors">Stories</Link>
            <Link href="/devotionals" className="hover:text-primary transition-colors">Devotionals</Link>
            <Link href="/videos" className="hover:text-primary transition-colors">Videos</Link>
            <Link href="/books" className="hover:text-primary transition-colors">Books</Link>
            <Link href="/community" className="hover:text-primary transition-colors">Community</Link>
            <Link href="/premium" className="hover:text-secondary transition-colors font-semibold">Premium</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          
          {profile ? (
            <>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Link href="/dashboard" className="hidden sm:inline-flex">
                <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border border-border">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="hidden sm:inline-flex border-primary text-primary hover:bg-primary hover:text-primary-foreground">Sign In</Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
