import { Search } from "./_components/search";
import { SearchResults } from "./_components/search-results";
import { Suspense } from "react";
import { Loading } from "./_components/loading";

export default function Home({
  searchParams,
}: {
  searchParams?: {
    search?: string;
  };
}) {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 space-y-6">
      <h1 className="text-2xl font-medium">Vectorino</h1>
      <Search />
      {searchParams?.search && (
        <Suspense fallback={<Loading />}>
          <SearchResults query={searchParams?.search} />
        </Suspense>
      )}
    </main>
  );
}
