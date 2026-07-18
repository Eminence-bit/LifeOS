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

class SyncEngine {
    private isInitialized = false;
    private isPulling = false;
    private userId: string | null = null;

    initialize() {
        if (this.isInitialized || !supabase) return;
        this.isInitialized = true;

        // Monitor Auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            useAuthStore.getState().setSession(session);

            if (session?.user) {
                this.userId = session.user.id;
                await this.pullFromCloud();
                this.setupSubscriptions();
            } else {
                this.userId = null;
                // If user logged out of Supabase auth, reset Session state
                useAuthStore.getState().setSession(null);
            }
        });
    }

    private async pullFromCloud() {
        if (!supabase || !this.userId || this.isPulling) return;
        this.isPulling = true;

        try {
            console.log('SyncEngine: Starting full sync pull from Supabase Cloud...');

            // 1. Settings & Profile
            const { data: dbSettings } = await supabase.from('settings').select('*').eq('id', this.userId).single();
            if (dbSettings) {
                const { data: dbProfile } = await supabase.from('profiles').select('*').eq('id', this.userId).single();
                useSettingsStore.setState({
                    settings: {
                        id: dbSettings.id,
                        theme: dbSettings.theme,
                        currency: dbSettings.currency,
                        timezone: dbSettings.timezone,
                        weekStartsOn: dbSettings.week_starts_on,
                        notifications: dbSettings.notifications,
                        quickNotes: dbSettings.quick_notes,
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

            // 2. Planning (Tasks, Events, Goals)
            const { data: dbTasks } = await supabase.from('tasks').select('*');
            if (dbTasks) {
                usePlanningStore.setState({
                    tasks: dbTasks.map(t => ({
                        id: t.id,
                        title: t.title,
                        description: t.description,
                        priority: t.priority,
                        status: t.status,
                        dueDate: t.due_date,
                        category: t.category,
                        goalId: t.goal_id,
                        tags: t.tags || [],
                        createdAt: t.created_at,
                        updatedAt: t.updated_at
                    }))
                });
            }

            const { data: dbEvents } = await supabase.from('events').select('*');
            if (dbEvents) {
                usePlanningStore.setState({
                    events: dbEvents.map(e => ({
                        id: e.id,
                        title: e.title,
                        description: e.description,
                        startDate: e.start_date,
                        endDate: e.end_date,
                        allDay: e.all_day,
                        recurring: e.recurring,
                        color: e.color,
                        category: e.category,
                        createdAt: e.created_at,
                        updatedAt: e.updated_at
                    }))
                });
            }

            const { data: dbGoals } = await supabase.from('goals').select('*');
            if (dbGoals) {
                usePlanningStore.setState({
                    goals: dbGoals.map(g => ({
                        id: g.id,
                        title: g.title,
                        description: g.description,
                        targetDate: g.target_date,
                        progress: g.progress,
                        category: g.category,
                        taskIds: g.task_ids || [],
                        createdAt: g.created_at,
                        updatedAt: g.updated_at
                    }))
                });
            }

            // 3. Finance (Expenses, Incomes, Budgets, Savings Goals)
            const { data: dbExpenses } = await supabase.from('expenses').select('*');
            if (dbExpenses) {
                useFinanceStore.setState({
                    expenses: dbExpenses.map(e => ({
                        id: e.id,
                        title: e.title,
                        amount: Number(e.amount),
                        category: e.category,
                        date: e.date,
                        recurring: e.recurring,
                        notes: e.notes,
                        createdAt: e.created_at,
                        updatedAt: e.updated_at
                    }))
                });
            }

            const { data: dbIncomes } = await supabase.from('incomes').select('*');
            if (dbIncomes) {
                useFinanceStore.setState({
                    incomes: dbIncomes.map(i => ({
                        id: i.id,
                        title: i.title,
                        amount: Number(i.amount),
                        date: i.date,
                        recurring: i.recurring,
                        source: i.source,
                        notes: i.notes,
                        createdAt: i.created_at,
                        updatedAt: i.updated_at
                    }))
                });
            }

            const { data: dbBudgets } = await supabase.from('budgets').select('*');
            if (dbBudgets) {
                useFinanceStore.setState({
                    budgets: dbBudgets.map(b => ({
                        id: b.id,
                        category: b.category,
                        limit: Number(b.limit_amount),
                        month: b.month,
                        createdAt: b.created_at,
                        updatedAt: b.created_at
                    }))
                });
            }

            const { data: dbSavings } = await supabase.from('savings_goals').select('*');
            if (dbSavings) {
                useFinanceStore.setState({
                    savingsGoals: dbSavings.map(s => ({
                        id: s.id,
                        title: s.title,
                        targetAmount: Number(s.target_amount),
                        currentAmount: Number(s.current_amount),
                        targetDate: s.target_date,
                        description: s.description,
                        createdAt: s.created_at,
                        updatedAt: s.updated_at
                    }))
                });
            }

            // 4. Food (Inventory, Shopping, Recipes, Meals)
            const { data: dbInventory } = await supabase.from('inventory_items').select('*');
            if (dbInventory) {
                useFoodStore.setState({
                    inventory: dbInventory.map(i => ({
                        id: i.id,
                        name: i.name,
                        quantity: Number(i.quantity),
                        unit: i.unit,
                        minQuantity: Number(i.min_quantity),
                        store: i.store,
                        expiryDate: i.expiry_date,
                        category: i.category,
                        createdAt: i.created_at,
                        updatedAt: i.updated_at
                    }))
                });
            }

            const { data: dbShopping } = await supabase.from('shopping_items').select('*');
            if (dbShopping) {
                useFoodStore.setState({
                    shoppingList: dbShopping.map(s => ({
                        id: s.id,
                        name: s.name,
                        quantity: Number(s.quantity),
                        unit: s.unit,
                        checked: s.bought || false,
                        manual: true
                    }))
                });
            }

            const { data: dbRecipes } = await supabase.from('recipes').select('*');
            if (dbRecipes) {
                useFoodStore.setState({
                    recipes: dbRecipes.map(r => ({
                        id: r.id,
                        title: r.title,
                        description: r.description,
                        ingredients: r.ingredients || [],
                        instructions: r.instructions || [],
                        prepTime: r.prep_time,
                        cookTime: r.cook_time,
                        servings: r.servings,
                        category: r.category,
                        nutrition: r.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
                        imageUrl: r.image_url,
                        createdAt: r.created_at,
                        updatedAt: r.updated_at
                    }))
                });
            }

            const { data: dbMeals } = await supabase.from('meal_plans').select('*');
            if (dbMeals) {
                useFoodStore.setState({
                    mealPlan: dbMeals.map(m => ({
                        id: m.id,
                        date: m.date,
                        mealType: m.meal_type,
                        recipeId: m.recipe_id,
                        recipeName: m.recipe_name,
                        customMeal: m.custom_meal,
                        cooked: m.cooked,
                        createdAt: m.created_at,
                        updatedAt: m.updated_at
                    }))
                });
            }

            // 5. Health (Workout logs, Water intakes, Sleep logs)
            const { data: dbWorkouts } = await supabase.from('workout_logs').select('*');
            if (dbWorkouts) {
                useHealthStore.setState({
                    workoutLogs: dbWorkouts.map(w => ({
                        id: w.id,
                        date: w.date,
                        exercises: w.exercises || [],
                        duration: w.duration,
                        notes: w.notes,
                        caloriesBurned: w.calories_burned,
                        createdAt: w.created_at,
                        updatedAt: w.updated_at
                    }))
                });
            }

            const { data: dbWater } = await supabase.from('water_intakes').select('*');
            if (dbWater) {
                useHealthStore.setState({
                    waterIntakes: dbWater.map(w => ({
                        id: w.id,
                        date: w.date,
                        amount: w.amount,
                        createdAt: w.created_at,
                        updatedAt: w.updated_at
                    }))
                });
            }

            const { data: dbSleep } = await supabase.from('sleep_logs').select('*');
            if (dbSleep) {
                useHealthStore.setState({
                    sleepLogs: dbSleep.map(s => ({
                        id: s.id,
                        date: s.date,
                        bedTime: s.bed_time,
                        wakeTime: s.wake_time,
                        duration: Number(s.duration),
                        quality: s.quality,
                        notes: s.notes,
                        createdAt: s.created_at,
                        updatedAt: s.updated_at
                    }))
                });
            }

            // 6. Learning topics & Sessions
            const { data: dbTopics } = await supabase.from('learning_topics').select('*');
            if (dbTopics) {
                useLearningStore.setState({
                    topics: dbTopics.map(t => ({
                        id: t.id,
                        name: t.name,
                        description: t.description,
                        category: t.category,
                        color: t.color,
                        progress: t.progress,
                        targetDate: t.target_date,
                        createdAt: t.created_at,
                        updatedAt: t.updated_at
                    }))
                });
            }

            const { data: dbSessions } = await supabase.from('study_sessions').select('*');
            if (dbSessions) {
                useLearningStore.setState({
                    studySessions: dbSessions.map(s => ({
                        id: s.id,
                        date: s.date,
                        topicId: s.topic_id,
                        duration: s.duration,
                        notes: s.notes,
                        createdAt: s.created_at,
                        updatedAt: s.updated_at
                    }))
                });
            }

            const { data: dbVocab } = await supabase.from('vocabulary_items').select('*');
            if (dbVocab) {
                useLearningStore.setState({
                    vocabulary: dbVocab.map(v => ({
                        id: v.id,
                        word: v.word,
                        translation: v.translation,
                        example: v.example,
                        topicId: v.topic_id,
                        language: v.language,
                        mastered: v.mastered,
                        reviewCount: v.review_count,
                        nextReview: v.next_review,
                        createdAt: v.created_at,
                        updatedAt: v.updated_at
                    }))
                });
            }

            // 7. Career
            const { data: dbJobs } = await supabase.from('job_applications').select('*');
            if (dbJobs) {
                useCareerStore.setState({
                    applications: dbJobs.map(j => ({
                        id: j.id,
                        company: j.company,
                        role: j.role,
                        status: j.status,
                        appliedDate: j.applied_date,
                        deadline: j.deadline,
                        notes: j.notes,
                        url: j.url,
                        salary: j.salary,
                        location: j.location,
                        remote: j.remote,
                        createdAt: j.created_at,
                        updatedAt: j.updated_at
                    }))
                });
            }

            // 8. Documents
            const { data: dbDocs } = await supabase.from('documents').select('*');
            if (dbDocs) {
                useDocumentsStore.setState({
                    documents: dbDocs.map(d => ({
                        id: d.id,
                        title: d.title,
                        type: d.type,
                        issuer: d.issuer,
                        issueDate: d.issue_date,
                        expiryDate: d.expiry_date,
                        documentNumber: d.document_number,
                        country: d.country,
                        notes: d.notes,
                        fileUrl: d.file_url,
                        status: d.status,
                        createdAt: d.created_at,
                        updatedAt: d.updated_at
                    }))
                });
            }

            console.log('SyncEngine: Pull complete. Local stores initialized with cloud data.');
        } catch (err) {
            console.error('SyncEngine: Error pulling data from cloud.', err);
        } finally {
            this.isPulling = false;
        }
    }

    private setupSubscriptions() {
        const client = supabase;
        if (!client || !this.userId) return;

        // Subscribe to planning updates
        usePlanningStore.subscribe(async (state) => {
            if (this.isPulling) return;
            // Upsert tasks
            for (const task of state.tasks) {
                await client.from('tasks').upsert({
                    id: task.id,
                    profile_id: this.userId,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    status: task.status,
                    due_date: task.dueDate,
                    category: task.category,
                    goal_id: task.goalId,
                    tags: task.tags
                });
            }
            // events
            for (const event of state.events) {
                await client.from('events').upsert({
                    id: event.id,
                    profile_id: this.userId,
                    title: event.title,
                    description: event.description,
                    start_date: event.startDate,
                    end_date: event.endDate,
                    all_day: event.allDay,
                    recurring: event.recurring,
                    color: event.color,
                    category: event.category
                });
            }
        });

        // Subscribe to settings updates
        useSettingsStore.subscribe(async (state) => {
            if (this.isPulling) return;
            await client.from('settings').upsert({
                id: this.userId,
                theme: state.settings.theme,
                currency: state.settings.currency,
                timezone: state.settings.timezone,
                week_starts_on: state.settings.weekStartsOn,
                notifications: state.settings.notifications,
                quick_notes: state.settings.quickNotes
            });

            if (state.settings.userProfile) {
                await client.from('profiles').upsert({
                    id: this.userId,
                    name: state.settings.userProfile.name,
                    email: state.settings.userProfile.email,
                    avatar_color: state.settings.userProfile.avatarColor,
                    bio: state.settings.userProfile.bio
                });
            }
        });

        // Subscribe to finance updates
        useFinanceStore.subscribe(async (state) => {
            if (this.isPulling) return;
            for (const expense of state.expenses) {
                await client.from('expenses').upsert({
                    id: expense.id,
                    profile_id: this.userId,
                    title: expense.title,
                    amount: expense.amount,
                    category: expense.category,
                    date: expense.date,
                    recurring: expense.recurring,
                    notes: expense.notes
                });
            }
            for (const budget of state.budgets) {
                await client.from('budgets').upsert({
                    id: budget.id,
                    profile_id: this.userId,
                    category: budget.category,
                    limit_amount: budget.limit,
                    month: budget.month
                });
            }
        });

        // Subscribe to food updates
        useFoodStore.subscribe(async (state) => {
            if (this.isPulling) return;
            for (const item of state.inventory) {
                await client.from('inventory_items').upsert({
                    id: item.id,
                    profile_id: this.userId,
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    min_quantity: item.minQuantity,
                    store: item.store,
                    expiry_date: item.expiryDate,
                    category: item.category
                });
            }
            for (const item of state.shoppingList) {
                await client.from('shopping_items').upsert({
                    id: item.id,
                    profile_id: this.userId,
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    bought: item.checked
                });
            }
        });

        // Subscribe to health updates
        useHealthStore.subscribe(async (state) => {
            if (this.isPulling) return;
            for (const intake of state.waterIntakes) {
                await client.from('water_intakes').upsert({
                    id: intake.id,
                    profile_id: this.userId,
                    date: intake.date,
                    amount: intake.amount
                });
            }
        });

        // Subscribe to knowledge updates
        useLearningStore.subscribe(async (state) => {
            if (this.isPulling) return;
            for (const topic of state.topics) {
                await client.from('learning_topics').upsert({
                    id: topic.id,
                    profile_id: this.userId,
                    name: topic.name,
                    description: topic.description,
                    category: topic.category,
                    color: topic.color,
                    progress: topic.progress,
                    target_date: topic.targetDate
                });
            }
        });

        // Subscribe to Career updates
        useCareerStore.subscribe(async (state) => {
            if (this.isPulling) return;
            for (const job of state.applications) {
                await client.from('job_applications').upsert({
                    id: job.id,
                    profile_id: this.userId,
                    company: job.company,
                    role: job.role,
                    status: job.status,
                    applied_date: job.appliedDate,
                    deadline: job.deadline,
                    notes: job.notes,
                    url: job.url,
                    salary: job.salary,
                    location: job.location,
                    remote: job.remote
                });
            }
        });

        // Subscribe to Documents updates
        useDocumentsStore.subscribe(async (state) => {
            if (this.isPulling) return;
            for (const doc of state.documents) {
                await client.from('documents').upsert({
                    id: doc.id,
                    profile_id: this.userId,
                    title: doc.title,
                    type: doc.type,
                    issuer: doc.issuer,
                    issue_date: doc.issueDate,
                    expiry_date: doc.expiryDate,
                    document_number: doc.documentNumber,
                    country: doc.country,
                    notes: doc.notes,
                    file_url: doc.fileUrl,
                    status: doc.status
                });
            }
        });

        console.log('SyncEngine: Store subscriptions successfully listening.');
    }
}

export const syncEngine = new SyncEngine();
