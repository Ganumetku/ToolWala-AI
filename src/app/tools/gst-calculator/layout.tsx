import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free GST Calculator Online - ToolWala AI',
  description: 'Calculate GST amount, total price, and reverse GST instantly with free GST Calculator.',
  keywords: ['gst calculator', 'gst calculator india', 'reverse gst calculator', 'add gst', 'remove gst', 'toolwala ai'],
  openGraph: {
    title: 'Free GST Calculator Online - ToolWala AI',
    description: 'Calculate GST amount, total price, and reverse GST instantly with free GST Calculator.',
  }
};

export default function GstCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
