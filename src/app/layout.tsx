import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PublicLayoutWrapper from "@/components/PublicLayoutWrapper";
import { Toaster } from 'sonner';
import GoogleAnalytics from "@/components/analytics/google-analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ToolWala AI – Free AI Tools for Images, PDF, Resume, QR & More",
    template: "%s | ToolWala AI"
  },
  description: "ToolWala AI offers fast and free AI tools for image editing, QR codes, resumes, PDFs, voice generation, captions, and more. Simple, powerful, and easy to use.",
  keywords: [
    "AI tools",
    "image tools",
    "PDF tools",
    "QR generator",
    "AI resume builder",
    "AI caption generator",
    "image compressor",
    "background remover",
    "ToolWala AI"
  ],
  authors: [{ name: "ToolWala AI" }],
  creator: "ToolWala AI",
  publisher: "ToolWala AI",
  metadataBase: new URL("https://toolwala.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://toolwala.co",
    siteName: "ToolWala AI",
    title: "ToolWala AI – Free AI Tools for Images, PDF, Resume, QR & More",
    description: "ToolWala AI offers fast and free AI tools for image editing, QR codes, resumes, PDFs, voice generation, captions, and more. Simple, powerful, and easy to use.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ToolWala AI – Free AI Tools for Images, PDF, Resume, QR & More",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolWala AI – Free AI Tools for Images, PDF, Resume, QR & More",
    description: "ToolWala AI offers fast and free AI tools for image editing, QR codes, resumes, PDFs, voice generation, captions, and more. Simple, powerful, and easy to use.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://toolwala.co/#organization",
      "name": "ToolWala AI",
      "url": "https://toolwala.co",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://toolwala.co/#logo",
        "url": "https://toolwala.co/icon-512.png",
        "contentUrl": "https://toolwala.co/icon-512.png",
        "caption": "ToolWala AI Logo",
        "inLanguage": "en-US",
        "width": 512,
        "height": 512
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://toolwala.co/#website",
      "url": "https://toolwala.co",
      "name": "ToolWala AI",
      "description": "ToolWala AI offers fast and free AI tools for image editing, QR codes, resumes, PDFs, voice generation, captions, and more. Simple, powerful, and easy to use.",
      "publisher": {
        "@id": "https://toolwala.co/#organization"
      },
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://toolwala.co/?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      ],
      "inLanguage": "en-US"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#030712] text-white">
        <GoogleAnalytics />
        <Toaster position="top-center" richColors />
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      </body>
    </html>
  );
}
