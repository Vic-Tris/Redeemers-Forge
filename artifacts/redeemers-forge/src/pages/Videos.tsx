import { useListVideos } from "@workspace/api-client-react";
import { VideoCard } from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Videos() {
  const { data: videos, isLoading } = useListVideos();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Sermons & Teaching</h1>
        <p className="text-lg text-muted-foreground font-serif italic max-w-2xl mx-auto">
          Nourish your faith with video messages from trusted voices.
        </p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[300px] rounded-xl" />)}
        </div>
      ) : videos?.length === 0 ? (
        <div className="text-center py-16 border rounded-xl border-dashed border-border">
          <p className="text-muted-foreground">No videos found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos?.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
