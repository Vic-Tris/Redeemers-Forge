import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Book } from "@workspace/api-client-react";
import { Book as BookIcon } from "lucide-react";

export function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}`}>
      <Card className="group h-full overflow-hidden border-border bg-card hover-elevate transition-all cursor-pointer flex flex-col">
        <div className="aspect-[2/3] bg-muted relative overflow-hidden">
          {book.coverUrl ? (
            <img 
              src={book.coverUrl} 
              alt={book.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <BookIcon className="w-16 h-16 text-primary/20" />
            </div>
          )}
          {book.isPremium && (
            <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded font-medium shadow-sm">
              Premium
            </div>
          )}
        </div>
        <CardContent className="p-4 flex flex-col space-y-2 flex-1">
          <h3 className="font-serif text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            {book.author}
          </p>
          <div className="pt-2 mt-auto flex items-center justify-between text-xs text-muted-foreground">
            <span>{book.category}</span>
            {book.pages && <span>{book.pages} pages</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
