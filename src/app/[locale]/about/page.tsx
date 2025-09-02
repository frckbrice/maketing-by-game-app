import AboutPage from '@/components/pages/about/AboutPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Black Friday Check',
  description: 'Learn about our ethical marketing innovation platform that serves merchants and consumers. We are not a gambling site, but a promotional campaign platform where everyone wins.',
  keywords: [
    'about us',
    'ethical marketing',
    'promotional campaigns', 
    'black friday check',
    'marketing platform',
    'merchants',
    'consumers',
    'win-win',
    'not gambling'
  ],
  authors: [{ name: 'Black Friday Check Team' }],
  openGraph: {
    title: 'About Us - Black Friday Check',
    description: 'Discover our mission to create a healthy marketing ecosystem where merchants gain visibility and customers get real value.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - Black Friday Check',
    description: 'Ethical marketing innovation platform serving merchants and consumers.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/about',
    languages: {
      'en': '/en/about',
      'fr': '/fr/about',
    },
  },
};

export default function About() {
  return <AboutPage />;
}