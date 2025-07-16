import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface BaseSkeletonProps {
  className?: string;
  count?: number;
}

// Property Card Skeleton
export function PropertyCardSkeleton({ className, count = 1 }: BaseSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={cn("nexus-skeleton-property-card overflow-hidden", className)}>
          <div className="relative">
            <Skeleton className="h-48 w-full" />
            <div className="absolute top-2 right-2">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-3" />
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center">
                <Skeleton className="h-4 w-8 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-4 w-8 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-4 w-8 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

// Portfolio Overview Skeleton
export function PortfolioSkeleton({ className }: BaseSkeletonProps) {
  return (
    <div className={cn("nexus-skeleton-portfolio", className)}>
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Area */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>

      {/* Properties List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PropertyCardSkeleton count={3} />
      </div>
    </div>
  );
}

// Investment Flow Skeleton
export function InvestmentFlowSkeleton({ className }: BaseSkeletonProps) {
  return (
    <div className={cn("nexus-skeleton-investment-flow max-w-2xl mx-auto", className)}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              {index < 3 && <Skeleton className="h-0.5 w-16 ml-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Fields */}
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard Widget Skeleton
export function DashboardWidgetSkeleton({ className }: BaseSkeletonProps) {
  return (
    <Card className={cn("nexus-skeleton-widget", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Notification Skeleton
export function NotificationSkeleton({ className, count = 3 }: BaseSkeletonProps) {
  return (
    <div className={cn("nexus-skeleton-notifications space-y-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

// Chat Message Skeleton
export function ChatSkeleton({ className, count = 5 }: BaseSkeletonProps) {
  return (
    <div className={cn("nexus-skeleton-chat space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => {
        const isUser = index % 2 === 0;
        return (
          <div key={index} className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
            {!isUser && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
            <div className={cn("max-w-xs space-y-2", isUser ? "items-end" : "items-start")}>
              <div className={cn("p-3 rounded-lg", isUser ? "bg-muted ml-8" : "bg-muted mr-8")}>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
            {isUser && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ className, rows = 5, columns = 4 }: BaseSkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn("nexus-skeleton-table", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-24" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 p-4 border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-20" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Generic Content Skeleton
export function ContentSkeleton({ className }: BaseSkeletonProps) {
  return (
    <div className={cn("nexus-skeleton-content space-y-4", className)}>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-3/4" />
      <div className="pt-4">
        <Skeleton className="h-6 w-1/2 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

// Loading state wrapper with optimistic updates
interface OptimisticSkeletonProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  optimisticContent?: React.ReactNode;
  className?: string;
}

export function OptimisticSkeleton({ 
  isLoading, 
  skeleton, 
  children, 
  optimisticContent,
  className 
}: OptimisticSkeletonProps) {
  if (isLoading) {
    return optimisticContent ? (
      <div className={cn("opacity-60 pointer-events-none", className)}>
        {optimisticContent}
      </div>
    ) : (
      <div className={className}>
        {skeleton}
      </div>
    );
  }
  
  return <div className={className}>{children}</div>;
}