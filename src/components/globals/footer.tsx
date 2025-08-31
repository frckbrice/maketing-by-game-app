import {
  Award,
  Clock,
  CreditCard,
  ExternalLink,
  Facebook,
  Gift,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Shield,
  Twitter,
  Youtube,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Footer = ({ isDark }: { isDark: boolean }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    categories: [
      { name: t('footer.techPhones'), href: '#tech' },
      { name: t('footer.fashionSneakers'), href: '#fashion' },
      { name: t('footer.homeAppliances'), href: '#home' },
      { name: t('footer.computers'), href: '#computers' },
      { name: t('footer.premiumBrands'), href: '#brands' },
    ],
    support: [
      { name: t('footer.helpCenter'), href: '#help' },
      { name: t('footer.howToPlay'), href: '#how-to-play' },
      { name: t('footer.contactUs'), href: '#contact' },
      { name: t('footer.faq'), href: '#faq' },
      { name: t('footer.liveChat'), href: '#chat' },
    ],
    company: [
      { name: t('footer.aboutUs'), href: '#about' },
      { name: t('footer.winnersGallery'), href: '#winners' },
      { name: t('footer.careers'), href: '#careers' },
      { name: t('footer.press'), href: '#press' },
      { name: t('footer.partnerships'), href: '#partnerships' },
    ],
    legal: [
      { name: t('footer.termsOfService'), href: '#terms' },
      { name: t('footer.privacyPolicy'), href: '#privacy' },
      { name: t('footer.contestRules'), href: '#rules' },
      { name: t('footer.security'), href: '#security' },
      { name: t('footer.licenses'), href: '#licenses' },
    ],
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: '#facebook',
      color: 'hover:text-blue-500',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: '#twitter',
      color: 'hover:text-blue-400',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      href: '#instagram',
      color: 'hover:text-pink-500',
    },
    {
      name: 'YouTube',
      icon: Youtube,
      href: '#youtube',
      color: 'hover:text-red-500',
    },
  ];

  const trustBadges = [
    { icon: Shield, text: t('footer.sslSecured'), description: t('footer.bankLevelEncryption') },
    { icon: Award, text: t('footer.licensed'), description: t('footer.fullyRegulatedPlatform') },
    {
      icon: Clock,
      text: t('footer.support24_7'),
      description: t('footer.roundTheClockAssistance'),
    },
    {
      icon: CreditCard,
      text: t('footer.securePayments'),
      description: t('footer.multiplePaymentOptions'),
    },
  ];

  return (
    <footer
      className={`${
        isDark
          ? 'bg-gradient-to-b from-gray-900 to-black border-t border-gray-800'
          : 'bg-gradient-to-b from-gray-50 to-white border-t border-gray-200'
      }`}
    >
      {/* Main Footer Content */}
      <div className='max-w-7xl mx-auto px-4 lg:px-8 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8'>
          {/* Company Info - Spans 2 columns on large screens */}
          <div className='lg:col-span-2'>
            <div className='flex items-center space-x-2 mb-6'>
              <div className='w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center'>
                <Gift className='w-6 h-6 text-white' />
              </div>
              <span
                className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {t('common.appName')}
              </span>
            </div>

            <p
              className={`text-sm mb-6 leading-relaxed ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
{t('footer.companyDescription')}
            </p>

            {/* Contact Info */}
            <div className='space-y-3 mb-6'>
              <div
                className={`flex items-center space-x-3 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Phone className='w-4 h-4' />
                <span>+1 (555) 123-LOTTO</span>
              </div>
              <div
                className={`flex items-center space-x-3 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Mail className='w-4 h-4' />
                <span>support@lotteryapp.com</span>
              </div>
              <div
                className={`flex items-center space-x-3 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <MapPin className='w-4 h-4' />
                <span>123 Lottery Street, Gaming City, GC 12345</span>
              </div>
            </div>

            {/* Social Links */}
            <div className='flex space-x-4'>
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isDark
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className='w-4 h-4' />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3
              className={`font-semibold text-sm uppercase tracking-wider mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Prize Categories
            </h3>
            <ul className='space-y-3'>
              {footerLinks.categories.map(link => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`text-sm transition-colors duration-200 ${
                      isDark
                        ? 'text-gray-400 hover:text-orange-400'
                        : 'text-gray-600 hover:text-orange-600'
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3
              className={`font-semibold text-sm uppercase tracking-wider mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Support
            </h3>
            <ul className='space-y-3'>
              {footerLinks.support.map(link => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`text-sm transition-colors duration-200 flex items-center gap-1 ${
                      isDark
                        ? 'text-gray-400 hover:text-orange-400'
                        : 'text-gray-600 hover:text-orange-600'
                    }`}
                  >
                    {link.name}
                    {link.name === 'Live Chat' && (
                      <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3
              className={`font-semibold text-sm uppercase tracking-wider mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Company
            </h3>
            <ul className='space-y-3'>
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`text-sm transition-colors duration-200 ${
                      isDark
                        ? 'text-gray-400 hover:text-orange-400'
                        : 'text-gray-600 hover:text-orange-600'
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3
              className={`font-semibold text-sm uppercase tracking-wider mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Legal
            </h3>
            <ul className='space-y-3'>
              {footerLinks.legal.map(link => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`text-sm transition-colors duration-200 flex items-center gap-1 ${
                      isDark
                        ? 'text-gray-400 hover:text-orange-400'
                        : 'text-gray-600 hover:text-orange-600'
                    }`}
                  >
                    {link.name}
                    {(link.name === 'Terms of Service' ||
                      link.name === 'Privacy Policy') && (
                      <ExternalLink className='w-3 h-3' />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div
          className={`mt-12 pt-8 border-t ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          }`}
        >
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            {trustBadges.map((badge, index) => (
              <div key={index} className='text-center group'>
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isDark
                      ? 'bg-gray-800 text-orange-400 group-hover:bg-gray-700'
                      : 'bg-gray-100 text-orange-600 group-hover:bg-gray-50'
                  }`}
                >
                  <badge.icon className='w-6 h-6' />
                </div>
                <h4
                  className={`font-semibold text-sm mb-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {badge.text}
                </h4>
                <p
                  className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div
          className={`mt-12 pt-8 border-t ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          }`}
        >
          <div className='max-w-md mx-auto text-center'>
            <h3
              className={`font-semibold text-lg mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('footer.stayUpdated')}
            </h3>
            <p
              className={`text-sm mb-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
{t('footer.newsletterDescription')}
            </p>
            <div className='flex gap-2'>
              <input
                type='email'
                placeholder={t('footer.enterEmail')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-orange-500'
                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              />
              <button className='px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105'>
{t('footer.subscribe')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className={`border-t px-4 lg:px-8 py-6 ${
          isDark
            ? 'border-gray-800 bg-black/50'
            : 'border-gray-200 bg-gray-50/50'
        }`}
      >
        <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
          <div
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            © {currentYear} {t('common.appName')}. {t('footer.allRightsReserved')} | {t('footer.licensedPlatform')}
          </div>

          <div className='flex items-center space-x-6'>
            <div
              className={`text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
{t('footer.playResponsibly')}
            </div>
            <div className='flex items-center space-x-4'>
              <img
                src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA2MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHJ4PSI0IiBmaWxsPSIjMTEyNTM3Ii8+CiAgPHRleHQgeD0iMzAiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiPkxJQ0VOU0VEPC90ZXh0Pgo8L3N2Zz4='
                alt={t('footer.gamingLicense')}
                className='h-6 opacity-60 hover:opacity-80 transition-opacity'
              />
              <img
                src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA2MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHJ4PSI0IiBmaWxsPSIjMTU5NzU3Ii8+CiAgPHRleHQgeD0iMzAiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiPlNTTDwvdGV4dD4KPC9zdmc+'
                alt={t('footer.sslCertificate')}
                className='h-6 opacity-60 hover:opacity-80 transition-opacity'
              />
              <img
                src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA2MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHJ4PSI0IiBmaWxsPSIjMjU2M0VCIi8+CiAgPHRleHQgeD0iMzAiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiPlBDSTwvdGV4dD4KPC9zdmc+'
                alt={t('footer.pciCompliance')}
                className='h-6 opacity-60 hover:opacity-80 transition-opacity'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Responsible Gaming Banner */}
      <div
        className={`text-center py-3 text-xs border-t ${
          isDark
            ? 'text-gray-500 bg-black/30 border-gray-900'
            : 'text-gray-500 bg-gray-100/50 border-gray-300'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2'>
          <span>{t('footer.gamblingWarning')}</span>
          <div className='flex items-center gap-4'>
            <a
              href='#responsible-gaming'
              className='underline hover:text-orange-500 transition-colors'
            >
{t('footer.getHelp')}
            </a>
            <span>|</span>
            <a
              href='#gamcare'
              className='hover:text-orange-500 transition-colors'
            >
              GamCare.org.uk
            </a>
            <span>|</span>
            <a
              href='#gamblers-anonymous'
              className='hover:text-orange-500 transition-colors'
            >
              Gamblers Anonymous
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
