import { useGetMyProfile, useGetMySubscription, useListBookmarks } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StoryCard } from "@/components/StoryCard";
import { Crown, Bookmark, User, Shield, Bell } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: profile, isLoading: isLoadingProfile } = useGetMyProfile();
  const { data: subscription, isLoading: isLoadingSub } = useGetMySubscription();
  const { data: bookmarks, isLoading: isLoadingBookmarks } = useListBookmarks();

  const isLoading = isLoadingProfile || isLoadingSub;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto text-center py-24 space-y-6">
        <div className="mx-auto w-fit p-5 rounded-full bg-primary/10 text-primary">
          <User className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold">Sign In Required</h1>
        <p className="text-muted-foreground font-serif italic">
          Please sign in to access your personal dashboard.
        </p>
        <Link href="/login">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  const initials = profile.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card className="border-border bg-card">
        <CardContent className="p-6 flex items-center gap-6">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={profile.avatar ?? ""} alt={profile.name} />
            <AvatarFallback className="text-xl font-serif bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h1 className="text-2xl font-serif font-bold">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            {profile.bio && <p className="text-sm text-foreground font-serif italic mt-2">&ldquo;{profile.bio}&rdquo;</p>}
          </div>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex border-border">
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Membership</p>
              <p className="font-semibold text-sm">
                {subscription?.status === "active" ? "Premium" : "Free"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Bookmarks</p>
              <p className="font-semibold text-sm">{bookmarks?.length ?? 0} saved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Notifications</p>
              <p className="font-semibold text-sm">0 unread</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA */}
      {subscription?.status !== "active" && (
        <Card className="border-secondary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-secondary" /> Upgrade to Premium
              </h3>
              <p className="text-sm text-muted-foreground">
                Unlock unlimited content, full community access, and more.
              </p>
            </div>
            <Link href="/premium">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0">
                View Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Bookmarked Content */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-xl">
            <Bookmark className="inline-block w-5 h-5 mr-2 text-primary" />
            Saved Content
          </CardTitle>
        </div>
        {isLoadingBookmarks ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-[240px] rounded-xl" />)}
          </div>
        ) : bookmarks && bookmarks.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {bookmarks.map(post => <StoryCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-xl border-dashed border-border">
            <Bookmark className="mx-auto h-10 w-10 mb-3 opacity-20" />
            <p className="text-muted-foreground font-serif italic">No saved content yet</p>
            <Link href="/stories" className="text-primary text-sm hover:underline mt-2 inline-block">
              Browse stories to save
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
