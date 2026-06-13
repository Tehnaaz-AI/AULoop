import Skeleton from "./Skeleton";

export default function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-9 w-9 rounded-2xl" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-5 w-1/4 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="mt-3">
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-10 w-full rounded-3xl" />
      </div>
    </div>
  );
}
