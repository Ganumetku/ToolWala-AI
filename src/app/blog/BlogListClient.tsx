"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, Clock, ArrowRight, Mail, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

interface BlogListClientProps {
  initialBlogs: BlogPost[];
}

const CATEGORIES = [
  "All",
  "AI Tools",
  "PDF Tools",
  "Image Editing",
  "Productivity",
  "SEO",
  "Tutorials",
  "Online Utilities",
  "Document Tools",
];

export default function BlogListClient({ initialBlogs }: BlogListClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribing(true);
    try {
      // Intercepted or mock subscribe endpoint
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email,
          message: "Opt-in to newsletter subscription updates.",
        }),
      });
      if (res.ok) {
        toast.success("Successfully subscribed to ToolWala Insights!");
        setEmail("");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  // Filter Blogs based on search & category select
  const filteredBlogs = initialBlogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      blog.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || blog.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Extract featured and latest posts list
  const featuredPost = filteredBlogs.find((b) => b.featured);
  const remainingBlogs = filteredBlogs.filter((b) => b.id !== featuredPost?.id);

  // Trending section gets top 3 blogs
  const trendingBlogs = initialBlogs.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* Search and Category filters */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white/[0.01] border border-white/5 p-6 rounded-3xl backdrop-blur-md">
        {/* Horizontal scrollable category list */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-3 md:pb-0 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-3 w-full md:w-80 focus-within:border-blue-500/50 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles & tags..."
            className="bg-transparent text-sm border-none outline-none text-white w-full placeholder-gray-600 font-semibold"
          />
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Post list */}
        <div className="lg:col-span-8 space-y-12">
          <AnimatePresence mode="popLayout">
            {/* Featured Post Card (Show only when All or AI/PDF matches) */}
            {featuredPost && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] shadow-2xl transition-all duration-300 card-glow"
              >
                <Link href={`/blog/${featuredPost.slug}`} className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
                  {/* Image banner */}
                  <div className="md:col-span-7 rounded-[2rem] overflow-hidden relative min-h-[260px] max-h-[350px]">
                    <img
                      src={featuredPost.thumbnail}
                      alt={featuredPost.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80" />
                    <span className="absolute top-5 left-5 px-3 py-1 rounded-lg bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/30">
                      Featured
                    </span>
                  </div>

                  {/* Text attributes */}
                  <div className="md:col-span-5 flex flex-col justify-between py-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-500">
                        <span>{featuredPost.category}</span>
                        <span className="text-gray-600">•</span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" /> {featuredPost.readingTime}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase group-hover:text-blue-400 transition-colors">
                        {featuredPost.title}
                      </h2>

                      <p className="text-gray-400 text-sm font-semibold leading-relaxed line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
                      {featuredPost.author.avatar && (
                        <img
                          src={featuredPost.author.avatar}
                          alt={featuredPost.author.name}
                          className="w-8 h-8 rounded-full border border-white/10 shrink-0"
                        />
                      )}
                      <div>
                        <span className="text-xs font-black text-white block">
                          {featuredPost.author.name}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold block">
                          {featuredPost.author.role || "Writer"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* General Posts Grid */}
            {remainingBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {remainingBlogs.map((blog) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={blog.id}
                    className="group flex flex-col justify-between rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative card-glow"
                  >
                    <Link href={`/blog/${blog.slug}`} className="flex flex-col h-full">
                      {/* Image header */}
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={blog.thumbnail}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent" />
                        <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-400">
                          {blog.category}
                        </span>
                      </div>

                      {/* Card contents */}
                      <div className="p-6 flex flex-col flex-1 justify-between space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {blog.readingTime}
                            </span>
                          </div>

                          <h3 className="text-lg font-black text-white uppercase tracking-tight leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                            {blog.title}
                          </h3>

                          <p className="text-gray-400 text-xs font-semibold leading-relaxed line-clamp-3">
                            {blog.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                          <div className="flex items-center gap-2">
                            {blog.author.avatar && (
                              <img
                                src={blog.author.avatar}
                                alt={blog.author.name}
                                className="w-6.5 h-6.5 rounded-full border border-white/10"
                              />
                            )}
                            <div>
                              <span className="text-[10px] font-black text-white block">
                                {blog.author.name}
                              </span>
                            </div>
                          </div>

                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Read Post <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : (
              !featuredPost && (
                <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.01]">
                  <Sparkles className="w-8 h-8 text-blue-500/50 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">
                    No articles found matching criteria.
                  </h3>
                </div>
              )
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Sidebar (Trending posts, Newsletter) */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Trending sidebar block */}
          <div className="glass rounded-[2rem] border border-white/5 p-6 sm:p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" /> Trending Topics
            </h3>

            <div className="space-y-6 divide-y divide-white/5">
              {trendingBlogs.map((trending, idx) => (
                <Link
                  href={`/blog/${trending.slug}`}
                  key={trending.id}
                  className={`flex gap-4 group pt-5 first:pt-0`}
                >
                  <span className="text-3xl font-black text-white/10 group-hover:text-blue-500/20 transition-colors leading-none shrink-0 font-sans">
                    0{idx + 1}
                  </span>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                      {trending.category}
                    </span>
                    <h4 className="text-sm font-black text-white uppercase leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                      {trending.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter subscription block */}
          <div className="glass rounded-[2rem] border border-white/5 p-6 sm:p-8 bg-gradient-to-b from-blue-600/[0.05] to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl" />
            <div className="space-y-4 relative z-10">
              <Mail className="w-8 h-8 text-blue-500" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none">
                Subscribe to ToolWala Insights
              </h3>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                Stay updated on client-side advancements, tools updates, and tech design articles. No spam, ever.
              </p>
              
              <form onSubmit={handleSubscribe} className="space-y-3 pt-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-blue-500/50 placeholder-gray-600"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="w-full py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {isSubscribing ? "Subscribing..." : "Join Newsletter"}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
