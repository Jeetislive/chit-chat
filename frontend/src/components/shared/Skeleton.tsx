"use client";

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export default function Skeleton({ className = "", lines = 1 }: SkeletonProps) {
  const widths = ["75%", "60%", "85%", "45%", "70%"];
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-glass-strong rounded-full mb-2 last:mb-0"
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}

interface AvatarSkeletonProps {
  size?: string;
}

export function AvatarSkeleton({ size = "w-10 h-10" }: AvatarSkeletonProps) {
  return <div className={`${size} rounded-full bg-glass-strong animate-pulse`} />;
}

export function CardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg">
      <AvatarSkeleton size="w-9 h-9" />
      <div className="flex-1">
        <div className="h-3 bg-glass-strong rounded-full w-28 mb-2 animate-pulse" />
        <div className="h-2.5 bg-glass-strong rounded-full w-20 animate-pulse" />
      </div>
    </div>
  );
}
