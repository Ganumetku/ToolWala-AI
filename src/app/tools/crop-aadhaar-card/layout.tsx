import { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'crop-aadhaar-card',
    'Crop Aadhaar Card Online Free – Front & Back PVC Print (UIDAI Specs) | ToolWala',
    'Crop e-Aadhaar card PDF or photo into front and back parts for instant PVC printing or laminating. 100% private in-browser tool compliant with UIDAI size guidelines.',
    '/tools/crop-aadhaar-card'
  );
}

export default function CropAadhaarCardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
