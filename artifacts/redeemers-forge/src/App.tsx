import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Show } from "@/lib/clerk-compat";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
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

// Only enable Clerk when an explicit publishable key is provided. Without it,
// the app renders in a signed-out, public mode instead of crashing.
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(220, 70%, 20%)",
    colorForeground: "hsl(220, 20%, 20%)",
    colorMutedForeground: "hsl(220, 10%, 40%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorBackground: "hsl(0, 0%, 100%)",
    colorInput: "hsl(40, 20%, 94%)",
    colorInputForeground: "hsl(220, 20%, 20%)",
    colorNeutral: "hsl(40, 20%, 90%)",
    fontFamily: "'Georgia', serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-serif text-foreground",
    headerSubtitle: "text-muted-foreground font-serif",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary hover:text-primary/80",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-green-600",
    alertText: "text-foreground",
    logoBox: "flex justify-center items-center py-2",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border border-border bg-card hover:bg-muted",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
    formFieldInput: "bg-muted border-border text-foreground",
    footerAction: "border-t border-border",
    dividerLine: "bg-border",
    alert: "border border-border bg-muted",
    otpCodeFieldInput: "bg-muted border-border text-foreground",
    formFieldRow: "gap-2",
    main: "gap-4",
  },
};

const queryClient = new QueryClient();

function AuthUnavailableNotice() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
      <p className="text-foreground font-serif">Sign-in is not available yet</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Authentication has not been configured for this environment. You can
        continue browsing the site freely.
      </p>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold text-primary">The Redeemer's Forge</h1>
          <p className="text-muted-foreground font-serif italic text-sm">
            "Iron sharpens iron" — Proverbs 27:17
          </p>
        </div>
        {clerkPubKey ? (
          <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
        ) : (
          <AuthUnavailableNotice />
        )}
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold text-primary">The Redeemer's Forge</h1>
          <p className="text-muted-foreground font-serif italic text-sm">
            Join a community of believers walking the path together
          </p>
        </div>
        {clerkPubKey ? (
          <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
        ) : (
          <AuthUnavailableNotice />
        )}
      </div>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

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
        <Route path="/dashboard">
          {() => (
            <Show
              when="signed-in"
              fallback={<SignInPage />}
            >
              <Dashboard />
            </Show>
          )}
        </Route>
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome Back",
            subtitle: "Sign in to your Redeemer's Forge account",
          },
        },
        signUp: {
          start: {
            title: "Join the Forge",
            subtitle: "Create your account and begin your journey",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route>
              {() => <Router />}
            </Route>
          </Switch>
        </TooltipProvider>
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function PublicApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Switch>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route>{() => <Router />}</Route>
          </Switch>
        </ErrorBoundary>
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="redeemers-forge-theme">
      <WouterRouter base={basePath}>
        {clerkPubKey ? <ClerkProviderWithRoutes /> : <PublicApp />}
      </WouterRouter>
    </ThemeProvider>
  );
}

export default App;
