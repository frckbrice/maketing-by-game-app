import { Button } from '@/components/globals/Button';
import { DollarSign, Target, Trophy, Zap } from 'lucide-react';

export const HowItWorksSection = ({ isDark }: { isDark: boolean }) => {
  const steps = [
    {
      icon: Target,
      title: isDark ? 'Pick & Play' : 'Choose Numbers',
      description: isDark
        ? 'Choose your favorite lottery game and select your lucky numbers'
        : 'Select your lucky numbers from our lottery games',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: Zap,
      title: isDark ? 'Spin to Win' : 'Buy Tickets',
      description: isDark
        ? 'Watch the draw live and see if fortune favors you today'
        : 'Purchase your lottery tickets securely online',
      color: 'from-orange-500 to-yellow-500',
    },
    {
      icon: DollarSign,
      title: isDark ? 'Enter, Wait, Win' : 'Wait for Results',
      description: isDark
        ? 'Enter the draw and wait for the results with anticipation'
        : 'Wait for the official draw results',
      color: 'from-green-500 to-blue-500',
    },
    {
      icon: Trophy,
      title: isDark ? 'Bills Delivered' : 'Claim Prizes',
      description: isDark
        ? 'Instant payouts directly to your account when you win'
        : 'Claim your winnings instantly and securely',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const prizes = [
    { name: 'Mega Jackpot', amount: '$50,000,000', emoji: '💎' },
    { name: 'Daily Bonus', amount: '$100,000', emoji: '💰' },
    { name: 'Weekly Prize', amount: '$1,000,000', emoji: '🏆' },
  ];

  return (
    <section
      id='how-it-works'
      className={`py-20 ${
        isDark
          ? 'bg-gradient-to-b from-black to-gray-900'
          : 'bg-gradient-to-b from-gray-100 via-white to-gray-50'
      }`}
    >
      <div className='max-w-7xl mx-auto px-4 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <div
            className={`inline-block px-4 py-2 rounded-full border text-sm font-semibold mb-4 ${
              isDark
                ? 'border-orange-500/30 text-orange-400 bg-orange-500/5'
                : 'border-orange-300/50 text-orange-600 bg-orange-100/30'
            }`}
          >
            {isDark ? 'WINNING PROCESS' : 'HOW IT WORKS'}
          </div>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {isDark ? (
              <>
                How <span className='text-orange-500'>BlackFriday Casino</span>{' '}
                Works
              </>
            ) : (
              'How It Works'
            )}
          </h2>
          <p
            className={`text-lg max-w-3xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {isDark
              ? 'Experience the thrill of winning with our simple 4-step process designed for maximum excitement and rewards.'
              : 'Follow these simple steps to start your journey towards winning life-changing prizes with our secure lottery platform.'}
          </p>
        </div>

        {/* Steps Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20'>
          {steps.map((step, index) => (
            <div key={index} className='text-center group relative'>
              {/* Step Number */}
              <div className='absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-10'>
                {index + 1}
              </div>

              {/* Icon Container */}
              <div
                className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 relative ${isDark ? `rounded-2xl bg-gradient-to-r ${step.color}` : `rounded-full bg-slate-700 group-hover:bg-orange-500`}`}
              >
                <step.icon
                  className={`w-10 h-10 ${isDark ? 'text-white' : 'text-orange-400 group-hover:text-white'} transition-colors duration-300`}
                />

                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 rounded-2xl ${isDark ? `bg-gradient-to-r ${step.color}` : 'bg-orange-500'} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
                ></div>
              </div>

              {/* Content */}
              <div className='space-y-3'>
                <h3
                  className={`text-xl font-bold ${isDark ? 'text-white group-hover:text-orange-300' : 'text-white group-hover:text-orange-300'} transition-colors duration-300`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed px-2 ${isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-slate-300 group-hover:text-slate-200'} transition-colors duration-300`}
                >
                  {step.description}
                </p>
              </div>

              {/* Connection Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className='hidden lg:block absolute top-10 -right-4 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-transparent'></div>
              )}
            </div>
          ))}
        </div>

        {/* Prize Showcase - Only for dark theme */}
        {isDark && (
          <>
            <div className='text-center mb-12'>
              <div className='inline-block px-4 py-2 rounded-full border border-orange-500/30 text-orange-400 text-sm font-semibold mb-4 bg-orange-500/5'>
                [ WIN MEGA BONUSES! ]
              </div>
              <h3 className='text-3xl lg:text-4xl font-bold text-white mb-4'>
                Win Your Dream <span className='text-orange-500'>Prizes</span>
              </h3>
              <p className='text-gray-400 text-lg max-w-2xl mx-auto'>
                Choose from our incredible prize pool and start your journey to
                financial freedom today.
              </p>
            </div>

            <div className='grid md:grid-cols-3 gap-8'>
              {prizes.map((prize, index) => (
                <div
                  key={index}
                  className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-orange-500/10 relative overflow-hidden'
                >
                  {/* Background Pattern */}
                  <div className='absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                  <div className='text-center relative z-10'>
                    {/* Prize Icon */}
                    <div className='text-6xl mb-6 group-hover:scale-110 transition-transform duration-300'>
                      {prize.emoji}
                    </div>

                    {/* Prize Details */}
                    <h4 className='text-xl font-bold text-white mb-3 group-hover:text-orange-300 transition-colors duration-300'>
                      {prize.name}
                    </h4>
                    <div className='text-4xl font-black text-orange-500 mb-6 group-hover:text-orange-400 transition-colors duration-300'>
                      {prize.amount}
                    </div>

                    {/* Features */}
                    <div className='space-y-2 mb-6 text-sm text-gray-400'>
                      <div className='flex items-center justify-center gap-1'>
                        <span className='w-1 h-1 bg-green-400 rounded-full'></span>
                        <span>Instant Payout</span>
                      </div>
                      <div className='flex items-center justify-center gap-1'>
                        <span className='w-1 h-1 bg-blue-400 rounded-full'></span>
                        <span>Tax Handled</span>
                      </div>
                      <div className='flex items-center justify-center gap-1'>
                        <span className='w-1 h-1 bg-purple-400 rounded-full'></span>
                        <span>Secure Transfer</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'>
                      Play Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className='text-center mt-12'>
              <p className='text-gray-400 mb-6 text-lg'>
                Ready to change your life? Join thousands of winners today!
              </p>
              <Button className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-4 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300'>
                Start Playing All Games
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
