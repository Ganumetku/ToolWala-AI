import SectionTitle from '@/components/SectionTitle';
import Link from 'next/link';
import { Check } from 'lucide-react';

export const metadata = {
  title: "Pricing | ToolWala AI",
  description: "Simple, transparent pricing for ToolWala AI. Choose the plan that works best for you.",
};

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '/signup',
    price: '$0',
    description: 'Perfect for individuals and light usage.',
    features: [
      'Access to 5 AI tools',
      'Standard processing speed',
      'Up to 10 uses per day',
      'Community support',
      'Ad-supported',
    ],
    mostPopular: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '/signup?plan=pro',
    price: '$9',
    description: 'Ideal for professionals and power users.',
    features: [
      'Access to all premium AI tools',
      'Lightning fast processing',
      'Unlimited uses',
      'Priority email support',
      'Ad-free experience',
      'Early access to new features',
    ],
    mostPopular: true,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle 
            title="Simple, transparent pricing" 
            subtitle="Choose the perfect plan for your needs. Always know what you'll pay."
            centered
          />
        </div>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12 px-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 xl:p-10 ${
                tier.mostPopular ? 'ring-2 ring-blue-600 bg-gray-50' : 'ring-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.id}
                  className={`text-lg font-semibold leading-8 ${
                    tier.mostPopular ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {tier.name}
                </h3>
                {tier.mostPopular ? (
                  <p className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-600">
                    Most popular
                  </p>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">{tier.price}</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
              </p>
              <Link
                href={tier.href}
                aria-describedby={tier.id}
                className={`mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.mostPopular
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-blue-600'
                    : 'text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300'
                }`}
              >
                Get started today
              </Link>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
