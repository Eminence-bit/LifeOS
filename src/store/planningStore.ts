import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Event, Goal } from '@/types';
import { createBaseEntity, now } from '@/lib/utils';
import { syncEngine } from '@/lib/syncEngine';

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
        (set, get) => ({
            tasks: [],
            events: [],
            goals: [],

            addTask: (task) => {
                const entity = { ...createBaseEntity(), ...task };
                set((s) => ({ tasks: [...s.tasks, entity] }));
                syncEngine.pushTask(entity);
            },
            updateTask: (id, updates) => {
                set((s) => ({
                    tasks: s.tasks.map((t) =>
                        t.id === id ? { ...t, ...updates, updatedAt: now() } : t
                    ),
                }));
                const updated = get().tasks.find((t) => t.id === id);
                if (updated) syncEngine.pushTask(updated);
            },
            deleteTask: (id) => {
                set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
                syncEngine.deleteTask(id);
            },

            addEvent: (event) => {
                const entity = { ...createBaseEntity(), ...event };
                set((s) => ({ events: [...s.events, entity] }));
                syncEngine.pushEvent(entity);
            },
            updateEvent: (id, updates) => {
                set((s) => ({
                    events: s.events.map((e) =>
                        e.id === id ? { ...e, ...updates, updatedAt: now() } : e
                    ),
                }));
                const updated = get().events.find((e) => e.id === id);
                if (updated) syncEngine.pushEvent(updated);
            },
            deleteEvent: (id) => {
                set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
                syncEngine.deleteEvent(id);
            },

            addGoal: (goal) => {
                const entity = { ...createBaseEntity(), ...goal };
                set((s) => ({ goals: [...s.goals, entity] }));
                syncEngine.pushGoal(entity);
            },
            updateGoal: (id, updates) => {
                set((s) => ({
                    goals: s.goals.map((g) =>
                        g.id === id ? { ...g, ...updates, updatedAt: now() } : g
                    ),
                }));
                const updated = get().goals.find((g) => g.id === id);
                if (updated) syncEngine.pushGoal(updated);
            },
            deleteGoal: (id) => {
                set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
                syncEngine.deleteGoal(id);
            },
        }),
        { name: 'lifeos-planning' }
    )
);
