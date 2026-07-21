import { notFound } from 'next/navigation';

export default function PricingPage() {
  notFound();
  return null;
}

/*
export default function PricingPageContent() {
*/
  const { t, localizeHref } = useTranslation();

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#030712] min-h-screen text-gray-900 dark:text-white font-sans transition-colors duration-250">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <MeshGradient />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-10 shadow-sm"
          >
            <Rocket className="w-4 h-4" />
            <span>{t('pricing.beta_badge', 'Beta Early Access Phase')}</span>
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-[0.9] uppercase">
            {t('pricing.title_1', 'AI for Everyone.')} <br />
            <span className="text-blue-600 dark:text-blue-500">{t('pricing.title_2', 'Currently 100% Free.')}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            {t('pricing.subtitle', "We're building the future of utility. During our beta phase, every tool is open and free to help us refine the experience.")}
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="pb-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Beta Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white dark:bg-[#080c18] border border-gray-200 dark:border-white/10 rounded-3xl p-10 h-full flex flex-col shadow-sm dark:shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('pricing.free_title', 'Beta Explorer')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 font-bold">{t('pricing.free_sub', 'Help us shape the future')}</p>
                </div>
                
                <div className="mb-10 flex items-baseline gap-2">
                  <span className="text-6xl font-black text-gray-900 dark:text-white">$0</span>
                  <span className="text-gray-500 font-black uppercase tracking-widest text-xs">{t('pricing.free_period', '/ forever beta')}</span>
                </div>
                
                <div className="space-y-4 mb-12 flex-grow">
                  <FeatureCheck text={t('pricing.free_features.bg_removal', 'Unlimited AI Background Removal')} />
                  <FeatureCheck text={t('pricing.free_features.humanizer', 'Full AI Text Humanizer Access')} />
                  <FeatureCheck text={t('pricing.free_features.logo', 'Logo Design Studio (High Res)')} />
                  <FeatureCheck text={t('pricing.free_features.support', 'Beta Priority Support')} />
                  <FeatureCheck text={t('pricing.free_features.releases', 'Early access to new releases')} />
                </div>
                
                <Link href={localizeHref('/tools')} className="w-full py-5 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-center transition-all shadow-md hover:scale-[1.02] active:scale-95">
                  {t('pricing.free_btn', 'Start Creating Now')}
                </Link>
              </div>
            </motion.div>

            {/* Pro Card (Coming Soon) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative bg-white/70 dark:bg-[#080c18]/50 border border-gray-200 dark:border-white/5 rounded-3xl p-10 h-full flex flex-col backdrop-blur-sm shadow-sm">
                <div className="absolute top-8 right-8">
                  <span className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest">
                    {t('pricing.coming_soon', 'Coming Soon')}
                  </span>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-gray-400 dark:text-white/50 mb-2">{t('pricing.pro_title', 'Pro Creator')}</h3>
                  <p className="text-gray-500 font-bold">{t('pricing.pro_sub', 'Advanced features for power users')}</p>
                </div>
                
                <div className="mb-10 flex items-baseline gap-2">
                  <span className="text-6xl font-black text-gray-300 dark:text-white/20">$??</span>
                  <span className="text-gray-500 dark:text-gray-600 font-black uppercase tracking-widest text-xs">{t('pricing.pro_period', '/ monthly')}</span>
                </div>
                
                <div className="space-y-4 mb-12 flex-grow opacity-50 dark:opacity-30">
                  <FeatureCheck text={t('pricing.pro_features.bulk', 'Bulk Image Processing')} />
                  <FeatureCheck text={t('pricing.pro_features.api', 'API Access for Developers')} />
                  <FeatureCheck text={t('pricing.pro_features.custom', 'Custom AI Model Training')} />
                  <FeatureCheck text={t('pricing.pro_features.team', 'Team Collaboration Tools')} />
                  <FeatureCheck text={t('pricing.pro_features.commercial', 'Commercial Usage Rights')} />
                </div>
                
                <button disabled className="w-full py-5 px-8 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 font-black cursor-not-allowed border border-gray-200 dark:border-white/5">
                  {t('pricing.pro_btn', 'Waitlist Opening Soon')}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-32 bg-gray-100/60 dark:bg-white/[0.02]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-16 tracking-tight uppercase">
            {t('pricing.features_title', "What's included in Free Beta?").replace('Free Beta', t('pricing.free_title', 'Free Beta'))}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {betaFeatures.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 rounded-2xl bg-white dark:bg-[#080c18] border border-gray-200 dark:border-white/5 hover:border-blue-500/30 transition-all group shadow-sm"
              >
                <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                <span className="block text-sm font-black text-gray-700 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                  {t('pricing.beta_features_list.' + feature.key, feature.name)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCheck({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
      </div>
      <span className="text-sm font-bold text-gray-700 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">{text}</span>
    </div>
  );
}
