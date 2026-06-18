"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { useTranslation } from "@/components/I18nContext";

const govTools = [
  {
    title: "Aadhaar Card Photo Resizer",
    desc: "Resize & crop photo to official UIDAI specifications (3.5cm x 4.5cm) under 50KB.",
    icon: <span className="text-2xl select-none" role="img" aria-label="Aadhaar Card">🪪</span>,
    href: "/tools/aadhaar-photo-resizer/",
    badge: "Official UIDAI Spec",
    kb: "20KB - 50KB",
    dim: "354 x 472 px"
  },
  {
    title: "Aadhaar Masking Tool",
    desc: "Automatically detect and redact the first 8 digits of your Aadhaar card for privacy protection.",
    icon: <span className="text-2xl select-none" role="img" aria-label="Aadhaar Mask">🪪</span>,
    href: "/tools/aadhaar-masking-tool/",
    badge: "Secure Privacy Mask",
    kb: "Original Size",
    dim: "Auto-Detect"
  },
  {
    title: "PAN Card Photo Crop",
    desc: "Standardize photo layout for online NSDL/UTIITSL application forms.",
    icon: <span className="text-2xl select-none" role="img" aria-label="PAN Card">🪪</span>,
    href: "/tools/pan-photo-tool/",
    badge: "NSDL / UTIITSL Ready",
    kb: "Under 50KB",
    dim: "213 x 213 px"
  },
  {
    title: "Signature Resizer",
    desc: "Compress and scale signature scans for official banking, passport, and exam uploads.",
    icon: <span className="text-2xl select-none" role="img" aria-label="Signature">✍️</span>,
    href: "/tools/signature-crop-tool/",
    badge: "SSC / IBPS Compliant",
    kb: "10KB - 20KB",
    dim: "256 x 64 px"
  },
  {
    title: "Passport Photo Maker",
    desc: "Generate professional passport size prints with automatic AI background removal.",
    icon: <span className="text-2xl select-none" role="img" aria-label="Passport Photo">📸</span>,
    href: "/tools/passport-photo-maker/",
    badge: "Schengen & US Visa Specs",
    kb: "Under 100KB",
    dim: "3.5 x 4.5 cm"
  },
  {
    title: "Exam Photo Resize",
    desc: "Resize photos for competitive exams including SSC, UPSC, IBPS, NEET and JEE.",
    icon: <span className="text-2xl select-none" role="img" aria-label="Exam Photo">📝</span>,
    href: "/tools/exam-photo-resizer/",
    badge: "National Portals",
    kb: "20KB - 50KB",
    dim: "3.5 x 4.5 cm"
  },
  {
    title: "JPG to PDF Converter",
    desc: "Convert document photo scans into a single secure PDF file for portal submission.",
    icon: <span className="text-2xl select-none" role="img" aria-label="JPG to PDF">🖼️</span>,
    href: "/tools/jpg-to-pdf/",
    badge: "Multi-Scan Join",
    kb: "Under 2MB",
    dim: "A4 Standard"
  },
  {
    title: "PDF Compressor",
    desc: "Compress government application attachments under standard portal size limits.",
    icon: <span className="text-2xl select-none" role="img" aria-label="PDF Compressor">🗜️</span>,
    href: "/tools/pdf-tools/",
    badge: "WASM Local Engine",
    kb: "Under 100KB",
    dim: "Optimized Quality"
  }
];

export default function GovernmentToolHub() {
  const { t, localizeHref } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden bg-black/30 border-b border-white/5">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Sparkles className="w-3.5 h-3.5" />
            {t('gov_hub.badge', 'INDIAN PORTAL COMPLIANCE')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            {t('gov_hub.title', 'Government Utilities Hub')}
          </h2>
          <p className="text-gray-500 mt-4 font-medium max-w-2xl mx-auto">
            {t('gov_hub.subtitle', 'Quickly format documents and photos according to official requirements for NSDL, UIDAI, passport offices, and recruitment boards.')}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {govTools.map((tool, index) => {
            const match = tool.href.match(/\/tools\/([^\/]+)\/?/);
            const slug = match ? match[1] : '';
            const displayTitle = slug ? t(`tools.${slug}.title`, tool.title) : tool.title;
            const displayDesc = slug ? t(`tools.${slug}.description`, tool.desc) : tool.desc;
            const displayBadge = slug ? t(`gov_hub.badges.${slug}`, tool.badge) : tool.badge;
            const displayKb = slug ? t(`gov_hub.kb.${slug}`, tool.kb) : tool.kb;
            const displayDim = slug ? t(`gov_hub.dim.${slug}`, tool.dim) : tool.dim;

            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="h-full"
              >
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="h-full relative group"
                >
                  {/* Premium Outer Glow Gradient */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/25 via-indigo-500/25 to-purple-500/25 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <Link
                    href={localizeHref(tool.href)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/40 w-full h-full glass shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                  >
                    {/* Glow Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10 w-full">
                      {/* Icon & Badge */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative">
                          <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          <span className="relative z-10">{tool.icon}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-gray-400 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all uppercase tracking-wider relative z-10">
                          {displayBadge}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-black text-white tracking-tight group-hover:text-blue-400 transition-colors uppercase leading-tight mb-2">
                        {displayTitle}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6 group-hover:text-gray-400 transition-colors">
                        {displayDesc}
                      </p>
                    </div>

                    {/* Specs & CTA */}
                    <div className="border-t border-white/5 pt-4 mt-auto relative z-10 w-full">
                      <div className="flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-4">
                        <span>{t('gov_hub.target_kb', 'Target KB:')} <span className="text-gray-400">{displayKb}</span></span>
                        <span>{t('gov_hub.dim_label', 'Dim:')} <span className="text-gray-400">{displayDim}</span></span>
                      </div>

                      <div 
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 group-hover:bg-blue-600 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-all shadow-md"
                      >
                        {t('gov_hub.configure_tool', 'Configure Tool')}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Security Banner */}
        <div className="mt-16 max-w-3xl mx-auto glass border border-white/5 p-6.5 rounded-[2rem] flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-blue-900/10 via-transparent to-transparent">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              {t('gov_hub.privacy_title', 'Strict Privacy Compliance')}
            </h4>
            <p className="text-xs text-gray-500 mt-1 font-semibold leading-relaxed">
              {t('gov_hub.privacy_desc', 'We understand the sensitivity of Aadhaar card details and personal photos. None of your data or files are uploaded to any server. Everything is processed 100% inside your browser cache.')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
