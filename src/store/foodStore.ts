import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InventoryItem, Recipe, MealPlanEntry } from '@/types';
import { createBaseEntity, now, todayStr } from '@/lib/utils';

interface FoodState {
    inventory: InventoryItem[];
    recipes: Recipe[];
    mealPlan: MealPlanEntry[];
    shoppingList: { id: string; name: string; quantity: number; unit: string; checked: boolean; manual: boolean }[];

    // Inventory
    addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
    deleteInventoryItem: (id: string) => void;

    // Recipes
    addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateRecipe: (id: string, updates: Partial<Recipe>) => void;
    deleteRecipe: (id: string) => void;

    // Meal Plan
    addMealPlanEntry: (entry: Omit<MealPlanEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateMealPlanEntry: (id: string, updates: Partial<MealPlanEntry>) => void;
    deleteMealPlanEntry: (id: string) => void;
    cookMeal: (entryId: string) => void; // deducts inventory

    // Shopping
    refreshShoppingList: () => void;
    addShoppingItem: (item: { name: string; quantity: number; unit: string }) => void;
    toggleShoppingItem: (id: string) => void;
    removeShoppingItem: (id: string) => void;
}

export const useFoodStore = create<FoodState>()(
    persist(
        (set, get) => ({
            inventory: [],
            recipes: [],
            mealPlan: [],
            shoppingList: [],

            addInventoryItem: (item) =>
                set((s) => ({ inventory: [...s.inventory, { ...createBaseEntity(), ...item }] })),
            updateInventoryItem: (id, updates) =>
                set((s) => ({
                    inventory: s.inventory.map((i) =>
                        i.id === id ? { ...i, ...updates, updatedAt: now() } : i
                    ),
                })),
            deleteInventoryItem: (id) =>
                set((s) => ({ inventory: s.inventory.filter((i) => i.id !== id) })),

            addRecipe: (recipe) =>
                set((s) => ({ recipes: [...s.recipes, { ...createBaseEntity(), ...recipe }] })),
            updateRecipe: (id, updates) =>
                set((s) => ({
                    recipes: s.recipes.map((r) =>
                        r.id === id ? { ...r, ...updates, updatedAt: now() } : r
                    ),
                })),
            deleteRecipe: (id) =>
                set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) })),

            addMealPlanEntry: (entry) =>
                set((s) => ({ mealPlan: [...s.mealPlan, { ...createBaseEntity(), ...entry }] })),
            updateMealPlanEntry: (id, updates) =>
                set((s) => ({
                    mealPlan: s.mealPlan.map((m) =>
                        m.id === id ? { ...m, ...updates, updatedAt: now() } : m
                    ),
                })),
            deleteMealPlanEntry: (id) =>
                set((s) => ({ mealPlan: s.mealPlan.filter((m) => m.id !== id) })),

            cookMeal: (entryId) => {
                const { mealPlan, recipes, inventory } = get();
                const entry = mealPlan.find((m) => m.id === entryId);
                if (!entry || !entry.recipeId) return;
                const recipe = recipes.find((r) => r.id === entry.recipeId);
                if (!recipe) return;

                // Deduct inventory
                const updatedInventory = inventory.map((item) => {
                    const ing = recipe.ingredients.find(
                        (i) => i.inventoryItemId === item.id
                    );
                    if (ing) {
                        return { ...item, quantity: Math.max(0, item.quantity - ing.quantity), updatedAt: now() };
                    }
                    return item;
                });

                set((s) => ({
                    inventory: updatedInventory,
                    mealPlan: s.mealPlan.map((m) =>
                        m.id === entryId ? { ...m, cooked: true, updatedAt: now() } : m
                    ),
                }));
            },

            refreshShoppingList: () => {
                const { inventory } = get();
                const autoItems = inventory
                    .filter((item) => item.quantity < item.minQuantity)
                    .map((item) => ({
                        id: `auto-${item.id}`,
                        name: item.name,
                        quantity: item.minQuantity - item.quantity,
                        unit: item.unit,
                        checked: false,
                        manual: false,
                    }));

                set((s) => ({
                    shoppingList: [
                        ...autoItems,
                        ...s.shoppingList.filter((i) => i.manual),
                    ],
                }));
            },

            addShoppingItem: (item) =>
                set((s) => ({
                    shoppingList: [
                        ...s.shoppingList,
                        { ...item, id: `manual-${Math.random().toString(36).substring(2)}`, checked: false, manual: true },
                    ],
                })),
            toggleShoppingItem: (id) =>
                set((s) => ({
                    shoppingList: s.shoppingList.map((i) =>
                        i.id === id ? { ...i, checked: !i.checked } : i
                    ),
                })),
            removeShoppingItem: (id) =>
                set((s) => ({ shoppingList: s.shoppingList.filter((i) => i.id !== id) })),
        }),
        { name: 'lifeos-food' }
    )
);
