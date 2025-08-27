// StatsSection.jsx
import { useTranslation } from 'react-i18next';

// Mock data with product-focused stats
const mockStats = [
  { number: '25K+', labelKey: 'home.stats.productsWon' },
  { number: '$10M+', labelKey: 'home.stats.prizeValue' },
  { number: '99.8%', labelKey: 'home.stats.deliveryRate' },
];

export const StatsSection = ({ isDark }: { isDark: boolean }) => {
  const { t } = useTranslation();

  return (
    <section
      className={`py-16 ${
        isDark
          ? 'bg-gradient-to-r from-gray-900 to-black'
          : 'bg-gradient-to-r from-gray-100 to-gray-50'
      }`}
    >
      <div className='max-w-4xl mx-auto px-4 lg:px-8'>
        <div className='grid grid-cols-3 gap-8'>
          {mockStats.map((stat, index) => (
            <div key={index} className='text-center group'>
              <div
                className={`text-3xl sm:text-4xl font-bold mb-2 transition-all duration-300 group-hover:scale-110 ${
                  isDark
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'
                }`}
              >
                {stat.number}
              </div>
              <div
                className={`text-sm transition-colors duration-300 group-hover:text-orange-400 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {t(stat.labelKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
