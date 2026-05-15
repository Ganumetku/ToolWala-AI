interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionTitle({ title, subtitle, centered = false }: SectionTitleProps) {
  return (
    <div className={`mb-16 max-w-4xl ${centered ? 'mx-auto text-center' : ''}`}>
      <h2 className="mb-6 text-4xl font-black tracking-tighter text-white md:text-6xl uppercase">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl text-gray-400 font-medium leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
