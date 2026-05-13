import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile } from '../lib/auth';
import { getSessionProfile, logout, updateProfileXP, unlockAchievement } from '../lib/auth';
import type { AppSettings } from '../lib/settings';
import { loadSettings, saveSettings } from '../lib/settings';

interface AppContextType {
  // Auth
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
  handleLogout: () => void;

  // Settings
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  persistSettings: () => void;

  // XP / Gamification
  addXP: (amount: number) => void;
  grantAchievement: (id: string) => void;

  // Inactivity lock
  resetInactivity: () => void;
  isLocked: boolean;
  unlock: (profile: UserProfile) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(() => getSessionProfile());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [isLocked, setIsLocked] = useState(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const resetInactivity = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    if (!profile) return;
    const minutes = settings.autoLockMinutes;
    if (minutes <= 0) return;
    inactivityTimer.current = setTimeout(() => {
      setIsLocked(true);
    }, minutes * 60 * 1000);
  }, [profile, settings.autoLockMinutes]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetInactivity, { passive: true }));
    resetInactivity();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivity));
      clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivity]);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    const isDark = settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    root.style.setProperty('--accent-primary', settings.accentColor);
    // Derived glow from accent
    const hex = settings.accentColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    root.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.35)`);
    root.style.setProperty('--font-size-base', settings.fontSize === 'sm' ? '13px' : settings.fontSize === 'lg' ? '16px' : '14px');
  }, [settings.theme, settings.accentColor, settings.fontSize]);

  const setProfile = (p: UserProfile | null) => {
    setProfileState(p);
    setIsLocked(false);
  };

  const handleLogout = () => {
    logout();
    setProfileState(null);
    setIsLocked(false);
  };

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  };

  const persistSettings = () => {
    saveSettings(settings);
  };

  const addXP = (amount: number) => {
    if (!profile) return;
    const updated = updateProfileXP(profile.id, amount);
    if (updated) setProfileState(updated);
  };

  const grantAchievement = (id: string) => {
    if (!profile) return;
    unlockAchievement(profile.id, id);
    setProfileState(prev => prev ? { ...prev, achievements: [...new Set([...prev.achievements, id])] } : prev);
  };

  const unlock = (p: UserProfile) => {
    setProfileState(p);
    setIsLocked(false);
    resetInactivity();
  };

  return (
    <AppContext.Provider value={{
      profile, setProfile, handleLogout,
      settings, updateSettings, persistSettings,
      addXP, grantAchievement,
      resetInactivity, isLocked, unlock,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
