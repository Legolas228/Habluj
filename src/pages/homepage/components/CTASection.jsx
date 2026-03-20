import React from 'react';
import Icon from '../../../components/AppIcon';
import LeadMagnetForm from '../../../components/LeadMagnetForm';
import { useTranslation } from '../../../hooks/useTranslation';
import { contactInfo, getContactLinks } from '../../../utils/contactInfo';

const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-xl mx-auto mb-12">
          <LeadMagnetForm source="homepage_cta" />
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            {t('cta.questionsText')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={getContactLinks.email()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border text-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Icon name="Mail" size={16} />
              <span className="font-medium">{contactInfo.email}</span>
            </a>
            <a
              href={getContactLinks.instagram()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border text-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Icon name="Instagram" size={16} />
              <span className="font-medium">@{contactInfo.instagram}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
