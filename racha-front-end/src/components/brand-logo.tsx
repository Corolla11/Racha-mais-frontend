type BrandMarkProps = {
  size?: number;
  src?: string;
  poster?: string;
  className?: string;
};

/**
 * Entrada única da marca visual do Racha+.
 * Usa `/logo.webm` (provisório) com fallback `/logo.png`.
 * Para substituir a logo definitiva, troque apenas os arquivos em `public/logo.webm` e `public/logo.png`.
 */
export function BrandMark({
  size = 36,
  src = "/logo.webm",
  poster = "/logo.png",
  className = "",
}: BrandMarkProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-[0_2px_8px_rgba(155,69,0,0.28)] bg-primary-container ${className}`}
      style={{ width: size, height: size }}
    >
      <video
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="h-full w-full object-cover"
      />
    </span>
  );
}

type BrandLogoProps = {
  compact?: boolean;
  light?: boolean;
  size?: number;
};

/** Marca completa do Racha+ (BrandMark + wordmark), usada em cabeçalhos públicos e de autenticação. */
function BrandLogo({ compact = false, light = false, size = 36 }: BrandLogoProps) {
  return (
    <span className="inline-flex items-center gap-space-sm" aria-label="Racha+">
      <BrandMark size={size} />
      {!compact && (
        <span
          className={`font-headline-sm text-headline-sm font-bold tracking-tight ${
            light ? "text-on-primary" : "text-on-surface"
          }`}
          aria-hidden="true"
        >
          Racha<span className={light ? "text-tertiary-fixed" : "text-primary"}>+</span>
        </span>
      )}
    </span>
  );
}

export default BrandLogo;
