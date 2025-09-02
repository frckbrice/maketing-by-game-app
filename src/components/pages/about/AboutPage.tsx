'use client';

import { Button } from '@/components/ui/Button';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Footer } from '@/components/globals';
import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  CheckCircle,
  Heart,
  Shield,
  Star,
  Target,
  Ticket,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true); // Default to dark theme for consistency

  useEffect(() => {
    setMounted(true);
  }, []);

  const values = [
    {
      icon: Shield,
      title: t('about.transparency'),
      description: t('about.transparencyDesc'),
    },
    {
      icon: Users,
      title: t('about.equity'),
      description: t('about.equityDesc'),
    },
    {
      icon: Heart,
      title: t('about.responsibility'),
      description: t('about.responsibilityDesc'),
    },
    {
      icon: Star,
      title: t('about.valueSharing'),
      description: t('about.valueSharingDesc'),
    },
  ];

  const merchantBenefits = [
    {
      icon: Zap,
      title: t('about.increasedVisibility'),
      description: t('about.increasedVisibilityDesc'),
    },
    {
      icon: Users,
      title: t('about.newCustomers'),
      description: t('about.newCustomersDesc'),
    },
    {
      icon: Trophy,
      title: t('about.customerLoyalty'),
      description: t('about.customerLoyaltyDesc'),
    },
  ];

  const customerBenefits = [
    {
      icon: Target,
      title: t('about.winChance'),
      description: t('about.winChanceDesc'),
    },
    {
      icon: Ticket,
      title: t('about.guaranteedDiscount'),
      description: t('about.guaranteedDiscountDesc'),
    },
    {
      icon: CheckCircle,
      title: t('about.discoverShops'),
      description: t('about.discoverShopsDesc'),
    },
  ];

  const handleStartShopping = () => {
    router.push('/games');
  };

  const handleBecomePartner = () => {
    if (!user) {
      // Redirect non-authenticated users to login
      router.push('/auth/login');
    } else {
      // Redirect authenticated users to profile page where they can apply to become vendor
      router.push('/profile');
    }
  };

  if (!mounted) {
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
      className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} ${isDark ? 'text-white' : 'text-gray-900'}`}
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

      {/* Hero Section */}
      <section className={`relative overflow-hidden ${isDark ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20' : 'bg-gradient-to-r from-orange-100 to-red-100'}`}>
        <div className={`absolute inset-0 ${isDark ? 'bg-black/20' : 'bg-white/20'}`}></div>
        <div className="relative container mx-auto px-4 py-20 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <AnimatedSection>
              <h1 className={`text-4xl sm:text-6xl font-bold mb-6 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('about.heroTitle')}
              </h1>
              <p className={`text-xl sm:text-2xl mb-8 leading-relaxed ${isDark ? 'text-orange-100' : 'text-orange-700'}`}>
                {t('about.heroSubtitle')}
              </p>
              <div className={`${isDark ? 'bg-white/10' : 'bg-orange-50'} backdrop-blur-sm rounded-2xl p-6 inline-block border ${isDark ? 'border-orange-500/30' : 'border-orange-200'}`}>
                <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {t('about.notGambling')}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg
            className={`w-full h-20 ${isDark ? 'text-gray-900' : 'text-gray-50'}`}
            fill="currentColor"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
            />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
            />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" />
          </svg>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h2 className={`text-3xl sm:text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('about.ourVision')}
            </h2>
            <p className={`text-lg mb-12 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('about.visionDesc')}
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <AnimatedSection delay={200} animation="fadeInLeft">
              <div className="p-6">
                <div className={`w-16 h-16 ${isDark ? 'bg-orange-900/30' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300`}>
                  <Users className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('about.merchantsWin')}
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('about.merchantsWinDesc')}
                </p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={400} animation="fadeInUp">
              <div className="p-6">
                <div className={`w-16 h-16 ${isDark ? 'bg-orange-900/30' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300`}>
                  <Target className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('about.customersDiscover')}
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('about.customersDiscoverDesc')}
                </p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={600} animation="fadeInRight">
              <div className="p-6">
                <div className={`w-16 h-16 ${isDark ? 'bg-orange-900/30' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300`}>
                  <Zap className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('about.techMakes')}
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('about.techMakesDesc')}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={`py-20 ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('about.howItWorks')}
              </h2>
            </AnimatedSection>
            
            <div className="space-y-8">
              <AnimatedSection delay={200} animation="fadeInLeft">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                          1
                        </div>
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {t('about.step1Title')}
                        </h3>
                      </div>
                      <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('about.step1Desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection delay={400} animation="fadeInRight">
                <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                  <div className="flex-1">
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                          2
                        </div>
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {t('about.step2Title')}
                        </h3>
                      </div>
                      <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('about.step2Desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection delay={600} animation="fadeInLeft">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                          3
                        </div>
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {t('about.step3Title')}
                        </h3>
                      </div>
                      <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('about.step3Desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection delay={800} animation="fadeIn">
              <div className="mt-12 text-center">
                <div className={`inline-flex items-center gap-4 ${isDark ? 'bg-green-900/30' : 'bg-green-100'} px-8 py-4 rounded-2xl`}>
                  <Trophy className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  <div className="text-left">
                    <p className={`font-bold ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                      {t('about.noOneEmpty')}
                    </p>
                    <p className={`${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      {t('about.everyoneWins')}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('about.ourValues')}
              </h2>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <AnimatedSection key={index} delay={index * 150} animation="fadeInUp">
                  <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white'} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full flex flex-col text-center ${isDark ? 'border border-gray-700/50' : 'border border-gray-200'}`}>
                    <div className={`w-16 h-16 ${isDark ? 'bg-orange-900/30 hover:bg-orange-800/40' : 'bg-orange-100 hover:bg-orange-200'} rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300`}>
                      <value.icon className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                    </div>
                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {value.title}
                    </h3>
                    <p className={`flex-1 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {value.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`py-20 ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('about.benefitsForAll')}
              </h2>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Merchants */}
              <AnimatedSection delay={200} animation="fadeInLeft">
                <div>
                  <h3 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('about.forMerchants')}
                  </h3>
                  <div className="space-y-6">
                    {merchantBenefits.map((benefit, index) => (
                      <AnimatedSection key={index} delay={300 + index * 150} animation="fadeInUp">
                        <div className={`flex items-start gap-4 ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300`}>
                          <div className={`w-12 h-12 ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <benefit.icon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {benefit.title}
                            </h4>
                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </AnimatedSection>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* Customers */}
              <AnimatedSection delay={400} animation="fadeInRight">
                <div>
                  <h3 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('about.forCustomers')}
                  </h3>
                  <div className="space-y-6">
                    {customerBenefits.map((benefit, index) => (
                      <AnimatedSection key={index} delay={500 + index * 150} animation="fadeInUp">
                        <div className={`flex items-start gap-4 ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300`}>
                          <div className={`w-12 h-12 ${isDark ? 'bg-green-900/30' : 'bg-green-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <benefit.icon className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                          </div>
                          <div>
                            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {benefit.title}
                            </h4>
                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </AnimatedSection>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* What We Don't Do */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('about.whatWeDontDo')}
              </h2>
            </AnimatedSection>
            
            <AnimatedSection delay={200} animation="fadeIn">
              <div className={`${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-2xl p-8`}>
                <p className={`text-lg mb-6 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('about.notLikeGambling')}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { key: 'noBetsWithLoss' },
                    { key: 'noAddiction' },
                    { key: 'noRevenueFromLoss' }
                  ].map((item, index) => (
                    <AnimatedSection key={index} delay={400 + index * 150} animation="fadeInUp">
                      <div className="text-center">
                        <div className={`w-12 h-12 ${isDark ? 'bg-red-900/30' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                          <span className={`font-bold text-xl ${isDark ? 'text-red-400' : 'text-red-600'}`}>❌</span>
                        </div>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t(`about.${item.key}`)}
                        </p>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>
                
                <AnimatedSection delay={800} animation="fadeIn">
                  <div className="mt-8 text-center">
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('about.everyTicketIsParticipation')}
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className={`py-20 ${isDark ? 'bg-gradient-to-r from-orange-600/30 to-red-500/30' : 'bg-gradient-to-r from-orange-100 to-red-100'}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('about.ourCommitment')}
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={200} animation="fadeInUp">
              <p className={`text-xl mb-8 leading-relaxed ${isDark ? 'text-orange-100' : 'text-orange-700'}`}>
                {t('about.commitmentDesc')}
              </p>
            </AnimatedSection>
            <AnimatedSection delay={400} animation="fadeInUp">
              <p className={`text-lg mb-8 ${isDark ? 'text-orange-100' : 'text-orange-700'}`}>
                {t('about.missionDesc')}
              </p>
            </AnimatedSection>
            
            <AnimatedSection delay={600} animation="fadeIn">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={handleStartShopping}
                  className={`font-semibold px-8 py-4 text-lg rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isDark 
                      ? 'bg-orange-500 text-white hover:bg-orange-600 border-orange-500' 
                      : 'bg-orange-500 text-white hover:bg-orange-600 border-orange-500'
                  }`}
                >
                  {t('about.startShopping')}
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={handleBecomePartner}
                  className={`font-semibold px-8 py-4 text-lg rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isDark 
                      ? 'border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-gray-900' 
                      : 'border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white'
                  }`}
                >
                  {t('about.becomePartner')}
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Campaign Text */}
      <section className={`py-16 ${isDark ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20' : 'bg-gradient-to-br from-yellow-50 to-orange-50'}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection animation="fadeIn">
              <div className={`${isDark ? 'bg-gray-800 border-orange-800' : 'bg-white border-orange-200'} rounded-2xl shadow-lg p-8 border-2`}>
                <AnimatedSection delay={200} animation="fadeInUp">
                  <h3 className={`text-2xl font-bold text-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('about.campaignExample')}
                  </h3>
                </AnimatedSection>
                
                <AnimatedSection delay={400} animation="fadeInUp">
                  <div className={`${isDark ? 'bg-gradient-to-r from-orange-900/30 to-yellow-900/30' : 'bg-gradient-to-r from-orange-100 to-yellow-100'} p-6 rounded-xl`}>
                    <div className="space-y-4">
                      {[
                        { emoji: '🎉', text: 'participateInCampaign' },
                        { emoji: null, text: 'campaignText1' },
                        { emoji: '⏳', text: 'campaignText2' },
                        { emoji: '🎁', text: 'campaignText3' },
                        { emoji: '📍', text: 'campaignText4' }
                      ].map((item, index) => (
                        <AnimatedSection key={index} delay={600 + index * 150} animation="fadeInLeft">
                          {item.emoji ? (
                            <p className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                              <span className="text-xl">{item.emoji}</span>
                              <span className="font-semibold">{t(`about.${item.text}`)}</span>
                            </p>
                          ) : (
                            <p className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{t(`about.${item.text}`)}</p>
                          )}
                        </AnimatedSection>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className='relative z-10'>
        <Footer isDark={isDark} />
      </div>
    </div>
  );
};

export default AboutPage;