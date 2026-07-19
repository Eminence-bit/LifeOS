import { useState } from 'react';
import { Plus, Trash2, ShoppingCart, Apple, ChefHat, CalendarDays, Edit2, Check } from 'lucide-react';
import { useFoodStore } from '@/store/foodStore';
import { todayStr } from '@/lib/utils';
import { format, startOfWeek, addDays } from 'date-fns';
import type { MealType, RecipeIngredient, InventoryItem, Recipe } from '@/types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];
const MEAL_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

// ── Add Inventory Item Modal ─────────────────────────────────────
function AddInventoryModal({ onClose }: { onClose: () => void }) {
    const { addInventoryItem } = useFoodStore();
    const [form, setForm] = useState({ name: '', quantity: '', unit: 'g', minQuantity: '', store: '', expiryDate: '', category: '' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.quantity) return;
        addInventoryItem({ name: form.name, quantity: parseFloat(form.quantity), unit: form.unit, minQuantity: parseFloat(form.minQuantity || '0'), store: form.store, expiryDate: form.expiryDate || undefined, category: form.category });
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Inventory Item</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Eggs" required /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div><label className="label">Quantity *</label><input className="input" type="number" min="0" step="any" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></div>
                        <div><label className="label">Unit</label>
                            <select className="input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                                {['g', 'kg', 'ml', 'L', 'pcs', 'pack', 'can', 'bag', 'cup', 'tbsp', 'tsp'].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div><label className="label">Min Qty</label><input className="input" type="number" min="0" step="any" value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value })} placeholder="0" /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label className="label">Store</label><input className="input" value={form.store} onChange={e => setForm({ ...form, store: e.target.value })} placeholder="e.g. Aldi, Lidl" /></div>
                        <div><label className="label">Expiry Date</label><input className="input" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Edit Inventory Item Modal ─────────────────────────────────────
function EditInventoryModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
    const { updateInventoryItem } = useFoodStore();
    const [form, setForm] = useState({
        name: item.name,
        quantity: item.quantity.toString(),
        unit: item.unit,
        minQuantity: item.minQuantity.toString(),
        store: item.store || '',
        expiryDate: item.expiryDate || '',
        category: item.category || ''
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.quantity) return;
        updateInventoryItem(item.id, {
            name: form.name,
            quantity: parseFloat(form.quantity),
            unit: form.unit,
            minQuantity: parseFloat(form.minQuantity || '0'),
            store: form.store || undefined,
            expiryDate: form.expiryDate || undefined,
            category: form.category || undefined
        });
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Edit Inventory Item</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Eggs" required /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div><label className="label">Quantity *</label><input className="input" type="number" min="0" step="any" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></div>
                        <div><label className="label">Unit</label>
                            <select className="input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                                {['g', 'kg', 'ml', 'L', 'pcs', 'pack', 'can', 'bag', 'cup', 'tbsp', 'tsp'].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div><label className="label">Min Qty</label><input className="input" type="number" min="0" step="any" value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value })} placeholder="0" /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label className="label">Store</label><input className="input" value={form.store} onChange={e => setForm({ ...form, store: e.target.value })} placeholder="e.g. Aldi, Lidl" /></div>
                        <div><label className="label">Expiry Date</label><input className="input" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Add Recipe Modal ─────────────────────────────────────────────
function AddRecipeModal({ onClose }: { onClose: () => void }) {
    const { addRecipe, inventory } = useFoodStore();
    const [form, setForm] = useState({
        title: '', description: '', prepTime: 15, cookTime: 15, servings: 2, category: '',
        instructions: [''],
        ingredients: [{ name: '', quantity: 1, unit: 'g', inventoryItemId: '' }] as RecipeIngredient[],
        calories: '', protein: '', carbs: '', fat: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) return;
        addRecipe({
            title: form.title,
            description: form.description,
            prepTime: form.prepTime,
            cookTime: form.cookTime,
            servings: form.servings,
            category: form.category || undefined,
            ingredients: form.ingredients.filter(i => i.name),
            instructions: form.instructions.filter(i => i),
            nutrition: form.calories || form.protein || form.carbs || form.fat ? {
                calories: form.calories ? parseFloat(form.calories) : undefined,
                protein: form.protein ? parseFloat(form.protein) : undefined,
                carbs: form.carbs ? parseFloat(form.carbs) : undefined,
                fat: form.fat ? parseFloat(form.fat) : undefined,
            } : undefined,
        });
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Recipe</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Recipe name" required /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div><label className="label">Prep (min)</label><input className="input" type="number" min="0" value={form.prepTime} onChange={e => setForm({ ...form, prepTime: +e.target.value })} /></div>
                        <div><label className="label">Cook (min)</label><input className="input" type="number" min="0" value={form.cookTime} onChange={e => setForm({ ...form, cookTime: +e.target.value })} /></div>
                        <div><label className="label">Servings</label><input className="input" type="number" min="1" value={form.servings} onChange={e => setForm({ ...form, servings: +e.target.value })} /></div>
                    </div>
                    {/* Nutrition stats */}
                    <div>
                        <label className="label">Nutrition (per serving)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                            <div><input className="input" type="number" min="0" placeholder="Calories (kcal)" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} /></div>
                            <div><input className="input" type="number" min="0" placeholder="Protein (g)" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} /></div>
                            <div><input className="input" type="number" min="0" placeholder="Carbs (g)" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} /></div>
                            <div><input className="input" type="number" min="0" placeholder="Fat (g)" value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} /></div>
                        </div>
                    </div>
                    {/* Ingredients */}
                    <div>
                        <label className="label">Ingredients</label>
                        {form.ingredients.map((ing, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: 8, marginBottom: 6 }}>
                                <input className="input" placeholder="Name" value={ing.name} onChange={e => {
                                    const upd = [...form.ingredients]; upd[idx] = { ...upd[idx], name: e.target.value }; setForm({ ...form, ingredients: upd });
                                }} />
                                <input className="input" type="number" min="0" step="any" placeholder="Qty" value={ing.quantity} onChange={e => {
                                    const upd = [...form.ingredients]; upd[idx] = { ...upd[idx], quantity: +e.target.value }; setForm({ ...form, ingredients: upd });
                                }} />
                                <select className="input" value={ing.unit} onChange={e => {
                                    const upd = [...form.ingredients]; upd[idx] = { ...upd[idx], unit: e.target.value }; setForm({ ...form, ingredients: upd });
                                }}>{['g', 'kg', 'ml', 'L', 'pcs', 'cup', 'tbsp', 'tsp'].map(u => <option key={u} value={u}>{u}</option>)}</select>
                                <select className="input" value={ing.inventoryItemId} onChange={e => {
                                    const upd = [...form.ingredients]; upd[idx] = { ...upd[idx], inventoryItemId: e.target.value, name: upd[idx].name || (inventory.find(i => i.id === e.target.value)?.name ?? '') }; setForm({ ...form, ingredients: upd });
                                }}>
                                    <option value="">Link to inventory…</option>
                                    {inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            </div>
                        ))}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, ingredients: [...form.ingredients, { name: '', quantity: 1, unit: 'g', inventoryItemId: '' }] })}><Plus size={14} />Add ingredient</button>
                    </div>
                    {/* Instructions */}
                    <div>
                        <label className="label">Instructions</label>
                        {form.instructions.map((step, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', minWidth: 20 }}>{idx + 1}.</span>
                                <input className="input" value={step} onChange={e => {
                                    const upd = [...form.instructions]; upd[idx] = e.target.value; setForm({ ...form, instructions: upd });
                                }} placeholder={`Step ${idx + 1}`} />
                            </div>
                        ))}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, instructions: [...form.instructions, ''] })}><Plus size={14} />Add step</button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Recipe</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Edit Recipe Modal ─────────────────────────────────────────────
function EditRecipeModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
    const { updateRecipe, inventory } = useFoodStore();
    const [form, setForm] = useState({
        title: recipe.title,
        description: recipe.description || '',
        prepTime: recipe.prepTime || 15,
        cookTime: recipe.cookTime || 15,
        servings: recipe.servings || 2,
        category: recipe.category || '',
        instructions: recipe.instructions?.length ? [...recipe.instructions] : [''],
        ingredients: recipe.ingredients?.length
            ? recipe.ingredients.map((i: any) => ({ ...i }))
            : [{ name: '', quantity: 1, unit: 'g', inventoryItemId: '' }] as RecipeIngredient[],
        calories: recipe.nutrition?.calories?.toString() || '',
        protein: recipe.nutrition?.protein?.toString() || '',
        carbs: recipe.nutrition?.carbs?.toString() || '',
        fat: recipe.nutrition?.fat?.toString() || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) return;
        updateRecipe(recipe.id, {
            title: form.title,
            description: form.description || undefined,
            prepTime: form.prepTime,
            cookTime: form.cookTime,
            servings: form.servings,
            category: form.category || undefined,
            ingredients: form.ingredients.filter(i => i.name),
            instructions: form.instructions.filter(i => i),
            nutrition: form.calories || form.protein || form.carbs || form.fat ? {
                calories: form.calories ? parseFloat(form.calories) : undefined,
                protein: form.protein ? parseFloat(form.protein) : undefined,
                carbs: form.carbs ? parseFloat(form.carbs) : undefined,
                fat: form.fat ? parseFloat(form.fat) : undefined,
            } : undefined,
        });
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Edit Recipe</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Recipe name" required /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div><label className="label">Prep (min)</label><input className="input" type="number" min="0" value={form.prepTime} onChange={e => setForm({ ...form, prepTime: +e.target.value })} /></div>
                        <div><label className="label">Cook (min)</label><input className="input" type="number" min="0" value={form.cookTime} onChange={e => setForm({ ...form, cookTime: +e.target.value })} /></div>
                        <div><label className="label">Servings</label><input className="input" type="number" min="1" value={form.servings} onChange={e => setForm({ ...form, servings: +e.target.value })} /></div>
                    </div>
                    {/* Nutrition stats */}
                    <div>
                        <label className="label">Nutrition (per serving)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                            <div><input className="input" type="number" min="0" placeholder="Calories (kcal)" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} /></div>
                            <div><input className="input" type="number" min="0" placeholder="Protein (g)" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} /></div>
                            <div><input className="input" type="number" min="0" placeholder="Carbs (g)" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} /></div>
                            <div><input className="input" type="number" min="0" placeholder="Fat (g)" value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} /></div>
                        </div>
                    </div>
                    {/* Ingredients */}
                    <div>
                        <label className="label">Ingredients</label>
                        {form.ingredients.map((ing, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: 8, marginBottom: 6 }}>
                                <input className="input" placeholder="Name" value={ing.name} onChange={e => {
                                    const upd = [...form.ingredients]; upd[idx] = { ...upd[idx], name: e.target.value }; setForm({ ...form, ingredients: upd });
                                }} />
                                <input className="input" type="number" min="0" step="any" placeholder="Qty" value={ing.quantity} onChange={e => {
                                    const upd = [...form.ingredients]; upd[idx] = { ...upd[idx], quantity: +e.target.value }; setForm({ ...form, ingredients: upd });
                                }} />
                                <select className="input" value={ing.unit} onChange={e => {
                                    const upd = [...form.ingredients]; upd[idx] = { ...upd[idx], unit: e.target.value }; setForm({ ...form, ingredients: upd });
                                }}>{['g', 'kg', 'ml', 'L', 'pcs', 'cup', 'tbsp', 'tsp'].map(u => <option key={u} value={u}>{u}</option>)}</select>
                                <select className="input" value={ing.inventoryItemId} onChange={e => {
                                    const upd = [...form.ingredients]; upd[idx] = { ...upd[idx], inventoryItemId: e.target.value, name: upd[idx].name || (inventory.find(i => i.id === e.target.value)?.name ?? '') }; setForm({ ...form, ingredients: upd });
                                }}>
                                    <option value="">Link to inventory…</option>
                                    {inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            </div>
                        ))}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, ingredients: [...form.ingredients, { name: '', quantity: 1, unit: 'g', inventoryItemId: '' }] })}><Plus size={14} />Add ingredient</button>
                    </div>
                    {/* Instructions */}
                    <div>
                        <label className="label">Instructions</label>
                        {form.instructions.map((step, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', minWidth: 20 }}>{idx + 1}.</span>
                                <input className="input" value={step} onChange={e => {
                                    const upd = [...form.instructions]; upd[idx] = e.target.value; setForm({ ...form, instructions: upd });
                                }} placeholder={`Step ${idx + 1}`} />
                            </div>
                        ))}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, instructions: [...form.instructions, ''] })}><Plus size={14} />Add step</button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}



// ── Meal Planner ─────────────────────────────────────────────────
function MealPlannerView() {
    const { mealPlan, recipes, addMealPlanEntry, cookMeal } = useFoodStore();
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: MealType } | null>(null);

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const getMeal = (date: string, mealType: MealType) =>
        mealPlan.find(m => m.date === date && m.mealType === mealType);

    // Today's total nutrition breakdown
    const todayDateStr = todayStr();
    const todayMeals = mealPlan.filter(m => m.date === todayDateStr);
    const todayNutrition = todayMeals.reduce((acc, m) => {
        if (m.recipeId) {
            const r = recipes.find(r => r.id === m.recipeId);
            if (r?.nutrition) {
                acc.calories += r.nutrition.calories ?? 0;
                acc.protein += r.nutrition.protein ?? 0;
                acc.carbs += r.nutrition.carbs ?? 0;
                acc.fat += r.nutrition.fat ?? 0;
            }
        }
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return (
        <div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 8 }}>
                    <thead>
                        <tr>
                            <th style={{ width: 100, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', padding: '8px 0' }}>MEAL</th>
                            {days.map(d => {
                                const dateStr = format(d, 'yyyy-MM-dd');
                                const dayMeals = mealPlan.filter(m => m.date === dateStr);
                                const dayCalories = dayMeals.reduce((acc, m) => {
                                    if (m.recipeId) {
                                        const r = recipes.find(r => r.id === m.recipeId);
                                        return acc + (r?.nutrition?.calories ?? 0);
                                    }
                                    return acc;
                                }, 0);

                                return (
                                    <th key={d.toISOString()} style={{ textAlign: 'center', fontSize: 12, padding: '8px 4px' }}>
                                        <div style={{ fontWeight: 600, color: dateStr === todayDateStr ? 'var(--accent-violet)' : 'var(--text-secondary)' }}>{format(d, 'EEE')}</div>
                                        <div style={{ fontWeight: 800, fontSize: 16, color: dateStr === todayDateStr ? 'var(--text-primary)' : 'var(--text-muted)' }}>{format(d, 'd')}</div>
                                        {dayCalories > 0 && (
                                            <div style={{ fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 600, marginTop: 4 }}>
                                                {dayCalories} kcal
                                            </div>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {MEAL_TYPES.map(mealType => (
                            <tr key={mealType}>
                                <td style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', padding: '4px 0' }}>
                                    {MEAL_ICONS[mealType]} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                </td>
                                {days.map(d => {
                                    const dateStr = format(d, 'yyyy-MM-dd');
                                    const entry = getMeal(dateStr, mealType);
                                    const recipe = entry?.recipeId ? recipes.find(r => r.id === entry.recipeId) : null;
                                    const recipeName = recipe ? recipe.title : entry?.customMeal;
                                    return (
                                        <td key={dateStr} style={{ padding: '4px' }}>
                                            <div
                                                className={`meal-slot${entry ? ' filled' : ''}`}
                                                onClick={() => !entry && setSelectedSlot({ date: dateStr, mealType })}
                                                style={{ minHeight: 72, borderRadius: 12 }}
                                            >
                                                {entry ? (
                                                    <div style={{ width: '100%' }}>
                                                        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={recipeName}>
                                                            {recipeName ?? 'Meal'}
                                                        </div>
                                                        {recipe?.nutrition?.calories && (
                                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                                                                {recipe.nutrition.calories} kcal
                                                            </div>
                                                        )}
                                                        {!entry.cooked && (
                                                            <button className="btn btn-primary" style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6 }} onClick={e => { e.stopPropagation(); cookMeal(entry.id); }}>
                                                                <Check size={10} />Cook
                                                            </button>
                                                        )}
                                                        {entry.cooked && <span className="badge" style={{ fontSize: 10, background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)' }}>Cooked</span>}
                                                    </div>
                                                ) : (
                                                    <Plus size={16} color="var(--text-muted)" />
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Today's Nutrition Summary Card */}
            {todayMeals.length > 0 && (
                <div className="card" style={{ padding: 16, marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TODAY'S PLANNED NUTRITION OUTLOOK</h4>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Date: {todayDateStr}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        {[
                            { label: 'Calories', value: `${todayNutrition.calories} kcal`, color: 'var(--accent-cyan)' },
                            { label: 'Protein', value: `${todayNutrition.protein} g`, color: 'var(--accent-violet-light)' },
                            { label: 'Carbohydrates', value: `${todayNutrition.carbs} g`, color: 'var(--accent-amber)' },
                            { label: 'Fats', value: `${todayNutrition.fat} g`, color: 'var(--accent-pink)' },
                        ].map(c => (
                            <div key={c.label} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 8 }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.label}</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: c.color, marginTop: 2 }}>{c.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Select recipe modal */}
            {selectedSlot && (
                <div className="modal-backdrop" onClick={() => setSelectedSlot(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Plan {selectedSlot.mealType} for {format(new Date(selectedSlot.date + 'T00:00:00'), 'EEE, MMM d')}</h3>
                        {recipes.length === 0 ? (
                            <div className="empty-state"><p>No recipes yet. Add some first!</p></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {recipes.map(r => (
                                    <button key={r.id} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => {
                                        addMealPlanEntry({ date: selectedSlot.date, mealType: selectedSlot.mealType, recipeId: r.id, recipeName: r.title, cooked: false });
                                        setSelectedSlot(null);
                                    }}>
                                        <ChefHat size={14} />{r.title} <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{r.prepTime + r.cookTime} min</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Food Page ─────────────────────────────────────────────────────
export function FoodPage() {
    const [tab, setTab] = useState<'inventory' | 'shopping' | 'recipes' | 'planner'>('inventory');
    const [modal, setModal] = useState<'inventory' | 'recipe' | null>(null);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const { inventory, recipes, shoppingList, deleteInventoryItem, deleteRecipe, toggleShoppingItem, removeShoppingItem, addShoppingItem, refreshShoppingList } = useFoodStore();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 className="section-title">Food</h2>
                    <p className="section-subtitle">Inventory, recipes, shopping, and meal planning</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {tab === 'inventory' && <button className="btn btn-primary" onClick={() => setModal('inventory')}><Plus size={16} />Add Item</button>}
                    {tab === 'recipes' && <button className="btn btn-primary" onClick={() => setModal('recipe')}><Plus size={16} />Add Recipe</button>}
                    {tab === 'shopping' && <button className="btn btn-secondary" onClick={refreshShoppingList}><ShoppingCart size={16} />Refresh from Inventory</button>}
                </div>
            </div>

            <div className="tabs" style={{ marginBottom: 20 }}>
                <button className={`tab ${tab === 'inventory' ? 'active' : ''}`} onClick={() => setTab('inventory')}><Apple size={14} />Inventory</button>
                <button className={`tab ${tab === 'shopping' ? 'active' : ''}`} onClick={() => setTab('shopping')}><ShoppingCart size={14} />Shopping</button>
                <button className={`tab ${tab === 'recipes' ? 'active' : ''}`} onClick={() => setTab('recipes')}><ChefHat size={14} />Recipes</button>
                <button className={`tab ${tab === 'planner' ? 'active' : ''}`} onClick={() => setTab('planner')}><CalendarDays size={14} />Meal Planner</button>
            </div>

            {tab === 'inventory' && (
                <div className="card" style={{ padding: 20 }}>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Item</th><th>Quantity</th><th>Min</th><th>Store</th><th>Expiry</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                            <tbody>
                                {inventory.length === 0 ? (
                                    <tr><td colSpan={7}><div className="empty-state"><Apple size={24} color="var(--text-muted)" /><p>No items in inventory</p></div></td></tr>
                                ) : inventory.map(item => {
                                    const isLow = item.quantity < item.minQuantity;
                                    return (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: 500 }}>{item.name}</td>
                                            <td style={{ color: isLow ? 'var(--accent-red)' : undefined, fontWeight: isLow ? 600 : undefined }}>{item.quantity} {item.unit}</td>
                                            <td className="text-muted">{item.minQuantity} {item.unit}</td>
                                            <td className="text-muted">{item.store ?? '—'}</td>
                                            <td className="text-muted">{item.expiryDate ? format(new Date(item.expiryDate + 'T00:00:00'), 'MMM d, yy') : '—'}</td>
                                            <td>
                                                <span className="badge" style={{ background: isLow ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: isLow ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                                                    {isLow ? 'Low' : 'OK'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditingItem(item)}><Edit2 size={14} /></button>
                                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteInventoryItem(item.id)}><Trash2 size={14} color="var(--accent-red)" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'shopping' && (
                <div>
                    <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
                        <form style={{ display: 'flex', gap: 10, flex: 1 }} onSubmit={e => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            const name = fd.get('name') as string;
                            if (name) { addShoppingItem({ name, quantity: 1, unit: 'pcs' }); (e.target as HTMLFormElement).reset(); }
                        }}>
                            <input className="input" name="name" placeholder="Add item manually..." style={{ flex: 1 }} />
                            <button type="submit" className="btn btn-secondary"><Plus size={16} />Add</button>
                        </form>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {shoppingList.length === 0 ? (
                            <div className="card empty-state" style={{ padding: 48 }}><div className="empty-state-icon"><ShoppingCart size={24} color="var(--text-muted)" /></div><h3>Shopping list is empty</h3><p>Click "Refresh from Inventory" to auto-generate items</p></div>
                        ) : shoppingList.map(item => (
                            <div key={item.id} className="card card-interactive" style={{ padding: 12 }} onClick={() => toggleShoppingItem(item.id)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid', borderColor: item.checked ? 'var(--accent-green)' : 'var(--border-strong)', background: item.checked ? 'var(--accent-green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {item.checked && <Check size={12} color="#fff" />}
                                    </div>
                                    <span style={{ flex: 1, textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: 14 }}>{item.name}</span>
                                    <span className="text-muted text-sm">{item.quantity} {item.unit}</span>
                                    {item.manual && <span className="chip">manual</span>}
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={e => { e.stopPropagation(); removeShoppingItem(item.id); }}><Trash2 size={14} color="var(--accent-red)" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'recipes' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {recipes.length === 0 ? (
                        <div className="card empty-state col-span-12" style={{ padding: 48 }}>
                            <div className="empty-state-icon"><ChefHat size={24} color="var(--text-muted)" /></div>
                            <h3>No recipes yet</h3><p>Add your first recipe to start meal planning</p>
                        </div>
                    ) : recipes.map(r => (
                        <div key={r.id} className="card" style={{ padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{r.title}</h3>
                                    <div className="text-xs text-muted" style={{ marginBottom: 6 }}>{r.prepTime + r.cookTime} min · {r.servings} servings</div>
                                    {r.nutrition && (
                                        <div style={{ fontSize: 11, color: 'var(--accent-cyan)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {r.nutrition.calories !== undefined && <span>🔥 {r.nutrition.calories} kcal</span>}
                                            {r.nutrition.protein !== undefined && <span>· P: {r.nutrition.protein}g</span>}
                                            {r.nutrition.carbs !== undefined && <span>· C: {r.nutrition.carbs}g</span>}
                                            {r.nutrition.fat !== undefined && <span>· F: {r.nutrition.fat}g</span>}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditingRecipe(r)}><Edit2 size={14} /></button>
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteRecipe(r.id)}><Trash2 size={14} color="var(--accent-red)" /></button>
                                </div>
                            </div>
                            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {r.ingredients.slice(0, 4).map((ing, i) => (
                                    <span key={i} className="chip">{ing.name}</span>
                                ))}
                                {r.ingredients.length > 4 && <span className="chip">+{r.ingredients.length - 4}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'planner' && <MealPlannerView />}

            {modal === 'inventory' && <AddInventoryModal onClose={() => setModal(null)} />}
            {modal === 'recipe' && <AddRecipeModal onClose={() => setModal(null)} />}
            {editingItem && <EditInventoryModal item={editingItem} onClose={() => setEditingItem(null)} />}
            {editingRecipe && <EditRecipeModal recipe={editingRecipe} onClose={() => setEditingRecipe(null)} />}
        </div>
    );
}
