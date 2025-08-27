// import {
//   Award,
//   Clock,
//   CreditCard,
//   ExternalLink,
//   Facebook,
//   Gift,
//   Instagram,
//   Mail,
//   MapPin,
//   Phone,
//   Shield,
//   Twitter,
//   Youtube,
// } from 'lucide-react';
// import { useTranslation } from 'react-i18next';

// export const Footer = ({ isDark }: { isDark: boolean }) => {
//   const { t } = useTranslation();
//   const currentYear = new Date().getFullYear();

//   const footerLinks = {
//     games: [
//       { name: t('home.footer.links.powerball'), href: '#powerball' },
//       { name: t('home.footer.links.megaMillions'), href: '#mega-millions' },
//       { name: t('home.footer.links.euroJackpot'), href: '#eurojackpot' },
//       { name: t('home.footer.links.lottoMax'), href: '#lotto-max' },
//       { name: t('home.footer.links.superEnalotto'), href: '#superenalotto' },
//     ],
//     support: [
//       { name: t('home.footer.links.helpCenter'), href: '#help' },
//       { name: t('home.footer.links.howToPlay'), href: '#how-to-play' },
//       { name: t('home.footer.links.contactUs'), href: '#contact' },
//       { name: t('home.footer.links.faq'), href: '#faq' },
//       { name: t('home.footer.links.liveChat'), href: '#chat' },
//     ],
//     company: [
//       { name: t('home.footer.links.aboutUs'), href: '#about' },
//       {
//         name: t('home.footer.links.responsibleGaming'),
//         href: '#responsible-gaming',
//       },
//       { name: t('home.footer.links.careers'), href: '#careers' },
//       { name: t('home.footer.links.press'), href: '#press' },
//       { name: t('home.footer.links.partnerships'), href: '#partnerships' },
//     ],
//     legal: [
//       { name: t('home.footer.links.termsOfService'), href: '#terms' },
//       { name: t('home.footer.links.privacyPolicy'), href: '#privacy' },
//       { name: t('home.footer.links.cookiePolicy'), href: '#cookies' },
//       { name: t('home.footer.links.security'), href: '#security' },
//       { name: t('home.footer.links.licenses'), href: '#licenses' },
//     ],
//   };

//   const socialLinks = [
//     {
//       name: 'Facebook',
//       icon: Facebook,
//       href: '#facebook',
//       color: 'hover:text-blue-500',
//     },
//     {
//       name: 'Twitter',
//       icon: Twitter,
//       href: '#twitter',
//       color: 'hover:text-blue-400',
//     },
//     {
//       name: 'Instagram',
//       icon: Instagram,
//       href: '#instagram',
//       color: 'hover:text-pink-500',
//     },
//     {
//       name: 'YouTube',
//       icon: Youtube,
//       href: '#youtube',
//       color: 'hover:text-red-500',
//     },
//   ];

//   const trustBadges = [
//     {
//       icon: Shield,
//       text: t('home.footer.trustBadges.sslSecured'),
//       description: t('home.footer.trustBadges.sslDescription'),
//     },
//     {
//       icon: Award,
//       text: t('home.footer.trustBadges.licensed'),
//       description: t('home.footer.trustBadges.licensedDescription'),
//     },
//     {
//       icon: Clock,
//       text: t('home.footer.trustBadges.support24_7'),
//       description: t('home.footer.trustBadges.supportDescription'),
//     },
//     {
//       icon: CreditCard,
//       text: t('home.footer.trustBadges.securePayments'),
//       description: t('home.footer.trustBadges.paymentsDescription'),
//     },
//   ];

//   return (
//     <footer
//       className={`${
//         isDark
//           ? 'bg-gradient-to-b from-gray-900 to-black border-t border-gray-800'
//           : 'bg-gradient-to-b from-gray-50 to-white border-t border-gray-200'
//       } relative z-20`}
//     >
//       {/* Debug: Add a visible border to see the footer */}
//       <div className='absolute inset-0 border-4 border-red-500 pointer-events-none'></div>

//       {/* Main Footer Content */}
//       <div className='max-w-7xl mx-auto px-4 lg:px-8 py-16'>
//         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8'>
//           {/* Company Info - Spans 2 columns on large screens */}
//           <div className='lg:col-span-2'>
//             <div className='flex items-center space-x-2 mb-6'>
//               <div className='w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center'>
//                 <Gift className='w-6 h-6 text-white' />
//               </div>
//               <span
//                 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}
//               >
//                 {t('home.footer.appName')}
//               </span>
//             </div>

//             <p
//               className={`text-sm mb-6 leading-relaxed ${
//                 isDark ? 'text-gray-400' : 'text-gray-600'
//               }`}
//             >
//               {t('home.footer.description')}
//             </p>

//             {/* Contact Info */}
//             <div className='space-y-3 mb-6'>
//               <div
//                 className={`flex items-center space-x-3 text-sm ${
//                   isDark ? 'text-gray-400' : 'text-gray-600'
//                 }`}
//               >
//                 <Phone className='w-4 h-4' />
//                 <span>{t('home.footer.contact.phone')}</span>
//               </div>
//               <div
//                 className={`flex items-center space-x-3 text-sm ${
//                   isDark ? 'text-gray-400' : 'text-gray-600'
//                 }`}
//               >
//                 <Mail className='w-4 h-4' />
//                 <span>{t('home.footer.contact.email')}</span>
//               </div>
//               <div
//                 className={`flex items-center space-x-3 text-sm ${
//                   isDark ? 'text-gray-400' : 'text-gray-600'
//                 }`}
//               >
//                 <MapPin className='w-4 h-4' />
//                 <span>{t('home.footer.contact.address')}</span>
//               </div>
//             </div>

//             {/* Social Links */}
//             <div className='flex space-x-4'>
//               {socialLinks.map(social => (
//                 <a
//                   key={social.name}
//                   href={social.href}
//                   className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
//                     isDark
//                       ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
//                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                   } ${social.color}`}
//                   aria-label={social.name}
//                 >
//                   <social.icon className='w-4 h-4' />
//                 </a>
//               ))}
//             </div>
//           </div>

//           {/* Games */}
//           <div>
//             <h3
//               className={`font-semibold text-sm uppercase tracking-wider mb-4 ${
//                 isDark ? 'text-white' : 'text-gray-900'
//               }`}
//             >
//               {t('home.footer.sections.popularGames')}
//             </h3>
//             <ul className='space-y-3'>
//               {footerLinks.games.map(link => (
//                 <li key={link.name}>
//                   <a
//                     href={link.href}
//                     className={`text-sm transition-colors duration-200 ${
//                       isDark
//                         ? 'text-gray-400 hover:text-orange-400'
//                         : 'text-gray-600 hover:text-orange-600'
//                     }`}
//                   >
//                     {link.name}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Support */}
//           <div>
//             <h3
//               className={`font-semibold text-sm uppercase tracking-wider mb-4 ${
//                 isDark ? 'text-white' : 'text-gray-900'
//               }`}
//             >
//               {t('home.footer.sections.support')}
//             </h3>
//             <ul className='space-y-3'>
//               {footerLinks.support.map(link => (
//                 <li key={link.name}>
//                   <a
//                     href={link.href}
//                     className={`text-sm transition-colors duration-200 flex items-center gap-1 ${
//                       isDark
//                         ? 'text-gray-400 hover:text-orange-400'
//                         : 'text-gray-600 hover:text-orange-600'
//                     }`}
//                   >
//                     {link.name}
//                     {link.name === t('home.footer.links.liveChat') && (
//                       <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
//                     )}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Company */}
//           <div>
//             <h3
//               className={`font-semibold text-sm uppercase tracking-wider mb-4 ${
//                 isDark ? 'text-white' : 'text-gray-900'
//               }`}
//             >
//               {t('home.footer.sections.company')}
//             </h3>
//             <ul className='space-y-3'>
//               {footerLinks.company.map(link => (
//                 <li key={link.name}>
//                   <a
//                     href={link.href}
//                     className={`text-sm transition-colors duration-200 ${
//                       isDark
//                         ? 'text-gray-400 hover:text-orange-400'
//                         : 'text-gray-600 hover:text-orange-600'
//                     }`}
//                   >
//                     {link.name}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Legal */}
//           <div>
//             <h3
//               className={`font-semibold text-sm uppercase tracking-wider mb-4 ${
//                 isDark ? 'text-white' : 'text-gray-900'
//               }`}
//             >
//               {t('home.footer.sections.legal')}
//             </h3>
//             <ul className='space-y-3'>
//               {footerLinks.legal.map(link => (
//                 <li key={link.name}>
//                   <a
//                     href={link.href}
//                     className={`text-sm transition-colors duration-200 flex items-center gap-1 ${
//                       isDark
//                         ? 'text-gray-400 hover:text-orange-400'
//                         : 'text-gray-600 hover:text-orange-600'
//                     }`}
//                   >
//                     {link.name}
//                     {(link.name === t('home.footer.links.termsOfService') ||
//                       link.name === t('home.footer.links.privacyPolicy')) && (
//                       <ExternalLink className='w-3 h-3' />
//                     )}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         {/* Trust Badges */}
//         <div
//           className={`mt-12 pt-8 border-t ${
//             isDark ? 'border-gray-800' : 'border-gray-200'
//           }`}
//         >
//           <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
//             {trustBadges.map((badge, index) => (
//               <div key={index} className='text-center group'>
//                 <div
//                   className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-200 ${
//                     isDark
//                       ? 'bg-gray-800 text-orange-400 group-hover:bg-gray-700'
//                       : 'bg-gray-100 text-orange-600 group-hover:bg-gray-50'
//                   }`}
//                 >
//                   <badge.icon className='w-6 h-6' />
//                 </div>
//                 <h4
//                   className={`font-semibold text-sm mb-1 ${
//                     isDark ? 'text-white' : 'text-gray-900'
//                   }`}
//                 >
//                   {badge.text}
//                 </h4>
//                 <p
//                   className={`text-xs ${
//                     isDark ? 'text-gray-400' : 'text-gray-600'
//                   }`}
//                 >
//                   {badge.description}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Newsletter Signup */}
//         <div
//           className={`mt-12 pt-8 border-t ${
//             isDark ? 'border-gray-800' : 'border-gray-200'
//           }`}
//         >
//           <div className='max-w-md mx-auto text-center'>
//             <h3
//               className={`font-semibold text-lg mb-2 ${
//                 isDark ? 'text-white' : 'text-gray-900'
//               }`}
//             >
//               {t('home.footer.newsletter.title')}
//             </h3>
//             <p
//               className={`text-sm mb-4 ${
//                 isDark ? 'text-gray-400' : 'text-gray-600'
//               }`}
//             >
//               {t('home.footer.newsletter.description')}
//             </p>
//             <div className='flex gap-2'>
//               <input
//                 type='email'
//                 placeholder={t('home.footer.newsletter.placeholder')}
//                 className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
//                   isDark
//                     ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-orange-500'
//                     : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500'
//                 } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
//               />
//               <button className='px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105'>
//                 {t('home.footer.newsletter.subscribe')}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Bar */}
//       <div
//         className={`border-t px-4 lg:px-8 py-6 ${
//           isDark
//             ? 'border-gray-800 bg-black/50'
//             : 'border-gray-200 bg-gray-50/50'
//         }`}
//       >
//         <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
//           <div
//             className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
//           >
//             © {currentYear} {t('home.footer.appName')}.{' '}
//             {t('home.footer.bottomBar.copyright')}
//           </div>

//           <div className='flex items-center space-x-6'>
//             <div
//               className={`text-xs ${
//                 isDark ? 'text-gray-500' : 'text-gray-500'
//               }`}
//             >
//               {t('home.footer.bottomBar.ageRestriction')}
//             </div>
//             <div className='flex items-center space-x-4'>
//               <img
//                 src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA2MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHJ4PSI0IiBmaWxsPSIjMTEyNTM3Ii8+CiAgPHRleHQgeD0iMzAiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiPkxJQ0VOU0VEPC90ZXh0Pgo8L3N2Zz4='
//                 alt='Gaming License'
//                 className='h-6 opacity-60 hover:opacity-80 transition-opacity'
//               />
//               <img
//                 src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA2MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHJ4PSI0IiBmaWxsPSIjMTU5NzU3Ii8+CiAgPHRleHQgeD0iMzAiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiPlNTTDwvdGV4dD4KPC9zdmc+'
//                 alt='SSL Certificate'
//                 className='h-6 opacity-60 hover:opacity-80 transition-opacity'
//               />
//               <img
//                 src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA2MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHJ4PSI0IiBmaWxsPSIjMjU2M0VCIi8+CiAgPHRleHQgeD0iMzAiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiPlBDSTwvdGV4dD4KPC9zdmc+'
//                 alt='PCI Compliance'
//                 className='h-6 opacity-60 hover:opacity-80 transition-opacity'
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Responsible Gaming Banner */}
//       <div
//         className={`text-center py-3 text-xs border-t ${
//           isDark
//             ? 'text-gray-500 bg-black/30 border-gray-900'
//             : 'text-gray-500 bg-gray-100/50 border-gray-300'
//         }`}
//       >
//         <div className='max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2'>
//           <span>Must be 18+ to participate. Gambling can be addictive.</span>
//           <div className='flex items-center gap-4'>
//             <a
//               href='#responsible-gaming'
//               className='underline hover:text-orange-500 transition-colors'
//             >
//               {t('home.footer.bottomBar.responsibleGaming')}
//             </a>
//             <span>|</span>
//             <a
//               href='#gamcare'
//               className='hover:text-orange-500 transition-colors'
//             >
//               {t('home.footer.bottomBar.gamcare')}
//             </a>
//             <span>|</span>
//             <a
//               href='#gamblers-anonymous'
//               className='hover:text-orange-500 transition-colors'
//             >
//               {t('home.footer.bottomBar.gamblersAnonymous')}
//             </a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// Footer.jsx
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

export const Footer = ({ isDark }: { isDark: boolean }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    categories: [
      { name: 'Tech & Phones', href: '#tech' },
      { name: 'Fashion & Sneakers', href: '#fashion' },
      { name: 'Home Appliances', href: '#home' },
      { name: 'Computers', href: '#computers' },
      { name: 'Premium Brands', href: '#brands' },
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'How to Play', href: '#how-to-play' },
      { name: 'Contact Us', href: '#contact' },
      { name: 'FAQ', href: '#faq' },
      { name: 'Live Chat', href: '#chat' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Winners Gallery', href: '#winners' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' },
      { name: 'Partnerships', href: '#partnerships' },
    ],
    legal: [
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Contest Rules', href: '#rules' },
      { name: 'Security', href: '#security' },
      { name: 'Licenses', href: '#licenses' },
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
    { icon: Shield, text: 'SSL Secured', description: 'Bank-level encryption' },
    { icon: Award, text: 'Licensed', description: 'Fully regulated platform' },
    {
      icon: Clock,
      text: '24/7 Support',
      description: 'Round-the-clock assistance',
    },
    {
      icon: CreditCard,
      text: 'Secure Payments',
      description: 'Multiple payment options',
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
                LotteryApp
              </span>
            </div>

            <p
              className={`text-sm mb-6 leading-relaxed ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Your trusted platform for international lottery games. Experience
              the thrill of winning life-changing jackpots with complete
              security and transparency.
            </p>

            {/* Contact Info */}
            <div className='space-y-3 mb-6'>
              <div
                className={`flex items-center space-x-3 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Phone className='w-4 h-4' />
                <span>+(+237 670 000 000)</span>
              </div>
              <div
                className={`flex items-center space-x-3 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Mail className='w-4 h-4' />
                <span>support@blackfriday-app.com</span>
              </div>
              <div
                className={`flex items-center space-x-3 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <MapPin className='w-4 h-4' />
                <span>Rue belle mere, Yaounde, Cameroon</span>
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
              Stay Updated
            </h3>
            <p
              className={`text-sm mb-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Get the latest jackpot updates and exclusive offers
            </p>
            <div className='flex gap-2'>
              <input
                type='email'
                placeholder='Enter your email'
                className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-orange-500'
                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              />
              <button className='px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105'>
                Subscribe
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
            © {currentYear} LotteryApp. All rights reserved. | Licensed and
            regulated platform.
          </div>

          <div className='flex items-center space-x-6'>
            <div
              className={`text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              18+ Only. Play Responsibly.
            </div>
            <div className='flex items-center space-x-4'>
              <img
                src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA2MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHJ4PSI0IiBmaWxsPSIjMTEyNTM3Ii8+CiAgPHRleHQgeD0iMzAiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiPkxJQ0VOU0VEPC90ZXh0Pgo8L3N2Zz4='
                alt='Gaming License'
                className='h-6 opacity-60 hover:opacity-80 transition-opacity'
              />
              <img
                src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA2MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHJ4PSI0IiBmaWxsPSIjMTU5NzU3Ii8+CiAgPHRleHQgeD0iMzAiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiPlNTTDwvdGV4dD4KPC9zdmc+'
                alt='SSL Certificate'
                className='h-6 opacity-60 hover:opacity-80 transition-opacity'
              />
              <img
                src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA2MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iMzAiIHJ4PSI0IiBmaWxsPSIjMjU2M0VCIi8+CiAgPHRleHQgeD0iMzAiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiPlBDSTwvdGV4dD4KPC9zdmc+'
                alt='PCI Compliance'
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
          <span>Must be 18+ to participate. Gambling can be addictive.</span>
          <div className='flex items-center gap-4'>
            <a
              href='#responsible-gaming'
              className='underline hover:text-orange-500 transition-colors'
            >
              Get help if needed
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

export default Footer;
