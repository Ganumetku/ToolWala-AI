import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Password Generator – Secure Random Password Creator | ToolWala AI',
  description: 'Generate strong secure random passwords instantly with ToolWala AI Password Generator. Fully private, client-side, fast and free.',
  keywords: [
    'password generator',
    'random password creator',
    'secure password',
    'offline password generator',
    'private password generator',
    'strong password maker'
  ],
  alternates: {
    canonical: '/tools/password-generator'
  },
  openGraph: {
    title: 'Free Password Generator – Secure Random Password Creator | ToolWala AI',
    description: 'Generate strong secure random passwords instantly with ToolWala AI Password Generator. Fully private, client-side, fast and free.',
    url: 'https://toolwala.co/tools/password-generator',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Password Generator – Secure Random Password Creator | ToolWala AI',
    description: 'Generate strong secure random passwords instantly with ToolWala AI Password Generator. Fully private, client-side, fast and free.'
  }
};

export default function PasswordGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
