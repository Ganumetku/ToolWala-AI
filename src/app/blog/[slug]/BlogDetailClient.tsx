"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Calendar, Clock, Share2, 
  Link2, ArrowLeft, ArrowRight, User
} from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
  createdAt: string;
  readingTime: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
}

interface BlogDetailClientProps {
  blog: BlogPost;
  allBlogs: BlogPost[];
}

const formatDateLong = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
};

const formatDateShort = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
};

interface TocItem {
  id: string;
  text: string;
  level: number;
}

// Inline Social Icon Components to bypass Lucide bundle changes
function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

export default function BlogDetailClient({ blog, allBlogs }: BlogDetailClientProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // Related posts matching the category (excluding current post)
  const relatedPosts = allBlogs
    .filter((b) => b.category === blog.category && b.id !== blog.id)
    .slice(0, 2);

  // If not enough related posts, grab the latest ones
  if (relatedPosts.length < 2) {
    const fallback = allBlogs
      .filter((b) => b.id !== blog.id && !relatedPosts.some((r) => r.id === b.id))
      .slice(0, 2 - relatedPosts.length);
    relatedPosts.push(...fallback);
  }

  // Prev / Next Navigation
  const currentIndex = allBlogs.findIndex((b) => b.id === blog.id);
  const prevPost = currentIndex > 0 ? allBlogs[currentIndex - 1] : null;
  const nextPost = currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : null;

  // Extract headings for the table of contents
  useEffect(() => {
    const articleBody = document.getElementById("blog-article-body");
    if (!articleBody) return;

    const headings = articleBody.querySelectorAll("h2, h3");
    const tempToc: TocItem[] = [];

    headings.forEach((heading, idx) => {
      const text = heading.textContent || "";
      const id = heading.id || `heading-${idx}`;
      heading.id = id; // ensure the element has the ID
      tempToc.push({
        id,
        text,
        level: heading.tagName.toLowerCase() === "h2" ? 2 : 3,
      });
    });

    setToc(tempToc);

    // Scroll listener to highlight active header
    const handleScroll = () => {
      let currentActive = "";
      for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 120) {
          currentActive = heading.id;
        }
      }
      setActiveId(currentActive || (tempToc[0]?.id ?? ""));
    };

    window.addEventListener("scroll", handleScroll);
    // run once initially
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [blog.content]);

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    toast.success("Article link copied to clipboard!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
      {/* Left Sticky Sidebar: Share utilities */}
      <div className="lg:col-span-1 lg:sticky lg:top-32 h-fit flex lg:flex-col items-center justify-center gap-4 bg-white/[0.01] border border-white/5 lg:py-6 rounded-2xl p-4">
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 hidden lg:block mb-2">Share</span>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blog.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/10 text-gray-400 hover:text-blue-400 active:scale-95 transition-all"
          title="Share on Twitter"
        >
          <TwitterIcon className="w-4 h-4" />
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/10 text-gray-400 hover:text-blue-400 active:scale-95 transition-all"
          title="Share on Facebook"
        >
          <FacebookIcon className="w-4 h-4" />
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/10 text-gray-400 hover:text-blue-400 active:scale-95 transition-all"
          title="Share on LinkedIn"
        >
          <LinkedinIcon className="w-4 h-4" />
        </a>
        <button
          onClick={copyLink}
          className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/10 text-gray-400 hover:text-blue-400 active:scale-95 transition-all cursor-pointer"
          title="Copy Article Link"
        >
          <Link2 className="w-4 h-4" />
        </button>
      </div>

      {/* Center Main Column: Article Content */}
      <div className="lg:col-span-8 space-y-12">
        <article className="glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl p-6 sm:p-14 bg-white/[0.01]">
          {/* Article Header info */}
          <header className="border-b border-white/5 pb-8 mb-10 space-y-6">
            <span className="px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-xs font-black uppercase tracking-widest text-blue-400 inline-block">
              {blog.category}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-tight uppercase">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-black uppercase tracking-widest text-gray-500">
              <div className="flex items-center gap-2">
                {blog.author.avatar ? (
                  <img
                    src={blog.author.avatar}
                    alt={blog.author.name}
                    className="w-8 h-8 rounded-full border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <span className="text-white block">{blog.author.name}</span>
                  <span className="text-[9px] text-gray-500 font-bold block mt-0.5">{blog.author.role || "Writer"}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-8">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDateLong(blog.publishedAt || blog.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {blog.readingTime}
                </span>
              </div>
            </div>
          </header>

          {/* Render Content Body */}
          <div 
            id="blog-article-body"
            className="prose prose-invert max-w-none text-gray-300 text-base sm:text-lg font-medium leading-relaxed font-sans whitespace-pre-wrap select-text space-y-6 animate-fade-in"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags Footer */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-8 mt-12 border-t border-white/5">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-gray-400 font-bold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Prev / Next controls */}
        <div className="flex flex-col sm:flex-row gap-6 justify-between items-center bg-white/[0.01] border border-white/5 p-6 rounded-3xl backdrop-blur-md animate-fade-in">
          {prevPost ? (
            <Link 
              href={`/blog/${prevPost.slug}`}
              className="flex items-center gap-4 group text-left w-full sm:w-auto"
            >
              <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-blue-600/10 border border-white/5 group-hover:border-blue-500/20 text-gray-400 group-hover:text-blue-400 transition-all">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block">Previous Post</span>
                <span className="text-xs font-black uppercase text-white group-hover:text-blue-400 transition-colors line-clamp-1">{prevPost.title}</span>
              </div>
            </Link>
          ) : <div />}

          {nextPost ? (
            <Link 
              href={`/blog/${nextPost.slug}`}
              className="flex items-center gap-4 group text-right sm:text-right w-full sm:w-auto justify-end ml-auto"
            >
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block text-right">Next Post</span>
                <span className="text-xs font-black uppercase text-white group-hover:text-blue-400 transition-colors line-clamp-1 text-right">{nextPost.title}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-blue-600/10 border border-white/5 group-hover:border-blue-500/20 text-gray-400 group-hover:text-blue-400 transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ) : <div />}
        </div>

        {/* Related articles grid */}
        <div className="space-y-6 pt-6 animate-fade-in">
          <h3 className="text-lg font-black text-white uppercase tracking-widest">
            Related Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {relatedPosts.map((rBlog) => (
              <Link 
                key={rBlog.id}
                href={`/blog/${rBlog.slug}`}
                className="group p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">{rBlog.category}</span>
                  <h4 className="text-sm font-black text-white uppercase group-hover:text-blue-400 transition-colors line-clamp-2">
                    {rBlog.title}
                  </h4>
                </div>
                <div className="flex items-center gap-3 pt-4 mt-6 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                  <span>{rBlog.readingTime}</span>
                  <span>•</span>
                  <span>{formatDateShort(rBlog.publishedAt || rBlog.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Sticky Table of Contents */}
      <div className="lg:col-span-3 lg:sticky lg:top-32 h-fit space-y-8 hidden lg:block">
        {toc.length > 0 && (
          <div className="glass rounded-[2rem] border border-white/5 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3">
              Table of Contents
            </h3>
            <ul className="space-y-3 text-xs font-bold tracking-wide">
              {toc.map((item) => (
                <li 
                  key={item.id}
                  style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`block transition-all hover:text-blue-400 line-clamp-2 ${
                      activeId === item.id 
                        ? 'text-blue-500 pl-2 border-l-2 border-blue-500' 
                        : 'text-gray-500'
                    }`}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
