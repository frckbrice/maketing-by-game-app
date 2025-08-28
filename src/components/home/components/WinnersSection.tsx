// WinnersSection.jsx
import { Button } from '@/components/ui/Button';
import { CheckCircle, Clock, Gift, Shield, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

// Mock data with AI-generated winner images and product wins
const mockWinners = [
  {
    name: 'NGUYEN SOPHIE',
    country: 'NGOA EKELE',
    prize: 'TECH BUNDLE',
    amount: 'iPhone 15 Pro Max + MacBook Pro',
    date: 'JUIN 2025',
    image: 'winner1.png',
  },
  {
    name: 'RIM A RIBAM JENER',
    country: 'NKOABANG',
    prize: 'FASHION PACK',
    amount: 'Nike Air Jordan + Designer Clothes',
    date: 'JULY 2025',
    image: 'winner2.png',
  },
  {
    name: 'BELLO',
    country: 'ETOUDI',
    prize: 'HOME BUNDLE',
    amount: 'Smart Appliances Package',
    date: 'AUGUST 2025',
    image: 'winner3.png',
  },
  {
    name: 'HENRIETTE NDOU',
    country: 'ESSOS',
    prize: 'SNEAKER COLLECTION',
    amount: 'Nike + Adidas Premium Pack',
    date: 'AUGUST 2025',
    image: 'winner4.png',
  },
];

export const WinnersSection = ({ isDark }: { isDark: boolean }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const features = [
    {
      icon: Shield,
      title: 'Authentic Products Only',
      description:
        'All products are brand new, authentic items from official retailers. We guarantee 100% genuine products from Apple, Nike, Samsung, and premium brands.',
    },
    {
      icon: CheckCircle,
      title: 'Transparent Contest Process',
      description:
        'Live streaming of all drawings with verified random selection process. Watch the contests unfold in real-time with complete fairness and transparency.',
    },
    {
      icon: Clock,
      title: 'Fast & Secure Delivery',
      description:
        'Winners receive their products within 5-10 business days with full tracking and insurance. All items ship directly from authorized retailers.',
    },
  ];

  return (
    <section
      className={`py-20 ${isDark ? 'bg-black' : 'bg-gradient-to-b from-white to-gray-50'}`}
    >
      <div className='max-w-7xl mx-auto px-4 lg:px-8'>
        {isDark ? (
          <div className='grid lg:grid-cols-2 gap-16 items-center'>
            {/* Left Side - Why Choose Us */}
            <div>
              <div className='relative mb-12'>
                <div className='w-full h-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden'>
                  <div className='relative'>
                    {/* Lottery Machine */}
                    <div className='w-48 h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl shadow-2xl relative'>
                      {/* Top Display */}
                      <div className='absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-inner'>
                        <Gift className='w-16 h-16 text-white' />
                      </div>

                      {/* Bottom Label */}
                      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg'>
                        <span className='text-white font-bold text-sm tracking-wide'>
                          {t('home.winners.jackpotLabel')}
                        </span>
                      </div>

                      {/* Machine Details */}
                      <div className='absolute top-1/2 left-4 w-2 h-8 bg-gray-600 rounded'></div>
                      <div className='absolute top-1/2 right-4 w-2 h-8 bg-gray-600 rounded'></div>
                    </div>

                    {/* Floating Lottery Numbers */}
                    <div className='absolute -top-4 -left-8 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-bounce'>
                      7
                    </div>
                    <div className='absolute -top-2 -right-6 w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-pulse'>
                      21
                    </div>
                    <div className='absolute bottom-4 -left-6 w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg animate-bounce'>
                      13
                    </div>
                    <div className='absolute bottom-2 -right-8 w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-pulse'>
                      42
                    </div>
                  </div>

                  {/* Ambient Glow Effect */}
                  <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-transparent rounded-full blur-3xl animate-pulse'></div>

                  {/* Additional Decorative Elements */}
                  <div className='absolute top-4 right-8 w-3 h-3 bg-yellow-400 rounded-full animate-ping'></div>
                  <div className='absolute bottom-8 left-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>
                </div>

                {/* Trust Badge */}
                <div className='absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/50 shadow-lg'>
                  <div className='text-orange-400 font-bold text-sm'>
                    {t('home.winners.trustedByPlayers')}
                  </div>
                  <div className='text-gray-500 text-xs'>Since 2020</div>
                </div>
              </div>

              {/* Features List */}
              <div className='space-y-8'>
                <div className='inline-block px-4 py-2 rounded-full border border-orange-500/30 text-orange-400 text-sm font-semibold mb-6 bg-orange-500/5'>
                  {t('home.winners.whyChooseUs')}
                </div>

                <h3 className='text-3xl lg:text-4xl font-bold text-white mb-8'>
                  Why Choose <span className='text-orange-500'>Us?</span>
                </h3>

                <div className='space-y-6'>
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-4 group hover:bg-gray-800/30 p-4 rounded-xl transition-all duration-300'
                    >
                      <div className='w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                        <feature.icon className='w-6 h-6 text-white' />
                      </div>
                      <div className='flex-1'>
                        <h4 className='text-white font-bold text-lg mb-2 group-hover:text-orange-300 transition-colors'>
                          {feature.title}
                        </h4>
                        <p className='text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors'>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Latest Winners */}
            <div>
              <div className='inline-block px-4 py-2 rounded-full border border-orange-500/30 text-orange-400 text-sm font-semibold mb-6 bg-orange-500/5'>
                {t('home.winners.jackpotTitle')}
              </div>

              <h3 className='text-3xl lg:text-4xl font-bold text-white mb-8'>
                {t('home.winners.latestWinners')}{' '}
                <span className='text-orange-500'>{t('common.winners')}</span>
              </h3>

              <p className='text-gray-400 mb-12 text-lg'>
                {t('home.winners.description')}
              </p>

              {/* Winners Grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8'>
                {mockWinners.map((winner, index) => (
                  <div
                    key={index}
                    className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-orange-500/10'
                  >
                    <div className='text-center'>
                      {/* Winner Avatar */}
                      <div className='w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300 border-2 border-orange-500/30'>
                        <Image
                          width={64}
                          height={64}
                          src={`/${locale}/images/${winner.image}`}
                          alt={winner.name}
                          className='w-full h-full object-cover'
                        />
                      </div>

                      {/* Winner Info */}
                      <h4 className='text-white font-bold text-lg mb-1 group-hover:text-orange-300 transition-colors'>
                        {winner.name}
                      </h4>

                      <p className='text-gray-400 text-sm mb-3 flex items-center justify-center gap-1'>
                        <span className='w-2 h-2 bg-green-400 rounded-full'></span>
                        {winner.country}
                      </p>

                      {/* Prize Details */}
                      <div className='space-y-2 mb-4'>
                        <div className='text-orange-500 font-bold text-sm px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20'>
                          {winner.prize}
                        </div>
                        <div className='text-2xl font-black text-green-400 mb-2 group-hover:text-green-300 transition-colors'>
                          {winner.amount}
                        </div>
                        <div className='text-gray-500 text-xs'>
                          {t('home.winners.wonIn')} {winner.date}
                        </div>
                      </div>

                      {/* Winner Badge */}
                      <div className='inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full'>
                        <div className='w-1 h-1 bg-yellow-400 rounded-full animate-pulse'></div>
                        <span className='text-yellow-400 text-xs font-medium'>
                          {t('home.winners.verifiedWinner')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Winners Button */}
              <div className='text-center'>
                <Button className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'>
                  <span className='flex items-center gap-2'>
                    {t('home.winners.viewAllWinners')}
                    <Trophy className='w-4 h-4' />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Light theme - Comprehensive layout matching dark mode */
          <div className='grid lg:grid-cols-2 gap-16 items-center'>
            {/* Left Side - Why Choose Us */}
            <div>
              <div className='relative mb-12'>
                <div className='w-full h-80 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl flex items-center justify-center relative overflow-hidden border border-orange-200/50'>
                  <div className='relative'>
                    {/* Lottery Machine */}
                    <div className='w-48 h-64 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl shadow-2xl relative border border-orange-200'>
                      {/* Top Display */}
                      <div className='absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-inner'>
                        <Gift className='w-16 h-16 text-white' />
                      </div>

                      {/* Bottom Label */}
                      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg'>
                        <span className='text-white font-bold text-sm tracking-wide'>
                          {t('home.winners.jackpotLabel')}
                        </span>
                      </div>

                      {/* Machine Details */}
                      <div className='absolute top-1/2 left-4 w-2 h-8 bg-orange-300 rounded'></div>
                      <div className='absolute top-1/2 right-4 w-2 h-8 bg-orange-300 rounded'></div>
                    </div>

                    {/* Floating Lottery Numbers */}
                    <div className='absolute -top-4 -left-8 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-bounce'>
                      7
                    </div>
                    <div className='absolute -top-2 -right-6 w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-pulse'>
                      21
                    </div>
                    <div className='absolute bottom-4 -left-6 w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg animate-bounce'>
                      13
                    </div>
                    <div className='absolute bottom-2 -right-8 w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-pulse'>
                      42
                    </div>
                  </div>

                  {/* Ambient Glow Effect */}
                  <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse'></div>

                  {/* Additional Decorative Elements */}
                  <div className='absolute top-4 right-8 w-3 h-3 bg-yellow-400 rounded-full animate-ping'></div>
                  <div className='absolute bottom-8 left-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>
                </div>

                {/* Trust Badge */}
                <div className='absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-200/50 shadow-lg'>
                  <div className='text-orange-600 font-bold text-sm'>
                    {t('home.winners.trustedByPlayers')}
                  </div>
                  <div className='text-gray-600 text-xs'>Since 2020</div>
                </div>
              </div>

              {/* Features List */}
              <div className='space-y-8'>
                <div className='inline-block px-4 py-2 rounded-full border border-orange-300/50 text-orange-600 text-sm font-semibold mb-6 bg-orange-100/30'>
                  {t('home.winners.whyChooseUs')}
                </div>

                <h3 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-8'>
                  Why Choose <span className='text-orange-500'>Us?</span>
                </h3>

                <div className='space-y-6'>
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-4 group hover:bg-orange-50/50 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-orange-200/50'
                    >
                      <div className='w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                        <feature.icon className='w-6 h-6 text-white' />
                      </div>
                      <div className='flex-1'>
                        <h4 className='text-gray-900 font-bold text-lg mb-2 group-hover:text-orange-600 transition-colors'>
                          {feature.title}
                        </h4>
                        <p className='text-gray-700 text-sm leading-relaxed group-hover:text-gray-800 transition-colors'>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Latest Winners */}
            <div>
              <div className='inline-block px-4 py-2 rounded-full border border-orange-300/50 text-orange-600 text-sm font-semibold mb-6 bg-orange-100/30'>
                🏆 {t('home.winners.jackpotTitle')}
              </div>

              <h3 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-8'>
                {t('home.winners.latestWinners')}{' '}
                <span className='text-orange-500'>{t('common.winners')}</span>
              </h3>

              <p className='text-gray-700 mb-12 text-lg'>
                {t('home.winners.description')}
              </p>

              {/* Winners Grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8'>
                {mockWinners.map((winner, index) => (
                  <div
                    key={index}
                    className='bg-white rounded-2xl p-6 border border-gray-200 hover:border-orange-300/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-orange-500/10'
                  >
                    <div className='text-center'>
                      {/* Winner Avatar */}
                      <div className='w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300 border-2 border-orange-500/30'>
                        <img
                          src={`/en/images/${winner.image}`}
                          alt={winner.name}
                          className='w-full h-full object-cover'
                        />
                      </div>

                      {/* Winner Info */}
                      <h4 className='text-gray-900 font-bold text-lg mb-1 group-hover:text-orange-600 transition-colors'>
                        {winner.name}
                      </h4>

                      <p className='text-gray-600 text-sm mb-3 flex items-center justify-center gap-1'>
                        <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                        {winner.country}
                      </p>

                      {/* Prize Details */}
                      <div className='space-y-2 mb-4'>
                        <div className='text-orange-600 font-bold text-sm px-3 py-1 bg-orange-100/50 rounded-full border border-orange-300/30'>
                          {winner.prize}
                        </div>
                        <div className='text-2xl font-black text-green-600 mb-2 group-hover:text-green-700 transition-colors'>
                          {winner.amount}
                        </div>
                        <div className='text-gray-500 text-xs'>
                          {t('home.winners.wonIn')} {winner.date}
                        </div>
                      </div>

                      {/* Winner Badge */}
                      <div className='inline-flex items-center gap-1 px-2 py-1 bg-yellow-100/50 border border-yellow-300/30 rounded-full'>
                        <div className='w-1 h-1 bg-yellow-500 rounded-full animate-pulse'></div>
                        <span className='text-yellow-700 text-xs font-medium'>
                          {t('home.winners.verifiedWinner')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Winners Button */}
              <div className='text-center'>
                <Button className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'>
                  <span className='flex items-center gap-2'>
                    {t('home.winners.viewAllWinners')}
                    <Trophy className='w-4 h-4' />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
