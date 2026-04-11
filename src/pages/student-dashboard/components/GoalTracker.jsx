import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';

const GoalTracker = ({
  currentLevel = '',
  profileBio = '',
  onSaveProfile,
  isProfileSaving = false,
  profileError = '',
  bookings = [],
  materials = [],
  goals = [],
  onToggleGoal,
  isGoalUpdating = false,
  goalsError = '',
}) => {
  const { t } = useTranslation();
  const [languageLevel, setLanguageLevel] = useState(currentLevel);
  const [bio, setBio] = useState(profileBio);
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    setLanguageLevel(currentLevel || '');
  }, [currentLevel]);

  useEffect(() => {
    setBio(profileBio || '');
  }, [profileBio]);

  const completedLessons = useMemo(() => bookings.filter((item) => item.status === 'completed').length, [bookings]);
  const activeGoals = useMemo(() => goals.filter((item) => !item.is_completed).length, [goals]);

  const saveProfile = async () => {
    if (!onSaveProfile) return;
    await onSaveProfile({ language_level: languageLevel, bio });
    setSaveSuccess(t('studentGoals.profileSaved'));
    window.setTimeout(() => setSaveSuccess(''), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-soft border p-6">
        <h2 className="text-2xl font-headlines font-bold text-foreground">{t('studentGoals.title')}</h2>
        <p className="text-muted-foreground mt-1">{t('studentGoals.subtitle')}</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary/5 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{t('studentGoals.activeGoals')}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{activeGoals}</p>
          </div>
          <div className="bg-secondary/5 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{t('studentGoals.completedLessons')}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{completedLessons}</p>
          </div>
          <div className="bg-accent/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{t('studentGoals.assignedResources')}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{materials.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-soft border p-6">
        <h3 className="text-lg font-headlines font-semibold text-foreground">{t('studentGoals.yourSettings')}</h3>
        <p className="text-sm text-muted-foreground mt-1">{t('studentGoals.studentEditable')}</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t('studentGoals.levelLabel')}</label>
            <select
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={languageLevel}
              onChange={(event) => setLanguageLevel(event.target.value)}
            >
              <option value="">-</option>
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t('studentGoals.personalNotes')}</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={4}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder={t('studentGoals.personalNotesPlaceholder')}
            />
          </div>
        </div>

        {profileError && <p className="text-sm text-error mt-3">{profileError}</p>}
        {saveSuccess && <p className="text-sm text-success mt-3">{saveSuccess}</p>}

        <div className="mt-4">
          <Button onClick={saveProfile} disabled={isProfileSaving} iconName="Save" iconPosition="left">
            {isProfileSaving ? t('studentGoals.saving') : t('studentGoals.saveProfile')}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-soft border p-6">
        <h3 className="text-lg font-headlines font-semibold text-foreground">{t('studentGoals.personalGoals')}</h3>
        <p className="text-sm text-muted-foreground mt-1">{t('studentGoals.localGoalsHint')}</p>

        {goalsError && <p className="text-sm text-error mt-3">{goalsError}</p>}

        <div className="mt-4 space-y-2">
          {!goals.length && <p className="text-sm text-muted-foreground">{t('studentGoals.noGoalsYet')}</p>}
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between border border-border rounded-md px-3 py-2">
              <button
                type="button"
                onClick={() => onToggleGoal?.(goal.id, !goal.is_completed)}
                className="flex items-center gap-2 text-left"
                disabled={isGoalUpdating}
              >
                <Icon name={goal.is_completed ? 'CheckCircle2' : 'Circle'} size={18} className={goal.is_completed ? 'text-success' : 'text-muted-foreground'} />
                <span className={goal.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}>{goal.title}</span>
              </button>
              <div className="text-xs text-muted-foreground text-right">
                {goal.due_date ? `Vence: ${goal.due_date}` : 'Sin fecha limite'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/40 rounded-lg border border-border p-4">
        <h4 className="font-medium text-foreground">{t('studentGoals.rolesTitle')}</h4>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
          <li>• {t('studentGoals.studentCan')}</li>
          <li>• {t('studentGoals.esterCan')}</li>
        </ul>
      </div>
    </div>
  );
};

export default GoalTracker;
