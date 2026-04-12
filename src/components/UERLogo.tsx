/**
 * UERLogo — United Estates Realty logo component.
 *
 * Drop your logo file at public/logo.png (or .svg/.webp) and
 * set USE_IMAGE = true to switch from the SVG placeholder to the real file.
 */

const LOGO_SRC = '/logo.png';   // ← path inside /public
const USE_IMAGE = false;        // ← flip to true once logo.png is in /public

interface UERLogoProps {
  /** pixel size of the square container */
  size?: number;
  className?: string;
}

export function UERLogo({ size = 40, className = '' }: UERLogoProps) {
  if (USE_IMAGE) {
    return (
      <img
        src={LOGO_SRC}
        alt="United Estates Realty"
        width={size}
        height={size}
        className={`object-contain ${className}`}
      />
    );
  }

  // ── SVG placeholder: shield with house, navy + red + white ──
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield background — navy */}
      <path
        d="M20 2L4 8v12c0 9.4 6.9 16.7 16 18 9.1-1.3 16-8.6 16-18V8L20 2z"
        fill="#1B3A6B"
      />
      {/* Right half — red */}
      <path
        d="M20 2v36c9.1-1.3 16-8.6 16-18V8L20 2z"
        fill="#B22234"
      />
      {/* House icon — white */}
      <path
        d="M20 11l-8 7h2v8h5v-5h2v5h5v-8h2l-8-7z"
        fill="white"
      />
    </svg>
  );
}
