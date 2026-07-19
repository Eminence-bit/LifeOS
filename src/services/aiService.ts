import type { Settings, Task, Expense, Income, Budget, SavingsGoal, InventoryItem, MealPlanEntry, Recipe, WorkoutLog, StudySession, Document } from '@/types';
import { daysUntil, formatCurrency } from '@/lib/utils';
import { usePlanningStore } from '@/store/planningStore';

export interface AISuggestion {
    id: string;
    msg: string;
    type: 'warning' | 'danger' | 'info';
    actionLabel?: string;
    actionPath?: string;
}

export interface AIDashboardAdvice {
    coachingAdvice: string;
    suggestions: AISuggestion[];
    predictions: string[];
    isMock?: boolean;
}

export async function fetchAIDashboardAdvice(params: {
    settings: Settings;
    tasks: Task[];
    expenses: Expense[];
    incomes: Income[];
    budgets: Budget[];
    savingsGoals: SavingsGoal[];
    inventory: InventoryItem[];
    mealPlan: MealPlanEntry[];
    recipes: Recipe[];
    workoutLogs: WorkoutLog[];
    studySessions: StudySession[];
    documents: Document[];
    streak: number;
    dailyGoalMinutes: number;
    todayWater: number;
}): Promise<AIDashboardAdvice> {
    const { settings } = params;
    const apiKey = settings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

    if (!apiKey.trim()) {
        return generateSimulatedResponse(params);
    }

    try {
        const payloadPrompt = generatePrompt(params);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: payloadPrompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: 0.2
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`API fetch error status ${response.status}`);
        }

        const resData = await response.json();
        const genText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!genText) {
            throw new Error('Empty response from model');
        }

        const advice: AIDashboardAdvice = cleanAndParseJSON(genText);
        return {
            ...advice,
            isMock: false
        };
    } catch (e) {
        console.error('AI Service (Gemini API failed, falling back to Simulation):', e);
        return {
            ...generateSimulatedResponse(params),
            coachingAdvice: `[Gemini API Offline] ${generateSimulatedResponse(params).coachingAdvice}`
        };
    }
}

/**
 * Normalizes and parses JSON returned by LLM, removing markdown fences,
 * repairing trailing commas, and handling whitespace issues.
 */
function cleanAndParseJSON(text: string): any {
    let clean = text.trim();

    // 1. Wipe markdown fences if LLM ignored configuration
    if (clean.startsWith('```')) {
        clean = clean.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '').trim();
    }

    // 2. Drop trailing commas in objects/arrays (invalid in ES5 JSON)
    clean = clean.replace(/,\s*([\]}])/g, '$1');

    try {
        return JSON.parse(clean);
    } catch (err: any) {
        // Fallback: If still failing, attempt basic character normalization
        console.warn("JSON repair attempt for text:", clean);
        throw err;
    }
}

function daysSince(dateStr: string): number {
    try {
        const date = new Date(dateStr);
        const today = new Date();
        date.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return Math.floor(Math.abs(today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
        return 0;
    }
}

function generatePrompt(params: {
    settings: Settings;
    tasks: Task[];
    expenses: Expense[];
    incomes: Income[];
    budgets: Budget[];
    savingsGoals: SavingsGoal[];
    inventory: InventoryItem[];
    mealPlan: MealPlanEntry[];
    recipes: Recipe[];
    workoutLogs: WorkoutLog[];
    studySessions: StudySession[];
    documents: Document[];
    streak: number;
    dailyGoalMinutes: number;
    todayWater: number;
}): string {
    const { settings, tasks, expenses, budgets, savingsGoals, inventory, mealPlan, workoutLogs, streak, dailyGoalMinutes, todayWater, documents, studySessions } = params;

    const todayVal = new Date().toISOString().split('T')[0];
    const username = settings.userProfile?.name || 'User';
    const incompleteTasks = tasks.filter(t => t.status !== 'done');
    const lowStock = inventory.filter(i => i.quantity < i.minQuantity);
    const expiringDocs = documents.filter(d => d.expiryDate && daysUntil(d.expiryDate) < 30);

    // Calculate rolling 7-day Momentum Score
    const past7DaysWorkouts = workoutLogs.filter(w => daysSince(w.date) <= 7).length;
    const workoutConsistency = Math.min(100, (past7DaysWorkouts / 3) * 100);

    const studyDaysPast7 = new Set(studySessions.filter(s => daysSince(s.date) <= 7).map(s => s.date)).size;
    const studyConsistency = Math.min(100, (studyDaysPast7 / 5) * 100);

    const tasksPast7 = tasks.filter(t => daysSince(t.createdAt) <= 7);
    const completedTasksPast7 = tasksPast7.filter(t => t.status === 'done').length;
    const taskConsistency = tasksPast7.length > 0 ? (completedTasksPast7 / tasksPast7.length) * 100 : 80;

    const momentumScore = Math.round((workoutConsistency * 0.3) + (studyConsistency * 0.4) + (taskConsistency * 0.3));
    const activeContext = settings.dashboardContext || 'work';

    return `You are LifeOS AI, an intelligent personal dashboard assistant for ${username}. Analyze the user's data and settings to provide coaching advice, action suggestions, and future pacing predictions. Shape your coaching advice around maintaining and building consistency and momentum (motivating the user to protect streaks, resume paused targets, and build positive momentum rather than demanding perfection).
    
    Current Day Focus Context: ${activeContext.toUpperCase()} mode. (If VACATION, keep suggestions light/relaxing, highlighting savings/travel rather than heavy chores).
    Consistency Momentum Score: ${momentumScore}% (100% being perfectly consistent over past 7 days, lower scores mean coaching should encourage slow, positive re-engagement).

User Profile:
- Name: ${username}
- Bio: ${settings.userProfile?.bio || 'None'}

Current Data State:
- Tasks count: ${tasks.length} (pending: ${incompleteTasks.length})
- Recent incomplete tasks: ${JSON.stringify(incompleteTasks.slice(0, 4).map(t => ({ title: t.title, priority: t.priority, dueDate: t.dueDate, category: t.category })))}
- Active Goals: ${JSON.stringify(params.tasks.filter(t => t.goalId).length > 0 ? "Linked goals trackable in planner" : "None")}
- Finance:
  - Budget Limit: ${JSON.stringify(budgets.map(b => ({ category: b.category, limit: b.limit, month: b.month })))}
  - Month Expenses: ${JSON.stringify(expenses.filter(e => e.date.startsWith(todayVal.slice(0, 7))).slice(0, 8).map(e => ({ title: e.title, amount: e.amount, category: e.category, date: e.date })))}
  - Savings Goals: ${JSON.stringify(savingsGoals.map(s => ({ title: s.title, target: s.targetAmount, current: s.currentAmount })))}
- Food & Nutrition:
  - Inventory (low items): ${JSON.stringify(lowStock.slice(0, 4).map(i => ({ name: i.name, quantity: i.quantity, min: i.minQuantity, unit: i.unit })))}
  - Planned meals: ${mealPlan.length}
- Health & Workout:
  - Water intake today: ${todayWater}ml / 2000ml goal
  - Workout logs count: ${workoutLogs.length}
- Learning:
  - Study streak: ${streak} days
  - Study daily goal: ${dailyGoalMinutes} minutes
- Expiring Documents: ${JSON.stringify(expiringDocs.slice(0, 2).map(d => ({ title: d.title, status: d.status, expiry: d.expiryDate })))}

Return a JSON object with this exact structure:
{
  "coachingAdvice": "A short, punchy 1-2 sentence tip based on their weakest area (Health, Finance, Learning, Nutrition, Career, Documents).",
  "suggestions": [
     {
       "id": "unique-id-1",
       "msg": "Specific action suggestion based on data (e.g. inventory restocks, budget warnings, document expiries, study revision). Include formatted currency or time figures where appropriate.",
       "type": "warning" | "danger" | "info",
       "actionLabel": "Button label (max 15 chars)",
       "actionPath": "Optional navigation route: '/food', '/finance', '/planning', '/learning', '/documents', '/health', '/career'"
     }
  ],
  "predictions": [
     "Plausible predictive pacing statement based on trajectory (e.g. grocery depletion days, budget overrun projections, goals pacing, savings completion)."
  ]
}
Do not include any markdown fences or additional text outside the JSON object. All double quotes inside text properties (such as in coachingAdvice, msg, and predictions) must be escaped as \\" or replaced with single quotes to ensure JSON validity.`;
}

function generateSimulatedResponse(params: {
    settings: Settings;
    tasks: Task[];
    expenses: Expense[];
    incomes: Income[];
    budgets: Budget[];
    savingsGoals: SavingsGoal[];
    inventory: InventoryItem[];
    mealPlan: MealPlanEntry[];
    recipes: Recipe[];
    workoutLogs: WorkoutLog[];
    studySessions: StudySession[];
    documents: Document[];
    streak: number;
    dailyGoalMinutes: number;
    todayWater: number;
}): AIDashboardAdvice {
    const { settings, tasks, expenses, budgets, savingsGoals, inventory, mealPlan, workoutLogs, streak, dailyGoalMinutes, todayWater, documents } = params;

    const todayVal = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayVal.slice(0, 7);

    // Heuristics: calculate scores for modules
    const workoutScore = workoutLogs.some(log => log.date === todayVal) ? 100 : 40;
    const waterScore = Math.min(100, (todayWater / 2000) * 100);
    const healthScore = Math.round((workoutScore + waterScore) / 2);

    const totalMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr)).reduce((s, e) => s + e.amount, 0);
    const budgetLimitTotal = budgets.filter(b => b.month === currentMonthStr).reduce((s, b) => s + b.limit, 0);
    const budgetSpentRatio = budgetLimitTotal > 0 ? totalMonthExpenses / budgetLimitTotal : 0;
    const financeScore = Math.max(0, Math.min(100, Math.round(100 - (budgetSpentRatio * 100))));

    const todayStudyMinutes = params.studySessions.filter(s => s.date === todayVal).reduce((sum, s) => sum + s.duration, 0);
    const learningScore = Math.min(100, Math.round((todayStudyMinutes / dailyGoalMinutes) * 100)) || 0;

    const plannedMealsCount = mealPlan.filter(m => m.date === todayVal).length;
    const nutritionScore = Math.min(100, plannedMealsCount * 33);

    const validDocs = documents.filter(d => d.status === 'valid').length;
    const docsScore = documents.length > 0 ? Math.round((validDocs / documents.length) * 100) : 100;

    const scores = [
        { name: 'Health', value: healthScore },
        { name: 'Finance', value: financeScore },
        { name: 'Learning', value: learningScore },
        { name: 'Nutrition', value: nutritionScore },
        { name: 'Documents', value: docsScore }
    ];

    const weakest = [...scores].sort((a, b) => a.value - b.value)[0];

    let coachingAdvice = 'All areas are balanced. Protect your streak goals to maintain healthy performance scores.';
    if (weakest.value < 75) {
        if (weakest.name === 'Learning') {
            coachingAdvice = 'Your learning score is low today. Dedicate just 15 minutes of revision to protect your study streak.';
        } else if (weakest.name === 'Health') {
            coachingAdvice = 'Log a workout or drink some water to raise your Health score and keep your physical system balanced.';
        } else if (weakest.name === 'Finance') {
            coachingAdvice = 'Your spending is pacing ahead of your budget limit. Consider cooking at home tonight to save.';
        } else if (weakest.name === 'Nutrition') {
            coachingAdvice = 'Pantry item reserves and meal planning are low. Pre-plan a healthy home-cooked meal.';
        } else if (weakest.name === 'Documents') {
            coachingAdvice = 'Some vital records are expiring soon or need attention. Schedule time for renewal.';
        }
    }

    const suggestions: AISuggestion[] = [];
    const predictions: string[] = [];

    // Low stock suggestions
    const lowStockItems = inventory.filter(i => i.quantity < i.minQuantity);
    lowStockItems.slice(0, 2).forEach(item => {
        const estDepletion = Math.max(1, Math.round(item.quantity / 2));
        const purchaseQty = item.minQuantity * 2 - item.quantity;
        const estCost = purchaseQty * 10;
        suggestions.push({
            id: `sim-inv-${item.id}`,
            msg: `📦 Stock Alert: "${item.name}" below minimum limit. Est depletion in ${estDepletion} days. Recommended buy: ${purchaseQty} ${item.unit} (Est: ${formatCurrency(estCost, settings.currency)}).`,
            type: 'warning',
            actionLabel: 'Restock',
            actionPath: '/food'
        });
    });

    // Budget warnings
    budgets.filter(b => b.month === currentMonthStr).forEach(budget => {
        const spent = expenses.filter(e => e.date.startsWith(currentMonthStr) && e.category === budget.category).reduce((s, e) => s + e.amount, 0);
        if (spent >= budget.limit * 0.8) {
            suggestions.push({
                id: `sim-budget-${budget.id}`,
                msg: `💸 Spending Warning: Used ${Math.round((spent / budget.limit) * 100)}% of your ${budget.category} budget limits.`,
                type: 'danger',
                actionLabel: 'Adjust Budget',
                actionPath: '/finance'
            });
        }
    });

    // Expiring docs
    documents.filter(d => d.status === 'expiring_soon' || d.status === 'expired').slice(0, 1).forEach(doc => {
        const days = doc.expiryDate ? daysUntil(doc.expiryDate) : null;
        suggestions.push({
            id: `sim-doc-${doc.id}`,
            msg: days !== null && days < 0 ? `🚨 Urgent: "${doc.title}" expired. Plan renewal.` : `⚠️ Document Warning: "${doc.title}" expires in ${days} days.`,
            type: days !== null && days < 0 ? 'danger' : 'warning',
            actionLabel: 'Renew Doc',
            actionPath: '/documents'
        });
    });

    // Learning
    if (todayStudyMinutes < dailyGoalMinutes) {
        suggestions.push({
            id: 'sim-study-streak',
            msg: `📚 Learning Pacing: Complete study target session to guard your ${streak}-day streak.`,
            type: 'info',
            actionLabel: 'Study Now',
            actionPath: '/learning'
        });
    }

    // Predictions list
    if (lowStockItems.length > 0) {
        predictions.push(`Grocery stock warning: Restock needed in 2 days to maintain minimum pantry levels.`);
    } else {
        predictions.push(`Pantry reserves: Groceries are well stocked until late this week.`);
    }

    if (budgetLimitTotal > 0) {
        const dayOfMonth = new Date().getDate();
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const projectedSpent = (totalMonthExpenses / dayOfMonth) * daysInMonth;
        if (projectedSpent > budgetLimitTotal) {
            predictions.push(`Exceeding forecast: Trajectory indicates you will exceed budget by ${formatCurrency(Math.round(projectedSpent - budgetLimitTotal), settings.currency)}.`);
        } else {
            predictions.push(`Savings projection: On track to save ${formatCurrency(Math.round(budgetLimitTotal - projectedSpent), settings.currency)} under budget.`);
        }
    }

    const targetGoal = usePlanningStore.getState().goals.find(g => g.progress < 100);
    if (targetGoal) {
        const daysRemaining = targetGoal.targetDate ? daysUntil(targetGoal.targetDate) : null;
        if (daysRemaining && daysRemaining > 0) {
            predictions.push(`Goal target pacing: Reach "${targetGoal.title}" in ~${daysRemaining} days at current progress rate.`);
        }
    } else {
        predictions.push(`Goal pacing forecast: Zero main goals pending. Set a new life target to track.`);
    }

    if (todayWater < 2000) {
        predictions.push(`Hydration warning: Daily target won't be met unless you drink ${2000 - todayWater}ml more.`);
    } else {
        predictions.push(`Hydration target met! Good work protecting your cognitive energy.`);
    }

    // Suggest adding API key only if they don't have one configured
    if (suggestions.length < 3 && !settings.geminiApiKey?.trim()) {
        suggestions.push({
            id: 'sim-key-tip',
            msg: `💡 Upgrade Coach: Provide a Google Gemini API Key in Settings to enable real AI recommendations.`,
            type: 'info',
            actionLabel: 'Go to Settings',
            actionPath: '/settings'
        });
    }

    return {
        coachingAdvice,
        suggestions,
        predictions,
        isMock: true
    };
}
