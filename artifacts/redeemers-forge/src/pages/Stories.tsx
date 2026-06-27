import { useListPosts } from "@workspace/api-client-react";
import { StoryCard } from "@/components/StoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Stories() {
  const { data: postList, isLoading } = useListPosts({ type: "story" });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Stories of Faith</h1>
        <p className="text-lg text-muted-foreground font-serif italic max-w-2xl mx-auto">
          Deep reflections, testimonies, and narratives from believers walking the path.
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[400px] rounded-xl" />)}
        </div>
      ) : postList?.posts.length === 0 ? (
        <div className="text-center py-16 border rounded-xl border-dashed border-border">
          <p className="text-muted-foreground">No stories found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {postList?.posts.map(post => (
            <StoryCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {postList?.posts && postList.posts.length > 0 && (
        <div className="flex justify-center pt-8">
          <Button variant="outline" size="lg" className="font-serif">Load More Stories</Button>
        </div>
      )}
    </div>
  );
}
