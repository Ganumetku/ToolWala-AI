"use client";

import { motion } from "framer-motion";
import { Star, CheckCircle, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Aadhaar Resizer is an absolute lifesaver. I was trying to upload my photo to the official portal for hours, and ToolWala formatted it correctly in 5 seconds. The best part is it runs offline!",
    author: "Rahul Verma",
    role: "Government Exam Aspirant",
    location: "New Delhi",
    rating: 5,
    verified: true
  },
  {
    quote: "As a product manager, I deal with PDFs and sensitive customer documents daily. Knowing that ToolWala processes everything client-side without server uploads gives me total peace of mind.",
    author: "Priya Sharma",
    role: "Senior Product Manager",
    location: "Bengaluru",
    rating: 5,
    verified: true
  },
  {
    quote: "The Background Remover is faster than half of the paid utilities I used to subscribe to. The edge sharpening convolution details are incredibly sharp. Highly recommend it!",
    author: "Devendra Patil",
    role: "Freelance UI Designer",
    location: "Mumbai",
    rating: 5,
    verified: true
  },
  {
    quote: "I use the AI Text Humanizer and PDF OCR engines daily. ToolWala AI has completely replaced my set of browser bookmarklets. Simply top-tier engineering.",
    author: "Ananya Iyer",
    role: "Content Strategist",
    location: "Chennai",
    rating: 5,
    verified: true
  }
];

export default function HomepageTestimonials() {
  return (
    <section className="py-24 relative overflow-hidden bg-black/10 border-b border-white/5">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4">
            <CheckCircle className="w-3.5 h-3.5" />
            USER REVIEWS
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Loved by 50,000+ Professionals
          </h2>
          <p className="text-gray-500 mt-4 font-medium max-w-2xl mx-auto">
            See why freelancers, developers, and daily internet users trust ToolWala AI to speed up their everyday workflows.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="premium-card p-8 hover:border-blue-500/20 group relative overflow-hidden"
            >
              {/* Quote Icon Background */}
              <div className="absolute top-6 right-6 opacity-[0.02] text-white">
                <Quote className="w-20 h-20" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 font-semibold leading-relaxed text-sm md:text-base mb-6 italic relative z-10">
                "{t.quote}"
              </p>

              {/* Profile details */}
              <div className="flex justify-between items-center border-t border-white/5 pt-5">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    {t.author}
                    {t.verified && (
                      <span className="flex items-center gap-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest">
                        Verified
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                    {t.role}
                  </p>
                </div>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                  {t.location}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
