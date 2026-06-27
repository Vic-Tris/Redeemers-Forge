import { useListPosts } from "@workspace/api-client-react";
import { StoryCard } from "@/components/StoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Heart, BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function Community() {
  const { data: posts, isLoading } = useListPosts({ limit: 6 });

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Community</h1>
        <p className="text-lg text-muted-foreground font-serif italic max-w-2xl mx-auto">
          "As iron sharpens iron, so one person sharpens another." — Proverbs 27:17
        </p>
      </div>

      {/* Stats */}
      <section className="grid sm:grid-cols-3 gap-6">
        {[
          { icon: Users, label: "Believers Connected", value: "1,240+", color: "text-primary" },
          { icon: MessageSquare, label: "Conversations", value: "8,900+", color: "text-secondary" },
          { icon: Heart, label: "Prayers Shared", value: "3,400+", color: "text-primary" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="text-center border-border bg-card">
            <CardContent className="p-6 space-y-3">
              <div className={`mx-auto w-fit p-3 rounded-full bg-primary/10 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold font-serif text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Discussion Feed */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold">Recent Discussions</h2>
          <Link href="/stories">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              View All
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[280px] rounded-xl" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts?.posts?.map(post => <StoryCard key={post.id} post={post} />)}
          </div>
        )}
      </section>

      {/* Prayer Wall CTA */}
      <section className="rounded-3xl border border-secondary/30 bg-secondary/5 p-8 md:p-12 text-center space-y-6">
        <div className="mx-auto w-fit p-4 rounded-full bg-secondary/10 text-secondary">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-serif font-bold">Join the Conversation</h2>
        <p className="text-muted-foreground font-serif italic max-w-xl mx-auto">
          Share your testimony, ask for prayer, or discuss scripture with fellow believers. Premium members get full community access.
        </p>
        <Link href="/premium">
          <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            Unlock Full Community Access
          </Button>
        </Link>
      </section>
    </div>
  );
}
