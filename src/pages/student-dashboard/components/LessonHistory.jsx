import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LessonHistory = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingLessons = [
    {
      id: 1,
      date: "2025-01-03",
      time: "14:00",
      duration: 60,
      type: "Konverzácia",
      teacher: "Ester Mesároš",
      status: "confirmed",
      topic: "Cestovanie a kultúra",
      meetingLink: "https://meet.google.com/abc-defg-hij"
    },
    {
      id: 2,
      date: "2025-01-05",
      time: "16:30",
      duration: 90,
      type: "Gramatika",
      teacher: "Ester Mesároš",
      status: "confirmed",
      topic: "Subjuntivo - pokročilé použitie",
      meetingLink: "https://meet.google.com/xyz-uvwx-yz"
    },
    {
      id: 3,
      date: "2025-01-08",
      time: "15:00",
      duration: 60,
      type: "DELE príprava",
      teacher: "Ester Mesároš",
      status: "pending",
      topic: "Písomné úlohy B2",
      meetingLink: null
    }
  ];

  const pastLessons = [
    {
      id: 4,
      date: "2024-12-20",
      time: "14:00",
      duration: 60,
      type: "Konverzácia",
      teacher: "Ester Mesároš",
      status: "completed",
      topic: "Vianočné tradície v Španielsku",
      rating: 5,
      notes: `Výborná lekcia o vianočných tradíciách!\n\nNové slovíčko:\n- Nochebuena - Štedrý večer\n- Roscón de Reyes - Trojkráľový koláč\n- Belén - Betlehem (jasličky)\n\nDomáca úloha: Napísať krátky text o slovenských vianočných tradíciách v španielčine.`,
      homework: "Napísať 200 slov o slovenských vianočných tradíciách"
    },
    {
      id: 5,
      date: "2024-12-18",
      time: "16:30",
      duration: 90,
      type: "Gramatika",
      teacher: "Ester Mesároš",
      status: "completed",
      topic: "Pretérito perfecto vs. indefinido",
      rating: 4,
      notes: `Pokrok v používaní minulých časov!\n\nKľúčové pravidlá:\n- Pretérito perfecto: súvislosti s prítomnosťou\n- Pretérito indefinido: ukončené činnosti v minulosti\n\nCvičenia na precvičenie v materiáloch.`,
      homework: "Dokončiť cvičenia 1-5 v pracovnom zošite"
    },
    {
      id: 6,
      date: "2024-12-15",
      time: "15:00",
      duration: 60,
      type: "Konverzácia",
      teacher: "Ester Mesároš",
      status: "completed",
      topic: "Práca a kariéra",
      rating: 5,
      notes: `Skvelé pokroky vo fluencii!\n\nNové frázy:\n- Buscar trabajo - hľadať prácu\n- Hacer una entrevista - robiť pohovor\n- Ascender en el trabajo - postupovať v práci\n\nPokračovať v konverzačných cvičeniach.`,
      homework: "Pripraviť prezentáciu o svojej práci (5 minút)"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'completed': return 'text-primary bg-primary/10';
      case 'cancelled': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Potvrdené';
      case 'pending': return 'Čaká na potvrdenie';
      case 'completed': return 'Dokončené';
      case 'cancelled': return 'Zrušené';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('sk-SK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderUpcomingLesson = (lesson) => (
    <div key={lesson?.id} className="bg-white rounded-lg shadow-soft border p-6 hover:shadow-warm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-headlines font-semibold text-foreground">{lesson?.type}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson?.status)}`}>
              {getStatusText(lesson?.status)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{formatDate(lesson?.date)}</p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={14} />
              <span>{lesson?.time} ({lesson?.duration} min)</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="User" size={14} />
              <span>{lesson?.teacher}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {lesson?.meetingLink && (
            <Button
              variant="outline"
              size="sm"
              iconName="Video"
              iconPosition="left"
              onClick={() => window.open(lesson?.meetingLink, '_blank')}
            >
              Pripojiť sa
            </Button>
          )}
          <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-1">Téma lekcie</h4>
        <p className="text-sm text-muted-foreground">{lesson?.topic}</p>
      </div>
    </div>
  );

  const renderPastLesson = (lesson) => (
    <div key={lesson?.id} className="bg-white rounded-lg shadow-soft border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-headlines font-semibold text-foreground">{lesson?.type}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson?.status)}`}>
              {getStatusText(lesson?.status)}
            </span>
            {lesson?.rating && (
              <div className="flex items-center space-x-1">
                {[...Array(5)]?.map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={14}
                    className={i < lesson?.rating ? 'text-accent fill-current' : 'text-muted-foreground'}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">{formatDate(lesson?.date)}</p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={14} />
              <span>{lesson?.time} ({lesson?.duration} min)</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="User" size={14} />
              <span>{lesson?.teacher}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" iconName="Download">
          Stiahnuť materiály
        </Button>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-1">Téma lekcie</h4>
          <p className="text-sm text-muted-foreground">{lesson?.topic}</p>
        </div>

        {lesson?.notes && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
              <Icon name="FileText" size={16} />
              <span>Poznámky z lekcie</span>
            </h4>
            <div className="text-sm text-muted-foreground whitespace-pre-line">{lesson?.notes}</div>
          </div>
        )}

        {lesson?.homework && (
          <div className="bg-accent/10 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
              <Icon name="BookOpen" size={16} />
              <span>Domáca úloha</span>
            </h4>
            <p className="text-sm text-muted-foreground">{lesson?.homework}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'upcoming' ? 'bg-white text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Nadchádzajúce lekcie ({upcomingLessons?.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'past' ? 'bg-white text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          História lekcií ({pastLessons?.length})
        </button>
      </div>
      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'upcoming' && (
          <>
            {upcomingLessons?.length > 0 ? (
              upcomingLessons?.map(renderUpcomingLesson)
            ) : (
              <div className="text-center py-12">
                <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="font-headlines font-semibold text-foreground mb-2">Žiadne nadchádzajúce lekcie</h3>
                <p className="text-muted-foreground mb-4">Rezervujte si novú lekciu a pokračujte vo svojom vzdelávaní</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'past' && (
          <>
            {pastLessons?.length > 0 ? (
              pastLessons?.map(renderPastLesson)
            ) : (
              <div className="text-center py-12">
                <Icon name="BookOpen" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="font-headlines font-semibold text-foreground mb-2">Žiadna história lekcií</h3>
                <p className="text-muted-foreground">Vaše dokončené lekcie sa zobrazia tu</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LessonHistory;
