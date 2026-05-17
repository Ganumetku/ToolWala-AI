import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free Professional Invoice Generator – Easy Invoices",
  description: "Create and download professional invoices in seconds. Clean layout, customizable fields, and instant PDF download.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
