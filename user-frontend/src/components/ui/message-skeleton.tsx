import { Skeleton } from "./skeleton";

export function MessageSkeleton() {
  return (
    <div className="flex items-start space-x-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-[250px]" />
      </div>
    </div>
  );
}