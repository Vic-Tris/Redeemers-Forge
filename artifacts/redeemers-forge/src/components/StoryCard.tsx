import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Post } from "@workspace/api-client-react";

export function StoryCard({ post }: { post: Post }) {
  return (
    <Link href={`/stories/${post.id}`}>
      <Card className="group h-full overflow-hidden border-border bg-card hover-elevate transition-all cursor-pointer flex flex-col">
        {post.coverImage && (
          <div className="aspect-[16/9] overflow-hidden">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <CardContent className="p-6 flex flex-col space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-secondary">
              {post.category || post.type}
            </div>
            {post.isPremium && (
              <span className="bg-secondary/20 text-secondary text-xs px-2 py-0.5 rounded-full font-medium">Premium</span>
            )}
          </div>
          <h3 className="font-serif text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
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
  );
}
