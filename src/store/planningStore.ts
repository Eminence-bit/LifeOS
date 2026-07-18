import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Event, Goal } from '@/types';
import { createBaseEntity, now } from '@/lib/utils';

interface PlanningState {
    tasks: Task[];
    events: Event[];
    goals: Goal[];
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateEvent: (id: string, updates: Partial<Event>) => void;
    deleteEvent: (id: string) => void;
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    deleteGoal: (id: string) => void;
}

export const usePlanningStore = create<PlanningState>()(
    persist(
        (set) => ({
            tasks: [],
            events: [],
            goals: [],

            addTask: (task) =>
                set((s) => ({ tasks: [...s.tasks, { ...createBaseEntity(), ...task }] })),
            updateTask: (id, updates) =>
                set((s) => ({
                    tasks: s.tasks.map((t) =>
                        t.id === id ? { ...t, ...updates, updatedAt: now() } : t
                    ),
                })),
            deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

            addEvent: (event) =>
                set((s) => ({ events: [...s.events, { ...createBaseEntity(), ...event }] })),
            updateEvent: (id, updates) =>
                set((s) => ({
                    events: s.events.map((e) =>
                        e.id === id ? { ...e, ...updates, updatedAt: now() } : e
                    ),
                })),
            deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

            addGoal: (goal) =>
                set((s) => ({ goals: [...s.goals, { ...createBaseEntity(), ...goal }] })),
            updateGoal: (id, updates) =>
                set((s) => ({
                    goals: s.goals.map((g) =>
                        g.id === id ? { ...g, ...updates, updatedAt: now() } : g
                    ),
                })),
            deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
        }),
        { name: 'lifeos-planning' }
    )
);
