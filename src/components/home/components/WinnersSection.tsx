// WinnersSection.jsx
import { Button } from '@/components/globals/Button';
import { Award, CheckCircle, Clock, Gift, Shield, Trophy } from 'lucide-react';

// Mock data
const mockWinners = [
  {
    name: 'Alex Anderson',
    country: 'INDONESIA',
    prize: 'POWERBALL',
    amount: '$50M',
    date: '2024',
    image: '👨‍💼',
  },
  {
    name: 'Taylor Madison',
    country: 'AUSTRALIA',
    prize: 'MEGA MILLIONS',
    amount: '$25M',
    date: '2024',
    image: '👩‍💼',
  },
  {
    name: 'Cinderella Joe',
    country: 'INDONESIA',
    prize: 'EUROJACKPOT',
    amount: '$15M',
    date: '2024',
    image: '👩‍🦰',
  },
  {
    name: 'James Peter',
    country: 'AUSTRALIA',
    prize: 'LOTTO MAX',
    amount: '$30M',
    date: '2024',
    image: '👨‍🚀',
  },
];

// Custom Button component
// const Button = ({ children, variant = 'default', className = '', ...props }) => {
//   const baseClasses = 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all duration-200 cursor-pointer';
//   const variants = {
//     default: 'bg-blue-600 text-white hover:bg-blue-700',
//     outline: 'border border-gray-300 bg-transparent hover:bg-gray-50'
//   };

//   return (
//     <button
//       className={`${baseClasses} ${variants[variant]} ${className}`}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// };

export const WinnersSection = ({ isDark }: { isDark: boolean }) => {
  const features = [
    {
      icon: Shield,
      title: 'Crown Plus License',
      description:
        'All lottery games are available to all countries, covering all locations across the world.',
    },
    {
      icon: CheckCircle,
      title: 'Transparent Draw Process',
      description:
        'Live streaming of all draws with verified random number generation for complete fairness.',
    },
    {
      icon: Clock,
      title: 'Secure Ticket Purchasing',
      description:
        'Bank-level security for all transactions with instant confirmation of your lottery tickets.',
    },
  ];

  return (
    <section className={`py-20 ${isDark ? 'bg-black' : 'bg-slate-900/50'}`}>
      <div className='max-w-7xl mx-auto px-4 lg:px-8'>
        {isDark ? (
          /* Dark theme - Side by side layout */
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
                          JACKPOT
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
                    TRUSTED BY PLAYERS
                  </div>
                  <div className='text-gray-500 text-xs'>Since 2020</div>
                </div>
              </div>

              {/* Features List */}
              <div className='space-y-8'>
                <div className='inline-block px-4 py-2 rounded-full border border-orange-500/30 text-orange-400 text-sm font-semibold mb-6 bg-orange-500/5'>
                  [ WHY CHOOSE US ]
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
                🏆 JACKPOT WINNERS
              </div>

              <h3 className='text-3xl lg:text-4xl font-bold text-white mb-8'>
                Latest <span className='text-orange-500'>Winners</span>
              </h3>

              <p className='text-gray-400 mb-12 text-lg'>
                Join our community of winners who have transformed their lives
                with life-changing jackpots.
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
                      <div className='text-5xl mb-4 group-hover:scale-110 transition-transform duration-300'>
                        {winner.image}
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
                          Won in {winner.date}
                        </div>
                      </div>

                      {/* Winner Badge */}
                      <div className='inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full'>
                        <div className='w-1 h-1 bg-yellow-400 rounded-full animate-pulse'></div>
                        <span className='text-yellow-400 text-xs font-medium'>
                          VERIFIED WINNER
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
                    View All Winners
                    <Trophy className='w-4 h-4' />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Light theme - Traditional layout */
          <div className='text-center'>
            <div className='mb-16'>
              <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white'>
                Recent Winners
              </h2>
              <p className='text-lg text-slate-300 max-w-3xl mx-auto'>
                Celebrate with our latest jackpot winners from around the world
                who have changed their lives forever.
              </p>
            </div>

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {mockWinners.slice(0, 3).map((winner, index) => (
                <div
                  key={index}
                  className='rounded-2xl p-6 bg-white/10 backdrop-blur-sm border border-slate-700/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group'
                >
                  <div className='flex items-center space-x-4 mb-4'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                      <Award className='w-6 h-6 text-white' />
                    </div>
                    <div className='text-left'>
                      <h3 className='font-semibold text-white group-hover:text-orange-300 transition-colors'>
                        {winner.name}
                      </h3>
                      <p className='text-sm text-slate-400'>{winner.date}</p>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <p className='text-sm text-slate-300'>
                      <span className='font-medium text-orange-400'>
                        Contest:
                      </span>{' '}
                      {winner.prize}
                    </p>
                    <p className='text-sm text-slate-300'>
                      <span className='font-medium text-green-400'>
                        Amount:
                      </span>
                      <span className='text-lg font-bold text-green-400 ml-2'>
                        {winner.amount}
                      </span>
                    </p>
                    <p className='text-sm text-slate-400'>
                      <span className='font-medium'>Country:</span>{' '}
                      {winner.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WinnersSection;
