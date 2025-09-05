import {
  defaultSEO,
  generateMetadata as generateSEOMetadata,
} from '@/lib/seo/metadata';
import { HomePageClient } from '../../components/ui/HomePageClient';

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return generateSEOMetadata({
    ...defaultSEO,
    locale,
    title:
      locale === 'fr'
        ? 'Application de marketing - Gagnez des Prix Incroyables'
        : 'Lottery App - Win Amazing Prizes',
    description:
      locale === 'fr'
        ? 'Participez à des jeux de marketing passionnants et gagnez des prix incroyables. Rejoignez des milliers de joueurs sur notre plateforme de loterie sécurisée et équitable.'
        : 'Participate in exciting lottery games and win incredible prizes. Join thousands of players in our secure and fair lottery platform.',
    keywords:
      locale === 'fr'
        ? [
            'marketing',
            'jeux',
            'prix',
            'gagner',
            'divertissement',
            'jeu de hasard',
          ]
        : ['marketing', 'games', 'prizes', 'win', 'gambling', 'entertainment'],
  });
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  return <HomePageClient locale={locale} />;
}
