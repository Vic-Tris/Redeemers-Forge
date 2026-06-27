import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import Home from "@/pages/Home";
import Stories from "@/pages/Stories";
import StoryReader from "@/pages/StoryReader";
import Devotionals from "@/pages/Devotionals";
import Videos from "@/pages/Videos";
import Books from "@/pages/Books";
import Search from "@/pages/Search";
import Community from "@/pages/Community";
import Premium from "@/pages/Premium";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/stories" component={Stories} />
        <Route path="/stories/:id" component={StoryReader} />
        <Route path="/devotionals" component={Devotionals} />
        <Route path="/videos" component={Videos} />
        <Route path="/books" component={Books} />
        <Route path="/search" component={Search} />
        <Route path="/community" component={Community} />
        <Route path="/premium" component={Premium} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="redeemers-forge-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
