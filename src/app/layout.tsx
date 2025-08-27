// // import { locales } from '@/lib/i18n/config';
// import { locales } from '../../i18n';
// import './globals.css';

// // Generate static params for all locales
// export async function generateStaticParams() {
//   return locales.map(locale => ({ locale }));
// }

// export default async function RootLayout({
//   children,
//   params,
// }: {
//   children: React.ReactNode;
//   params: Promise<{ locale: string }>;
// }) {

//   return children;
// }

import { ReactNode } from 'react';
import './globals.css';

type Props = {
  children: ReactNode;
};

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  return children;
}
