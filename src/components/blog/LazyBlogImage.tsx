"use client";

import { useState } from "react";
import Image from "next/image";

interface LazyBlogImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill";
}

export default function LazyBlogImage({
  src,
  alt,
  className = "",
  priority = false,
  aspectRatio,
  objectFit = "cover",
}: LazyBlogImageProps) {
  const [loaded, setLoaded] = useState(false);

  const isBase64 = src.startsWith("data:") || src.startsWith("blob:");

  const fitClass = objectFit === "contain" ? "object-contain" : objectFit === "fill" ? "object-fill" : "object-cover";

  if (isBase64) {
    return (
      <div className={`relative overflow-hidden ${aspectRatio || ""}`}>
        {!loaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" aria-hidden="true" />
        )}
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`transition-opacity duration-500 ${fitClass} ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${aspectRatio || "w-full h-full"}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" aria-hidden="true" />
      )}
      <Image
        src={src}
        alt={alt}
        priority={priority}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setLoaded(true)}
        className={`transition-opacity duration-500 ${fitClass} ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
      />
    </div>
  );
}
