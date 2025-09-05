import { GamesPage } from '@/components/features/games';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return generateSEOMetadata({
    title:
      locale === 'fr'
        ? 'Jeux de Loterie - Participez et Gagnez'
        : 'Lottery Games - Play and Win',
    description:
      locale === 'fr'
        ? 'Découvrez nos jeux de loterie passionnants avec des prix incroyables. Participez maintenant et tentez votre chance de gagner!'
        : 'Discover our exciting lottery games with incredible prizes. Play now and try your luck to win!',
    keywords:
      locale === 'fr'
        ? [
            'jeux de loterie',
            'loterie',
            'prix',
            'gagner',
            'jeu',
            'divertissement',
          ]
        : [
            'lottery games',
            'lottery',
            'prizes',
            'win',
            'game',
            'entertainment',
          ],
    url: '/games',
    locale,
    section: 'Games',
  });
}

export default function Games() {
  return <GamesPage />;
}
