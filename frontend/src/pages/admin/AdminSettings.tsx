import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { settingService } from '../../api';
import { LibrarySetting } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<LibrarySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Local state for modified values
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await settingService.getAllSettings();
      setSettings(data);
      const valMap: Record<string, string> = {};
      data.forEach((s) => {
        valMap[s.key] = s.value;
      });
      setFormValues(valMap);
    } catch (err: any) {
      showToast('Failed to load library settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, description?: string) => {
    setSavingKey(key);
    try {
      const val = formValues[key];
      await settingService.updateSetting(key, val, description);
      showToast(`Setting "${key}" updated successfully!`, 'success');
      fetchSettings();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update setting', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Library System Configuration & Rules
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic institution-wide circulation rules, overdue fine rates, and borrowing quotas.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:text-dps-700 text-xs font-bold rounded-xl shadow-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Settings</span>
        </button>
      </div>

      {/* Info notice */}
      <div className="bg-gradient-to-r from-dps-50 to-indigo-50 border border-dps-200/60 rounded-2xl p-4 flex items-center gap-3">
        <Info className="w-5 h-5 text-dps-600 flex-shrink-0" />
        <p className="text-xs text-dps-900 leading-relaxed">
          Changes take effect immediately for all subsequent book issues, automated midnight overdue cron tasks, and fine computations.
        </p>
      </div>

      {/* Settings List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading system parameters..." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {settings.map((setting) => {
            const isSaving = savingKey === setting.key;
            const hasChanged = formValues[setting.key] !== setting.value;

            return (
              <div
                key={setting.key}
                className="p-5 sm:p-6 hover:bg-slate-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {setting.key}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {setting.description || 'System circulation parameter.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    value={formValues[setting.key] ?? ''}
                    onChange={(e) =>
                      setFormValues({ ...formValues, [setting.key]: e.target.value })
                    }
                    className="flex-1 sm:w-48 px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500 focus:bg-white"
                  />
                  <button
                    onClick={() => handleUpdateSetting(setting.key, setting.description)}
                    disabled={isSaving || !hasChanged}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-40 ${
                      hasChanged
                        ? 'bg-dps-600 hover:bg-dps-700 text-white'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

