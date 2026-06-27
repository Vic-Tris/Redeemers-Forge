import { useState } from "react";
import { useGlobalSearch } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StoryCard } from "@/components/StoryCard";
import { VideoCard } from "@/components/VideoCard";
import { BookCard } from "@/components/BookCard";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const { data, isLoading } = useGlobalSearch({ q: activeQuery || " " });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(query.trim());
  };

  const posts = data?.posts ?? [];
  const videos = data?.videos ?? [];
  const books = data?.books ?? [];
  const totalResults = posts.length + videos.length + books.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Search</h1>
        <p className="text-lg text-muted-foreground font-serif italic max-w-2xl mx-auto">
          Find stories, devotionals, videos, and books to nourish your faith.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for stories, devotionals, videos, books..."
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button type="submit" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          Search
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      )}

      {!isLoading && activeQuery && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{activeQuery}&rdquo;
          </p>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
              <TabsTrigger value="posts">Stories ({posts.length})</TabsTrigger>
              <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
              <TabsTrigger value="books">Books ({books.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8 mt-6">
              {posts.length > 0 && (
                <section className="space-y-4">
                  <h2 className="font-serif text-xl font-bold">Stories & Devotionals</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {posts.map(post => <StoryCard key={post.id} post={post} />)}
                  </div>
                </section>
              )}
              {videos.length > 0 && (
                <section className="space-y-4">
                  <h2 className="font-serif text-xl font-bold">Videos</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map(video => <VideoCard key={video.id} video={video} />)}
                  </div>
                </section>
              )}
              {books.length > 0 && (
                <section className="space-y-4">
                  <h2 className="font-serif text-xl font-bold">Books</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {books.map(book => <BookCard key={book.id} book={book} />)}
                  </div>
                </section>
              )}
              {totalResults === 0 && (
                <div className="text-center py-16 border rounded-xl border-dashed border-border">
                  <p className="text-muted-foreground">No results found. Try different keywords.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              {posts.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {posts.map(post => <StoryCard key={post.id} post={post} />)}
                </div>
              ) : (
                <div className="text-center py-16 border rounded-xl border-dashed border-border">
                  <p className="text-muted-foreground">No stories found.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos" className="mt-6">
              {videos.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map(video => <VideoCard key={video.id} video={video} />)}
                </div>
              ) : (
                <div className="text-center py-16 border rounded-xl border-dashed border-border">
                  <p className="text-muted-foreground">No videos found.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="books" className="mt-6">
              {books.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.map(book => <BookCard key={book.id} book={book} />)}
                </div>
              ) : (
                <div className="text-center py-16 border rounded-xl border-dashed border-border">
                  <p className="text-muted-foreground">No books found.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!activeQuery && (
        <div className="text-center py-16 border rounded-xl border-dashed border-border text-muted-foreground">
          <SearchIcon className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg font-serif italic">Enter a search term to explore content</p>
        </div>
      )}
    </div>
  );
}
