import AboutPage from '@/components/pages/about/AboutPage';
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
        ? 'À Propos - Application de Loterie'
        : 'About Us - Lottery App',
    description:
      locale === 'fr'
        ? 'Découvrez notre plateforme de loterie sécurisée et équitable. Nous offrons des jeux passionnants avec des prix incroyables pour tous les joueurs.'
        : 'Learn about our secure and fair lottery platform. We offer exciting games with incredible prizes for all players.',
    keywords:
      locale === 'fr'
        ? [
            'à propos',
            'loterie',
            'plateforme',
            'jeux',
            'prix',
            'sécurisé',
            'équitable',
          ]
        : [
            'about us',
            'lottery',
            'platform',
            'games',
            'prizes',
            'secure',
            'fair',
          ],
    url: '/about',
    locale,
    section: 'About',
    type: 'website',
  });
}

export default function About() {
  return <AboutPage />;
}
