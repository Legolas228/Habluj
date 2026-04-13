import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import Icon from '../AppIcon';
import { contactInfo, getContactLinks } from '../../utils/contactInfo';
import { SETMORE_BOOKING_URL } from '../../utils/setmore';
import { getLocalizedPath } from '../../utils/seo';

const SiteFooter = () => {
  const { t, language } = useTranslation();
  const legalTitle = language === 'es' ? 'Legal' : language === 'cz' ? 'Právní informace' : 'Právne informácie';

  return (
    <footer className="bg-foreground text-white py-12">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-cultural rounded-lg flex items-center justify-center">
                <span className="text-white font-headlines font-bold text-lg">H</span>
              </div>
              <div>
                <h2 className="font-headlines font-bold text-xl">
                  Habl<span className="text-primary">uj</span>
                </h2>
                <p className="text-xs text-gray-300 font-accent">{t('footer.tagline')}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{t('footer.description')}</p>
          </div>

          <div>
            <h3 className="font-headlines font-bold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to={getLocalizedPath('/', language)} className="text-gray-300 hover:text-white transition-colors">{t('header.home')}</Link></li>
              <li><Link to={getLocalizedPath('/about-the-teacher', language)} className="text-gray-300 hover:text-white transition-colors">{t('footer.aboutTeacher')}</Link></li>
              <li><Link to={getLocalizedPath('/tutoring-services', language)} className="text-gray-300 hover:text-white transition-colors">{t('footer.services')}</Link></li>
              <li><a href={SETMORE_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">{t('footer.booking')}</a></li>
              <li><Link to={getLocalizedPath('/contact', language)} className="text-gray-300 hover:text-white transition-colors">{t('header.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-headlines font-bold mb-4">{legalTitle}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to={getLocalizedPath('/privacy-policy', language)} className="text-gray-300 hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to={getLocalizedPath('/terms-and-conditions', language)} className="text-gray-300 hover:text-white transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to={getLocalizedPath('/cookies-policy', language)} className="text-gray-300 hover:text-white transition-colors">{t('footer.cookies')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-headlines font-bold mb-4">{t('footer.contactTitle')}</h3>
            <div className="flex flex-col items-start gap-3 text-sm">
              <a
                href={getContactLinks.instagram()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                aria-label={`Open Instagram profile @${contactInfo.instagram}`}
              >
                <Icon name="Instagram" size={16} />
                <span className="font-medium">@{contactInfo.instagram}</span>
              </a>
              <a
                href={getContactLinks.email()}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                aria-label={`Send email to ${contactInfo.email}`}
              >
                <Icon name="Mail" size={16} />
                <span className="font-medium">{contactInfo.email}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            {t('footer.copyright').replace('{year}', new Date().getFullYear().toString())}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
