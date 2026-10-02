"use client";

import React from 'react';
import { VectorSymbol } from './LogoSymbols';
import { getBrandInitials, LogoLayoutType, FONT_OPTIONS } from './logoEngine';

export interface LogoRendererProps {
  layout?: LogoLayoutType;
  symbolId?: string;
  brandName: string;
  slogan?: string;
  primaryColor: string;
  accentColor: string;
  bgColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono' | 'geometric' | 'display';
  fontSize?: number;
  letterSpacing?: number;
  symbolScale?: number;
  uppercase?: boolean;
  shadow?: boolean;
  frameShape?: 'none' | 'circle' | 'squircle' | 'hexagon' | 'shield';
  isLarge?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function LogoRenderer({
  layout = 'icon-top',
  symbolId = 'quantum-orbit',
  brandName,
  slogan,
  primaryColor = '#2563EB',
  accentColor = '#06B6D4',
  bgColor,
  fontFamily = 'sans',
  fontSize = 32,
  letterSpacing = 1,
  symbolScale = 1,
  uppercase = false,
  shadow = false,
  frameShape = 'none',
  isLarge = false,
  className = '',
  style = {},
}: LogoRendererProps) {
  const initials = getBrandInitials(brandName || 'Brand');
  const fontObj = FONT_OPTIONS.find((f) => f.id === fontFamily) || FONT_OPTIONS[0];

  const displayName = brandName
    ? uppercase
      ? brandName.toUpperCase()
      : brandName
    : 'Your Brand';

  const baseSymbolSize = isLarge ? 84 : 48;
  const computedSymbolSize = Math.round(baseSymbolSize * symbolScale);

  // Split name for wordmark two-tone accents
  const nameParts = displayName.trim().split(/\s+/);
  const firstWord = nameParts[0] || '';
  const remainingWords = nameParts.slice(1).join(' ');

  const titleStyle: React.CSSProperties = {
    fontFamily: fontObj.family,
    color: primaryColor,
    fontSize: `${fontSize}px`,
    letterSpacing: `${letterSpacing}px`,
    lineHeight: 1.15,
    textShadow: shadow ? `0 8px 24px ${primaryColor}33` : 'none',
  };

  const sloganStyle: React.CSSProperties = {
    fontFamily: fontObj.family,
    color: accentColor,
    fontSize: `${Math.max(10, Math.round(fontSize * 0.32))}px`,
    letterSpacing: `${Math.max(2, letterSpacing * 2.5 + 4)}px`,
    opacity: 0.85,
    textTransform: 'uppercase',
  };

  const renderSymbol = () => {
    const symbolElement = (
      <VectorSymbol
        symbolId={symbolId}
        primaryColor={primaryColor}
        accentColor={accentColor}
        size={computedSymbolSize}
      />
    );

    if (frameShape === 'circle') {
      return (
        <div
          className="p-3.5 rounded-full flex items-center justify-center border-2 shadow-sm transition-transform"
          style={{ borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}0d` }}
        >
          {symbolElement}
        </div>
      );
    }

    if (frameShape === 'squircle') {
      return (
        <div
          className="p-3.5 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-transform"
          style={{ borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}0d` }}
        >
          {symbolElement}
        </div>
      );
    }

    if (frameShape === 'shield') {
      return (
        <div
          className="p-4 rounded-[1.25rem] flex items-center justify-center border-2 shadow-sm"
          style={{ borderColor: `${primaryColor}55`, backgroundColor: `${primaryColor}12` }}
        >
          {symbolElement}
        </div>
      );
    }

    return symbolElement;
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        backgroundColor: bgColor || 'transparent',
        ...style,
      }}
    >
      {/* 1. Icon Top (Centered Classic) */}
      {layout === 'icon-top' && (
        <div className="flex flex-col items-center text-center gap-3.5 max-w-full">
          {renderSymbol()}
          <div className="flex flex-col items-center">
            <h2 className="font-extrabold tracking-tight" style={titleStyle}>
              {displayName}
            </h2>
            {slogan && (
              <p className="font-bold tracking-widest mt-1.5" style={sloganStyle}>
                {slogan}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 2. Icon Left (Horizontal Corporate Lockup) */}
      {layout === 'icon-left' && (
        <div className="flex items-center gap-4 text-left max-w-full">
          <div className="shrink-0">{renderSymbol()}</div>
          <div className="flex flex-col">
            <h2 className="font-extrabold tracking-tight" style={titleStyle}>
              {displayName}
            </h2>
            {slogan && (
              <p className="font-bold tracking-widest mt-1" style={sloganStyle}>
                {slogan}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. Monogram Badge (Executive Initials) */}
      {layout === 'monogram-badge' && (
        <div className="flex flex-col items-center text-center gap-3 max-w-full">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 shadow-md relative overflow-hidden"
            style={{
              borderColor: primaryColor,
              background: `linear-gradient(135deg, ${primaryColor}15, ${accentColor}25)`,
            }}
          >
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle at top right, ${accentColor}, transparent 70%)`,
              }}
            />
            <span
              className="font-black text-2xl sm:text-3xl tracking-tight relative z-10"
              style={{
                fontFamily: fontObj.family,
                color: primaryColor,
              }}
            >
              {initials}
            </span>
          </div>
          <h2 className="font-extrabold tracking-tight" style={{ ...titleStyle, fontSize: `${fontSize * 0.9}px` }}>
            {displayName}
          </h2>
          {slogan && (
            <p className="font-bold tracking-widest" style={sloganStyle}>
              {slogan}
            </p>
          )}
        </div>
      )}

      {/* 4. Luxury Crest & Serif */}
      {layout === 'luxury-crest' && (
        <div className="flex flex-col items-center text-center gap-3 p-4 max-w-full">
          <div className="relative">
            <VectorSymbol
              symbolId="luxury-crest"
              primaryColor={primaryColor}
              accentColor={accentColor}
              size={computedSymbolSize + 12}
            />
          </div>
          <div className="flex flex-col items-center">
            <div className="h-0.5 w-12 rounded-full mb-2" style={{ backgroundColor: `${primaryColor}40` }} />
            <h2
              className="font-black uppercase tracking-[0.18em]"
              style={{
                ...titleStyle,
                fontFamily: FONT_OPTIONS.find((f) => f.id === 'serif')?.family || fontObj.family,
                fontSize: `${fontSize * 0.92}px`,
              }}
            >
              {displayName}
            </h2>
            <div className="h-0.5 w-12 rounded-full mt-2" style={{ backgroundColor: `${primaryColor}40` }} />
            {slogan && (
              <p
                className="font-semibold uppercase tracking-[0.35em] mt-2 text-[10px]"
                style={{ color: accentColor }}
              >
                {slogan}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 5. Bold Wordmark (Modern Typographic Contrast) */}
      {layout === 'bold-wordmark' && (
        <div className="flex flex-col items-center text-center max-w-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
            <div className="h-0.5 w-8 rounded-full" style={{ backgroundColor: `${primaryColor}40` }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
          </div>
          <h2 className="font-black tracking-tight" style={{ ...titleStyle, fontSize: `${fontSize * 1.15}px` }}>
            <span>{firstWord}</span>
            {remainingWords && (
              <span style={{ color: accentColor, opacity: 0.85 }}> {remainingWords}</span>
            )}
          </h2>
          {slogan && (
            <p className="font-bold tracking-widest mt-2" style={sloganStyle}>
              {slogan}
            </p>
          )}
        </div>
      )}

      {/* 6. Tech Gradient (Sleek Squircle Pill) */}
      {layout === 'tech-gradient' && (
        <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border bg-white/70 dark:bg-black/40 backdrop-blur-md shadow-sm max-w-full"
             style={{ borderColor: `${primaryColor}30` }}>
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 shadow-md"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
            }}
          >
            <VectorSymbol
              symbolId={symbolId}
              primaryColor="#ffffff"
              accentColor="#ffffff"
              size={computedSymbolSize * 0.7}
            />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="font-black tracking-tight" style={titleStyle}>
              {displayName}
            </h2>
            {slogan && (
              <p className="font-bold tracking-widest mt-0.5" style={sloganStyle}>
                {slogan}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 7. Minimal Stamp (Circular seal / modern frame) */}
      {layout === 'minimal-stamp' && (
        <div
          className="p-5 sm:p-7 rounded-3xl border-2 flex flex-col items-center text-center gap-2.5 max-w-full"
          style={{
            borderColor: `${primaryColor}50`,
            backgroundColor: `${primaryColor}06`,
          }}
        >
          {renderSymbol()}
          <h2 className="font-extrabold uppercase tracking-widest" style={{ ...titleStyle, fontSize: `${fontSize * 0.85}px` }}>
            {displayName}
          </h2>
          {slogan && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px]" style={{ color: accentColor }}>✦</span>
              <p className="font-bold tracking-widest" style={sloganStyle}>
                {slogan}
              </p>
              <span className="text-[10px]" style={{ color: accentColor }}>✦</span>
            </div>
          )}
        </div>
      )}

      {/* 8. Stacked Clean */}
      {layout === 'stacked-clean' && (
        <div className="flex flex-col items-center text-center gap-3 max-w-full">
          <div className="p-2">{renderSymbol()}</div>
          <div className="h-px w-14" style={{ backgroundColor: `${primaryColor}40` }} />
          <h2 className="font-bold tracking-tight" style={titleStyle}>
            {displayName}
          </h2>
          {slogan && (
            <p className="font-medium tracking-widest" style={sloganStyle}>
              {slogan}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
