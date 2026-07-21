interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  as?: 'h1' | 'h2';
}

export default function SectionTitle({ title, subtitle, centered = false, as = 'h2' }: SectionTitleProps) {
  const Heading = as;
  return (
    <div className={`mb-16 max-w-4xl ${centered ? 'mx-auto text-center' : ''}`}>
      <Heading className="mb-6 text-4xl font-black tracking-tighter text-gray-900 dark:text-white md:text-6xl uppercase">
        {title}
      </Heading>
      {subtitle && (
        <p className="text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

