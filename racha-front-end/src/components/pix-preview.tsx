// Decorative preview only. This pattern does not encode a payment payload.
export default function PixPreview({ size = 152 }: { size?: number }) {
  const cells = [];
  for (let y = 0; y < 25; y++) {
    for (let x = 0; x < 25; x++) {
      const inFinder = (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
      const inLogo = x >= 10 && x <= 14 && y >= 10 && y <= 14;
      if (!inFinder && !inLogo && ((x * 17 + y * 13 + x * y * 3) % 11 < 5)) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1"/>);
    }
  }
  return <svg className="racha-qr-preview" role="img" aria-label="QR Code ilustrativo, sem validade para pagamento" width={size} height={size} viewBox="-2 -2 29 29" fill="#172131">
    <rect x="-2" y="-2" width="29" height="29" fill="white"/>
    {[[0, 0], [18, 0], [0, 18]].map(([x, y]) => <g key={`${x}-${y}`}><rect x={x} y={y} width="7" height="7"/><rect x={x + 1} y={y + 1} width="5" height="5" fill="white"/><rect x={x + 2} y={y + 2} width="3" height="3"/></g>)}
    {cells}<rect x="10" y="10" width="5" height="5" rx="1" fill="#ff873d"/><path d="M11.4 12.5h2.2m-1.1-1.1v2.2" stroke="white" strokeWidth=".7"/>
  </svg>;
}
