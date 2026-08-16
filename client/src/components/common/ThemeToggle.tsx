import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false }) => {
  const { mode, setMode } = useTheme();

  const options: { id: ThemeMode; icon: React.ElementType; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' },
  ];

  if (compact) {
    const current = options.find((o) => o.id === mode)!;
    const Icon = current.icon;
    const next = options[(options.indexOf(current) + 1) % options.length];
    return (
      <button
        title={`Switch to ${next.label} mode`}
        onClick={() => setMode(next.id)}
        className="p-2 rounded-xl border border-slate-700/50 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
      >
        <Icon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1">
      {options.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          title={`${label} Mode`}
          onClick={() => setMode(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === id
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};
