// components/FlagIcon.tsx
// Usa flag-icons (CSS + SVGs reales). Visible en cualquier PC/OS.
// Uso: <FlagIcon code="pe" size="md" />
// El code debe ser ISO 3166-1 alpha-2 en MINÚSCULAS.

type Size = 'sm' | 'md' | 'lg';

const sizeMap: Record<Size, string> = {
  sm: 'w-4 h-3',
  md: 'w-6 h-4',
  lg: 'w-8 h-6',
};

export function FlagIcon({
  code,
  size = 'md',
  className = '',
}: {
  code: string;
  size?: Size;
  className?: string;
}) {
  if (!code) return null;
  // flag-icons usa clase "fi fi-<código-en-minúsculas>"
  return (
    <span
      className={[
        'fi',
        `fi-${code.toLowerCase()}`,
        'inline-block rounded-sm object-cover',
        sizeMap[size],
        className,
      ].join(' ')}
      aria-hidden="true"
      title={code.toUpperCase()}
    />
  );
}