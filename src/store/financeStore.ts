import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Expense, Income, Budget, SavingsGoal } from '@/types';
import { createBaseEntity, now } from '@/lib/utils';
import { syncEngine } from '@/lib/syncEngine';

interface FinanceState {
    expenses: Expense[];
    incomes: Income[];
    budgets: Budget[];
    savingsGoals: SavingsGoal[];
    addExpense: (e: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateExpense: (id: string, updates: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;
    addIncome: (i: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateIncome: (id: string, updates: Partial<Income>) => void;
    deleteIncome: (id: string) => void;
    setBudget: (b: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
    addSavingsGoal: (g: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
    deleteSavingsGoal: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>()(
    persist(
        (set, get) => ({
            expenses: [],
            incomes: [],
            budgets: [],
            savingsGoals: [],

            addExpense: (e) => {
                const entity = { ...createBaseEntity(), ...e };
                set((s) => ({ expenses: [...s.expenses, entity] }));
                syncEngine.pushExpense(entity);
            },
            updateExpense: (id, updates) => {
                set((s) => ({
                    expenses: s.expenses.map((ex) =>
                        ex.id === id ? { ...ex, ...updates, updatedAt: now() } : ex
                    ),
                }));
                const updated = get().expenses.find((ex) => ex.id === id);
                if (updated) syncEngine.pushExpense(updated);
            },
            deleteExpense: (id) => {
                set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
                syncEngine.deleteExpense(id);
            },

            addIncome: (i) => {
                const entity = { ...createBaseEntity(), ...i };
                set((s) => ({ incomes: [...s.incomes, entity] }));
                syncEngine.pushIncome(entity);
            },
            updateIncome: (id, updates) => {
                set((s) => ({
                    incomes: s.incomes.map((inc) =>
                        inc.id === id ? { ...inc, ...updates, updatedAt: now() } : inc
                    ),
                }));
                const updated = get().incomes.find((inc) => inc.id === id);
                if (updated) syncEngine.pushIncome(updated);
            },
            deleteIncome: (id) => {
                set((s) => ({ incomes: s.incomes.filter((i) => i.id !== id) }));
                syncEngine.deleteIncome(id);
            },

            setBudget: (b) => {
                set((s) => {
                    const exists = s.budgets.find(
                        (bud) => bud.category === b.category && bud.month === b.month
                    );
                    if (exists) {
                        const updated = { ...exists, ...b, updatedAt: now() };
                        syncEngine.pushBudget(updated);
                        return {
                            budgets: s.budgets.map((bud) =>
                                bud.id === exists.id ? updated : bud
                            ),
                        };
                    }
                    const entity = { ...createBaseEntity(), ...b };
                    syncEngine.pushBudget(entity);
                    return { budgets: [...s.budgets, entity] };
                });
            },

            addSavingsGoal: (g) => {
                const entity = { ...createBaseEntity(), ...g };
                set((s) => ({ savingsGoals: [...s.savingsGoals, entity] }));
                syncEngine.pushSavingsGoal(entity);
            },
            updateSavingsGoal: (id, updates) => {
                set((s) => ({
                    savingsGoals: s.savingsGoals.map((sg) =>
                        sg.id === id ? { ...sg, ...updates, updatedAt: now() } : sg
                    ),
                }));
                const updated = get().savingsGoals.find((sg) => sg.id === id);
                if (updated) syncEngine.pushSavingsGoal(updated);
            },
            deleteSavingsGoal: (id) => {
                set((s) => ({ savingsGoals: s.savingsGoals.filter((g) => g.id !== id) }));
                syncEngine.deleteSavingsGoal(id);
            },
        }),
        { name: 'lifeos-finance' }
    )
);
