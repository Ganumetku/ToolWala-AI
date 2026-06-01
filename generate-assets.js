const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Define directory paths
const publicDir = path.join(__dirname, 'public');
const appDir = path.join(__dirname, 'src', 'app');

// Ensure directories exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Define High-Resolution 512x512 Logo SVG
const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" /> <!-- blue-500 -->
      <stop offset="100%" stop-color="#1d4ed8" /> <!-- blue-700 -->
    </linearGradient>
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#2563eb" flood-opacity="0.35" />
    </filter>
  </defs>
  <!-- Background with premium rounded corners -->
  <rect x="32" y="32" width="448" height="448" rx="112" ry="112" fill="url(#blueGrad)" filter="url(#glow)" />
  <rect x="32" y="32" width="448" height="448" rx="112" ry="112" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8" />
  
  <!-- White glossy top reflection -->
  <path d="M 32 144 C 32 84.8 84.8 32 144 32 L 368 32 C 427.2 32 480 84.8 480 144 C 480 100 32 100 32 144 Z" fill="rgba(255,255,255,0.08)" />
  
  <!-- Letter T - Vector Accurate Path -->
  <path d="M 160 140 L 352 140 L 352 196 L 284 196 L 284 370 L 228 370 L 228 196 L 160 196 Z" fill="#ffffff" />
</svg>
`;

// 2. Define High-Resolution 1200x630 OpenGraph Banner SVG
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030712" />
      <stop offset="50%" stop-color="#080f25" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#60a5fa" />
    </linearGradient>
    <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="24" flood-color="#2563eb" flood-opacity="0.4" />
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  
  <!-- Subtle decorative ambient glow circles -->
  <circle cx="200" cy="150" r="350" fill="#2563eb" fill-opacity="0.06" filter="blur(80px)" />
  <circle cx="1000" cy="480" r="400" fill="#1d4ed8" fill-opacity="0.05" filter="blur(100px)" />
  
  <!-- Grid pattern overlay -->
  <path d="M 0,0 L 1200,0 M 0,50 L 1200,50 M 0,100 L 1200,100 M 0,150 L 1200,150 M 0,200 L 1200,200 M 0,250 L 1200,250 M 0,300 L 1200,300 M 0,350 L 1200,350 M 0,400 L 1200,400 M 0,450 L 1200,450 M 0,500 L 1200,500 M 0,550 L 1200,550 M 0,600 L 1200,600" stroke="#ffffff" stroke-opacity="0.015" stroke-width="1" />
  <path d="M 0,0 L 0,630 M 50,0 L 50,630 M 100,0 L 100,630 M 150,0 L 150,630 M 200,0 L 200,630 M 250,0 L 250,630 M 300,0 L 300,630 M 350,0 L 350,630 M 400,0 L 400,630 M 450,0 L 450,630 M 500,0 L 500,630 M 550,0 L 550,630 M 600,0 L 600,630 M 650,0 L 650,630 M 700,0 L 700,630 M 750,0 L 750,630 M 800,0 L 800,630 M 850,0 L 850,630 M 900,0 L 900,630 M 950,0 L 950,630 M 1000,0 L 1000,630 M 1050,0 L 1050,630 M 1100,0 L 1100,630 M 1150,0 L 1150,630" stroke="#ffffff" stroke-opacity="0.015" stroke-width="1" />

  <!-- Logo T-Box inside the banner -->
  <g transform="translate(120, 225)" filter="url(#logoGlow)">
    <rect x="0" y="0" width="180" height="180" rx="45" ry="45" fill="url(#blueGrad)" />
    <rect x="0" y="0" width="180" height="180" rx="45" ry="45" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4" />
    <path d="M 56 48 L 124 48 L 124 68 L 100 68 L 100 132 L 80 132 L 80 68 L 56 68 Z" fill="#ffffff" />
  </g>

  <!-- Branding Text -->
  <text x="340" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="75" font-weight="900" fill="url(#textGrad)" letter-spacing="-2px">ToolWala <tspan fill="url(#accentGrad)">AI</tspan></text>
  <text x="345" y="360" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#60a5fa" letter-spacing="3px">FREE AI UTILITIES SUITE</text>
  <text x="345" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#94a3b8">Images • PDF • Resume • QR • Captions • Voice &amp; More</text>

  <!-- Professional Badge -->
  <rect x="120" y="465" width="220" height="40" rx="20" ry="20" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.2)" stroke-width="1.5" />
  <text x="230" y="489" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#60a5fa" text-anchor="middle" dominant-baseline="middle" letter-spacing="1.5px">100% FREE &amp; SECURE</text>

  <!-- URL text on bottom right -->
  <text x="1080" y="550" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#475569" text-anchor="end" letter-spacing="1px">toolwala.co</text>
</svg>
`;

async function generateAssets() {
  console.log('🚀 Starting high-quality branding asset generation...');

  try {
    const logoBuffer = Buffer.from(logoSvg);
    const ogBuffer = Buffer.from(ogSvg);

    // 1. Generate icon.png (32x32 standard browser icon)
    await sharp(logoBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'icon.png'));
    console.log('✅ Generated public/icon.png (32x32)');

    // 2. Generate favicon.ico (32x32 for root & legacy compat)
    await sharp(logoBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    await sharp(logoBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(appDir, 'favicon.ico')); // Overwrite App Router fallback
    console.log('✅ Generated public/favicon.ico & src/app/favicon.ico');

    // 3. Generate apple-touch-icon.png (180x180 high-contrast icon for iOS bookmarks/Safari)
    await sharp(logoBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✅ Generated public/apple-touch-icon.png (180x180)');

    // 4. Generate Android/PWA splash screen icons
    await sharp(logoBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ Generated public/icon-192.png (192x192)');

    await sharp(logoBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ Generated public/icon-512.png (512x512)');

    // 5. Generate og-image.png (1200x630 high-contrast social banner)
    await sharp(ogBuffer)
      .resize(1200, 630)
      .png()
      .toFile(path.join(publicDir, 'og-image.png'));
    console.log('✅ Generated public/og-image.png (1200x630)');

    console.log('🎉 Brand asset generation complete! All assets are vector-accurate and ready.');
  } catch (error) {
    console.error('❌ Error during asset generation:', error);
    process.exit(1);
  }
}

generateAssets();
