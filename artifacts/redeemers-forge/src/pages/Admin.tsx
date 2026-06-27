import { useGetGlobalAnalytics, useListPosts, useListVideos, useListBooks } from "@workspace/api-client-react";
import type { Post, Video, Book } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Video as VideoIcon, BookOpen, Users, TrendingUp, Eye, MessageSquare } from "lucide-react";

export default function Admin() {
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetGlobalAnalytics();
  const { data: posts, isLoading: isLoadingPosts } = useListPosts({ limit: 5 });
  const { data: videos, isLoading: isLoadingVideos } = useListVideos({ limit: 5 });
  const { data: books, isLoading: isLoadingBooks } = useListBooks({ limit: 5 });

  const isLoading = isLoadingAnalytics;

  const stats = [
    { icon: FileText, label: "Total Posts", value: analytics?.totalPosts ?? "—", color: "text-primary" },
    { icon: Users, label: "Total Users", value: analytics?.totalUsers ?? "—", color: "text-secondary" },
    { icon: Eye, label: "Total Views", value: analytics?.totalViews ?? "—", color: "text-primary" },
    { icon: MessageSquare, label: "Total Comments", value: analytics?.totalComments ?? "—", color: "text-secondary" },
    { icon: Users, label: "Premium Members", value: analytics?.totalPremiumUsers ?? "—", color: "text-primary" },
    { icon: TrendingUp, label: "Recent Signups", value: analytics?.recentSignups ?? "—", color: "text-secondary" },
  ];

  const topPosts = analytics?.topPosts ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" /> Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground">Platform overview and content management</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2.5 rounded-lg bg-primary/10 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12 mt-1" />
                ) : (
                  <p className="text-2xl font-bold font-serif">{value}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Posts */}
      {topPosts.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" /> Top Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPosts.map((post: Post, i: number) => (
                <div key={post.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold font-serif text-muted-foreground w-6">{i + 1}</span>
                    <div>
                      <p className="font-medium text-sm text-foreground">{post.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{post.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.viewCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tables */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Recent Posts</span>
              <Button variant="ghost" size="sm" className="text-xs text-primary h-7">Manage</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingPosts ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-10 rounded" />)
            ) : (
              posts?.posts?.slice(0, 4).map((post: Post) => (
                <div key={post.id} className="flex items-start gap-2 py-1 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{post.type}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Videos */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><VideoIcon className="w-4 h-4 text-secondary" /> Recent Videos</span>
              <Button variant="ghost" size="sm" className="text-xs text-primary h-7">Manage</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingVideos ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-10 rounded" />)
            ) : (
              videos?.slice(0, 4).map((video: Video) => (
                <div key={video.id} className="flex items-start gap-2 py-1 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.category ?? "Uncategorized"} · {video.duration}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Books */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Recent Books</span>
              <Button variant="ghost" size="sm" className="text-xs text-primary h-7">Manage</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingBooks ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-10 rounded" />)
            ) : (
              books?.slice(0, 4).map((book: Book) => (
                <div key={book.id} className="flex items-start gap-2 py-1 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
