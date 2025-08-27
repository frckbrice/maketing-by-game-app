import { HomePageClient } from './HomePageClient';

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  return <HomePageClient locale={locale} />;
}
