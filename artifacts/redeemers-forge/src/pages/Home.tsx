import { Link } from "wouter";
import { useGetFeaturedPosts, useGetTrendingPosts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Users, ArrowRight } from "lucide-react";

export default function Home() {
  const { data: featuredPosts, isLoading: isLoadingFeatured } = useGetFeaturedPosts();
  const { data: trendingPosts, isLoading: isLoadingTrending } = useGetTrendingPosts();

  const heroPost = featuredPosts?.[0];
  const heroPost = featuredPosts?.[0];

console.log("Featured Posts:", featuredPosts);
console.log("Hero Post:", heroPost);
console.log("Loading:", isLoadingFeatured);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {isLoadingFeatured ? (
          <Skeleton className="w-full h-[500px]" />
        ) : heroPost ? (
          <div className="grid md:grid-cols-2 gap-0 items-center min-h-[500px]">
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center space-y-6 z-10">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                Featured {heroPost.type}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
                {heroPost.title}
              </h1>
              <p className="text-lg text-muted-foreground font-serif italic max-w-xl">
                {heroPost.excerpt}
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Link href={`/stories/${heroPost.id}`}>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Read Story
                  </Button>
                </Link>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{heroPost.authorName}</span>
                  <span className="mx-2">&middot;</span>
                  <span>{heroPost.readingTimeMinutes} min read</span>
                </div>
              </div>
            </div>
            {heroPost.coverImage && (
              <div className="relative h-full w-full min-h-[300px] md:min-h-full bg-muted">
                <img 
                  src={heroPost.coverImage} 
                  alt={heroPost.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-transparent md:hidden" />
                <div className="absolute inset-0 bg-gradient-to-r from-card via-card/20 to-transparent hidden md:block" />
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* Quick Links */}
      <section className="grid sm:grid-cols-3 gap-6">
        <Card className="hover-elevate transition-all border-border bg-card">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold">Daily Devotionals</h3>
            <p className="text-muted-foreground text-sm">Start your morning with scripture and thoughtful reflection.</p>
            <Link href="/devotionals" className="text-primary font-medium inline-flex items-center hover:underline">
              Read Today's <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all border-border bg-card">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-secondary/10 text-secondary">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold">Sermons & Video</h3>
            <p className="text-muted-foreground text-sm">Watch powerful messages from trusted pastors and teachers.</p>
            <Link href="/videos" className="text-secondary font-medium inline-flex items-center hover:underline">
              Browse Library <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all border-border bg-card">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-accent text-accent-foreground">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold">Community</h3>
            <p className="text-muted-foreground text-sm">Join discussions, share prayer requests, and grow together.</p>
            <Link href="/community" className="text-foreground font-medium inline-flex items-center hover:underline">
              Join Conversation <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Trending Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Trending This Week</h2>
          <Link href="/stories">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              View all
            </Button>
          </Link>
        </div>
        
        {isLoadingTrending ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-[400px] rounded-xl" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingPosts?.slice(0, 3).map(post => (
              <Link key={post.id} href={`/stories/${post.id}`}>
                <Card className="group h-full overflow-hidden border-border bg-card hover-elevate transition-all cursor-pointer">
                  {post.coverImage && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col space-y-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-secondary">
                      {post.category || post.type}
                    </div>
                    <h3 className="font-serif text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 text-sm flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border mt-auto">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.authorName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {post.authorName.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{post.authorName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
