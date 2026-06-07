import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free SIP Calculator Online - ToolWala AI',
  description: 'Calculate SIP returns, future value, total investment and estimated wealth instantly.',
  keywords: [
    'sip calculator',
    'mutual fund calculator',
    'investment calculator',
    'sip returns',
    'systematic investment plan',
    'future value calculator'
  ],
  alternates: {
    canonical: '/tools/sip-calculator'
  },
  openGraph: {
    title: 'Free SIP Calculator Online - ToolWala AI',
    description: 'Calculate SIP returns, future value, total investment and estimated wealth instantly.',
    url: 'https://toolwala.co/tools/sip-calculator',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free SIP Calculator Online - ToolWala AI',
    description: 'Calculate SIP returns, future value, total investment and estimated wealth instantly.'
  }
};

export default function SipCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
