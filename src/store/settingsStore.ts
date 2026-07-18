import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '@/types';
import { createBaseEntity } from '@/lib/utils';

interface SettingsState {
    settings: Settings;
    updateSettings: (updates: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
    ...createBaseEntity(),
    theme: 'dark',
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
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            settings: defaultSettings,
            updateSettings: (updates) =>
                set((s) => ({ settings: { ...s.settings, ...updates } })),
        }),
        { name: 'lifeos-settings' }
    )
);
