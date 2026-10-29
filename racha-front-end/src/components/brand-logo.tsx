type BrandLogoProps = {
  compact?: boolean;
  light?: boolean;
};

function BrandLogo({ compact = false, light = false }: BrandLogoProps) {
  return (
    <span className="inline-flex items-center gap-3" aria-label="Racha+">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-secondary shadow-sm shadow-primary/25">
        <svg
          aria-hidden="true"
          viewBox="0 0 32 32"
          fill="none"
          className="h-6 w-6"
        >
          <path
            d="M7 10.5h7a4.5 4.5 0 0 1 0 9H7v-9Zm0 9v5m18-14v14m-7-7h7"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span
            className={`block text-base font-extrabold tracking-tight ${
              light ? "text-white" : "text-secondary"
            }`}
          >
            Racha<span className="text-primary">+</span>
          </span>
          <span
            className={`mt-0.5 block text-[10px] font-medium tracking-wide ${
              light ? "text-white/65" : "text-text-secondary"
            }`}
          >
            MAIS LEVE JUNTOS
          </span>
        </span>
      )}
    </span>
  );
}

export default BrandLogo;
