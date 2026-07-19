import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearningTopic, Lesson, VocabularyItem, StudySession } from '@/types';
import { createBaseEntity, now, todayStr } from '@/lib/utils';
import { syncEngine } from '@/lib/syncEngine';

interface LearningState {
    topics: LearningTopic[];
    lessons: Lesson[];
    vocabulary: VocabularyItem[];
    studySessions: StudySession[];
    dailyGoalMinutes: number;
    streak: number;
    lastStudyDate: string | null;
    addTopic: (t: Omit<LearningTopic, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateTopic: (id: string, updates: Partial<LearningTopic>) => void;
    deleteTopic: (id: string) => void;
    addLesson: (l: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateLesson: (id: string, updates: Partial<Lesson>) => void;
    deleteLesson: (id: string) => void;
    addVocabulary: (v: Omit<VocabularyItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateVocabulary: (id: string, updates: Partial<VocabularyItem>) => void;
    deleteVocabulary: (id: string) => void;
    logStudySession: (s: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => void;
    setDailyGoal: (minutes: number) => void;
}

export const useLearningStore = create<LearningState>()(
    persist(
        (set, get) => ({
            topics: [],
            lessons: [],
            vocabulary: [],
            studySessions: [],
            dailyGoalMinutes: 60,
            streak: 0,
            lastStudyDate: null,

            addTopic: (t) => {
                const entity = { ...createBaseEntity(), ...t };
                set((s) => ({ topics: [...s.topics, entity] }));
                syncEngine.pushLearningTopic(entity);
            },
            updateTopic: (id, updates) => {
                set((s) => ({
                    topics: s.topics.map((t) =>
                        t.id === id ? { ...t, ...updates, updatedAt: now() } : t
                    ),
                }));
                const updated = get().topics.find((t) => t.id === id);
                if (updated) syncEngine.pushLearningTopic(updated);
            },
            deleteTopic: (id) => {
                set((s) => ({ topics: s.topics.filter((t) => t.id !== id) }));
                syncEngine.deleteLearningTopic(id);
            },

            // Lessons are local-only (no Supabase table for lessons currently)
            addLesson: (l) =>
                set((s) => ({ lessons: [...s.lessons, { ...createBaseEntity(), ...l }] })),
            updateLesson: (id, updates) =>
                set((s) => ({
                    lessons: s.lessons.map((l) =>
                        l.id === id ? { ...l, ...updates, updatedAt: now() } : l
                    ),
                })),
            deleteLesson: (id) =>
                set((s) => ({ lessons: s.lessons.filter((l) => l.id !== id) })),

            addVocabulary: (v) => {
                const entity = { ...createBaseEntity(), ...v };
                set((s) => ({ vocabulary: [...s.vocabulary, entity] }));
                syncEngine.pushVocabularyItem(entity);
            },
            updateVocabulary: (id, updates) => {
                set((s) => ({
                    vocabulary: s.vocabulary.map((v) =>
                        v.id === id ? { ...v, ...updates, updatedAt: now() } : v
                    ),
                }));
                const updated = get().vocabulary.find((v) => v.id === id);
                if (updated) syncEngine.pushVocabularyItem(updated);
            },
            deleteVocabulary: (id) => {
                set((s) => ({ vocabulary: s.vocabulary.filter((v) => v.id !== id) }));
                syncEngine.deleteVocabularyItem(id);
            },

            logStudySession: (s) => {
                const today = todayStr();
                const { lastStudyDate, streak } = get();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                let newStreak = streak;
                if (lastStudyDate === today) {
                    // already studied today, just add session
                } else if (lastStudyDate === yesterdayStr) {
                    newStreak = streak + 1;
                } else {
                    newStreak = 1;
                }

                const entity = { ...createBaseEntity(), ...s };
                set((state) => ({
                    studySessions: [...state.studySessions, entity],
                    streak: newStreak,
                    lastStudyDate: today,
                }));
                syncEngine.pushStudySession(entity);
            },

            setDailyGoal: (minutes) => set({ dailyGoalMinutes: minutes }),
        }),
        { name: 'lifeos-learning' }
    )
);
