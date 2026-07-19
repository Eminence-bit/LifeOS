import { supabase } from './supabase';
import { usePlanningStore } from '@/store/planningStore';
import { useFinanceStore } from '@/store/financeStore';
import { useFoodStore } from '@/store/foodStore';
import { useHealthStore } from '@/store/healthStore';
import { useLearningStore } from '@/store/learningStore';
import { useCareerStore } from '@/store/careerStore';
import { useDocumentsStore } from '@/store/documentsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { encryptApiKey, decryptApiKey } from './crypto';

// ─── helpers ────────────────────────────────────────────────────────────────

function logError(context: string, error: unknown) {
    console.error(`SyncEngine [${context}]:`, error);
}

/** Returns true if the string is a valid RFC 4122 UUID */
function isValidUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Only applies the setState when Supabase actually returned rows.
 * This prevents an empty result (tables not yet created, RLS mismatch, etc.)
 * from wiping data that is already persisted in localStorage.
 */
function safeSet<T>(data: T[] | null, apply: (rows: T[]) => void) {
    if (data && data.length > 0) {
        apply(data);
    }
}

// ─── SyncEngine ─────────────────────────────────────────────────────────────

class SyncEngine {
    private isInitialized = false;
    private isPulling = false;
    userId: string | null = null;
    private hasGeminiApiKeyColumn = true;

    initialize() {
        if (this.isInitialized || !supabase) return;
        this.isInitialized = true;

        supabase.auth.onAuthStateChange(async (event, session) => {
            useAuthStore.getState().setSession(session);

            if (session?.user) {
                this.userId = session.user.id;
                await this.pullFromCloud();
                await this.migrateLocalIds();
            } else {
                this.userId = null;
                useAuthStore.getState().setSession(null);
            }
        });
    }

    // ── ID Migration (one-time fix for pre-UUID localStorage data) ───────────

    /**
     * Scans all stores for items with non-UUID IDs (legacy short random strings).
     * Re-assigns proper UUIDs, fixes cross-references, and pushes to Supabase.
     * Safe to call repeatedly — only acts on items with invalid IDs.
     */
    private async migrateLocalIds() {
        let didMigrate = false;

        // ── Planning ──
        const planning = usePlanningStore.getState();

        // Build id map: oldId -> newId for tasks (goals reference task IDs)
        const taskIdMap = new Map<string, string>();
        const migratedTasks = planning.tasks.map(t => {
            if (isValidUUID(t.id)) return t;
            const newId = crypto.randomUUID();
            taskIdMap.set(t.id, newId);
            didMigrate = true;
            return { ...t, id: newId };
        });
        if (taskIdMap.size > 0) {
            usePlanningStore.setState({ tasks: migratedTasks });
            for (const t of migratedTasks) await this.pushTask(t);
        }

        const goalIdMap = new Map<string, string>();
        const migratedGoals = planning.goals.map(g => {
            const needsNewId = !isValidUUID(g.id);
            const newId = needsNewId ? crypto.randomUUID() : g.id;
            if (needsNewId) { goalIdMap.set(g.id, newId); didMigrate = true; }
            // Fix task_ids cross-references
            const fixedTaskIds = (g.taskIds || []).map(tid => taskIdMap.get(tid) ?? tid);
            return { ...g, id: newId, taskIds: fixedTaskIds };
        });
        if (goalIdMap.size > 0 || taskIdMap.size > 0) {
            usePlanningStore.setState({ goals: migratedGoals });
            for (const g of migratedGoals) await this.pushGoal(g);
        }

        const migratedEvents = planning.events.map(e => {
            if (isValidUUID(e.id)) return e;
            didMigrate = true;
            return { ...e, id: crypto.randomUUID() };
        });
        if (migratedEvents.some((e, i) => e.id !== planning.events[i]?.id)) {
            usePlanningStore.setState({ events: migratedEvents });
            for (const e of migratedEvents) await this.pushEvent(e);
        }

        // ── Finance ──
        const finance = useFinanceStore.getState();
        const migratedExpenses = finance.expenses.map(e => isValidUUID(e.id) ? e : (didMigrate = true, { ...e, id: crypto.randomUUID() }));
        if (migratedExpenses.some((e, i) => e.id !== finance.expenses[i]?.id)) {
            useFinanceStore.setState({ expenses: migratedExpenses });
            for (const e of migratedExpenses) await this.pushExpense(e);
        }
        const migratedIncomes = finance.incomes.map(i => isValidUUID(i.id) ? i : (didMigrate = true, { ...i, id: crypto.randomUUID() }));
        if (migratedIncomes.some((i, idx) => i.id !== finance.incomes[idx]?.id)) {
            useFinanceStore.setState({ incomes: migratedIncomes });
            for (const i of migratedIncomes) await this.pushIncome(i);
        }
        const migratedBudgets = finance.budgets.map(b => isValidUUID(b.id) ? b : (didMigrate = true, { ...b, id: crypto.randomUUID() }));
        if (migratedBudgets.some((b, i) => b.id !== finance.budgets[i]?.id)) {
            useFinanceStore.setState({ budgets: migratedBudgets });
            for (const b of migratedBudgets) await this.pushBudget(b);
        }
        const migratedSavings = finance.savingsGoals.map(s => isValidUUID(s.id) ? s : (didMigrate = true, { ...s, id: crypto.randomUUID() }));
        if (migratedSavings.some((s, i) => s.id !== finance.savingsGoals[i]?.id)) {
            useFinanceStore.setState({ savingsGoals: migratedSavings });
            for (const s of migratedSavings) await this.pushSavingsGoal(s);
        }

        // ── Food ──
        const food = useFoodStore.getState();
        const inventoryIdMap = new Map<string, string>();
        const migratedInventory = food.inventory.map(i => {
            if (isValidUUID(i.id)) return i;
            const newId = crypto.randomUUID();
            inventoryIdMap.set(i.id, newId);
            didMigrate = true;
            return { ...i, id: newId };
        });
        if (inventoryIdMap.size > 0) {
            useFoodStore.setState({ inventory: migratedInventory });
            for (const i of migratedInventory) await this.pushInventoryItem(i);
        }
        // Only migrate manual shopping items (auto-* are derived and never stored)
        const migratedShopping = food.shoppingList
            .filter(i => !i.id.startsWith('auto-'))
            .map(i => isValidUUID(i.id) ? i : (didMigrate = true, { ...i, id: crypto.randomUUID() }));
        if (migratedShopping.some((s, i) => s.id !== food.shoppingList.filter(x => !x.id.startsWith('auto-'))[i]?.id)) {
            useFoodStore.setState({
                shoppingList: [
                    ...food.shoppingList.filter(i => i.id.startsWith('auto-')),
                    ...migratedShopping
                ]
            });
            for (const s of migratedShopping) await this.pushShoppingItem(s);
        }
        const recipeIdMap = new Map<string, string>();
        const migratedRecipes = food.recipes.map(r => {
            if (isValidUUID(r.id)) return r;
            const newId = crypto.randomUUID();
            recipeIdMap.set(r.id, newId);
            didMigrate = true;
            return { ...r, id: newId };
        });
        if (recipeIdMap.size > 0) {
            useFoodStore.setState({ recipes: migratedRecipes });
            for (const r of migratedRecipes) await this.pushRecipe(r);
        }
        const migratedMeals = food.mealPlan.map(m => {
            const needsNewId = !isValidUUID(m.id);
            const newId = needsNewId ? crypto.randomUUID() : m.id;
            if (needsNewId) didMigrate = true;
            const fixedRecipeId = m.recipeId ? (recipeIdMap.get(m.recipeId) ?? m.recipeId) : m.recipeId;
            return { ...m, id: newId, recipeId: fixedRecipeId };
        });
        if (migratedMeals.some((m, i) => m.id !== food.mealPlan[i]?.id)) {
            useFoodStore.setState({ mealPlan: migratedMeals });
            for (const m of migratedMeals) await this.pushMealPlan(m);
        }

        // ── Health ──
        const health = useHealthStore.getState();
        const migratedWorkouts = health.workoutLogs.map(w => isValidUUID(w.id) ? w : (didMigrate = true, { ...w, id: crypto.randomUUID() }));
        if (migratedWorkouts.some((w, i) => w.id !== health.workoutLogs[i]?.id)) {
            useHealthStore.setState({ workoutLogs: migratedWorkouts });
            for (const w of migratedWorkouts) await this.pushWorkoutLog(w);
        }
        const migratedMetrics = health.bodyMetrics.map(b => isValidUUID(b.id) ? b : (didMigrate = true, { ...b, id: crypto.randomUUID() }));
        if (migratedMetrics.some((b, i) => b.id !== health.bodyMetrics[i]?.id)) {
            useHealthStore.setState({ bodyMetrics: migratedMetrics });
            for (const b of migratedMetrics) await this.pushBodyMetric(b);
        }
        const migratedWater = health.waterIntakes.map(w => isValidUUID(w.id) ? w : (didMigrate = true, { ...w, id: crypto.randomUUID() }));
        if (migratedWater.some((w, i) => w.id !== health.waterIntakes[i]?.id)) {
            useHealthStore.setState({ waterIntakes: migratedWater });
            for (const w of migratedWater) await this.pushWaterIntake(w);
        }
        const migratedSleep = health.sleepLogs.map(s => isValidUUID(s.id) ? s : (didMigrate = true, { ...s, id: crypto.randomUUID() }));
        if (migratedSleep.some((s, i) => s.id !== health.sleepLogs[i]?.id)) {
            useHealthStore.setState({ sleepLogs: migratedSleep });
            for (const s of migratedSleep) await this.pushSleepLog(s);
        }

        // ── Learning ──
        const learning = useLearningStore.getState();
        const topicIdMap = new Map<string, string>();
        const migratedTopics = learning.topics.map(t => {
            if (isValidUUID(t.id)) return t;
            const newId = crypto.randomUUID();
            topicIdMap.set(t.id, newId);
            didMigrate = true;
            return { ...t, id: newId };
        });
        if (topicIdMap.size > 0) {
            useLearningStore.setState({ topics: migratedTopics });
            for (const t of migratedTopics) await this.pushLearningTopic(t);
        }
        const migratedSessions = learning.studySessions.map(s => {
            const needsNewId = !isValidUUID(s.id);
            if (needsNewId) didMigrate = true;
            const fixedTopicId = s.topicId ? (topicIdMap.get(s.topicId) ?? s.topicId) : s.topicId;
            return { ...s, id: needsNewId ? crypto.randomUUID() : s.id, topicId: fixedTopicId };
        });
        if (migratedSessions.some((s, i) => s.id !== learning.studySessions[i]?.id)) {
            useLearningStore.setState({ studySessions: migratedSessions });
            for (const s of migratedSessions) await this.pushStudySession(s);
        }
        const migratedVocab = learning.vocabulary.map(v => {
            const needsNewId = !isValidUUID(v.id);
            if (needsNewId) didMigrate = true;
            const fixedTopicId = v.topicId ? (topicIdMap.get(v.topicId) ?? v.topicId) : v.topicId;
            return { ...v, id: needsNewId ? crypto.randomUUID() : v.id, topicId: fixedTopicId };
        });
        if (migratedVocab.some((v, i) => v.id !== learning.vocabulary[i]?.id)) {
            useLearningStore.setState({ vocabulary: migratedVocab });
            for (const v of migratedVocab) await this.pushVocabularyItem(v);
        }

        // ── Career ──
        const career = useCareerStore.getState();
        const migratedJobs = career.applications.map(j => isValidUUID(j.id) ? j : (didMigrate = true, { ...j, id: crypto.randomUUID() }));
        if (migratedJobs.some((j, i) => j.id !== career.applications[i]?.id)) {
            useCareerStore.setState({ applications: migratedJobs });
            for (const j of migratedJobs) await this.pushJobApplication(j);
        }
        const migratedProjects = career.projects.map(p => isValidUUID(p.id) ? p : (didMigrate = true, { ...p, id: crypto.randomUUID() }));
        if (migratedProjects.some((p, i) => p.id !== career.projects[i]?.id)) {
            useCareerStore.setState({ projects: migratedProjects });
            for (const p of migratedProjects) await this.pushProject(p);
        }
        const migratedCerts = career.certificates.map(c => isValidUUID(c.id) ? c : (didMigrate = true, { ...c, id: crypto.randomUUID() }));
        if (migratedCerts.some((c, i) => c.id !== career.certificates[i]?.id)) {
            useCareerStore.setState({ certificates: migratedCerts });
            for (const c of migratedCerts) await this.pushCertificate(c);
        }
        const migratedSkills = career.skills.map(s => isValidUUID(s.id) ? s : (didMigrate = true, { ...s, id: crypto.randomUUID() }));
        if (migratedSkills.some((s, i) => s.id !== career.skills[i]?.id)) {
            useCareerStore.setState({ skills: migratedSkills });
            for (const s of migratedSkills) await this.pushCareerSkill(s);
        }

        // ── Documents ──
        const docs = useDocumentsStore.getState();
        const migratedDocs = docs.documents.map(d => isValidUUID(d.id) ? d : (didMigrate = true, { ...d, id: crypto.randomUUID() }));
        if (migratedDocs.some((d, i) => d.id !== docs.documents[i]?.id)) {
            useDocumentsStore.setState({ documents: migratedDocs });
            for (const d of migratedDocs) await this.pushDocument(d);
        }

        if (didMigrate) {
            console.log('SyncEngine: legacy ID migration complete — all items now have valid UUIDs and are synced to Supabase.');
        }
    }

    // ── Pull ─────────────────────────────────────────────────────────────────

    async pullFromCloud() {
        if (!supabase || !this.userId || this.isPulling) return;
        this.isPulling = true;

        try {
            console.log('SyncEngine: pulling from cloud...');

            // 1. Settings & Profile
            const { data: dbSettings, error: settingsErr } = await supabase
                .from('settings').select('*').eq('id', this.userId).single();
            if (settingsErr) logError('pull/settings', settingsErr);
            if (dbSettings) {
                this.hasGeminiApiKeyColumn = 'gemini_api_key' in dbSettings;
                const { data: dbProfile } = await supabase
                    .from('profiles').select('*').eq('id', this.userId).single();

                const localSettings = useSettingsStore.getState().settings;
                const resolvedApiKey = this.hasGeminiApiKeyColumn
                    ? (dbSettings.gemini_api_key ? decryptApiKey(dbSettings.gemini_api_key, this.userId) : '')
                    : (localSettings.geminiApiKey || '');

                useSettingsStore.setState({
                    settings: {
                        id: dbSettings.id,
                        theme: dbSettings.theme,
                        themeStyle: dbSettings.theme_style || 'cozy-earth',
                        disableDynamicAccents: dbSettings.disable_dynamic_accents ?? false,
                        currency: dbSettings.currency,
                        timezone: dbSettings.timezone,
                        weekStartsOn: dbSettings.week_starts_on,
                        notifications: dbSettings.notifications,
                        quickNotes: dbSettings.quick_notes,
                        geminiApiKey: resolvedApiKey,
                        createdAt: dbSettings.created_at || new Date().toISOString(),
                        updatedAt: dbSettings.updated_at || new Date().toISOString(),
                        userProfile: dbProfile ? {
                            name: dbProfile.name,
                            email: dbProfile.email,
                            avatarColor: dbProfile.avatar_color,
                            bio: dbProfile.bio
                        } : undefined
                    }
                });
            }

            // 2. Planning
            const { data: dbTasks, error: tasksErr } = await supabase.from('tasks').select('*');
            if (tasksErr) logError('pull/tasks', tasksErr);
            safeSet(dbTasks, (rows) => usePlanningStore.setState({
                tasks: rows.map(t => ({
                    id: t.id, title: t.title, description: t.description,
                    priority: t.priority, status: t.status, dueDate: t.due_date,
                    category: t.category, goalId: t.goal_id, tags: t.tags || [],
                    createdAt: t.created_at, updatedAt: t.updated_at
                }))
            }));

            const { data: dbEvents, error: eventsErr } = await supabase.from('events').select('*');
            if (eventsErr) logError('pull/events', eventsErr);
            safeSet(dbEvents, (rows) => usePlanningStore.setState({
                events: rows.map(e => ({
                    id: e.id, title: e.title, description: e.description,
                    startDate: e.start_date, endDate: e.end_date, allDay: e.all_day,
                    recurring: e.recurring, color: e.color, category: e.category,
                    createdAt: e.created_at, updatedAt: e.updated_at
                }))
            }));

            const { data: dbGoals, error: goalsErr } = await supabase.from('goals').select('*');
            if (goalsErr) logError('pull/goals', goalsErr);
            safeSet(dbGoals, (rows) => usePlanningStore.setState({
                goals: rows.map(g => ({
                    id: g.id, title: g.title, description: g.description,
                    targetDate: g.target_date, progress: g.progress,
                    category: g.category, taskIds: g.task_ids || [],
                    createdAt: g.created_at, updatedAt: g.updated_at
                }))
            }));

            // 3. Finance
            const { data: dbExpenses, error: expErr } = await supabase.from('expenses').select('*');
            if (expErr) logError('pull/expenses', expErr);
            safeSet(dbExpenses, (rows) => useFinanceStore.setState({
                expenses: rows.map(e => ({
                    id: e.id, title: e.title, amount: Number(e.amount),
                    category: e.category, date: e.date, recurring: e.recurring,
                    notes: e.notes, createdAt: e.created_at, updatedAt: e.updated_at
                }))
            }));

            const { data: dbIncomes, error: incErr } = await supabase.from('incomes').select('*');
            if (incErr) logError('pull/incomes', incErr);
            safeSet(dbIncomes, (rows) => useFinanceStore.setState({
                incomes: rows.map(i => ({
                    id: i.id, title: i.title, amount: Number(i.amount),
                    date: i.date, recurring: i.recurring, source: i.source,
                    notes: i.notes, createdAt: i.created_at, updatedAt: i.updated_at
                }))
            }));

            const { data: dbBudgets, error: budErr } = await supabase.from('budgets').select('*');
            if (budErr) logError('pull/budgets', budErr);
            safeSet(dbBudgets, (rows) => useFinanceStore.setState({
                budgets: rows.map(b => ({
                    id: b.id, category: b.category, limit: Number(b.limit_amount),
                    month: b.month, createdAt: b.created_at, updatedAt: b.created_at
                }))
            }));

            const { data: dbSavings, error: savErr } = await supabase.from('savings_goals').select('*');
            if (savErr) logError('pull/savings_goals', savErr);
            safeSet(dbSavings, (rows) => useFinanceStore.setState({
                savingsGoals: rows.map(s => ({
                    id: s.id, title: s.title, targetAmount: Number(s.target_amount),
                    currentAmount: Number(s.current_amount), targetDate: s.target_date,
                    description: s.description, createdAt: s.created_at, updatedAt: s.updated_at
                }))
            }));

            // 4. Food
            const { data: dbInventory, error: invErr } = await supabase.from('inventory_items').select('*');
            if (invErr) logError('pull/inventory_items', invErr);
            safeSet(dbInventory, (rows) => useFoodStore.setState({
                inventory: rows.map(i => ({
                    id: i.id, name: i.name, quantity: Number(i.quantity), unit: i.unit,
                    minQuantity: Number(i.min_quantity), store: i.store,
                    expiryDate: i.expiry_date, category: i.category,
                    createdAt: i.created_at, updatedAt: i.updated_at
                }))
            }));

            const { data: dbShopping, error: shopErr } = await supabase.from('shopping_items').select('*');
            if (shopErr) logError('pull/shopping_items', shopErr);
            safeSet(dbShopping, (rows) => useFoodStore.setState({
                shoppingList: rows.map(s => ({
                    id: s.id, name: s.name, quantity: Number(s.quantity),
                    unit: s.unit, checked: s.bought || false, manual: true
                }))
            }));

            const { data: dbRecipes, error: recErr } = await supabase.from('recipes').select('*');
            if (recErr) logError('pull/recipes', recErr);
            safeSet(dbRecipes, (rows) => useFoodStore.setState({
                recipes: rows.map(r => ({
                    id: r.id, title: r.title, description: r.description,
                    ingredients: r.ingredients || [], instructions: r.instructions || [],
                    prepTime: r.prep_time, cookTime: r.cook_time, servings: r.servings,
                    category: r.category,
                    nutrition: r.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    imageUrl: r.image_url, createdAt: r.created_at, updatedAt: r.updated_at
                }))
            }));

            const { data: dbMeals, error: mealErr } = await supabase.from('meal_plans').select('*');
            if (mealErr) logError('pull/meal_plans', mealErr);
            safeSet(dbMeals, (rows) => useFoodStore.setState({
                mealPlan: rows.map(m => ({
                    id: m.id, date: m.date, mealType: m.meal_type, recipeId: m.recipe_id,
                    recipeName: m.recipe_name, customMeal: m.custom_meal, cooked: m.cooked,
                    createdAt: m.created_at, updatedAt: m.updated_at
                }))
            }));

            // 5. Health
            const { data: dbWorkouts, error: wrkErr } = await supabase.from('workout_logs').select('*');
            if (wrkErr) logError('pull/workout_logs', wrkErr);
            safeSet(dbWorkouts, (rows) => useHealthStore.setState({
                workoutLogs: rows.map(w => ({
                    id: w.id, date: w.date, exercises: w.exercises || [],
                    duration: w.duration, notes: w.notes, caloriesBurned: w.calories_burned,
                    createdAt: w.created_at, updatedAt: w.updated_at
                }))
            }));

            const { data: dbBodyMetrics, error: bmErr } = await supabase.from('body_metrics').select('*');
            if (bmErr) logError('pull/body_metrics', bmErr);
            safeSet(dbBodyMetrics, (rows) => useHealthStore.setState({
                bodyMetrics: rows.map(b => ({
                    id: b.id, date: b.date, weight: b.weight ? Number(b.weight) : undefined,
                    height: b.height ? Number(b.height) : undefined,
                    chest: b.chest ? Number(b.chest) : undefined,
                    waist: b.waist ? Number(b.waist) : undefined,
                    hips: b.hips ? Number(b.hips) : undefined,
                    bodyFat: b.body_fat ? Number(b.body_fat) : undefined,
                    createdAt: b.created_at, updatedAt: b.updated_at
                }))
            }));

            const { data: dbWater, error: watErr } = await supabase.from('water_intakes').select('*');
            if (watErr) logError('pull/water_intakes', watErr);
            safeSet(dbWater, (rows) => useHealthStore.setState({
                waterIntakes: rows.map(w => ({
                    id: w.id, date: w.date, amount: w.amount,
                    createdAt: w.created_at, updatedAt: w.updated_at
                }))
            }));

            const { data: dbSleep, error: slpErr } = await supabase.from('sleep_logs').select('*');
            if (slpErr) logError('pull/sleep_logs', slpErr);
            safeSet(dbSleep, (rows) => useHealthStore.setState({
                sleepLogs: rows.map(s => ({
                    id: s.id, date: s.date, bedTime: s.bed_time, wakeTime: s.wake_time,
                    duration: Number(s.duration), quality: s.quality, notes: s.notes,
                    createdAt: s.created_at, updatedAt: s.updated_at
                }))
            }));

            // 6. Learning
            const { data: dbTopics, error: topErr } = await supabase.from('learning_topics').select('*');
            if (topErr) logError('pull/learning_topics', topErr);
            safeSet(dbTopics, (rows) => useLearningStore.setState({
                topics: rows.map(t => ({
                    id: t.id, name: t.name, description: t.description,
                    category: t.category, color: t.color, progress: t.progress,
                    targetDate: t.target_date, createdAt: t.created_at, updatedAt: t.updated_at
                }))
            }));

            const { data: dbSessions, error: sesErr } = await supabase.from('study_sessions').select('*');
            if (sesErr) logError('pull/study_sessions', sesErr);
            safeSet(dbSessions, (rows) => useLearningStore.setState({
                studySessions: rows.map(s => ({
                    id: s.id, date: s.date, topicId: s.topic_id, duration: s.duration,
                    notes: s.notes, createdAt: s.created_at, updatedAt: s.updated_at
                }))
            }));

            const { data: dbVocab, error: vocErr } = await supabase.from('vocabulary_items').select('*');
            if (vocErr) logError('pull/vocabulary_items', vocErr);
            safeSet(dbVocab, (rows) => useLearningStore.setState({
                vocabulary: rows.map(v => ({
                    id: v.id, word: v.word, translation: v.translation, example: v.example,
                    topicId: v.topic_id, language: v.language, mastered: v.mastered,
                    reviewCount: v.review_count, nextReview: v.next_review,
                    createdAt: v.created_at, updatedAt: v.updated_at
                }))
            }));

            // 7. Career
            const { data: dbJobs, error: jobErr } = await supabase.from('job_applications').select('*');
            if (jobErr) logError('pull/job_applications', jobErr);
            safeSet(dbJobs, (rows) => useCareerStore.setState({
                applications: rows.map(j => ({
                    id: j.id, company: j.company, role: j.role, status: j.status,
                    appliedDate: j.applied_date, deadline: j.deadline, notes: j.notes,
                    url: j.url, salary: j.salary, location: j.location, remote: j.remote,
                    createdAt: j.created_at, updatedAt: j.updated_at
                }))
            }));

            const { data: dbProjects, error: projErr } = await supabase.from('projects').select('*');
            if (projErr) logError('pull/projects', projErr);
            safeSet(dbProjects, (rows) => useCareerStore.setState({
                projects: rows.map(p => ({
                    id: p.id, title: p.title, description: p.description, status: p.status,
                    startDate: p.start_date, endDate: p.end_date, technologies: p.technologies || [],
                    url: p.url, githubUrl: p.github_url,
                    createdAt: p.created_at, updatedAt: p.updated_at
                }))
            }));

            const { data: dbCerts, error: certErr } = await supabase.from('certificates').select('*');
            if (certErr) logError('pull/certificates', certErr);
            safeSet(dbCerts, (rows) => useCareerStore.setState({
                certificates: rows.map(c => ({
                    id: c.id, title: c.title, issuer: c.issuer, issueDate: c.issue_date,
                    expiryDate: c.expiry_date, credentialId: c.credential_id, url: c.url,
                    category: c.category, createdAt: c.created_at, updatedAt: c.updated_at
                }))
            }));

            const { data: dbSkills, error: sklErr } = await supabase.from('career_skills').select('*');
            if (sklErr) logError('pull/career_skills', sklErr);
            safeSet(dbSkills, (rows) => useCareerStore.setState({
                skills: rows.map(s => ({
                    id: s.id, name: s.name, level: s.level, category: s.category,
                    yearsOfExperience: s.years_of_experience ? Number(s.years_of_experience) : undefined,
                    createdAt: s.created_at, updatedAt: s.updated_at
                }))
            }));

            // 8. Documents
            const { data: dbDocs, error: docErr } = await supabase.from('documents').select('*');
            if (docErr) logError('pull/documents', docErr);
            safeSet(dbDocs, (rows) => useDocumentsStore.setState({
                documents: rows.map(d => ({
                    id: d.id, title: d.title, type: d.type, issuer: d.issuer,
                    issueDate: d.issue_date, expiryDate: d.expiry_date,
                    documentNumber: d.document_number, country: d.country,
                    notes: d.notes, fileUrl: d.file_url, status: d.status,
                    createdAt: d.created_at, updatedAt: d.updated_at
                }))
            }));

            console.log('SyncEngine: pull complete.');
        } catch (err) {
            logError('pullFromCloud', err);
        } finally {
            this.isPulling = false;
        }
    }

    // ── Push helpers (called directly by store actions) ──────────────────────

    private get client() { return supabase; }

    private async upsert(table: string, row: Record<string, unknown>) {
        if (!this.client || !this.userId) return;
        // Hard guard: never send non-UUID IDs to Supabase
        if (typeof row.id !== 'string' || !isValidUUID(row.id)) {
            console.warn(`SyncEngine: skipping upsert to '${table}' — invalid UUID: ${row.id}`);
            return;
        }
        const { error } = await this.client.from(table).upsert({ ...row, profile_id: this.userId });
        if (error) logError(`upsert/${table}`, error);
    }

    private async remove(table: string, id: string) {
        if (!this.client || !this.userId) return;
        // Hard guard: never delete with non-UUID IDs
        if (!isValidUUID(id)) {
            console.warn(`SyncEngine: skipping delete from '${table}' — invalid UUID: ${id}`);
            return;
        }
        const { error } = await this.client.from(table).delete().eq('id', id);
        if (error) logError(`delete/${table}`, error);
    }


    // ── Planning ─────────────────────────────────────────────────────────────

    async pushTask(t: { id: string; title: string; description?: string; priority: string; status: string; dueDate?: string; category?: string; goalId?: string; tags?: string[] }) {
        await this.upsert('tasks', { id: t.id, title: t.title, description: t.description, priority: t.priority, status: t.status, due_date: t.dueDate, category: t.category, goal_id: t.goalId, tags: t.tags });
    }
    async deleteTask(id: string) { await this.remove('tasks', id); }

    async pushEvent(e: { id: string; title: string; description?: string; startDate: string; endDate?: string; allDay?: boolean; recurring?: string; color?: string; category?: string }) {
        await this.upsert('events', { id: e.id, title: e.title, description: e.description, start_date: e.startDate, end_date: e.endDate, all_day: e.allDay, recurring: e.recurring, color: e.color, category: e.category });
    }
    async deleteEvent(id: string) { await this.remove('events', id); }

    async pushGoal(g: { id: string; title: string; description?: string; targetDate?: string; progress?: number; category?: string; taskIds?: string[] }) {
        await this.upsert('goals', { id: g.id, title: g.title, description: g.description, target_date: g.targetDate, progress: g.progress, category: g.category, task_ids: g.taskIds });
    }
    async deleteGoal(id: string) { await this.remove('goals', id); }

    // ── Finance ──────────────────────────────────────────────────────────────

    async pushExpense(e: { id: string; title: string; amount: number; category: string; date: string; recurring?: string; notes?: string }) {
        await this.upsert('expenses', { id: e.id, title: e.title, amount: e.amount, category: e.category, date: e.date, recurring: e.recurring, notes: e.notes });
    }
    async deleteExpense(id: string) { await this.remove('expenses', id); }

    async pushIncome(i: { id: string; title: string; amount: number; date: string; recurring?: string; source?: string; notes?: string }) {
        await this.upsert('incomes', { id: i.id, title: i.title, amount: i.amount, date: i.date, recurring: i.recurring, source: i.source, notes: i.notes });
    }
    async deleteIncome(id: string) { await this.remove('incomes', id); }

    async pushBudget(b: { id: string; category: string; limit: number; month: string }) {
        await this.upsert('budgets', { id: b.id, category: b.category, limit_amount: b.limit, month: b.month });
    }
    async deleteBudget(id: string) { await this.remove('budgets', id); }

    async pushSavingsGoal(s: { id: string; title: string; targetAmount: number; currentAmount: number; targetDate?: string; description?: string }) {
        await this.upsert('savings_goals', { id: s.id, title: s.title, target_amount: s.targetAmount, current_amount: s.currentAmount, target_date: s.targetDate, description: s.description });
    }
    async deleteSavingsGoal(id: string) { await this.remove('savings_goals', id); }

    // ── Food ─────────────────────────────────────────────────────────────────

    async pushInventoryItem(i: { id: string; name: string; quantity: number; unit: string; minQuantity: number; store?: string; expiryDate?: string; category?: string }) {
        await this.upsert('inventory_items', { id: i.id, name: i.name, quantity: i.quantity, unit: i.unit, min_quantity: i.minQuantity, store: i.store, expiry_date: i.expiryDate, category: i.category });
    }
    async deleteInventoryItem(id: string) { await this.remove('inventory_items', id); }

    async pushShoppingItem(i: { id: string; name: string; quantity: number; unit: string; checked: boolean }) {
        await this.upsert('shopping_items', { id: i.id, name: i.name, quantity: i.quantity, unit: i.unit, bought: i.checked });
    }
    async deleteShoppingItem(id: string) { await this.remove('shopping_items', id); }

    async pushRecipe(r: { id: string; title: string; description?: string; ingredients: unknown; instructions: string[]; prepTime?: number; cookTime?: number; servings?: number; category?: string; nutrition?: unknown; imageUrl?: string }) {
        await this.upsert('recipes', { id: r.id, title: r.title, description: r.description, ingredients: r.ingredients, instructions: r.instructions, prep_time: r.prepTime, cook_time: r.cookTime, servings: r.servings, category: r.category, nutrition: r.nutrition, image_url: r.imageUrl });
    }
    async deleteRecipe(id: string) { await this.remove('recipes', id); }

    async pushMealPlan(m: { id: string; date: string; mealType: string; recipeId?: string; recipeName?: string; customMeal?: string; cooked?: boolean }) {
        await this.upsert('meal_plans', { id: m.id, date: m.date, meal_type: m.mealType, recipe_id: m.recipeId, recipe_name: m.recipeName, custom_meal: m.customMeal, cooked: m.cooked });
    }
    async deleteMealPlan(id: string) { await this.remove('meal_plans', id); }

    // ── Health ───────────────────────────────────────────────────────────────

    async pushWorkoutLog(w: { id: string; date: string; exercises: unknown; duration?: number; notes?: string; caloriesBurned?: number }) {
        await this.upsert('workout_logs', { id: w.id, date: w.date, exercises: w.exercises, duration: w.duration, notes: w.notes, calories_burned: w.caloriesBurned });
    }
    async deleteWorkoutLog(id: string) { await this.remove('workout_logs', id); }

    async pushBodyMetric(b: { id: string; date: string; weight?: number; height?: number; chest?: number; waist?: number; hips?: number; bodyFat?: number }) {
        await this.upsert('body_metrics', { id: b.id, date: b.date, weight: b.weight, height: b.height, chest: b.chest, waist: b.waist, hips: b.hips, body_fat: b.bodyFat });
    }
    async deleteBodyMetric(id: string) { await this.remove('body_metrics', id); }

    async pushWaterIntake(w: { id: string; date: string; amount: number }) {
        await this.upsert('water_intakes', { id: w.id, date: w.date, amount: w.amount });
    }
    async deleteWaterIntake(id: string) { await this.remove('water_intakes', id); }

    async pushSleepLog(s: { id: string; date: string; bedTime: string; wakeTime: string; duration: number; quality: number; notes?: string }) {
        await this.upsert('sleep_logs', { id: s.id, date: s.date, bed_time: s.bedTime, wake_time: s.wakeTime, duration: s.duration, quality: s.quality, notes: s.notes });
    }
    async deleteSleepLog(id: string) { await this.remove('sleep_logs', id); }

    // ── Learning ─────────────────────────────────────────────────────────────

    async pushLearningTopic(t: { id: string; name: string; description?: string; category: string; color?: string; progress?: number; targetDate?: string }) {
        await this.upsert('learning_topics', { id: t.id, name: t.name, description: t.description, category: t.category, color: t.color, progress: t.progress, target_date: t.targetDate });
    }
    async deleteLearningTopic(id: string) { await this.remove('learning_topics', id); }

    async pushStudySession(s: { id: string; date: string; topicId?: string; duration: number; notes?: string }) {
        await this.upsert('study_sessions', { id: s.id, date: s.date, topic_id: s.topicId, duration: s.duration, notes: s.notes });
    }
    async deleteStudySession(id: string) { await this.remove('study_sessions', id); }

    async pushVocabularyItem(v: { id: string; word: string; translation: string; example?: string; topicId?: string; language: string; mastered?: boolean; reviewCount?: number; nextReview?: string }) {
        await this.upsert('vocabulary_items', { id: v.id, word: v.word, translation: v.translation, example: v.example, topic_id: v.topicId, language: v.language, mastered: v.mastered, review_count: v.reviewCount, next_review: v.nextReview });
    }
    async deleteVocabularyItem(id: string) { await this.remove('vocabulary_items', id); }

    // ── Career ───────────────────────────────────────────────────────────────

    async pushJobApplication(j: { id: string; company: string; role: string; status: string; appliedDate?: string; deadline?: string; notes?: string; url?: string; salary?: string; location?: string; remote?: boolean }) {
        await this.upsert('job_applications', { id: j.id, company: j.company, role: j.role, status: j.status, applied_date: j.appliedDate, deadline: j.deadline, notes: j.notes, url: j.url, salary: j.salary, location: j.location, remote: j.remote });
    }
    async deleteJobApplication(id: string) { await this.remove('job_applications', id); }

    async pushProject(p: { id: string; title: string; description?: string; status: string; startDate?: string; endDate?: string; technologies?: string[]; url?: string; githubUrl?: string }) {
        await this.upsert('projects', { id: p.id, title: p.title, description: p.description, status: p.status, start_date: p.startDate, end_date: p.endDate, technologies: p.technologies, url: p.url, github_url: p.githubUrl });
    }
    async deleteProject(id: string) { await this.remove('projects', id); }

    async pushCertificate(c: { id: string; title: string; issuer: string; issueDate: string; expiryDate?: string; credentialId?: string; url?: string; category?: string }) {
        await this.upsert('certificates', { id: c.id, title: c.title, issuer: c.issuer, issue_date: c.issueDate, expiry_date: c.expiryDate, credential_id: c.credentialId, url: c.url, category: c.category });
    }
    async deleteCertificate(id: string) { await this.remove('certificates', id); }

    async pushCareerSkill(s: { id: string; name: string; level: string; category?: string; yearsOfExperience?: number }) {
        await this.upsert('career_skills', { id: s.id, name: s.name, level: s.level, category: s.category, years_of_experience: s.yearsOfExperience });
    }
    async deleteCareerSkill(id: string) { await this.remove('career_skills', id); }

    // ── Documents ────────────────────────────────────────────────────────────

    async pushDocument(d: { id: string; title: string; type: string; issuer?: string; issueDate?: string; expiryDate?: string; documentNumber?: string; country?: string; notes?: string; fileUrl?: string; status: string }) {
        await this.upsert('documents', { id: d.id, title: d.title, type: d.type, issuer: d.issuer, issue_date: d.issueDate, expiry_date: d.expiryDate, document_number: d.documentNumber, country: d.country, notes: d.notes, file_url: d.fileUrl, status: d.status });
    }
    async deleteDocument(id: string) { await this.remove('documents', id); }

    // ── Settings ─────────────────────────────────────────────────────────────

    async pushSettings(s: { theme: string; themeStyle?: string; disableDynamicAccents?: boolean; currency: string; timezone: string; weekStartsOn: number; notifications: unknown; quickNotes?: string; geminiApiKey?: string }) {
        if (!this.client || !this.userId) return;

        const payload: any = {
            id: this.userId,
            theme: s.theme,
            theme_style: s.themeStyle || 'cozy-earth',
            disable_dynamic_accents: s.disableDynamicAccents || false,
            currency: s.currency,
            timezone: s.timezone,
            week_starts_on: s.weekStartsOn,
            notifications: s.notifications,
            quick_notes: s.quickNotes || ''
        };

        if (this.hasGeminiApiKeyColumn) {
            payload.gemini_api_key = s.geminiApiKey ? encryptApiKey(s.geminiApiKey, this.userId) : '';
        }

        const { error } = await this.client.from('settings').upsert(payload);
        if (error) logError('upsert/settings', error);
    }

    async pushProfile(p: { name: string; email: string; avatarColor?: string; bio?: string }) {
        if (!this.client || !this.userId) return;
        const { error } = await this.client.from('profiles').upsert({
            id: this.userId, name: p.name, email: p.email,
            avatar_color: p.avatarColor, bio: p.bio
        });
        if (error) logError('upsert/profiles', error);
    }
}

export const syncEngine = new SyncEngine();
