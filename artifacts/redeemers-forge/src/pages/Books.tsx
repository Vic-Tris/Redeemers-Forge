import { useListBooks } from "@workspace/api-client-react";
import { BookCard } from "@/components/BookCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Books() {
  const { data: books, isLoading } = useListBooks();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">The Library</h1>
        <p className="text-lg text-muted-foreground font-serif italic max-w-2xl mx-auto">
          Timeless texts, modern reflections, and study materials for deep growth.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)}
        </div>
      ) : books?.length === 0 ? (
        <div className="text-center py-16 border rounded-xl border-dashed border-border">
          <p className="text-muted-foreground">No books found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {books?.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
