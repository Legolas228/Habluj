import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../hooks/useTranslation';

const ProgressChart = ({ language = 'sk', progressRecords = [], error = '' }) => {
  const { t } = useTranslation();

  const latestSkillRecord = [...progressRecords]
    .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
    .find((item) => (
      Number.isFinite(item?.speaking_score)
      && Number.isFinite(item?.listening_score)
      && Number.isFinite(item?.reading_score)
      && Number.isFinite(item?.writing_score)
      && Number.isFinite(item?.grammar_score)
      && Number.isFinite(item?.vocabulary_score)
    ));

  const skillLabels = (t('studentProgress.skills') || '').split(',').map((item) => item.trim());

  const skillsData = [
    { label: skillLabels[0] || 'Speaking', value: latestSkillRecord?.speaking_score },
    { label: skillLabels[1] || 'Listening', value: latestSkillRecord?.listening_score },
    { label: skillLabels[2] || 'Reading', value: latestSkillRecord?.reading_score },
    { label: skillLabels[3] || 'Writing', value: latestSkillRecord?.writing_score },
    { label: skillLabels[4] || 'Grammar', value: latestSkillRecord?.grammar_score },
    { label: skillLabels[5] || 'Vocabulary', value: latestSkillRecord?.vocabulary_score },
  ];

  const overallAverage = latestSkillRecord
    ? Math.round(
      (
        latestSkillRecord.speaking_score
        + latestSkillRecord.listening_score
        + latestSkillRecord.reading_score
        + latestSkillRecord.writing_score
        + latestSkillRecord.grammar_score
        + latestSkillRecord.vocabulary_score
      ) / 6,
    )
    : null;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-soft border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-headlines font-semibold text-foreground">{t('studentProgress.overallTitle')}</h3>
            <p className="text-sm text-muted-foreground">{t('studentProgress.skillsSubtitle')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('studentProgress.managedByEster')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Progreso general</p>
            <p className="text-2xl font-semibold text-foreground">{overallAverage ?? '-'}</p>
          </div>
        </div>

        {latestSkillRecord ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis
                dataKey="label"
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
                formatter={(value) => [`${value}`, t('studentProgress.studyLabel')]}
              />
              <Bar
                dataKey="value"
                fill="#C4622D"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('studentProgress.skillsPending')}</p>
        )}
      </div>
    </div>
  );
};

export default ProgressChart;
