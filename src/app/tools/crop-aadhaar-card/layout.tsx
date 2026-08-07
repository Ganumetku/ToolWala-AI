import { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'crop-aadhaar-card',
    'Aadhaar Photo Resize & Crop Tool – Official UIDAI Specs | ToolWala AI',
    'Crop and resize Aadhaar card photos online free to official UIDAI specs (3.5x4.5 cm, <50KB) with clean white background. 100% private browser processing.',
    '/tools/crop-aadhaar-card'
  );
}

export default function CropAadhaarCardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
