import React, { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const VideoIntroduction = () => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <section className="py-20 lg:py-32 bg-background overflow-hidden" id="video-introduction">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Icon name="Video" size={20} className="text-primary" />
              <span className="text-sm font-medium text-foreground">{t('about.video.badge')}</span>
            </div>

            <h2 className="font-headlines text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {t('about.video.title').replace('{highlight}', '')} <span className="text-spanish">{t('about.video.titleHighlight')}</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t('about.video.description')}
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-black group">
            {!isPlaying ? (
              <>
                <div className="absolute inset-0">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop"
                    alt="Video predstavenie"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-70 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={handlePlay}
                    className="w-20 h-20 lg:w-24 lg:h-24 bg-spanish text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300 hover:bg-spanish/90"
                  >
                    <Icon name="Play" size={32} className="ml-2" />
                  </button>
                </div>

                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                      2:30
                    </div>
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                      Slovensky / Español
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Prečo učiť so mnou?</h3>
                  <p className="text-white/80 max-w-xl">
                    Krátka ukážka mojej výučby a prístupu k študentom.
                  </p>
                </div>
              </>
            ) : (
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Video predstavenie"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0 text-secondary">
                <Icon name="MessageCircle" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('about.video.features.1')}</h4>
                <p className="text-sm text-muted-foreground">Autentická výslovnosť a prirodzená komunikácia</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 text-primary">
                <Icon name="Smile" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('about.video.features.2')}</h4>
                <p className="text-sm text-muted-foreground">Uvoľnená atmosféra bez stresu z chýb</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-spanish/10 rounded-xl flex items-center justify-center flex-shrink-0 text-spanish">
                <Icon name="Zap" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('about.video.features.3')}</h4>
                <p className="text-sm text-muted-foreground">Okamžitá spätná väzba a motivácia</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6">
              {t('about.video.cta')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoIntroduction;
