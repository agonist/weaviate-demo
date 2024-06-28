import { Skeleton } from "@/components/ui/skeleton";

export const Loading = () => {
  return (
    <div className="flex flex-col space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-3 w-96" />
        </div>
      ))}
    </div>
  );
};
