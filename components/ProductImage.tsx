"use client";

import Image from "next/image";
import { useState } from "react";

// 사진을 보여주되, 링크가 깨지면 우아한 대체 배경을 보여줍니다.
export default function ProductImage({
  src,
  alt,
  priority = false,
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ece6d8] to-[#ddd3bf]">
        <span className="font-serif text-sm tracking-luxe text-muted">
          MAISON LUXE
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      priority={priority}
      className="object-cover transition-transform duration-700 hover:scale-105"
      onError={() => setError(true)}
    />
  );
}
