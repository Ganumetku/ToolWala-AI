import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free AI Passport Photo Maker – Print-Ready Photos",
  description: "Convert photos into standard, print-ready passport-size pictures. Automatic background removal and cropping tools.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
