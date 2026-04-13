import React from 'react';
import { Link } from 'react-router-dom';

import Button from './ui/Button';
import Icon from './AppIcon';
import { useTranslation } from '../hooks/useTranslation';
import { getLocalizedPath } from '../utils/seo';

const LevelQuizTeaser = () => {
  const { t, language } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-border p-6">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon name="ListOrdered" size={20} />
        </div>
        <div>
          <h3 className="text-xl font-headlines font-bold text-foreground mb-1">
            {t('levelQuiz.teaser.title')}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {t('levelQuiz.teaser.subtitle')}
          </p>
          <Button asChild iconName="ArrowRight" iconPosition="right">
            <Link to={getLocalizedPath('/level-questionnaire', language)}>{t('levelQuiz.teaser.cta')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LevelQuizTeaser;
