import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Expense, Income, Budget, SavingsGoal } from '@/types';
import { createBaseEntity, now } from '@/lib/utils';

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
        (set) => ({
            expenses: [],
            incomes: [],
            budgets: [],
            savingsGoals: [],

            addExpense: (e) =>
                set((s) => ({ expenses: [...s.expenses, { ...createBaseEntity(), ...e }] })),
            updateExpense: (id, updates) =>
                set((s) => ({
                    expenses: s.expenses.map((ex) =>
                        ex.id === id ? { ...ex, ...updates, updatedAt: now() } : ex
                    ),
                })),
            deleteExpense: (id) =>
                set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

            addIncome: (i) =>
                set((s) => ({ incomes: [...s.incomes, { ...createBaseEntity(), ...i }] })),
            updateIncome: (id, updates) =>
                set((s) => ({
                    incomes: s.incomes.map((inc) =>
                        inc.id === id ? { ...inc, ...updates, updatedAt: now() } : inc
                    ),
                })),
            deleteIncome: (id) =>
                set((s) => ({ incomes: s.incomes.filter((i) => i.id !== id) })),

            setBudget: (b) =>
                set((s) => {
                    const exists = s.budgets.find(
                        (bud) => bud.category === b.category && bud.month === b.month
                    );
                    if (exists) {
                        return {
                            budgets: s.budgets.map((bud) =>
                                bud.id === exists.id ? { ...bud, ...b, updatedAt: now() } : bud
                            ),
                        };
                    }
                    return { budgets: [...s.budgets, { ...createBaseEntity(), ...b }] };
                }),

            addSavingsGoal: (g) =>
                set((s) => ({ savingsGoals: [...s.savingsGoals, { ...createBaseEntity(), ...g }] })),
            updateSavingsGoal: (id, updates) =>
                set((s) => ({
                    savingsGoals: s.savingsGoals.map((sg) =>
                        sg.id === id ? { ...sg, ...updates, updatedAt: now() } : sg
                    ),
                })),
            deleteSavingsGoal: (id) =>
                set((s) => ({ savingsGoals: s.savingsGoals.filter((g) => g.id !== id) })),
        }),
        { name: 'lifeos-finance' }
    )
);
