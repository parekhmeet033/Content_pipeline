import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as settingsService from '../api/settingsService';
import { useTheme } from '../hooks/useTheme';
import Card from '../components/common/Card';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Toggle from '../components/common/Toggle';
import { CONTENT_TONES, CONTENT_TYPES, CONTENT_LENGTHS } from '../constants';

const THEME_OPTIONS = [
  { value: 'SYSTEM', label: 'Match system' },
  { value: 'LIGHT', label: 'Light' },
  { value: 'DARK', label: 'Dark' },
];

export default function SettingsPage() {
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);

  const { data: settings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsService.getSettings });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (payload) => settingsService.updateSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings'], updated);
      setForm(updated);
      toast.success('Settings saved');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not save settings'),
  });

  const toggleMutation = useMutation({
    mutationFn: (payload) => settingsService.updateSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings'], updated);
      setForm(updated);
    },
  });

  if (isLoading || !form) return <Spinner label="Loading settings" />;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === 'theme') setTheme(value);
  }

  function toggle(field, value) {
    const previousForm = form;
    setForm((f) => ({ ...f, [field]: value }));
    toggleMutation.mutate(
      { [field]: value },
      {
        onError: (err) => {
          setForm(previousForm);
          toast.error(err.response?.data?.message || 'Could not save that change');
        },
      }
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Customize your ContentNova experience.</p>
      </div>

      <Card className="p-6">
        <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Appearance</h3>
        <Select options={THEME_OPTIONS} value={form.theme} onChange={(e) => set('theme', e.target.value)} label="Theme" />
      </Card>

      <Card className="p-6">
        <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <Toggle
            label="Email notifications"
            description="Receive email updates about your content"
            checked={form.emailNotifications}
            disabled={toggleMutation.isPending}
            onChange={(v) => toggle('emailNotifications', v)}
          />
          <Toggle
            label="Push notifications"
            description="Receive in-browser notifications"
            checked={form.pushNotifications}
            disabled={toggleMutation.isPending}
            onChange={(v) => toggle('pushNotifications', v)}
          />
          <Toggle
            label="Weekly digest"
            description="A weekly summary of your content performance"
            checked={form.weeklyDigest}
            disabled={toggleMutation.isPending}
            onChange={(v) => toggle('weeklyDigest', v)}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Default AI preferences</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Default content type" options={CONTENT_TYPES} value={form.defaultContentType} onChange={(e) => set('defaultContentType', e.target.value)} />
          <Select label="Default tone" options={CONTENT_TONES} value={form.defaultTone} onChange={(e) => set('defaultTone', e.target.value)} />
          <Select label="Default length" options={CONTENT_LENGTHS} value={form.defaultLength} onChange={(e) => set('defaultLength', e.target.value)} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>
          Save settings
        </Button>
      </div>
    </div>
  );
}
