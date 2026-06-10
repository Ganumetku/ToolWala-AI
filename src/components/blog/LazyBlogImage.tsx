"use client";

import { useState } from "react";

interface LazyBlogImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: string;
}

export default function LazyBlogImage({
  src,
  alt,
  className = "",
  priority = false,
  aspectRatio,
}: LazyBlogImageProps) {
  const [loaded, setLoaded] = useState(false);

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
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
      />
    </div>
  );
}
