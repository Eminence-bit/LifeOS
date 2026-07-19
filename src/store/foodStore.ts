import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InventoryItem, Recipe, MealPlanEntry } from '@/types';
import { createBaseEntity, generateId, now, todayStr } from '@/lib/utils';
import { syncEngine } from '@/lib/syncEngine';

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
    cookMeal: (entryId: string) => void;

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

            addInventoryItem: (item) => {
                const entity = { ...createBaseEntity(), ...item };
                set((s) => ({ inventory: [...s.inventory, entity] }));
                syncEngine.pushInventoryItem(entity);
            },
            updateInventoryItem: (id, updates) => {
                set((s) => ({
                    inventory: s.inventory.map((i) =>
                        i.id === id ? { ...i, ...updates, updatedAt: now() } : i
                    ),
                }));
                const updated = get().inventory.find((i) => i.id === id);
                if (updated) syncEngine.pushInventoryItem(updated);
            },
            deleteInventoryItem: (id) => {
                set((s) => ({ inventory: s.inventory.filter((i) => i.id !== id) }));
                syncEngine.deleteInventoryItem(id);
            },

            addRecipe: (recipe) => {
                const entity = { ...createBaseEntity(), ...recipe };
                set((s) => ({ recipes: [...s.recipes, entity] }));
                syncEngine.pushRecipe(entity);
            },
            updateRecipe: (id, updates) => {
                set((s) => ({
                    recipes: s.recipes.map((r) =>
                        r.id === id ? { ...r, ...updates, updatedAt: now() } : r
                    ),
                }));
                const updated = get().recipes.find((r) => r.id === id);
                if (updated) syncEngine.pushRecipe(updated);
            },
            deleteRecipe: (id) => {
                set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) }));
                syncEngine.deleteRecipe(id);
            },

            addMealPlanEntry: (entry) => {
                const entity = { ...createBaseEntity(), ...entry };
                set((s) => ({ mealPlan: [...s.mealPlan, entity] }));
                syncEngine.pushMealPlan(entity);
            },
            updateMealPlanEntry: (id, updates) => {
                set((s) => ({
                    mealPlan: s.mealPlan.map((m) =>
                        m.id === id ? { ...m, ...updates, updatedAt: now() } : m
                    ),
                }));
                const updated = get().mealPlan.find((m) => m.id === id);
                if (updated) syncEngine.pushMealPlan(updated);
            },
            deleteMealPlanEntry: (id) => {
                set((s) => ({ mealPlan: s.mealPlan.filter((m) => m.id !== id) }));
                syncEngine.deleteMealPlan(id);
            },

            cookMeal: (entryId) => {
                const { mealPlan, recipes, inventory } = get();
                const entry = mealPlan.find((m) => m.id === entryId);
                if (!entry || !entry.recipeId) return;
                const recipe = recipes.find((r) => r.id === entry.recipeId);
                if (!recipe) return;

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

                // Sync affected inventory and meal plan entry
                for (const item of updatedInventory) {
                    syncEngine.pushInventoryItem(item);
                }
                const cookedEntry = get().mealPlan.find((m) => m.id === entryId);
                if (cookedEntry) syncEngine.pushMealPlan(cookedEntry);
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

            addShoppingItem: (item) => {
                const newItem = { ...item, id: generateId(), checked: false, manual: true };
                set((s) => ({
                    shoppingList: [...s.shoppingList, newItem],
                }));
                syncEngine.pushShoppingItem(newItem);
            },
            toggleShoppingItem: (id) => {
                set((s) => ({
                    shoppingList: s.shoppingList.map((i) =>
                        i.id === id ? { ...i, checked: !i.checked } : i
                    ),
                }));
                const toggled = get().shoppingList.find((i) => i.id === id);
                // Only sync manual items — auto-* items are derived from inventory
                if (toggled && toggled.manual && !toggled.id.startsWith('auto-')) {
                    syncEngine.pushShoppingItem(toggled);
                }
            },
            removeShoppingItem: (id) => {
                set((s) => ({ shoppingList: s.shoppingList.filter((i) => i.id !== id) }));
                // Only delete from DB if it was a manual (UUID) item
                if (!id.startsWith('auto-')) syncEngine.deleteShoppingItem(id);
            },
        }),
        { name: 'lifeos-food' }
    )
);
