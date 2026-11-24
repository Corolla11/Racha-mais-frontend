import Icon from "./icon";

type BrandLogoProps = {
  compact?: boolean;
  light?: boolean;
};

/** Marca do Racha+ usada na landing (selo laranja + nome). */
function BrandLogo({ compact = false, light = false }: BrandLogoProps) {
  return (
    <span className="inline-flex items-center gap-space-sm" aria-label="Racha+">
      <span className="w-9 h-9 shrink-0 rounded-lg bg-primary-container flex items-center justify-center shadow-[0_2px_8px_rgba(255,140,66,0.3)]">
        <Icon name="pie_chart" size={20} className="text-on-primary" />
      </span>
      {!compact && (
        <span
          className={`font-headline-sm text-headline-sm font-bold tracking-tight ${
            light ? "text-on-primary" : "text-on-surface"
          }`}
          aria-hidden="true"
        >
          Racha<span className="text-primary-container">+</span>
        </span>
      )}
    </span>
  );
}

export default BrandLogo;
