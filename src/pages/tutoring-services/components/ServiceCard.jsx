import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ServiceCard = ({ service, onBookTrial, onLearnMore }) => {
  const {
    id,
    title,
    subtitle,
    description,
    features,
    price,
    duration,
    sessions,
    level,
    icon,
    popular,
    trialAvailable,
    color
  } = service;

  return (
    <div className={`relative bg-white rounded-xl shadow-soft border transition-all duration-300 hover:shadow-cultural hover:-translate-y-1 ${popular ? 'ring-2 ring-primary shadow-warm' : ''
      }`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
            Najpopulárnejšie
          </div>
        </div>
      )}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon name={icon} size={24} className="text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{price}</div>
            <div className="text-sm text-muted-foreground">za {duration}</div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-headlines font-bold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-primary font-medium mb-3">{subtitle}</p>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {description}
          </p>

          {/* Service Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Icon name="Clock" size={16} />
              <span>{sessions} lekcií</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="BarChart3" size={16} />
              <span>{level}</span>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-2">
            {features?.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {trialAvailable && (
            <Button
              variant="outline"
              fullWidth
              iconName="Play"
              iconPosition="left"
              onClick={() => onBookTrial(id)}
              className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              Bezplatná skúšobná lekcia
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
