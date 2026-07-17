// components/Skeleton.tsx
// Patrón Boneyard implementado con CSS puro (shimmer via ::after en globals.css).
// boneyard-js no está publicado en npm — este componente replica su API exacta.

type SkeletonProps = {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
};

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Skeleton({ className = '', rounded = 'md' }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="loading"
      className={['skeleton', roundedMap[rounded], className].join(' ')}
    />
  );
}

export function SkeletonGroup({
  rows = 3,
  className = 'h-4 w-full',
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}