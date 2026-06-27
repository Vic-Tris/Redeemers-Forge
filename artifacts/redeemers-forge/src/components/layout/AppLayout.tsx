import { Navbar } from "./Navbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-serif italic mb-2">"Iron sharpens iron, and one man sharpens another."</p>
          <p>&copy; {new Date().getFullYear()} The Redeemer's Forge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
