import { useParams } from "wouter";
import { useGetPost, useLikePost, useBookmarkPost } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, Share2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { CommentsSection } from "@/components/CommentsSection";

export default function StoryReader() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const { data: post, isLoading } = useGetPost(id);

  const likeMutation = useLikePost();
  const bookmarkMutation = useBookmarkPost();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 py-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-[400px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-serif font-bold">Story not found</h2>
        <Link href="/stories" className="text-primary hover:underline mt-4 inline-block">Return to stories</Link>
      </div>
    );
  }

  const handleLike = () => {
    likeMutation.mutate({ postId: post.id });
  };

  const handleBookmark = () => {
    bookmarkMutation.mutate({ postId: post.id });
  };

  return (
    <article className="max-w-3xl mx-auto py-8">
      <Link href={post.type === "devotional" ? "/devotionals" : "/stories"}>
        <Button variant="ghost" className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
      </Link>

      <header className="space-y-6 mb-12">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold uppercase tracking-wider text-secondary">
            {post.category || post.type}
          </div>
          <span className="text-sm text-muted-foreground">{post.readingTimeMinutes} min read</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
          {post.title}
        </h1>

        <p className="text-xl text-muted-foreground font-serif italic border-l-4 border-secondary pl-6 py-2">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between py-6 border-b border-border">
          <div className="flex items-center gap-4">
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt={post.authorName} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {post.authorName.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-medium text-foreground">{post.authorName}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleLike} className={post.isLiked ? "text-destructive" : ""}>
              <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleBookmark} className={post.isBookmarked ? "text-primary" : ""}>
              <Bookmark className={`w-5 h-5 ${post.isBookmarked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {post.coverImage && (
        <figure className="mb-12">
          <img src={post.coverImage} alt={post.title} className="w-full rounded-2xl object-cover aspect-[21/9]" />
        </figure>
      )}

      <div 
        className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-p:font-serif prose-p:leading-relaxed max-w-none mb-16"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <footer className="border-t border-border pt-8 mt-16">
        <CommentsSection postId={post.id} commentCount={post.commentCount} />
      </footer>
    </article>
  );
}
