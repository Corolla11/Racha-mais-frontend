import { useEffect, useState, type ReactNode } from "react";
import { apiRequest } from "../lib/api";
import { ENDPOINTS } from "../lib/endpoints";

const TTL_CACHE_AVATAR_MS = 240_000;
const cacheAvatar = new Map<string, { url: string; expiresAt: number }>();

function isDirectUrl(src: string): boolean {
  return /^(https?:\/\/|data:|\/)/i.test(src);
}

export default function UserAvatar({
  userId,
  image,
  alt = "",
  className = "w-full h-full object-cover",
  fallback,
}: {
  userId?: string;
  image?: string | null;
  alt?: string;
  className?: string;
  fallback: ReactNode;
}) {
  const needsPresign = Boolean(image && !isDirectUrl(image) && userId);
  const [resolved, setResolved] = useState<{ key: string; url: string } | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!image || !needsPresign || !userId) return;
    const cached = cacheAvatar.get(image);
    if (cached && cached.expiresAt > Date.now()) {
      return;
    }
    cacheAvatar.delete(image);

    let ativo = true;
    apiRequest<{ url: string }>(ENDPOINTS.users.avatar(userId))
      .then((res) => {
        cacheAvatar.set(image, {
          url: res.url,
          expiresAt: Date.now() + TTL_CACHE_AVATAR_MS,
        });
        if (ativo) setResolved({ key: image, url: res.url });
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [image, needsPresign, userId, retry]);

  if (!image) return <>{fallback}</>;
  const src = needsPresign
    ? (resolved?.key === image ? resolved.url : cacheAvatar.get(image)?.url)
    : image;
  if (!src) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (needsPresign && retry < 1) {
          cacheAvatar.delete(image);
          setResolved(null);
          setRetry((n) => n + 1);
        }
      }}
    />
  );
}
