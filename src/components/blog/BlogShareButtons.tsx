"use client";

import { Link2 } from "lucide-react";
import { toast } from "sonner";

interface BlogShareButtonsProps {
  title: string;
  url: string;
  layout?: "vertical" | "horizontal";
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

const btnClass =
  "p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-white/5 dark:hover:bg-blue-600/10 border border-slate-200 dark:border-white/10 hover:border-blue-500/30 text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all flex items-center justify-center";

export default function BlogShareButtons({ title, url, layout = "vertical" }: BlogShareButtonsProps) {
  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Article link copied!");
  };

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`, label: "Twitter", Icon: TwitterIcon },
    { href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, label: "Facebook", Icon: FacebookIcon },
    { href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`, label: "LinkedIn", Icon: LinkedinIcon },
    { href: `https://wa.me/?text=${encodedTitle}%20${encoded}`, label: "WhatsApp", Icon: WhatsAppIcon },
  ];

  return (
    <div
      className={`flex items-center gap-2.5 ${
        layout === "vertical"
          ? "lg:flex-col lg:py-4 bg-white dark:bg-[#0c1222]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2.5 shadow-sm"
          : "flex-row flex-wrap"
      }`}
    >
      {layout === "vertical" && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden lg:block mb-1">
          Share
        </span>
      )}
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClass}
          title={`Share on ${label}`}
          aria-label={`Share on ${label}`}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
      <button onClick={copyLink} className={`${btnClass} cursor-pointer`} title="Copy link" aria-label="Copy link">
        <Link2 className="w-4 h-4" />
      </button>
    </div>
  );
}
