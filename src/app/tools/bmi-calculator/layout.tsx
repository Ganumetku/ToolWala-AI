import type { Metadata } from 'next';
import { generateToolMetadataHelper } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadataHelper(
    'bmi-calculator',
    'BMI Calculator – Check Your Body Mass Index Online | ToolWala AI',
    'Free online BMI Calculator. Enter your height and weight to instantly calculate your Body Mass Index and WHO weight category with health insights.',
    '/tools/bmi-calculator'
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
