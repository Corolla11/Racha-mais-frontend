import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Icon from "./icon";

export default function PixPreview({
  payload,
  size = 152,
  label = "QR Code Pix",
}: {
  payload?: string;
  size?: number;
  label?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!payload) return;
    let ativo = true;
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 3,
      width: size * 2,
      color: {
        dark: "#121c2a",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (ativo) setDataUrl(url);
      })
      .catch(() => {
        if (ativo) setDataUrl("");
      });
    return () => {
      ativo = false;
    };
  }, [payload, size]);

  if (!payload || !dataUrl) {
    return (
      <div
        role="img"
        aria-label={payload ? "Gerando QR Code Pix..." : "Cadastre uma chave Pix para gerar o QR Code"}
        style={{ width: size, height: size }}
        className="mx-auto flex flex-col items-center justify-center rounded-lg bg-surface-container-lowest p-3 text-center text-outline"
      >
        <Icon name="qr_code_2" size={Math.round(size * 0.4)} />
        <span className="mt-1 font-label-sm text-label-sm">
          {payload ? "Gerando..." : "Sem chave Pix"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt={label}
      className="mx-auto block h-auto max-w-full rounded-lg bg-white"
    />
  );
}
