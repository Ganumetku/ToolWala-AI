"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { useTranslation } from "@/components/I18nContext";
import ToolIcon from "@/components/ToolIcon";
import PdfToolIcon from "@/components/PdfToolIcon";
import { startTopProgress } from "@/components/TopProgressBar";

const govTools = [
  {
    title: "Crop Aadhaar Card",
    desc: "Crop Aadhaar Card online quickly and remove unwanted background & margins to official UIDAI specs (3.5cm x 4.5cm).",
    icon: "Crop",
    href: "/tools/crop-aadhaar-card/",
    badge: "Official UIDAI Spec",
    kb: "20KB - 50KB",
    dim: "354 x 472 px"
  },
  {
    title: "Aadhaar PDF Compressor",
    desc: "Compress e-Aadhaar PDF attachments under the official UIDAI 300KB upload limit.",
    icon: "Shrink",
    href: "/tools/aadhaar-pdf-compressor/",
    badge: "UIDAI < 300KB",
    kb: "Under 300KB",
    dim: "Optimized"
  },
  {
    title: "Aadhaar Masking Tool",
    desc: "Automatically detect and redact the first 8 digits of your Aadhaar card for privacy protection.",
    icon: "EyeOff",
    href: "/tools/aadhaar-masking-tool/",
    badge: "Secure Privacy Mask",
    kb: "Original Size",
    dim: "Auto-Detect"
  },
  {
    title: "PAN Card Resize",
    desc: "Standardize passport photo layout to official NSDL/UTIITSL specifications.",
    icon: "IdCard",
    href: "/tools/pan-card-resize/",
    badge: "NSDL / UTIITSL Ready",
    kb: "Under 50KB",
    dim: "213 x 213 px"
  },
  {
    title: "Signature Resize",
    desc: "Compress and scale signature scans for official banking, passport, and exam uploads.",
    icon: "PenTool",
    href: "/tools/signature-resize/",
    badge: "SSC / IBPS Compliant",
    kb: "10KB - 20KB",
    dim: "256 x 64 px"
  },
  {
    title: "Passport Photo Maker",
    desc: "Generate professional passport size prints with automatic AI background removal.",
    icon: "IdCard",
    href: "/tools/passport-photo-maker/",
    badge: "Schengen & US Visa Specs",
    kb: "Under 100KB",
    dim: "3.5 x 4.5 cm"
  },
  {
    title: "SSC Photo Resize",
    desc: "Resize passport photos to official Staff Selection Commission guidelines under 50KB.",
    icon: "IdCard",
    href: "/tools/ssc-photo-resize/",
    badge: "SSC Portal Spec",
    kb: "20KB - 50KB",
    dim: "3.5 x 4.5 cm"
  },
  {
    title: "UPSC Photo Resize",
    desc: "Resize passport photos to official UPSC registration guidelines under 40KB.",
    icon: "GraduationCap",
    href: "/tools/upsc-photo-resize/",
    badge: "UPSC OTR Spec",
    kb: "20KB - 40KB",
    dim: "350 x 350 px"
  },
  {
    title: "Government Form PDF Compressor",
    desc: "Compress government application PDF attachments under standard portal size limits.",
    icon: "FileMinus",
    href: "/tools/gov-form-pdf-compressor/",
    badge: "Portal Presets",
    kb: "Selectable KB",
    dim: "Custom Scale"
  }
];

export default function GovernmentToolHub() {
  const { t, localizeHref } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden bg-gray-50/50 dark:bg-black/30 border-b border-gray-200 dark:border-white/5 transition-colors duration-250 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            {t('gov_hub.badge', 'INDIAN PORTAL COMPLIANCE')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t('gov_hub.title', 'Government Utilities Hub')}
          </h2>
          <p className="text-gray-600 dark:text-gray-500 mt-4 font-medium max-w-2xl mx-auto text-sm">
            {t('gov_hub.subtitle', 'Quickly format documents and photos according to official requirements for NSDL, UIDAI, passport offices, and recruitment boards.')}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6 max-w-7xl mx-auto">
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
                <div className="h-full relative group">

                  <Link
                    href={localizeHref(tool.href)}
                    onClick={() => startTopProgress()}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-white dark:bg-[#0c1222] p-5 sm:p-6 transition-all duration-300 ease-out hover:-translate-y-1 w-full h-full shadow-[0_2px_8px_-2px_rgba(37,99,235,0.05),0_1px_4px_rgba(15,23,42,0.03)] hover:shadow-[0_14px_30px_-6px_rgba(37,99,235,0.10),0_4px_10px_-2px_rgba(15,23,42,0.04)] hover:border-blue-500/30 dark:hover:border-blue-400/30 dark:shadow-none"
                  >
                    <div className="relative z-10 w-full flex-1 flex flex-col justify-between">
                      <div>
                        {/* Icon & Badge */}
                        <div className="flex items-center justify-between mb-3.5 gap-2">
                          <PdfToolIcon 
                            toolId={slug} 
                            iconName={tool.icon} 
                            category="Utility Tools" 
                            size="md" 
                            className="transition-transform duration-300 group-hover:scale-105" 
                          />
                          <span className="px-2 py-0.5 rounded-full bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 text-[8px] sm:text-[9px] font-bold text-blue-600 dark:text-blue-400 group-hover:border-blue-500/30 transition-all uppercase tracking-wider relative z-10 max-w-[60%] truncate">
                            {displayBadge}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-[16px] sm:text-[17px] font-bold leading-snug text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight line-clamp-2 min-h-[2.3rem]">
                          {displayTitle}
                        </h3>
                        <p className="text-[12px] sm:text-[12.5px] font-normal leading-[1.65] text-slate-500/90 dark:text-slate-400 line-clamp-3 mb-3 min-h-[3.2rem]">
                          {displayDesc}
                        </p>
                      </div>

                      {/* Specs & CTA */}
                      <div className="border-t border-slate-100/90 dark:border-white/[0.06] pt-2.5 mt-2 relative z-10 w-full">
                        <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-slate-400 dark:text-gray-500 font-semibold uppercase tracking-wider mb-2">
                          <span>{t('gov_hub.target_kb', 'Target:')} <span className="text-slate-700 dark:text-gray-300 font-bold">{displayKb}</span></span>
                          <span>{t('gov_hub.dim_label', 'Dim:')} <span className="text-slate-700 dark:text-gray-300 font-bold">{displayDim}</span></span>
                        </div>

                        <div className="flex items-center justify-between w-full text-[11px] font-bold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          <span className="text-[10px] font-semibold uppercase tracking-wider">{t('gov_hub.configure_tool', 'Open Preset')}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Security Banner */}
        <div className="mt-16 max-w-3xl mx-auto bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6.5 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              {t('gov_hub.privacy_title', 'Strict Privacy Compliance')}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-500 mt-1 font-semibold leading-relaxed">
              {t('gov_hub.privacy_desc', 'We understand the sensitivity of Aadhaar card details and personal photos. None of your data or files are uploaded to any server. Everything is processed 100% inside your browser cache.')}
            </p>
          </div>
        </div>

        {/* 2026 Rule Update Guides */}
        <div className="mt-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
          <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">2026 Official Guides:</span>
          <Link href="/blog/pan-card-photo-size-2026-new-requirement/" className="hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4">
            PAN Photo Size & Specs Guide →
          </Link>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
          <Link href="/blog/indian-passport-photo-size-2026-why-old-2x2-inch-photo-no-longer-accepted/" className="hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4">
            Passport Photo 2026 Rule Change →
          </Link>
        </div>
      </div>
    </section>
  );
}
