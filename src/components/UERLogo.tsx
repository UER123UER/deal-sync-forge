interface UERLogoProps {
  /** width in pixels — height auto-scales to preserve aspect ratio */
  width?: number;
  className?: string;
}

export function UERLogo({ width = 200, className = '' }: UERLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="United Estates Realty"
      style={{ width, height: 'auto', objectFit: 'contain', display: 'block' }}
      className={className}
    />
  );
}
