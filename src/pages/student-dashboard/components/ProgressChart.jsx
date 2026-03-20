import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../hooks/useTranslation';

const ProgressChart = ({ language = 'sk', progressRecords = [], error = '' }) => {
  const { t } = useTranslation();
  const months = (t('studentProgress.months') || '').split(',').map((item) => item.trim()).filter(Boolean);
  const skills = (t('studentProgress.skills') || '').split(',').map((item) => item.trim()).filter(Boolean);

  const fallbackProgressData = [
    { month: months[0], speaking: 65, listening: 70, reading: 75, writing: 60, overall: 67 },
    { month: months[1], speaking: 70, listening: 75, reading: 80, writing: 65, overall: 72 },
    { month: months[2], speaking: 75, listening: 80, reading: 85, writing: 70, overall: 77 },
    { month: months[3], speaking: 80, listening: 85, reading: 88, writing: 75, overall: 82 },
    { month: months[4], speaking: 85, listening: 88, reading: 90, writing: 80, overall: 85 },
    { month: months[5], speaking: 88, listening: 90, reading: 92, writing: 85, overall: 88 }
  ];

  const progressData = progressRecords.length
    ? progressRecords.slice(0, 6).map((item) => ({
      month: (item.updated_at || '').slice(0, 10),
      overall: Number(item.score || 0),
    })).reverse()
    : fallbackProgressData;

  const skillsData = [
    { skill: skills[0], current: 88, target: 95, color: "#C4622D" },
    { skill: skills[1], current: 90, target: 95, color: "#2C5F7C" },
    { skill: skills[2], current: 92, target: 98, color: "#4A7C59" },
    { skill: skills[3], current: 85, target: 90, color: "#D4941E" }
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Overall Progress Chart */}
      <div className="bg-white rounded-lg shadow-soft border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-headlines font-semibold text-foreground">{t('studentProgress.overallTitle')}</h3>
            <p className="text-sm text-muted-foreground">{t('studentProgress.overallSubtitle')}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="TrendingUp" size={16} className="text-success" />
            <span>{t('studentProgress.growth')}</span>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis 
                dataKey="month" 
                stroke="#5A5A5A"
                fontSize={12}
              />
              <YAxis 
                stroke="#5A5A5A"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="overall" 
                stroke="#C4622D" 
                strokeWidth={3}
                dot={{ fill: '#C4622D', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#C4622D', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Skills Breakdown */}
      <div className="bg-white rounded-lg shadow-soft border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-headlines font-semibold text-foreground">{t('studentProgress.skillsTitle')}</h3>
            <p className="text-sm text-muted-foreground">{t('studentProgress.skillsSubtitle')}</p>
          </div>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            {t('studentProgress.setGoals')}
          </button>
        </div>

        <div className="space-y-4">
          {skillsData?.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{skill?.skill}</span>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-foreground font-medium">{skill?.current}%</span>
                  <span className="text-muted-foreground">/ {skill?.target}%</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(skill?.current / skill?.target) * 100}%`,
                      backgroundColor: skill?.color
                    }}
                  ></div>
                </div>
                <div 
                  className="absolute top-0 w-0.5 h-2 bg-gray-400"
                  style={{ left: `${(skill?.target / 100) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Monthly Activity */}
      <div className="bg-white rounded-lg shadow-soft border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-headlines font-semibold text-foreground">{t('studentProgress.monthlyTitle')}</h3>
            <p className="text-sm text-muted-foreground">{t('studentProgress.monthlySubtitle')}</p>
          </div>
        </div>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis 
                dataKey="month" 
                stroke="#5A5A5A"
                fontSize={12}
              />
              <YAxis 
                stroke="#5A5A5A"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value} ${t('studentProgress.hoursLabel')}`, t('studentProgress.studyLabel')]}
              />
              <Bar 
                dataKey="overall" 
                fill="#C4622D" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
