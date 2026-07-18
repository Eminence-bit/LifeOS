import { useMemo, useState, useEffect } from 'react';
import {
    CheckSquare, Calendar, Wallet, Apple, Heart, BookOpen,
    AlertTriangle, FileText, Zap, TrendingUp, ArrowUpRight,
    Clock, Flame, Target, ShoppingCart, ChevronRight, PlusCircle, Sparkles, Edit2, Play, Pause, RotateCcw, X, Info, Award, Bookmark, Lightbulb, Star
} from 'lucide-react';
import { usePlanningStore } from '@/store/planningStore';
import { useFinanceStore } from '@/store/financeStore';
import { useFoodStore } from '@/store/foodStore';
import { useHealthStore } from '@/store/healthStore';
import { useLearningStore } from '@/store/learningStore';
import { useDocumentsStore } from '@/store/documentsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { daysUntil, formatCurrency, todayStr, currentMonth } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export function DashboardPage() {
    const navigate = useNavigate();
    const today = new Date();
    const todayVal = todayStr();

    // ── Store Selectors ──
    const { tasks, updateTask, events } = usePlanningStore();
    const { expenses, incomes, budgets, savingsGoals } = useFinanceStore();
    const { inventory, shoppingList, mealPlan, recipes, addShoppingItem } = useFoodStore();
    const { workoutLogs, workoutPlans, waterIntakes, addWaterIntake } = useHealthStore();
    const { topics, studySessions, dailyGoalMinutes, streak } = useLearningStore();
    const { documents } = useDocumentsStore();
    const { settings, updateSettings } = useSettingsStore();

    const username = settings.userProfile?.name || 'User';

    // ── Local States ──
    const [showBriefingModal, setShowBriefingModal] = useState(false);
    const [startDayStep, setStartDayStep] = useState<'idle' | 'briefing' | 'focus'>('idle');
    const [timerSeconds, setTimerSeconds] = useState(25 * 60);
    const [timerRunning, setTimerRunning] = useState(false);
    const [customFocusTarget, setCustomFocusTarget] = useState('');
    const [secondBrainTab, setSecondBrainTab] = useState<'notes' | 'ideas' | 'bookmarks'>('notes');
    const [energyRating, setEnergyRating] = useState<number>(4);

    // ── Focus Mode Timer logic ──
    useEffect(() => {
        let interval: any = null;
        if (timerRunning) {
            interval = setInterval(() => {
                setTimerSeconds(s => {
                    if (s <= 1) {
                        setTimerRunning(false);
                        alert("Focus session complete! Great work on your priority objectives.");
                        return 25 * 60;
                    }
                    return s - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning]);

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // ── Data Calculations ──
    const topTask = useMemo(() => {
        return tasks.find(t => t.status !== 'done' && (!t.dueDate || t.dueDate <= todayVal));
    }, [tasks, todayVal]);

    const todayWorkout = useMemo(() => {
        return workoutLogs.some(log => log.date === todayVal);
    }, [workoutLogs, todayVal]);

    const todayStudyMinutes = useMemo(() => {
        return studySessions.filter(s => s.date === todayVal).reduce((sum, s) => sum + s.duration, 0);
    }, [studySessions, todayVal]);
    const studyGoalMet = todayStudyMinutes >= dailyGoalMinutes;

    const todayWater = useMemo(() => {
        return waterIntakes.filter(w => w.date === todayVal).reduce((sum, w) => sum + w.amount, 0);
    }, [waterIntakes, todayVal]);
    const waterGoalMet = todayWater >= 2000;

    const prioritiesCount = tasks.filter(t => t.status !== 'done' && t.dueDate === todayVal).length;
    const mealsPlannedCount = mealPlan.filter(m => m.date === todayVal).length;
    const meetingsTodayCount = events.filter(e => e.startDate.startsWith(todayVal)).length;

    // Estimate free time
    const estimatedFreeTime = useMemo(() => {
        const sleepHrs = 8;
        const workPlaceholder = 8;
        const studyHrs = todayStudyMinutes / 60;
        const workoutHrs = todayWorkout ? 1 : 0;
        const meetingsHrs = meetingsTodayCount * 1.0;
        return Math.max(1, Math.round((24 - sleepHrs - workPlaceholder - studyHrs - workoutHrs - meetingsHrs) * 10) / 10);
    }, [todayStudyMinutes, todayWorkout, meetingsTodayCount]);

    // Budget Health
    const currentMonthStr = currentMonth();
    const totalMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr)).reduce((s, e) => s + e.amount, 0);
    const budgetLimitTotal = budgets.filter(b => b.month === currentMonthStr).reduce((s, b) => s + b.limit, 0);

    const budgetStatus = useMemo(() => {
        if (budgetLimitTotal === 0) return 'Budget not set';
        const ratio = totalMonthExpenses / budgetLimitTotal;
        if (ratio > 1) return 'Budget exceeded';
        if (ratio > 0.8) return 'Budget is tight';
        return 'Budget is healthy';
    }, [totalMonthExpenses, budgetLimitTotal]);

    const inventoryStatus = useMemo(() => {
        const lowItemsCount = inventory.filter(i => i.quantity < i.minQuantity).length;
        return lowItemsCount > 0 ? `${lowItemsCount} items low` : 'Inventory fully restocked';
    }, [inventory]);

    // Today's Mission Checklist Items
    const missionItems = useMemo(() => {
        const list = [];
        if (topTask) {
            list.push({
                id: 'task',
                label: `Priority Objective: "${topTask.title}"`,
                status: 'critical' as const,
                checked: false,
                desc: 'Overdue or due today'
            });
        }
        list.push({
            id: 'workout',
            label: todayWorkout ? 'Physical Activity logged' : 'Log Daily Workout',
            status: todayWorkout ? ('complete' as const) : ('today' as const),
            checked: todayWorkout,
            desc: todayWorkout ? 'Workout logged' : 'Keep your physical balance'
        });
        list.push({
            id: 'study',
            label: `German Study Target (${todayStudyMinutes}/${dailyGoalMinutes} min)`,
            status: studyGoalMet ? ('complete' as const) : todayStudyMinutes > 0 ? ('today' as const) : ('critical' as const),
            checked: studyGoalMet,
            desc: `Streak: ${streak} days`
        });
        list.push({
            id: 'water',
            label: `Hydration Intake (${todayWater}/2000 ml)`,
            status: waterGoalMet ? ('complete' as const) : todayWater > 0 ? ('today' as const) : ('critical' as const),
            checked: waterGoalMet,
            desc: 'Daily water target'
        });
        return list;
    }, [topTask, todayWorkout, todayStudyMinutes, dailyGoalMinutes, studyGoalMet, streak, todayWater, waterGoalMet]);

    const priorityScore = useMemo(() => {
        const completed = missionItems.filter(item => item.checked).length;
        return Math.round((completed / missionItems.length) * 100);
    }, [missionItems]);

    // ── LIFE PULSE MASTER COACH SCORING ──
    const lifePulse = useMemo(() => {
        // Health score: 50% workout logged + 50% water progress ratio
        const healthScore = Math.round((todayWorkout ? 50 : 0) + Math.min(50, (todayWater / 2000) * 50));

        // Finance score: 100 - spent limit percentage (capped)
        const budgetSpentRatio = budgetLimitTotal > 0 ? totalMonthExpenses / budgetLimitTotal : 0;
        const financeScore = Math.max(0, Math.min(100, Math.round(100 - (budgetSpentRatio * 100))));

        // Learning score: target study minutes logged ratio
        const learningScore = Math.min(100, Math.round((todayStudyMinutes / dailyGoalMinutes) * 100)) || 0;

        // Nutrition score: meals planned ratio (e.g. at least 3 planned meals is 100)
        const plannedMealsCount = mealPlan.filter(m => m.date === todayVal).length;
        const nutritionScore = Math.min(100, plannedMealsCount * 33);

        // Documents score: proportion of valid documents
        const validDocs = documents.filter(d => d.status === 'valid').length;
        const docsScore = documents.length > 0 ? Math.round((validDocs / documents.length) * 100) : 100;

        // Career score: completed tasks or projects checked
        const careerScore = settings.userProfile?.bio ? 90 : 50;

        const scores = [
            { name: 'Health', value: healthScore, color: 'var(--accent-red)' },
            { name: 'Finance', value: financeScore, color: 'var(--accent-green)' },
            { name: 'Learning', value: learningScore, color: 'var(--accent-violet-light)' },
            { name: 'Nutrition', value: nutritionScore, color: 'var(--accent-amber)' },
            { name: 'Career', value: careerScore, color: 'var(--accent-cyan)' },
            { name: 'Documents', value: docsScore, color: 'var(--text-primary)' }
        ];

        const overall = Math.round(scores.reduce((sum, s) => sum + s.value, 0) / scores.length);

        // Compute coaching text based on the weakest module
        const sorted = [...scores].sort((a, b) => a.value - b.value);
        const weakest = sorted[0];

        let coachingText = '';
        if (weakest.name === 'Learning') {
            coachingText = 'Your weakest area is Learning. Setting aside just 15 minutes of revision today will boost study stats.';
        } else if (weakest.name === 'Health') {
            coachingText = 'Your weakest area is Health. Try logging a workout or drinking 500ml water to raise this score.';
        } else if (weakest.name === 'Finance') {
            coachingText = 'Your weakest area is Finance due to budget category use. Check your transactions today.';
        } else if (weakest.name === 'Nutrition') {
            coachingText = 'Your weakest area is Nutrition. Go to the food planner and pre-plan a meal for tomorrow.';
        } else {
            coachingText = 'All areas are balanced. Protect your streak goals to maintain healthy performance scores.';
        }

        return { scores, overall, coachingText };
    }, [todayWorkout, todayWater, budgetLimitTotal, totalMonthExpenses, todayStudyMinutes, dailyGoalMinutes, mealPlan, todayVal, documents, settings.userProfile]);

    // ── Smarter Recommendations ──
    const coachSuggestions = useMemo(() => {
        const suggestions: { id: string; msg: string; type: 'warning' | 'danger' | 'info'; actionLabel?: string; onAction?: () => void }[] = [];

        inventory.filter(i => i.quantity < i.minQuantity).slice(0, 2).forEach(item => {
            const depletionDays = Math.max(1, Math.round(item.quantity / 2));
            const recPurchase = item.minQuantity * 2 - item.quantity;
            let estPrice = recPurchase * 10;
            let iconText = '📦';
            if (item.name.toLowerCase().includes('egg')) {
                estPrice = recPurchase * 6;
                iconText = '🥚';
            } else if (item.name.toLowerCase().includes('milk')) {
                estPrice = recPurchase * 45;
                iconText = '🥛';
            } else if (item.name.toLowerCase().includes('chicken')) {
                estPrice = recPurchase * 250;
                iconText = '🍗';
            }

            suggestions.push({
                id: `inv-${item.id}`,
                msg: `${iconText} ${item.name} below limit. Est depletion: ${depletionDays} days. Recommended purchase: ${recPurchase} ${item.unit} (Est cost: ${formatCurrency(estPrice, settings.currency)}). Next shopping trip: Tomorrow.`,
                type: 'warning',
                actionLabel: 'Restock',
                onAction: () => {
                    addShoppingItem({ name: item.name, quantity: recPurchase, unit: item.unit });
                    alert(`Added ${recPurchase} ${item.unit} of ${item.name} to Shopping List.`);
                }
            });
        });

        documents.filter(d => d.status === 'expiring_soon' || d.status === 'expired').slice(0, 1).forEach(doc => {
            const days = doc.expiryDate ? daysUntil(doc.expiryDate) : null;
            suggestions.push({
                id: `doc-${doc.id}`,
                msg: days !== null && days < 0 ? `🚨 Urgent: "${doc.title}" expired. Plan renewal today.` : `⚠️ Warning: "${doc.title}" expires in ${days} days. Renew soon.`,
                type: days !== null && days < 0 ? 'danger' : 'warning',
                actionLabel: 'Details',
                onAction: () => navigate('/documents')
            });
        });

        budgets.filter(b => b.month === currentMonthStr).forEach(budget => {
            const spent = expenses.filter(e => e.date.startsWith(currentMonthStr) && e.category === budget.category).reduce((s, e) => s + e.amount, 0);
            if (spent >= budget.limit * 0.8) {
                suggestions.push({
                    id: `budget-${budget.id}`,
                    msg: `💸 Spending warning: Used ${Math.round((spent / budget.limit) * 100)}% of your ${budget.category} budget. Consider cooking at home tonight.`,
                    type: 'danger',
                    actionLabel: 'Budgets',
                    onAction: () => navigate('/finance')
                });
            }
        });

        if (!studyGoalMet && topics.length > 0) {
            suggestions.push({
                id: 'streak-coaching',
                msg: `📚 Guard your B2 German streak. Spend 15 minutes reviewing active language topics.`,
                type: 'info',
                actionLabel: 'Study',
                onAction: () => navigate('/learning')
            });
        }

        return suggestions;
    }, [inventory, documents, expenses, budgets, studyGoalMet, dailyGoalMinutes, todayStudyMinutes, streak, navigate, addShoppingItem, currentMonthStr, settings.currency]);

    // ── Proactive Life Predictions ──
    const predictions = useMemo(() => {
        const list: string[] = [];

        const lowItemsCount = inventory.filter(i => i.quantity < i.minQuantity).length;
        if (lowItemsCount > 0) {
            list.push(`Grocery stock warning: Restock needed in 2 days to maintain pantry minimums.`);
        } else {
            list.push(`Pantry status: You have enough groceries to last safely until Saturday.`);
        }

        const dayOfMonth = today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        if (budgetLimitTotal > 0) {
            const projectedSpent = (totalMonthExpenses / dayOfMonth) * daysInMonth;
            if (projectedSpent > budgetLimitTotal) {
                list.push(`Exceeding forecast: Trajectory indicates you will exceed budget by ${formatCurrency(Math.round(projectedSpent - budgetLimitTotal), settings.currency)}.`);
            } else {
                list.push(`Savings projection: On track to save ${formatCurrency(Math.round(budgetLimitTotal - projectedSpent), settings.currency)} under budget.`);
            }
        }

        const activeGoalsList = usePlanningStore.getState().goals;
        const targetGoal = activeGoalsList.find(g => g.progress < 100);
        if (targetGoal) {
            const daysRemaining = targetGoal.targetDate ? daysUntil(targetGoal.targetDate) : null;
            if (daysRemaining && daysRemaining > 0) {
                list.push(`Goal target pacing: Reach "${targetGoal.title}" in ~${daysRemaining} days at current progress rate.`);
            }
        } else {
            list.push(`Goal pacing forecast: You will reach German B2 in 91 days at your current study rate.`);
        }

        const nextSavingsGoal = savingsGoals.find(g => g.currentAmount < g.targetAmount);
        if (nextSavingsGoal) {
            const remainingAmt = nextSavingsGoal.targetAmount - nextSavingsGoal.currentAmount;
            const months = Math.ceil(remainingAmt / 250) || 1;
            list.push(`Savings timeline: Complete target Emergency Fund in ${months} months near current deposit pacing.`);
        }

        if (!waterGoalMet) {
            const remWater = Math.max(0, 2000 - todayWater);
            list.push(`Hydration check: Water target likely won't be met today unless you log another ${remWater} ml.`);
        }

        return list;
    }, [inventory, budgetLimitTotal, totalMonthExpenses, today, settings.currency, waterGoalMet, todayWater, savingsGoals]);

    // ── Weekly Progress Overview ──
    const weeklyProgress = useMemo(() => {
        const start = startOfWeek(today, { weekStartsOn: settings.weekStartsOn });
        const end = endOfWeek(today, { weekStartsOn: settings.weekStartsOn });

        const weeklyTasks = tasks.filter(t => t.createdAt && (t.dueDate ? isWithinInterval(new Date(t.dueDate), { start, end }) : true));
        const weeklyTasksCompleted = weeklyTasks.filter(t => t.status === 'done').length;
        const weeklyWorkouts = workoutLogs.filter(log => isWithinInterval(new Date(log.date), { start, end })).length;
        const weeklyStudyMins = studySessions.filter(s => isWithinInterval(new Date(s.date), { start, end })).reduce((sum, s) => sum + s.duration, 0);
        const weeklySpent = expenses.filter(e => isWithinInterval(new Date(e.date), { start, end })).reduce((sum, e) => sum + e.amount, 0);
        const weeklySpentPct = budgetLimitTotal > 0 ? Math.min(100, Math.round((weeklySpent / (budgetLimitTotal / 4)) * 100)) : 10;

        return {
            tasksDone: weeklyTasksCompleted,
            tasksTotal: Math.max(weeklyTasks.length, 5),
            gymDone: weeklyWorkouts,
            gymGoal: 4,
            studyHrs: Math.round((weeklyStudyMins / 60) * 10) / 10,
            budgetSpent: weeklySpentPct,
            mealPrepDone: mealPlan.filter(m => isWithinInterval(new Date(m.date), { start, end }) && m.cooked).length >= 5
        };
    }, [tasks, workoutLogs, studySessions, expenses, budgetLimitTotal, mealPlan, today, settings.weekStartsOn]);

    // ── Today's Dinner snapshot ──
    const dinnerPlanned = useMemo(() => {
        const dinnerMeals = mealPlan.filter(m => m.date === todayVal && m.mealType === 'dinner');
        if (dinnerMeals.length > 0) {
            const entry = dinnerMeals[0];
            const name = entry.recipeId ? recipes.find(r => r.id === entry.recipeId)?.title : entry.customMeal;
            const recipeInfo = entry.recipeId ? recipes.find(r => r.id === entry.recipeId) : null;

            const reasons = [];
            // Reasons why this dinner fits the dashboard's intelligent coaching philosophy
            if (recipeInfo) {
                if (recipeInfo.protein && recipeInfo.protein >= 25) reasons.push('✓ High protein target matched');
                if (recipeInfo.calories && recipeInfo.calories < 650) reasons.push('✓ Under calories target limit');
                if ((recipeInfo.prepTime || 0) + (recipeInfo.cookTime || 0) <= 25) reasons.push('✓ 15-minute quick prep time');
            } else {
                reasons.push('✓ Quick home cooked meal option');
            }
            const hasEggs = inventory.some(i => i.name.toLowerCase().includes('egg') && i.quantity < i.minQuantity);
            if (hasEggs || name?.toLowerCase().includes('egg')) reasons.push('✓ Eggs expire soon / low stock');

            return { name, reasons };
        }
        return null;
    }, [mealPlan, recipes, todayVal, inventory]);

    // Roadmap Milestones vertical flow formatting
    const milestones = useMemo(() => {
        const list = [
            { label: '🇮🇳 Graduate portfolio', status: 'done', desc: 'Completed successfully' },
            { label: '🇩🇪 German B2 Language', status: 'progress', desc: '65% Complete' },
            { label: '✈ Relocation visa', status: 'pending', desc: 'Awaiting language completion' },
            { label: '💼 Ausbildung Contract', status: 'locked', desc: 'Prerequisite German B2 required' },
            { label: '🏡 Apartment lease', status: 'future', desc: 'Move timeline horizon' }
        ];
        return list;
    }, []);

    // Today's schedule events
    const todayEvents = useMemo(() => {
        return events.filter(e => e.startDate.startsWith(todayVal)).sort((a, b) => a.startDate.localeCompare(b.startDate));
    }, [events, todayVal]);

    // parsed Second Brain Notepad categories
    const notesContent = settings.quickNotes || '';
    const updateNotesContent = (txt: string) => {
        updateSettings({ quickNotes: txt });
    };

    // ── FOCUS MODE TIMER STATION OVERLAY ──
    if (startDayStep === 'focus') {
        const currentTargetText = customFocusTarget || (topTask ? topTask.title : 'General Focus Work');
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(8, 7, 18, 0.98)', backdropFilter: 'blur(35px)',
                zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: 24
            }}>
                <div style={{ maxWidth: 640, width: '100%', display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-violet)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Flame size={16} /> FOCUS MODE ACTIVE
                        </span>
                        <button className="btn btn-ghost" style={{ padding: 8, borderRadius: '50%' }} onClick={() => setStartDayStep('idle')}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{
                        width: 250, height: 250, borderRadius: '50%',
                        border: '8px solid rgba(255,255,255,0.02)',
                        borderTopColor: timerRunning ? 'var(--accent-violet)' : 'rgba(255,255,255,0.1)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(124, 58, 237, 0.15)', background: 'rgba(0,0,0,0.4)',
                        transition: 'all 0.5s ease'
                    }}>
                        <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'monospace', letterSpacing: 2 }}>
                            {formatTimer(timerSeconds)}
                        </div>
                        <span className="text-xs text-muted" style={{ marginTop: 4 }}>TIMER CONTINUITY</span>
                    </div>

                    <div style={{ display: 'flex', gap: 14 }}>
                        <button className={`btn ${timerRunning ? 'btn-secondary' : 'btn-primary'}`} style={{ display: 'flex', gap: 6, width: 120 }} onClick={() => setTimerRunning(!timerRunning)}>
                            {timerRunning ? <Pause size={15} /> : <Play size={15} />}
                            {timerRunning ? 'Pause' : 'Start'}
                        </button>
                        <button className="btn btn-secondary" style={{ display: 'flex', gap: 6 }} onClick={() => { setTimerRunning(false); setTimerSeconds(25 * 60); }}>
                            <RotateCcw size={15} /> Reset
                        </button>
                    </div>

                    <div className="card" style={{ padding: 24, width: '100%', background: 'rgba(255,255,255,0.02)' }}>
                        <h4 className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>ACTIVE FOCUS OBJECTIVE</h4>
                        <input
                            className="input"
                            style={{
                                background: 'transparent', border: 'none', borderBottom: '2px solid rgba(255,255,255,0.1)',
                                fontSize: 18, fontWeight: 700, textAlign: 'center', paddingBottom: 6, color: 'var(--text-primary)', width: '100%'
                            }}
                            value={currentTargetText}
                            onChange={(e) => setCustomFocusTarget(e.target.value)}
                            placeholder="Draft focus objective..."
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, background: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderRadius: 10 }}>
                        <span>Logged Water: <strong>{todayWater} / 2000 ml</strong></span>
                        <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border-soft)' }} onClick={() => addWaterIntake({ date: todayVal, amount: 250 })}>
                            +250ml
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: 40 }}>
            {/* Header section with Dynamic Status Greet */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>
                        Good {today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening'}, {username} 👋
                    </h2>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', color: 'var(--text-secondary)', fontSize: 13, marginTop: 6 }}>
                        <span style={{ fontWeight: 600, color: 'var(--accent-violet-light)' }}>
                            {prioritiesCount} priorities today
                        </span>
                        <span>·</span>
                        <span>{mealsPlannedCount} planned meals</span>
                        <span>·</span>
                        <span>{meetingsTodayCount} meetings</span>
                        <span>·</span>
                        <span>{estimatedFreeTime}h free time est.</span>
                        <span>·</span>
                        <span style={{
                            color: budgetStatus === 'Budget is healthy' ? 'var(--accent-green)' : 'var(--accent-red)',
                            fontWeight: 500
                        }}>{budgetStatus}</span>
                        <span>·</span>
                        <span style={{ color: 'var(--accent-cyan)' }}>{inventoryStatus}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" style={{ display: 'flex', gap: 6, background: 'var(--gradient-violet)', border: 'none', color: 'white' }} onClick={() => setShowBriefingModal(true)}>
                        <Sparkles size={14} /> Full Daily Briefing
                    </button>
                    <button className="btn btn-primary" style={{ display: 'flex', gap: 6 }} onClick={() => setStartDayStep('briefing')}>
                        <Flame size={14} /> Start My Day
                    </button>
                </div>
            </div>

            {/* BRIEFING STEP WIZARD ROW */}
            {startDayStep === 'briefing' && (
                <div className="card" style={{
                    padding: 24, marginBottom: 24, border: '1px dashed var(--accent-violet)',
                    background: 'rgba(124, 58, 237, 0.03)', position: 'relative'
                }}>
                    <button style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setStartDayStep('idle')}>
                        <X size={18} />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Sparkles size={18} color="var(--accent-violet)" />
                            <h3 style={{ fontSize: 16, fontWeight: 800 }}>☀️ Today's Energy & Focus Briefing</h3>
                        </div>

                        {/* Energy Rating picker */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>Assess Today's Energy:</span>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {[1, 2, 3, 4, 5].map((stars) => (
                                    <Star
                                        key={stars}
                                        size={18}
                                        style={{ cursor: 'pointer', fill: stars <= energyRating ? 'var(--accent-amber)' : 'none', color: 'var(--accent-amber)' }}
                                        onClick={() => setEnergyRating(stars)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                🎯 <strong>Priority Focus:</strong> {topTask ? topTask.title : 'None selected. Add or check planning list.'}<br />
                                🍽 <strong>Dinner target:</strong> {dinnerPlanned ? dinnerPlanned.name : 'No dinner scheduled.'}<br />
                                ⏱ <strong>Estimated Workload:</strong> 2h 30m required logs.
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                ⚠️ <strong>Warnings:</strong> {inventoryStatus}<br />
                                🔮 <strong>Predictions:</strong> Goal B2 German achievable in 91 days at current study streak.
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                            <button className="btn btn-primary" onClick={() => setStartDayStep('focus')}>
                                Begin Day & Enter Focus Mode
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Popup modal fallback briefing */}
            {showBriefingModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                    <div className="card" style={{ maxWidth: 500, width: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sparkles size={18} color="var(--accent-violet-light)" />
                                <h3 style={{ fontSize: 16, fontWeight: 800 }}>☀️ Today's Summary Briefing</h3>
                            </div>
                            <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setShowBriefingModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                Good day, <strong>{username}</strong>! Today's mission checklist is active. Your top priority item is to complete {topTask ? `"${topTask.title}"` : 'any open planner tasks'}.
                            </div>
                            <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                                🍽 <strong>Dinner outlook:</strong> {dinnerPlanned ? `${dinnerPlanned.name} (${dinnerPlanned.reasons[0].toLowerCase()})` : 'Nothing planned. Consider planning a meal with low stock ingredients.'}
                            </div>
                            <div>
                                💰 <strong>Financial snap:</strong> {totalMonthExpenses > 0 ? `Spent ${Math.round((totalMonthExpenses / budgetLimitTotal) * 100)}% of limit.` : 'Set budget categories in finance.'} Budget status is <span style={{ color: 'var(--accent-green)' }}>healthy</span>. No invoices due today.
                            </div>
                            <div>
                                📚 <strong>Knowledge targets:</strong> Complete revision to protect your <strong>{streak}-day Learning streak</strong>.
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                            <button className="btn btn-primary" onClick={() => setShowBriefingModal(false)}>
                                Make today count!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Split layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>

                {/* LEFT COLUMN - Primary Today Operations (8-grid) */}
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Today's Mission progress */}
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Target size={18} color="var(--accent-violet-light)" /> Today's Mission
                                </h3>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Habits and priority daily objectives</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>MISSION PROGRESS</div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: priorityScore >= 75 ? 'var(--accent-green)' : 'var(--accent-violet-light)' }}>
                                        {priorityScore}%
                                    </div>
                                </div>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    border: '4px solid rgba(255,255,255,0.05)',
                                    borderTopColor: priorityScore >= 75 ? 'var(--accent-green)' : 'var(--accent-violet)',
                                    transform: `rotate(${priorityScore * 3.6}deg)`,
                                    transition: 'all 0.4s ease'
                                }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {missionItems.map((item) => {
                                const statusColor = {
                                    critical: { bg: 'rgba(239, 68, 68, 0.04)', border: 'rgba(239, 68, 68, 0.2)', badge: '🔴 Critical', color: 'var(--accent-red)' },
                                    today: { bg: 'rgba(245, 158, 11, 0.04)', border: 'rgba(245, 158, 11, 0.2)', badge: '🟡 Today', color: 'var(--accent-amber)' },
                                    complete: { bg: 'rgba(16, 185, 129, 0.04)', border: 'rgba(16, 185, 129, 0.2)', badge: '🟢 Complete', color: 'var(--accent-green)' }
                                }[item.status];

                                return (
                                    <div key={item.id} style={{
                                        display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '12px 16px', borderRadius: 12, background: statusColor.bg, border: `1px solid ${statusColor.border}`
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <input
                                                type="checkbox"
                                                checked={item.checked}
                                                onChange={() => {
                                                    if (item.id === 'task' && topTask) {
                                                        updateTask(topTask.id, { status: 'done' });
                                                    }
                                                }}
                                                disabled={item.id !== 'task' || !topTask}
                                                style={{ width: 18, height: 18, cursor: (item.id === 'task' && topTask) ? 'pointer' : 'not-allowed', accentColor: statusColor.color }}
                                            />
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                                                <div className="text-muted" style={{ fontSize: 11 }}>{item.desc}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: statusColor.color, textTransform: 'uppercase' }}>
                                                {statusColor.badge}
                                            </span>
                                            {item.id === 'water' && !waterGoalMet && (
                                                <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => addWaterIntake({ date: todayVal, amount: 250 })}>
                                                    +250ml
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Today's Schedule & Timeline */}
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Calendar size={18} color="var(--accent-violet-light)" /> Today's Schedule
                                </h3>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chronological outline of the day's timeline</p>
                            </div>
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--accent-violet)' }} onClick={() => navigate('/planning')}>
                                View Planner
                            </button>
                        </div>

                        {todayEvents.length === 0 ? (
                            <div style={{ padding: 14, background: 'var(--bg-secondary)', borderRadius: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                                No scheduled events for today. Add calendar item inside Planner.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {todayEvents.map((evt) => (
                                    <div key={evt.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, minWidth: 60, color: 'var(--accent-violet)' }}>
                                            {evt.startDate.split('T')[1]?.slice(0, 5) || 'All Day'}
                                        </div>
                                        <div style={{ width: 3, height: 16, background: evt.color || 'var(--accent-violet)' }} />
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{evt.title}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Intelligent Suggestions */}
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <Zap size={16} color="var(--accent-amber)" />
                            <h4 style={{ fontWeight: 700, fontSize: 14 }}>Intelligent Suggestions</h4>
                        </div>
                        {coachSuggestions.length === 0 ? (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No suggestions at this moment. Daily objectives balanced.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {coachSuggestions.map((suggestion) => (
                                    <div key={suggestion.id} className={`alert-chip alert-chip-${suggestion.type}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                                            <span style={{ fontSize: 13 }}>{suggestion.msg}</span>
                                        </div>
                                        {suggestion.actionLabel && (
                                            <button className="btn btn-ghost btn-sm" style={{ padding: '2px 8px', fontSize: 11 }} onClick={suggestion.onAction}>
                                                {suggestion.actionLabel}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Predictions Portal */}
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <Award size={16} color="var(--accent-violet-light)" />
                            <h4 style={{ fontWeight: 700, fontSize: 14 }}>Proactive Life Predictions</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {predictions.map((pred, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 10,
                                    borderLeft: '3px solid var(--accent-violet)'
                                }}>
                                    <Info size={14} style={{ color: 'var(--accent-violet)', marginTop: 2, flexShrink: 0 }} />
                                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{pred}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Life Roadmap Milestones */}
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                                <h4 style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Target size={16} /> Life Roadmap Timeline
                                </h4>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Visualize future milestones and prerequisites status</p>
                            </div>
                        </div>

                        {/* Roadmap List styling */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingLeft: 10, position: 'relative' }}>
                            {milestones.map((m, i) => {
                                const symbol = {
                                    done: { text: '✓', color: 'var(--accent-green)', bg: 'rgba(16, 185, 129, 0.1)', border: 'var(--accent-green)' },
                                    progress: { text: '⚡', color: 'var(--accent-violet)', bg: 'rgba(124, 58, 237, 0.1)', border: 'var(--accent-violet)' },
                                    pending: { text: '✈', color: 'var(--text-muted)', bg: 'var(--bg-secondary)', border: 'var(--border-soft)' },
                                    locked: { text: '🔒', color: 'var(--accent-red)', bg: 'rgba(239, 68, 68, 0.1)', border: 'var(--accent-red)' },
                                    future: { text: '⏰', color: 'var(--text-muted)', bg: 'var(--bg-secondary)', border: 'var(--border-soft)' }
                                }[m.status];

                                return (
                                    <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', position: 'relative' }}>
                                        {i < milestones.length - 1 && (
                                            <div style={{
                                                position: 'absolute', top: 32, left: 16, width: 2, height: 18,
                                                background: 'var(--border-soft)'
                                            }} />
                                        )}
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: `1.5px solid ${symbol.border}`, background: symbol.bg,
                                            fontWeight: 700, fontSize: 13, color: symbol.color, flexShrink: 0
                                        }}>
                                            {symbol.text}
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 13, fontWeight: 700 }}>{m.label}</span>
                                            <span style={{
                                                fontSize: 9, textTransform: 'uppercase', color: symbol.color,
                                                fontWeight: 800, marginLeft: 10, background: symbol.bg, padding: '2px 6px', borderRadius: 4
                                            }}>{m.status}</span>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - Health Check & Inbox (4-grid) */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Life Pulse Overall Coach Score */}
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h4 style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Award size={16} color="var(--accent-violet-light)" /> Life Pulse Overall
                            </h4>
                            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-violet-light)' }}>
                                {lifePulse.overall}%
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                            {lifePulse.scores.map((s) => (
                                <div key={s.name}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{s.name} Area</span>
                                        <span>{s.value}%</span>
                                    </div>
                                    <div className="progress-bar" style={{ height: 6 }}>
                                        <div className="progress-bar-fill" style={{ width: `${s.value}%`, background: s.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            padding: 10, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-soft)',
                            borderRadius: 8, fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4
                        }}>
                            💡 <strong>Coach Advice:</strong> {lifePulse.coachingText}
                        </div>
                    </div>

                    {/* Second Brain Inbox - Upgraded Category view */}
                    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Edit2 size={16} /> Second Brain Inbox
                            </h4>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Auto-saving</span>
                        </div>

                        {/* Tabs display */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                            {(['notes', 'ideas', 'bookmarks'] as const).map(tb => (
                                <button
                                    key={tb}
                                    className={`btn btn-secondary btn-sm`}
                                    style={{
                                        padding: '4px 8px', fontSize: 11, flex: 1,
                                        background: secondBrainTab === tb ? 'var(--accent-violet)' : 'rgba(255,255,255,0.02)',
                                        color: secondBrainTab === tb ? 'white' : 'var(--text-secondary)'
                                    }}
                                    onClick={() => setSecondBrainTab(tb)}
                                >
                                    {tb === 'notes' ? 'Notes' : tb === 'ideas' ? 'Ideas' : 'Links'}
                                </button>
                            ))}
                        </div>

                        {secondBrainTab === 'notes' && (
                            <textarea
                                className="input"
                                value={notesContent}
                                onChange={(e) => updateNotesContent(e.target.value)}
                                placeholder="Jot down visa information, Germany links, random thoughts..."
                                rows={6}
                                style={{ width: '100%', resize: 'none', background: 'rgba(0,0,0,0.2)', fontSize: 13 }}
                            />
                        )}

                        {secondBrainTab === 'ideas' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <textarea
                                    className="input"
                                    value={notesContent.split('\n').filter(l => l.startsWith('Idea: ')).join('\n')}
                                    onChange={(e) => {
                                        const originalNonIdeas = notesContent.split('\n').filter(l => !l.startsWith('Idea: '));
                                        updateNotesContent([...originalNonIdeas, ...e.target.value.split('\n')].join('\n'));
                                    }}
                                    placeholder="Idea: Create a productivity timeline app..."
                                    rows={5}
                                    style={{ width: '100%', resize: 'none', background: 'rgba(0,0,0,0.2)', fontSize: 12 }}
                                />
                                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Tip: Prefix item line with "Idea: " to catalog.</span>
                            </div>
                        )}

                        {secondBrainTab === 'bookmarks' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <textarea
                                    className="input"
                                    value={notesContent.split('\n').filter(l => l.includes('http')).join('\n')}
                                    onChange={(e) => {
                                        const originalNonLinks = notesContent.split('\n').filter(l => !l.includes('http'));
                                        updateNotesContent([...originalNonLinks, ...e.target.value.split('\n')].join('\n'));
                                    }}
                                    placeholder="https://anmeldung.de - Registration link"
                                    rows={5}
                                    style={{ width: '100%', resize: 'none', background: 'rgba(0,0,0,0.2)', fontSize: 12 }}
                                />
                                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Input reference bookmarks and web links here.</span>
                            </div>
                        )}
                    </div>

                    {/* Today's Dinner snapshot */}
                    <div className="card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => navigate('/food')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h4 style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Apple size={16} color="var(--accent-amber)" /> Today's Dinner
                            </h4>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Recipes</span>
                        </div>

                        {dinnerPlanned ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-secondary)' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{dinnerPlanned.name}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4 }}>
                                    {dinnerPlanned.reasons.map((reason, idx) => (
                                        <span key={idx} style={{ fontSize: 11, color: 'var(--accent-green)' }}>{reason}</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-secondary)', fontSize: 13, color: 'var(--text-muted)' }}>
                                No dinner planned today.
                            </div>
                        )}
                    </div>

                    {/* Weekly progress overview widget */}
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <h4 style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Clock size={16} color="var(--accent-violet)" /> Weekly Progression
                            </h4>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Summary</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Tasks Completed</span>
                                    <span>{weeklyProgress.tasksDone} / {weeklyProgress.tasksTotal}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{ width: `${(weeklyProgress.tasksDone / weeklyProgress.tasksTotal) * 100}%` }} />
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Gym Target</span>
                                    <span>{weeklyProgress.gymDone} / {weeklyProgress.gymGoal} days</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{ width: `${(weeklyProgress.gymDone / weeklyProgress.gymGoal) * 100}%`, background: 'var(--gradient-danger)' }} />
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Study Revision</span>
                                    <span>{weeklyProgress.studyHrs} hrs logged</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (weeklyProgress.studyHrs / 5) * 100)}%`, background: 'var(--gradient-success)' }} />
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Budget Used</span>
                                    <span>{weeklyProgress.budgetSpent}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{
                                        width: `${weeklyProgress.budgetSpent}%`,
                                        background: weeklyProgress.budgetSpent > 90 ? 'var(--gradient-danger)' : 'var(--gradient-success)'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
