import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Icon from '../../../components/AppIcon';

const PersonalStory = () => {
  const { t } = useTranslation();

  const storyMilestones = [
    {
      year: t('about.story.timeline.2016.year'),
      title: t('about.story.timeline.2016.title'),
      description: t('about.story.timeline.2016.desc'),
      icon: 'BookOpen'
    },
    {
      year: t('about.story.timeline.2018.year'),
      title: t('about.story.timeline.2018.title'),
      description: t('about.story.timeline.2018.desc'),
      icon: 'Globe'
    },
    {
      year: t('about.story.timeline.2020.year'),
      title: t('about.story.timeline.2020.title'),
      description: t('about.story.timeline.2020.desc'),
      icon: 'Award'
    },
    {
      year: t('about.story.timeline.2022.year'),
      title: t('about.story.timeline.2022.title'),
      description: t('about.story.timeline.2022.desc'),
      icon: 'Rocket'
    },
    {
      year: t('about.story.timeline.2024.year'),
      title: t('about.story.timeline.2024.title'),
      description: t('about.story.timeline.2024.desc'),
      icon: 'Plane'
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-background overflow-hidden" id="personal-story">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Story Content */}
          <div className="lg:w-1/2">
            <div className="inline-flex items-center space-x-2 bg-secondary/10 px-4 py-2 rounded-full mb-6">
              <Icon name="User" size={20} className="text-secondary" />
              <span className="text-sm font-medium text-foreground">{t('about.story.badge')}</span>
            </div>

            <h2 className="font-headlines text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {t('about.story.title').replace('{highlight}', '')} <span className="text-spanish">{t('about.story.titleHighlight')}</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {t('about.story.description')}
            </p>

            <div className="space-y-6 mb-12">
              <h3 className="font-headlines text-2xl font-bold text-foreground">
                {t('about.story.challengesTitle')}
              </h3>

              <div className="flex gap-4">
                <div className="mt-1 min-w-6">
                  <div className="w-6 h-6 rounded-full bg-spanish/10 flex items-center justify-center">
                    <Icon name="Check" size={14} className="text-spanish" />
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.story.challenges1')}
                </p>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 min-w-6">
                  <div className="w-6 h-6 rounded-full bg-spanish/10 flex items-center justify-center">
                    <Icon name="Check" size={14} className="text-spanish" />
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.story.challenges2')}
                </p>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 min-w-6">
                  <div className="w-6 h-6 rounded-full bg-spanish/10 flex items-center justify-center">
                    <Icon name="Check" size={14} className="text-spanish" />
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.story.challenges3')}
                </p>
              </div>
            </div>

            <blockquote className="border-l-4 border-primary pl-6 py-2 bg-primary/5 rounded-r-lg">
              <p className="font-accent text-xl italic text-foreground mb-2">
                {t('about.story.quote')}
              </p>
              <footer className="text-sm font-medium text-primary">
                {t('about.story.quoteAuthor')}
              </footer>
            </blockquote>
          </div>

          {/* Timeline */}
          <div className="lg:w-1/2 relative">
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

            <div className="space-y-12 relative">
              <h3 className="font-headlines text-2xl font-bold text-foreground mb-8 md:pl-20">
                {t('about.story.timelineTitle')}
              </h3>

              {storyMilestones.map((milestone, index) => (
                <div key={index} className="relative flex items-start group">
                  <div className="hidden md:block absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary z-10 group-hover:scale-125 transition-transform duration-300"></div>

                  <div className="w-full md:ml-20 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-base sm:text-lg text-foreground">{milestone.year}</div>
                      <Icon name={milestone.icon} size={20} className="text-primary/60" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">{milestone.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalStory;
