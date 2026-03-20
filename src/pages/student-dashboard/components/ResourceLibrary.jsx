import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ResourceLibrary = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'Všetko', icon: 'Grid3X3' },
    { id: 'grammar', name: 'Gramatika', icon: 'Book' },
    { id: 'vocabulary', name: 'Slovná zásoba', icon: 'BookOpen' },
    { id: 'conversation', name: 'Konverzácia', icon: 'MessageCircle' },
    { id: 'culture', name: 'Kultúra', icon: 'Globe' },
    { id: 'exercises', name: 'Cvičenia', icon: 'PenTool' },
    { id: 'audio', name: 'Audio', icon: 'Headphones' }
  ];

  const resources = [
    {
      id: 1,
      title: "Subjuntivo - Kompletný sprievodca",
      description: "Podrobný materiál o používaní subjuntíva v španielčine s príkladmi a cvičeniami",
      category: "grammar",
      type: "PDF",
      size: "2.4 MB",
      downloadCount: 156,
      dateAdded: "2024-12-15",
      difficulty: "intermediate",
      tags: ["subjuntivo", "gramatika", "pokročilí"],
      isBookmarked: true,
      isDownloaded: true
    },
    {
      id: 2,
      title: "1000 najčastejších španielskych slov",
      description: "Zoznam najpoužívanejších slov s prekladom a výslovnosťou",
      category: "vocabulary",
      type: "PDF",
      size: "1.8 MB",
      downloadCount: 234,
      dateAdded: "2024-12-10",
      difficulty: "beginner",
      tags: ["slovíčka", "základy", "začiatočníci"],
      isBookmarked: false,
      isDownloaded: true
    },
    {
      id: 3,
      title: "Konverzačné frázy pre cestovanie",
      description: "Užitočné frázy a dialógy pre cestovanie do španielsky hovoriacich krajín",
      category: "conversation",
      type: "Audio + PDF",
      size: "15.2 MB",
      downloadCount: 89,
      dateAdded: "2024-12-08",
      difficulty: "intermediate",
      tags: ["cestovanie", "frázy", "dialógy"],
      isBookmarked: true,
      isDownloaded: false
    },
    {
      id: 4,
      title: "Španielske tradície a sviatky",
      description: "Prehľad najdôležitejších španielskych tradícií a sviatkov",
      category: "culture",
      type: "PDF",
      size: "3.1 MB",
      downloadCount: 67,
      dateAdded: "2024-12-05",
      difficulty: "intermediate",
      tags: ["kultúra", "tradície", "sviatky"],
      isBookmarked: false,
      isDownloaded: false
    },
    {
      id: 5,
      title: "Cvičenia na pretérito perfecto",
      description: "Interaktívne cvičenia na precvičenie pretérito perfecto",
      category: "exercises",
      type: "Interactive",
      size: "Online",
      downloadCount: 145,
      dateAdded: "2024-12-01",
      difficulty: "intermediate",
      tags: ["cvičenia", "pretérito", "gramatika"],
      isBookmarked: true,
      isDownloaded: false
    },
    {
      id: 6,
      title: "Výslovnosť španielskych samohlások",
      description: "Audio materiál na precvičenie správnej výslovnosti",
      category: "audio",
      type: "MP3",
      size: "8.7 MB",
      downloadCount: 78,
      dateAdded: "2024-11-28",
      difficulty: "beginner",
      tags: ["výslovnosť", "audio", "samohlásky"],
      isBookmarked: false,
      isDownloaded: true
    },
    {
      id: 7,
      title: "Obchodná španielčina - základy",
      description: "Terminológia a frázy pre obchodné prostredie",
      category: "vocabulary",
      type: "PDF",
      size: "2.9 MB",
      downloadCount: 92,
      dateAdded: "2024-11-25",
      difficulty: "advanced",
      tags: ["obchod", "business", "pokročilí"],
      isBookmarked: true,
      isDownloaded: false
    },
    {
      id: 8,
      title: "Latinsko-americké variácie",
      description: "Rozdiely medzi európskou a latinsko-americkou španielčinou",
      category: "culture",
      type: "PDF + Audio",
      size: "12.4 MB",
      downloadCount: 54,
      dateAdded: "2024-11-20",
      difficulty: "advanced",
      tags: ["variácie", "latinská amerika", "dialekty"],
      isBookmarked: false,
      isDownloaded: false
    }
  ];

  const filteredResources = resources?.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource?.category === activeCategory;
    const matchesSearch = resource?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         resource?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         resource?.tags?.some(tag => tag?.toLowerCase()?.includes(searchTerm?.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-success bg-success/10';
      case 'intermediate': return 'text-warning bg-warning/10';
      case 'advanced': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'Začiatočník';
      case 'intermediate': return 'Pokročilý';
      case 'advanced': return 'Expert';
      default: return difficulty;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PDF': return 'FileText';
      case 'Audio': return 'Headphones';
      case 'MP3': return 'Music';
      case 'Interactive': return 'Monitor';
      case 'Audio + PDF': return 'Headphones';
      case 'PDF + Audio': return 'FileText';
      default: return 'File';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleBookmark = (resourceId) => {
    console.log(`Toggle bookmark for resource: ${resourceId}`);
  };

  const downloadResource = (resourceId) => {
    console.log(`Download resource: ${resourceId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headlines font-bold text-foreground">Knižnica materiálov</h2>
          <p className="text-muted-foreground">Prístup k všetkým vzdelávacím materiálom a zdrojom</p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Hľadať materiály..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
          />
        </div>
      </div>
      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => setActiveCategory(category?.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === category?.id
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            <Icon name={category?.icon} size={16} />
            <span>{category?.name}</span>
          </button>
        ))}
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-soft border p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="FileText" size={20} className="text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Celkové materiály</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{resources?.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-soft border p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Download" size={20} className="text-secondary" />
            <span className="text-sm font-medium text-muted-foreground">Stiahnuté</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{resources?.filter(r => r?.isDownloaded)?.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-soft border p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Bookmark" size={20} className="text-accent" />
            <span className="text-sm font-medium text-muted-foreground">Obľúbené</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{resources?.filter(r => r?.isBookmarked)?.length}</p>
        </div>
      </div>
      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredResources?.map((resource) => (
          <div key={resource?.id} className="bg-white rounded-lg shadow-soft border p-6 hover:shadow-warm transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={getTypeIcon(resource?.type)} size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-headlines font-semibold text-foreground mb-1">{resource?.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{resource?.description}</p>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource?.difficulty)}`}>
                      {getDifficultyText(resource?.difficulty)}
                    </span>
                    <span className="px-2 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                      {resource?.type}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource?.tags?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => toggleBookmark(resource?.id)}
                className={`p-2 rounded-lg transition-colors ${
                  resource?.isBookmarked 
                    ? 'text-accent bg-accent/10 hover:bg-accent/20' :'text-muted-foreground hover:text-accent hover:bg-accent/10'
                }`}
              >
                <Icon name="Bookmark" size={20} className={resource?.isBookmarked ? 'fill-current' : ''} />
              </button>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={14} />
                  <span>{formatDate(resource?.dateAdded)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="HardDrive" size={14} />
                  <span>{resource?.size}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Download" size={14} />
                  <span>{resource?.downloadCount}</span>
                </div>
              </div>
              
              {resource?.isDownloaded && (
                <div className="flex items-center space-x-1 text-success">
                  <Icon name="CheckCircle" size={14} />
                  <span>Stiahnuté</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={resource?.isDownloaded ? "outline" : "default"}
                size="sm"
                iconName="Download"
                iconPosition="left"
                onClick={() => downloadResource(resource?.id)}
                className="flex-1"
              >
                {resource?.isDownloaded ? 'Stiahnuť znovu' : 'Stiahnuť'}
              </Button>
              
              {resource?.type === 'Interactive' && (
                <Button
                  variant="secondary"
                  size="sm"
                  iconName="ExternalLink"
                  iconPosition="left"
                  onClick={() => window.open('#', '_blank')}
                >
                  Otvoriť
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {filteredResources?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="font-headlines font-semibold text-foreground mb-2">Žiadne materiály nenájdené</h3>
          <p className="text-muted-foreground mb-4">
            Skúste zmeniť vyhľadávací výraz alebo kategóriu
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('all');
            }}
          >
            Vymazať filtre
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResourceLibrary;
