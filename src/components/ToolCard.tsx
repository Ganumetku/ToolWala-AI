import Link from 'next/link';

export interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  isPopular?: boolean;
}

export default function ToolCard({ title, description, icon, href, isPopular }: ToolCardProps) {
  return (
    <Link 
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100"
    >
      {isPopular && (
        <span className="absolute top-0 right-0 rounded-bl-xl rounded-tr-xl bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
          Popular
        </span>
      )}
      <div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
      <div className="mt-6 flex items-center text-sm font-medium text-blue-600">
        Try now 
        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </Link>
  );
}
