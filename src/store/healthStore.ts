import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkoutPlan, WorkoutLog, BodyMetric, WaterIntake, SleepLog } from '@/types';
import { createBaseEntity, now } from '@/lib/utils';
import { syncEngine } from '@/lib/syncEngine';

interface HealthState {
    workoutPlans: WorkoutPlan[];
    workoutLogs: WorkoutLog[];
    bodyMetrics: BodyMetric[];
    waterIntakes: WaterIntake[];
    sleepLogs: SleepLog[];
    addWorkoutPlan: (p: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateWorkoutPlan: (id: string, updates: Partial<WorkoutPlan>) => void;
    deleteWorkoutPlan: (id: string) => void;
    addWorkoutLog: (l: Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
    deleteWorkoutLog: (id: string) => void;
    addBodyMetric: (m: Omit<BodyMetric, 'id' | 'createdAt' | 'updatedAt'>) => void;
    addWaterIntake: (w: Omit<WaterIntake, 'id' | 'createdAt' | 'updatedAt'>) => void;
    addSleepLog: (s: Omit<SleepLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const useHealthStore = create<HealthState>()(
    persist(
        (set, get) => ({
            workoutPlans: [],
            workoutLogs: [],
            bodyMetrics: [],
            waterIntakes: [],
            sleepLogs: [],

            addWorkoutPlan: (p) =>
                set((s) => ({ workoutPlans: [...s.workoutPlans, { ...createBaseEntity(), ...p }] })),
            updateWorkoutPlan: (id, updates) =>
                set((s) => ({
                    workoutPlans: s.workoutPlans.map((wp) =>
                        wp.id === id ? { ...wp, ...updates, updatedAt: now() } : wp
                    ),
                })),
            deleteWorkoutPlan: (id) =>
                set((s) => ({ workoutPlans: s.workoutPlans.filter((p) => p.id !== id) })),

            addWorkoutLog: (l) => {
                const entity = { ...createBaseEntity(), ...l };
                set((s) => ({ workoutLogs: [...s.workoutLogs, entity] }));
                syncEngine.pushWorkoutLog(entity);
            },
            deleteWorkoutLog: (id) => {
                set((s) => ({ workoutLogs: s.workoutLogs.filter((l) => l.id !== id) }));
                syncEngine.deleteWorkoutLog(id);
            },

            addBodyMetric: (m) => {
                const entity = { ...createBaseEntity(), ...m };
                set((s) => ({ bodyMetrics: [...s.bodyMetrics, entity] }));
                syncEngine.pushBodyMetric(entity);
            },

            addWaterIntake: (w) => {
                const entity = { ...createBaseEntity(), ...w };
                set((s) => ({ waterIntakes: [...s.waterIntakes, entity] }));
                syncEngine.pushWaterIntake(entity);
            },

            addSleepLog: (s2) => {
                const entity = { ...createBaseEntity(), ...s2 };
                set((s) => ({ sleepLogs: [...s.sleepLogs, entity] }));
                syncEngine.pushSleepLog(entity);
            },
        }),
        { name: 'lifeos-health' }
    )
);
