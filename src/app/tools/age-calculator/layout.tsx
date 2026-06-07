import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Age Calculator Online - ToolWala AI',
  description: 'Calculate your exact age in years, months, days, total weeks and next birthday instantly with ToolWala AI.',
  keywords: [
    'age calculator',
    'exact age calculator',
    'chronological age calculator',
    'date of birth calculator',
    'birthday calculator',
    'days lived calculator'
  ],
  alternates: {
    canonical: '/tools/age-calculator'
  },
  openGraph: {
    title: 'Free Age Calculator Online - ToolWala AI',
    description: 'Calculate your exact age in years, months, days, total weeks and next birthday instantly with ToolWala AI.',
    url: 'https://toolwala.co/tools/age-calculator',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Age Calculator Online - ToolWala AI',
    description: 'Calculate your exact age in years, months, days, total weeks and next birthday instantly with ToolWala AI.'
  }
};

export default function AgeCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
