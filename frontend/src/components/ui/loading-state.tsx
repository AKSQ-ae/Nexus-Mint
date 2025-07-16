import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export function PropertyCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-6 space-y-4">
      <Skeleton className="h-48 w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-lg border space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function ButtonLoadingSpinner({ children, loading, ...props }: { 
  children: React.ReactNode; 
  loading?: boolean; 
  [key: string]: any;
}) {
  return (
    <button disabled={loading} {...props}>
      <div className="flex items-center space-x-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{children}</span>
      </div>
    </button>
  );
}

export function InlineLoadingSpinner({ size = 4 }: { size?: number }) {
  return <Loader2 className={`h-${size} w-${size} animate-spin text-muted-foreground`} />;
}