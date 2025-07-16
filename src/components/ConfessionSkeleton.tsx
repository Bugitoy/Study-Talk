'use client';

export function ConfessionSkeleton() {
  return (
    <div className="rounded-[12px] border border-gray-300 bg-white p-4 lg:p-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 skeleton-shimmer rounded-[8px]"></div>
        <div className="flex-1">
          <div className="h-4 skeleton-shimmer rounded w-32 mb-2"></div>
          <div className="h-3 skeleton-shimmer rounded w-24"></div>
        </div>
        <div className="h-6 skeleton-shimmer rounded w-16"></div>
      </div>

      {/* Title skeleton */}
      <div className="mb-4">
        <div className="h-6 skeleton-shimmer rounded w-3/4 mb-2"></div>
      </div>

      {/* Content skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-4 skeleton-shimmer rounded w-full"></div>
        <div className="h-4 skeleton-shimmer rounded w-full"></div>
        <div className="h-4 skeleton-shimmer rounded w-2/3"></div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 skeleton-shimmer rounded"></div>
            <div className="h-4 skeleton-shimmer rounded w-8"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 skeleton-shimmer rounded"></div>
            <div className="h-4 skeleton-shimmer rounded w-8"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 skeleton-shimmer rounded"></div>
            <div className="h-4 skeleton-shimmer rounded w-8"></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-5 h-5 skeleton-shimmer rounded"></div>
          <div className="w-5 h-5 skeleton-shimmer rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function ConfessionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ConfessionSkeleton key={i} />
      ))}
    </div>
  );
} 