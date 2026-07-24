"use client";

import React from 'react';

interface ToolIconProps {
  icon?: React.ReactNode | string;
  className?: string;
  fallback?: string;
}

export default function ToolIcon({ icon, className = "w-8 h-8", fallback = "🛠️" }: ToolIconProps) {
  if (!icon) {
    return <span className={className}>{fallback}</span>;
  }

  if (typeof icon !== 'string') {
    return <>{icon}</>;
  }

  const trimmed = icon.trim();

  // Check if icon string is an image URL or uploaded path
  const isImage = 
    trimmed.startsWith('/') || 
    trimmed.startsWith('http://') || 
    trimmed.startsWith('https://') || 
    trimmed.startsWith('data:image/') ||
    /\.(png|jpe?g|svg|webp|gif|ico)$/i.test(trimmed);

  if (isImage) {
    return (
      <img 
        src={trimmed} 
        alt="" 
        className={`object-contain inline-block shrink-0 ${className}`} 
        loading="lazy"
        onError={(e) => {
          // Fallback to emoji if image load fails
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.innerText = fallback;
          }
        }}
      />
    );
  }

  return <span className={className}>{trimmed}</span>;
}
