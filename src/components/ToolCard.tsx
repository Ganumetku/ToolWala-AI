import Link from 'next/link';
import { ToolCategory } from '@/data/tools';

export interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  isPopular?: boolean;
  category?: ToolCategory;
}

export default function ToolCard({ title, description, icon, href, isPopular, category }: ToolCardProps) {
  return (
    <Link 
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50 block w-full h-full"
    >
      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
        {isPopular && (
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-3 py-1 text-xs font-bold text-orange-700 shadow-sm border border-orange-200/50 backdrop-blur-sm">
            🔥 Popular
          </span>
        )}
        {category && (
          <span className="inline-flex items-center rounded-full bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100/50 backdrop-blur-sm">
            {category}
          </span>
        )}
      </div>
      <div className="relative z-0 mt-2">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-3xl shadow-sm border border-blue-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors pr-16">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{description}</p>
      </div>
      <div className="mt-8 flex items-center text-sm font-semibold text-blue-600 bg-blue-50/0 group-hover:bg-blue-50/50 p-2 -ml-2 rounded-lg transition-colors w-max">
        Try now 
        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </Link>
  );
}
