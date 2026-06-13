"use client";

import { useState } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url?: string;
  className?: string;
}

export default function ShareButtons({ title, url, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return url || window.location.href;
    }
    return url || "";
  };

  const handleCopy = async () => {
    const targetUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      toast.success("Link copied! Share it with your friends ⚡");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  const shareOnTwitter = () => {
    const targetUrl = getShareUrl();
    const shareText = `Check out this amazing tool on ToolWala AI: ${title} 🚀`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(targetUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareOnLinkedin = () => {
    const targetUrl = getShareUrl();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(targetUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareOnFacebook = () => {
    const targetUrl = getShareUrl();
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(targetUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5 mr-1 select-none">
        <Share2 className="w-3.5 h-3.5 text-blue-500" /> Share Tool:
      </span>
      
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-blue-600/5 text-xs text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer select-none"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Copy Link</span>
          </>
        )}
      </button>

      <button
        onClick={shareOnTwitter}
        className="p-2 bg-white/5 border border-white/10 hover:border-blue-400/30 hover:bg-blue-400/5 text-gray-400 hover:text-blue-400 rounded-xl transition-all cursor-pointer"
        aria-label="Share on Twitter"
      >
        <TwitterIcon className="w-4 h-4" />
      </button>

      <button
        onClick={shareOnLinkedin}
        className="p-2 bg-white/5 border border-white/10 hover:border-indigo-400/30 hover:bg-indigo-400/5 text-gray-400 hover:text-indigo-400 rounded-xl transition-all cursor-pointer"
        aria-label="Share on LinkedIn"
      >
        <LinkedinIcon className="w-4 h-4" />
      </button>

      <button
        onClick={shareOnFacebook}
        className="p-2 bg-white/5 border border-white/10 hover:border-blue-600/30 hover:bg-blue-600/5 text-gray-400 hover:text-blue-500 rounded-xl transition-all cursor-pointer"
        aria-label="Share on Facebook"
      >
        <FacebookIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

// Brand SVG Icons defined locally
function TwitterIcon(props: any) {
  return (
    <svg {...props} suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}

function LinkedinIcon(props: any) {
  return (
    <svg {...props} suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function FacebookIcon(props: any) {
  return (
    <svg {...props} suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}
