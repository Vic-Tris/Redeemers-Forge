import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Video as VideoType } from "@workspace/api-client-react";
import { PlayCircle } from "lucide-react";

export function VideoCard({ video }: { video: VideoType }) {
  return (
    <Link href={`/videos/${video.id}`}>
      <Card className="group h-full overflow-hidden border-border bg-card hover-elevate transition-all cursor-pointer flex flex-col">
        <div className="relative aspect-video bg-muted overflow-hidden">
          {video.thumbnailUrl ? (
            <img 
              src={video.thumbnailUrl} 
              alt={video.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/10">
              <PlayCircle className="w-12 h-12 text-secondary/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md group-hover:scale-110 duration-300" />
          </div>
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono font-medium">
              {video.duration}
            </div>
          )}
        </div>
        <CardContent className="p-4 flex flex-col space-y-2 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-secondary">
            {video.category || "Video"}
          </div>
          <h3 className="font-serif text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {video.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-sm flex-1">
            {video.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
