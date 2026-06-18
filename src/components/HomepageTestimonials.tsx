"use client";

import { motion } from "framer-motion";
import { Star, CheckCircle, Quote } from "lucide-react";
import { useTranslation } from "@/components/I18nContext";

export default function HomepageTestimonials() {
  const { t } = useTranslation();

  const testimonials = [
    {
      quote: t('testimonials.quote1', 'Aadhaar Resizer is an absolute lifesaver. I was trying to upload my photo to the official portal for hours, and ToolWala formatted it correctly in 5 seconds. The best part is it runs offline!'),
      author: t('testimonials.author1', 'Rahul Verma'),
      role: t('testimonials.role1', 'Government Exam Aspirant'),
      location: t('testimonials.location1', 'New Delhi'),
      rating: 5,
      verified: true
    },
    {
      quote: t('testimonials.quote2', 'As a product manager, I deal with PDFs and sensitive customer documents daily. Knowing that ToolWala processes everything client-side without server uploads gives me total peace of mind.'),
      author: t('testimonials.author2', 'Priya Sharma'),
      role: t('testimonials.role2', 'Senior Product Manager'),
      location: t('testimonials.location2', 'Bengaluru'),
      rating: 5,
      verified: true
    },
    {
      quote: t('testimonials.quote3', 'The Background Remover is faster than half of the paid utilities I used to subscribe to. The edge sharpening convolution details are incredibly sharp. Highly recommend it!'),
      author: t('testimonials.author3', 'Devendra Patil'),
      role: t('testimonials.role3', 'Freelance UI Designer'),
      location: t('testimonials.location3', 'Mumbai'),
      rating: 5,
      verified: true
    },
    {
      quote: t('testimonials.quote4', 'I use the AI Text Humanizer and PDF OCR engines daily. ToolWala AI has completely replaced my set of browser bookmarklets. Simply top-tier engineering.'),
      author: t('testimonials.author4', 'Ananya Iyer'),
      role: t('testimonials.role4', 'Content Strategist'),
      location: t('testimonials.location4', 'Chennai'),
      rating: 5,
      verified: true
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-black/10 border-b border-white/5">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4">
            <CheckCircle className="w-3.5 h-3.5" />
            {t('testimonials.badge', 'USER REVIEWS')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            {t('testimonials.title', 'Loved by 50,000+ Professionals')}
          </h2>
          <p className="text-gray-500 mt-4 font-medium max-w-2xl mx-auto">
            {t('testimonials.subtitle', 'See why freelancers, developers, and daily internet users trust ToolWala AI to speed up their everyday workflows.')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((tItem, idx) => (
            <motion.div
              key={tItem.author}
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
                {[...Array(tItem.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 font-semibold leading-relaxed text-sm md:text-base mb-6 italic relative z-10">
                "{tItem.quote}"
              </p>

              {/* Profile details */}
              <div className="flex justify-between items-center border-t border-white/5 pt-5">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    {tItem.author}
                    {tItem.verified && (
                      <span className="flex items-center gap-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest">
                        {t('testimonials.verified', 'Verified')}
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                    {tItem.role}
                  </p>
                </div>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                  {tItem.location}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
