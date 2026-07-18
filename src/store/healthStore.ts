import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkoutPlan, WorkoutLog, BodyMetric, WaterIntake, SleepLog } from '@/types';
import { createBaseEntity, now } from '@/lib/utils';

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
        (set) => ({
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
            addWorkoutLog: (l) =>
                set((s) => ({ workoutLogs: [...s.workoutLogs, { ...createBaseEntity(), ...l }] })),
            deleteWorkoutLog: (id) =>
                set((s) => ({ workoutLogs: s.workoutLogs.filter((l) => l.id !== id) })),
            addBodyMetric: (m) =>
                set((s) => ({ bodyMetrics: [...s.bodyMetrics, { ...createBaseEntity(), ...m }] })),
            addWaterIntake: (w) =>
                set((s) => ({ waterIntakes: [...s.waterIntakes, { ...createBaseEntity(), ...w }] })),
            addSleepLog: (s2) =>
                set((s) => ({ sleepLogs: [...s.sleepLogs, { ...createBaseEntity(), ...s2 }] })),
        }),
        { name: 'lifeos-health' }
    )
);
