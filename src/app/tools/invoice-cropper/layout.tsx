import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Invoice Cropper Online - Crop & Scan Invoices & Receipts | ToolWala AI",
  description: "Crop and scan invoice images or PDFs online. Automatically detect document edges, remove unwanted margins, clean backgrounds, and export to JPG, PNG, or PDF locally.",
  alternates: {
    canonical: "/tools/invoice-cropper",
  },
  keywords: [
    "invoice cropper",
    "crop invoice online",
    "receipt cropper",
    "invoice scanner",
    "document crop tool",
    "crop receipt image",
    "invoice editor online"
  ],
  openGraph: {
    title: "Invoice Cropper Online - Crop & Scan Invoices & Receipts",
    description: "Crop and scan invoice images or PDFs online. Automatically detect document edges, remove unwanted margins, clean backgrounds, and export to JPG, PNG, or PDF locally.",
    url: "https://toolwala.co/tools/invoice-cropper",
    type: "website"
  }
};

export default function InvoiceCropperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
