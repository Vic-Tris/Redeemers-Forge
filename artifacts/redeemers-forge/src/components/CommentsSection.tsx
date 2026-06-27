import { useState } from "react";
import { useGetPostComments, useSubmitComment } from "@workspace/api-client-react";
import type { Comment } from "@workspace/api-client-react";
import { useUser, Show } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageSquare, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

function CommentItem({ comment }: { comment: Comment }) {
  const initials = comment.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9 shrink-0 mt-0.5">
        <AvatarImage src={comment.authorAvatar ?? ""} alt={comment.authorName} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary font-serif">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-medium text-sm text-foreground">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })}
          </span>
          {comment.isPinned && (
            <span className="text-xs bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full font-medium">Pinned</span>
          )}
        </div>
        <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
        <div className="flex items-center gap-3 mt-2">
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Heart className="w-3.5 h-3.5" />
            {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
          </button>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-border">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentsSectionProps {
  postId: number;
  commentCount: number;
}

export function CommentsSection({ postId, commentCount }: CommentsSectionProps) {
  const { user } = useUser();
  const { data: comments, isLoading } = useGetPostComments(postId);
  const submitComment = useSubmitComment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    submitComment.mutate(
      {
        postId,
        data: { content: content.trim() },
      },
      {
        onSuccess: () => {
          setContent("");
          queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
          toast({ title: "Comment posted", description: "Your comment has been added." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to post comment. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <section className="space-y-8">
      <h3 className="text-2xl font-serif font-bold">
        <MessageSquare className="inline-block w-6 h-6 mr-2 text-primary" />
        Comments ({commentCount})
      </h3>

      {/* Comment Form */}
      <Show when="signed-in">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9 shrink-0 mt-1">
              <AvatarImage src={user?.imageUrl ?? ""} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {user?.fullName?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts on this story..."
                className="min-h-[80px] resize-none bg-muted/50 border-border focus:border-primary"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!content.trim() || submitComment.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {submitComment.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Show>

      <Show when="signed-out">
        <div className="p-6 border border-dashed border-border rounded-xl text-center space-y-3">
          <p className="text-muted-foreground font-serif italic">
            Sign in to join the conversation
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/sign-in">
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </Show>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-border rounded-xl">
          <MessageSquare className="mx-auto h-10 w-10 mb-3 opacity-20" />
          <p className="text-muted-foreground font-serif italic">
            Be the first to share your thoughts on this story.
          </p>
        </div>
      )}
    </section>
  );
}
