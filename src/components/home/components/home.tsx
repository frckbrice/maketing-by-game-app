import { useEffect, useState } from 'react';

import { Footer } from '@/components/globals';
import { DesktopHeader } from './DesktopHeader';
import { FinalCTASection } from './FinalCTASection';
import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { MobileNavigation } from './MobileNavigation';
import { StatsSection } from './stats-section';
import { WinnersSection } from './WinnersSection';

const HomePageComponent = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true); // Default to dark theme for casino look
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <div
        className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} flex items-center justify-center`}
      >
        <div
          className={`animate-spin rounded-full h-16 w-16 border-b-2 ${isDark ? 'border-orange-500' : 'border-orange-600'}`}
        ></div>
      </div>
    );
  }

  return (
    <div
      className={`${isDark ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} ${isDark ? 'text-white' : 'text-gray-900'}`}
    >
      {/* Desktop Header */}
      <DesktopHeader isDark={isDark} onThemeToggle={() => setIsDark(!isDark)} />

      {/* Mobile Navigation */}
      <MobileNavigation
        isDark={isDark}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onThemeToggle={() => setIsDark(!isDark)}
      />

      <HeroSection isDark={isDark} />

      <HowItWorksSection isDark={isDark} />

      <WinnersSection isDark={isDark} />

      <StatsSection isDark={isDark} />

      <FinalCTASection isDark={isDark} />

      {/* Footer with proper spacing */}
      <div className='relative z-10'>
        <Footer isDark={isDark} />
      </div>
    </div>
  );
};

export default HomePageComponent;
