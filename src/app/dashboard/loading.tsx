import { Skeleton } from '@/components/ui/LoadingIndicator';

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <Skeleton className="mb-2 h-6 w-48" />
      <Skeleton className="mb-6 h-4 w-24" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-surface-container-low p-4">
            <Skeleton className="mb-3 h-28 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
