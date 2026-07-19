import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '@/types';
import { createBaseEntity } from '@/lib/utils';
import { syncEngine } from '@/lib/syncEngine';

interface SettingsState {
    settings: Settings;
    updateSettings: (updates: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
    ...createBaseEntity(),
    theme: 'dark',
    themeStyle: 'cozy-earth',
    disableDynamicAccents: false,
    currency: 'EUR',
    timezone: 'Europe/Berlin',
    weekStartsOn: 1,
    notifications: {
        inventory: true,
        documents: true,
        bills: true,
        study: true,
        workout: true,
    },
    userProfile: {
        name: 'Guest User',
        email: 'guest@example.com',
        avatarColor: '#7c3aed',
        bio: 'Local offline workspace.',
    },
    quickNotes: '',
    geminiApiKey: '',
    dashboardContext: 'work',
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            settings: defaultSettings,
            updateSettings: (updates) => {
                set((s) => ({ settings: { ...s.settings, ...updates } }));
                const s = get().settings;
                syncEngine.pushSettings(s);
                if (s.userProfile) {
                    syncEngine.pushProfile(s.userProfile);
                }
            },
        }),
        { name: 'lifeos-settings' }
    )
);
