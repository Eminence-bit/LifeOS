import { useMemo, useState, useEffect } from 'react';
import {
    CheckSquare, Calendar, Wallet, Apple, Heart, BookOpen,
    AlertTriangle, FileText, Zap, TrendingUp, ArrowUpRight,
    Clock, Flame, Target, ShoppingCart, ChevronRight, PlusCircle, Sparkles, Edit2, Play, Pause, RotateCcw, X, Info, Award, Bookmark, Lightbulb, Star, RefreshCw
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
import { fetchAIDashboardAdvice } from '@/services/aiService';
import type { AIDashboardAdvice, AISuggestion } from '@/services/aiService';

function RadarChart({ scores, details }: { scores: { name: string; value: number; color: string }[]; details: Record<string, string> }) {
    const [hoveredSector, setHoveredSector] = useState<string | null>(null);
    const cx = 110;
    const cy = 100;
    const r = 80; // Enlarged from 70 to 80
    const pointsCount = scores.length;

    // Level lines (25%, 50%, 75%, 100%)
    const levelLines = [0.25, 0.5, 0.75, 1.0].map(level => {
        const pts = [];
        for (let i = 0; i < pointsCount; i++) {
            const angle = (i * 2 * Math.PI) / pointsCount - Math.PI / 2;
            const x = cx + r * level * Math.cos(angle);
            const y = cy + r * level * Math.sin(angle);
            pts.push(`${x},${y}`);
        }
        return pts.join(' ');
    });

    // User data points
    const userPts = scores.map((s, i) => {
        const valRatio = Math.max(0.05, s.value / 100);
        const angle = (i * 2 * Math.PI) / pointsCount - Math.PI / 2;
        const x = cx + r * valRatio * Math.cos(angle);
        const y = cy + r * valRatio * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '14px 0', width: '100%' }}>
            <svg width="240" height="220" style={{ overflow: 'visible' }}>
                {/* Translucent complete outline backdrop (100% boundary limit) */}
                <polygon
                    points={levelLines[levelLines.length - 1]}
                    fill="rgba(124, 58, 237, 0.25)"
                    stroke="var(--border-strong)"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                />

                {/* Level Grid Polygons */}
                {levelLines.map((pts, idx) => (
                    <polygon
                        key={idx}
                        points={pts}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="0.8"
                    />
                ))}

                {/* Axis lines */}
                {scores.map((s, i) => {
                    const angle = (i * 2 * Math.PI) / pointsCount - Math.PI / 2;
                    const x = cx + r * Math.cos(angle);
                    const y = cy + r * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            x1={cx}
                            y1={cy}
                            x2={x}
                            y2={y}
                            stroke={hoveredSector === s.name.toLowerCase() ? s.color : "var(--border)"}
                            strokeWidth={hoveredSector === s.name.toLowerCase() ? "2" : "1"}
                            style={{ transition: 'stroke-width 0.2s, stroke 0.2s' }}
                        />
                    );
                })}

                {/* User Data Polygon */}
                <polygon
                    points={userPts}
                    fill="rgba(124, 58, 237, 0.4)"
                    stroke="var(--accent-violet-light)"
                    strokeWidth="2.5"
                />

                {/* Score dots */}
                {scores.map((s, i) => {
                    const valRatio = Math.max(0.05, s.value / 100);
                    const angle = (i * 2 * Math.PI) / pointsCount - Math.PI / 2;
                    const x = cx + r * valRatio * Math.cos(angle);
                    const y = cy + r * valRatio * Math.sin(angle);
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r={hoveredSector === s.name.toLowerCase() ? "6" : "4"}
                            fill={s.color}
                            style={{ transition: 'r 0.2s' }}
                            onMouseEnter={() => setHoveredSector(s.name.toLowerCase())}
                            onMouseLeave={() => setHoveredSector(null)}
                        />
                    );
                })}

                {/* Outer Labels */}
                {scores.map((s, i) => {
                    const angle = (i * 2 * Math.PI) / pointsCount - Math.PI / 2;
                    const x = cx + (r + 18) * Math.cos(angle);
                    const y = cy + (r + 10) * Math.sin(angle);

                    let textAnchor: 'inherit' | 'end' | 'start' | 'middle' = 'middle';
                    if (Math.cos(angle) > 0.1) textAnchor = 'start';
                    else if (Math.cos(angle) < -0.1) textAnchor = 'end';

                    const isHovered = hoveredSector === s.name.toLowerCase();

                    return (
                        <g
                            key={i}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredSector(s.name.toLowerCase())}
                            onMouseLeave={() => setHoveredSector(null)}
                        >
                            <text
                                x={x}
                                y={y}
                                textAnchor={textAnchor}
                                fill={isHovered ? s.color : "var(--text-secondary)"}
                                fontSize={isHovered ? "11.5" : "10.5"}
                                fontWeight="700"
                                style={{ transition: 'fill 0.2s, font-size 0.2s' }}
                            >
                                {s.name}
                            </text>
                            <text
                                x={x}
                                y={y + 11}
                                textAnchor={textAnchor}
                                fill="var(--text-muted)"
                                fontSize="9"
                            >
                                {s.value}%
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Hover details explanation tooltip */}
            {hoveredSector && (
                <div style={{
                    marginTop: 18,
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-soft)',
                    borderLeft: `3px solid ${scores.find(s => s.name.toLowerCase() === hoveredSector)?.color || 'var(--accent-violet)'}`,
                    borderRadius: '4px 8px 8px 4px',
                    fontSize: 11.5,
                    width: '100%',
                    textAlign: 'left'
                }}>
                    <strong style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                        {hoveredSector} Score Analysis
                    </strong>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>
                        {details[hoveredSector]}
                    </div>
                </div>
            )}
        </div>
    );
}

export function DashboardPage() {
    const navigate = useNavigate();
    const today = new Date();
    const todayVal = todayStr();

    // ── Store Selectors ──
    const { tasks, updateTask, addTask, addGoal, events, goals } = usePlanningStore();
    const { expenses, incomes, budgets, savingsGoals } = useFinanceStore();
    const { inventory, shoppingList, mealPlan, recipes, addShoppingItem } = useFoodStore();
    const { workoutLogs, workoutPlans, waterIntakes, sleepLogs, addWaterIntake } = useHealthStore();
    const { topics, studySessions, dailyGoalMinutes, streak } = useLearningStore();
    const { documents, addDocument } = useDocumentsStore();
    const { settings, updateSettings } = useSettingsStore();
    const notesContent = settings.quickNotes || '';
    const updateNotesContent = (txt: string) => {
        updateSettings({ quickNotes: txt });
    };

    const username = settings.userProfile?.name || 'User';

    // ── Local States ──
    const [showBriefingModal, setShowBriefingModal] = useState(false);
    const [startDayStep, setStartDayStep] = useState<'idle' | 'briefing' | 'focus'>('idle');
    const [timerSeconds, setTimerSeconds] = useState(25 * 60);
    const [timerRunning, setTimerRunning] = useState(false);
    const [customFocusTarget, setCustomFocusTarget] = useState('');
    const [secondBrainTab, setSecondBrainTab] = useState<'notes' | 'ideas' | 'bookmarks'>('notes');
    const [manualEnergyRating, setManualEnergyRating] = useState<number | null>(null);
    const [replayTab, setReplayTab] = useState<'today' | 'weekly' | 'monthly' | 'yearly'>('today');
    const [dailyMood, setDailyMood] = useState<string>('😊');
    const [showDiaryModal, setShowDiaryModal] = useState(false);

    // ── AI Suggestions & Analytics State ──
    const [aiAdvice, setAiAdvice] = useState<AIDashboardAdvice | null>(null);
    const [aiLoading, setAiLoading] = useState<boolean>(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const loadAIAdvice = async (forceRefresh = false) => {
        console.log("loadAIAdvice: Triggered", { forceRefresh, hasApiKey: !!settings.geminiApiKey });
        setAiLoading(true);
        setAiError(null);
        try {
            if (!forceRefresh) {
                const cached = sessionStorage.getItem('lifeos_ai_advice_v1');
                console.log("loadAIAdvice: Checking sessionStorage cache", { cachedExists: !!cached });
                if (cached) {
                    const parsed = JSON.parse(cached);
                    console.log("loadAIAdvice: Using cached AI advice", parsed);
                    setAiAdvice(parsed);
                    setAiLoading(false);
                    return;
                }
            }

            const currentMonthStr = currentMonth();
            const totalMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr)).reduce((s, e) => s + e.amount, 0);
            const todayWaterAmount = waterIntakes.filter(w => w.date === todayVal).reduce((sum, w) => sum + w.amount, 0);

            console.log("loadAIAdvice: Invoking fetchAIDashboardAdvice...");
            const res = await fetchAIDashboardAdvice({
                settings,
                tasks,
                expenses,
                incomes,
                budgets,
                savingsGoals,
                inventory,
                mealPlan,
                recipes,
                workoutLogs,
                studySessions,
                documents,
                streak,
                dailyGoalMinutes,
                todayWater: todayWaterAmount
            });
            console.log("loadAIAdvice: Received fetchAIDashboardAdvice response", res);
            setAiAdvice(res);
            sessionStorage.setItem('lifeos_ai_advice_v1', JSON.stringify(res));
        } catch (err: any) {
            console.error("loadAIAdvice: Caught exception in loadAIAdvice:", err);
            setAiError('Failed to fetch AI Dashboard Advice.');
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        loadAIAdvice();
    }, []);

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

    // Helper to calculate days since date
    const daysSince = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const t = new Date();
            date.setHours(0, 0, 0, 0);
            t.setHours(0, 0, 0, 0);
            return Math.floor(Math.abs(t.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        } catch {
            return 999;
        }
    };

    // ── Context Filtering (F) ──
    const filteredTasks = useMemo(() => {
        const ctx = settings.dashboardContext || 'work';
        if (ctx === 'vacation') {
            return tasks.filter(t => t.category?.toLowerCase() !== 'work' && t.category?.toLowerCase() !== 'study');
        } else if (ctx === 'weekend') {
            return tasks.filter(t => t.category?.toLowerCase() !== 'work');
        }
        return tasks;
    }, [tasks, settings.dashboardContext]);

    // ── Momentum Consistency Score (G) ──
    const momentumScore = useMemo(() => {
        const past7DaysWorkouts = workoutLogs.filter(w => daysSince(w.date) <= 7).length;
        const workoutConsistency = Math.min(100, (past7DaysWorkouts / 3) * 100);

        const studyDaysPast7 = new Set(studySessions.filter(s => daysSince(s.date) <= 7).map(s => s.date)).size;
        const studyConsistency = Math.min(100, (studyDaysPast7 / 5) * 100);

        const tasksPast7 = tasks.filter(t => daysSince(t.createdAt) <= 7);
        const completedTasksPast7 = tasksPast7.filter(t => t.status === 'done').length;
        const taskConsistency = tasksPast7.length > 0 ? (completedTasksPast7 / tasksPast7.length) * 100 : 80;

        return Math.round((workoutConsistency * 0.3) + (studyConsistency * 0.4) + (taskConsistency * 0.3));
    }, [workoutLogs, studySessions, tasks]);

    // ── Data Calculations ──
    const topTask = useMemo(() => {
        return filteredTasks.find(t => t.status !== 'done' && (!t.dueDate || t.dueDate <= todayVal));
    }, [filteredTasks, todayVal]);

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

    const prioritiesCount = filteredTasks.filter(t => t.status !== 'done' && t.dueDate === todayVal).length;
    const mealsPlannedCount = mealPlan.filter(m => m.date === todayVal).length;

    // ── Weekly Aggregates ──
    const weeklyStudyMinutes = useMemo(() => {
        return studySessions.filter(s => daysSince(s.date) <= 7).reduce((sum, s) => sum + s.duration, 0) + todayStudyMinutes;
    }, [studySessions, todayStudyMinutes]);

    const weeklyWorkouts = useMemo(() => {
        return workoutLogs.filter(w => daysSince(w.date) <= 7).length;
    }, [workoutLogs]);

    const weeklyExpenses = useMemo(() => {
        return expenses.filter(e => daysSince(e.date) <= 7).reduce((sum, e) => sum + e.amount, 0);
    }, [expenses]);

    const weeklyWaterDays = useMemo(() => {
        const map: Record<string, number> = {};
        waterIntakes.filter(w => daysSince(w.date) <= 7).forEach(w => {
            map[w.date] = (map[w.date] || 0) + w.amount;
        });
        return Object.values(map).filter(amount => amount >= 2000).length;
    }, [waterIntakes]);

    const weeklySleepQuality = useMemo(() => {
        const last7 = sleepLogs.filter(s => daysSince(s.date) <= 7);
        return last7.length > 0 ? (last7.reduce((sum, s) => sum + s.quality, 0) / last7.length).toFixed(1) : '4.2';
    }, [sleepLogs]);

    // ── Monthly Aggregates ──
    const monthlyStudyMinutes = useMemo(() => {
        const curM = todayVal.slice(0, 7);
        return studySessions.filter(s => s.date.startsWith(curM)).reduce((sum, s) => sum + s.duration, 0) + todayStudyMinutes;
    }, [studySessions, todayVal, todayStudyMinutes]);

    const monthlyWorkouts = useMemo(() => {
        const curM = todayVal.slice(0, 7);
        return workoutLogs.filter(w => w.date.startsWith(curM)).length;
    }, [workoutLogs, todayVal]);

    const monthlyMeals = useMemo(() => {
        const curM = todayVal.slice(0, 7);
        return mealPlan.filter(m => m.date.startsWith(curM)).length;
    }, [mealPlan, todayVal]);

    const monthlySleepQuality = useMemo(() => {
        const curM = todayVal.slice(0, 7);
        const thisMonthSleep = sleepLogs.filter(s => s.date.startsWith(curM));
        return thisMonthSleep.length > 0 ? (thisMonthSleep.reduce((sum, s) => sum + s.quality, 0) / thisMonthSleep.length).toFixed(1) : '4.3';
    }, [sleepLogs, todayVal]);

    // ── Yearly Aggregates ──
    const yearlyStudyMinutes = useMemo(() => {
        const curY = todayVal.slice(0, 4);
        return studySessions.filter(s => s.date.startsWith(curY)).reduce((sum, s) => sum + s.duration, 0) + todayStudyMinutes;
    }, [studySessions, todayVal, todayStudyMinutes]);

    const yearlyWorkouts = useMemo(() => {
        const curY = todayVal.slice(0, 4);
        return workoutLogs.filter(w => w.date.startsWith(curY)).length;
    }, [workoutLogs, todayVal]);

    const yearlyExpenses = useMemo(() => {
        const curY = todayVal.slice(0, 4);
        return expenses.filter(e => e.date.startsWith(curY)).reduce((sum, e) => sum + e.amount, 0);
    }, [expenses, todayVal]);

    const yearlyMeals = useMemo(() => {
        const curY = todayVal.slice(0, 4);
        return mealPlan.filter(m => m.date.startsWith(curY)).length;
    }, [mealPlan, todayVal]);

    const yearlySleepQuality = useMemo(() => {
        const curY = todayVal.slice(0, 4);
        const thisYearSleep = sleepLogs.filter(s => s.date.startsWith(curY));
        return thisYearSleep.length > 0 ? (thisYearSleep.reduce((sum, s) => sum + s.quality, 0) / thisYearSleep.length).toFixed(1) : '4.4';
    }, [sleepLogs, todayVal]);

    // ── Dynamic Greeting & Pacing Stats (A) ──
    const greetingInfo = useMemo(() => {
        const hours = today.getHours();
        let greetText = 'Good Evening';
        let icon = '🌅';
        if (hours < 12) {
            greetText = 'Good Morning';
            icon = '🌅';
        } else if (hours < 17) {
            greetText = 'Good Afternoon';
            icon = '☀️';
        } else if (hours < 21) {
            greetText = 'Good Evening';
            icon = '🌆';
        } else {
            greetText = 'Good Night';
            icon = '🌙';
        }

        const todayPendingTasks = filteredTasks.filter(t => t.status !== 'done' && t.dueDate === todayVal);
        const studyRemaining = Math.max(0, dailyGoalMinutes - todayStudyMinutes);

        let remainingItemsCount = todayPendingTasks.length;
        if (studyRemaining > 0) remainingItemsCount += 1;
        if (todayWater < 2000) remainingItemsCount += 1;
        if (!todayWorkout) remainingItemsCount += 1;

        let subtitle = "You're on track today.";

        if (remainingItemsCount > 0) {
            const estMinutes = (todayPendingTasks.length * 30) + studyRemaining;
            const estHours = Math.floor(estMinutes / 60);
            const estMins = estMinutes % 60;
            if (estMinutes > 0) {
                subtitle = `You have ${remainingItemsCount} meaningful things left today. Estimated completion: ${estHours > 0 ? `${estHours}h ` : ''}${estMins}m`;
            } else {
                subtitle = `Completed main tasks! Remaining habits check keeps you on track.`;
            }
        } else if (streak > 0) {
            subtitle = `Awesome productivity! Your ${streak}-day streak is secured.`;
        }

        return { greetText, icon, subtitle };
    }, [filteredTasks, todayVal, dailyGoalMinutes, todayStudyMinutes, todayWater, todayWorkout, streak]);
    const meetingsTodayCount = events.filter(e => e.startDate.startsWith(todayVal)).length;

    // ── Algorithmic Energy Score (B) ──
    const computedEnergyScore = useMemo(() => {
        const lastSleepLog = sleepLogs.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
        let sleepPoints = 28; // default baseline (avg sleep)
        let sleepSuccess = false;
        if (lastSleepLog) {
            const durRatio = Math.min(1, lastSleepLog.duration / 8);
            const qualRatio = Math.min(1, lastSleepLog.quality / 5);
            sleepPoints = (durRatio * 20) + (qualRatio * 20);
            if (lastSleepLog.duration >= 7 && lastSleepLog.quality >= 4) {
                sleepSuccess = true;
            }
        }

        const waterPoints = Math.min(20, (todayWater / 2000) * 20);
        const waterSuccess = todayWater >= 1500;

        const pendingTodayTasks = tasks.filter(t => t.status !== 'done' && t.dueDate === todayVal).length;
        const workloadPoints = Math.max(0, 20 - (pendingTodayTasks * 4));
        const workloadSuccess = pendingTodayTasks <= 2;

        const workoutPoints = todayWorkout ? 20 : 10;
        const workoutSuccess = todayWorkout;

        const totalScore = Math.min(100, Math.round(sleepPoints + waterPoints + workloadPoints + workoutPoints));

        return {
            totalScore,
            factors: {
                sleep: sleepSuccess || (lastSleepLog && lastSleepLog.duration >= 6.5),
                water: waterSuccess,
                workload: workloadSuccess,
                workout: workoutSuccess,
                previousDay: lastSleepLog ? lastSleepLog.quality >= 3 : true
            }
        };
    }, [sleepLogs, todayWater, tasks, todayVal, todayWorkout]);

    const activeEnergyPercent = manualEnergyRating !== null ? manualEnergyRating * 20 : computedEnergyScore.totalScore;

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

    // ── Active Calories Burned (System 2: Relationship Engine) ──
    const activeCaloriesBurned = useMemo(() => {
        const todayWorkoutsCount = workoutLogs.filter(w => w.date === todayVal).length;
        return todayWorkoutsCount * 400; // 400 kcal per workout session
    }, [workoutLogs, todayVal]);

    // ── Achievements Unlocked (System 3: Achievement Engine) ──
    const achievements = useMemo(() => {
        const list = [];

        // 7-day study streak
        if (streak >= 7) {
            list.push({
                title: '7 Day Study Streak',
                badge: 'Unlocked',
                desc: 'Maintained focus daily.',
                gains: ['+4 Momentum', '+2 Learning Score', '+1 Life Pulse'],
                color: 'var(--accent-violet-light)'
            });
        } else if (streak >= 3) {
            list.push({
                title: '3 Day Study Booster',
                badge: 'Unlocked',
                desc: 'Consistently learning.',
                gains: ['+2 Momentum', '+1 Learning Score'],
                color: 'var(--accent-violet-light)'
            });
        }

        // Workout warrior
        const workoutsCount = workoutLogs.filter(w => daysSince(w.date) <= 7).length;
        if (workoutsCount >= 3) {
            list.push({
                title: 'Workout Warrior',
                badge: 'Unlocked',
                desc: '3+ workouts logged in last 7 days.',
                gains: ['+3 Momentum', '+2 Fitness Level'],
                color: 'var(--accent-red)'
            });
        }

        // Hydration guard
        if (todayWater >= 2000) {
            list.push({
                title: 'Water Shield',
                badge: 'Unlocked',
                desc: '2000ml hydration goal hit today.',
                gains: ['+2 Momentum', '+1 Life Pulse'],
                color: 'var(--accent-cyan)'
            });
        }

        // Frugal mastermind
        if (budgetStatus === 'Budget is healthy' && totalMonthExpenses > 0) {
            list.push({
                title: 'Frugal Mastermind',
                badge: 'Unlocked',
                desc: 'Monthly expenses safe below limits.',
                gains: ['+3 Finance Level'],
                color: 'var(--accent-green)'
            });
        }

        // Organized Brain
        const isInboxEmpty = notesContent.trim().length === 0;
        if (isInboxEmpty) {
            list.push({
                title: 'Organized Brain',
                badge: 'Unlocked',
                desc: 'All notes converted and triaged!',
                gains: ['+2 Mind Clarity'],
                color: 'var(--accent-amber)'
            });
        }

        return list;
    }, [streak, workoutLogs, todayWater, budgetStatus, totalMonthExpenses, notesContent]);

    // ── LIFE PULSE MASTER COACH SCORING ──
    const lifePulse = useMemo(() => {
        // Health score: 40% workout logged + 30% water progress + 30% active calorie burn target (400 kcal)
        const workoutPoints = todayWorkout ? 40 : 0;
        const waterPoints = Math.min(30, (todayWater / 2000) * 30);
        const caloriePoints = Math.min(30, (activeCaloriesBurned / 400) * 30);
        const healthScore = Math.round(workoutPoints + waterPoints + caloriePoints);

        // Finance score: 100 - spent limit percentage (capped)
        const budgetSpentRatio = budgetLimitTotal > 0 ? totalMonthExpenses / budgetLimitTotal : 0;
        const financeScore = Math.max(0, Math.min(100, Math.round(100 - (budgetSpentRatio * 100))));

        // Learning score: target study minutes logged ratio
        const learningScore = Math.min(100, Math.round((todayStudyMinutes / dailyGoalMinutes) * 100)) || 0;

        // Nutrition score: meals planned ratio + workout calorie boost
        const plannedMealsCount = mealPlan.filter(m => m.date === todayVal).length;
        const nutritionScore = Math.min(100, (plannedMealsCount * 33) + (activeCaloriesBurned > 0 ? 10 : 0));

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

        const details = {
            health: `• Workout: ${todayWorkout ? 'Logged (+40%)' : 'None (+0%)'}\n• Water: ${todayWater}ml / 2000ml (Max +30%)\n• Active Burn: ${activeCaloriesBurned} kcal (Max +30% at 400 kcal)\nCurrent Score: ${healthScore}%`,
            finance: `• Spent: ₹${totalMonthExpenses} of ₹${budgetLimitTotal}\n• Status: ${budgetStatus}\nCurrent Score: ${financeScore}%`,
            learning: `• German study: ${todayStudyMinutes} mins / ${dailyGoalMinutes} mins target\nCurrent Score: ${learningScore}%`,
            nutrition: `• Pre-planned meals: ${plannedMealsCount} today\n• Burn boost: ${activeCaloriesBurned > 0 ? 'Active (+10%)' : 'Inactive (+0%)'}\nCurrent Score: ${nutritionScore}%`,
            career: `• Bio settings: ${settings.userProfile?.bio ? 'Completed' : 'Missing'}\nCurrent Score: ${careerScore}%`,
            documents: `• Valid files: ${validDocs} of ${documents.length} total\nCurrent Score: ${docsScore}%`
        };

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

        return { scores, overall, coachingText, details };
    }, [todayWorkout, todayWater, budgetLimitTotal, totalMonthExpenses, todayStudyMinutes, dailyGoalMinutes, mealPlan, todayVal, documents, settings.userProfile, activeCaloriesBurned, budgetStatus]);

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

    // ── AI Advice mapping wrappers ──
    const coachingAdviceText = useMemo(() => {
        if (aiAdvice) return aiAdvice.coachingAdvice;
        return lifePulse.coachingText;
    }, [aiAdvice, lifePulse.coachingText]);

    const renderedSuggestions = useMemo(() => {
        if (aiAdvice) return aiAdvice.suggestions;
        return coachSuggestions.map(s => ({
            id: s.id,
            msg: s.msg,
            type: s.type,
            actionLabel: s.actionLabel,
            actionPath: s.id.startsWith('inv-') ? '/food' : s.id.startsWith('doc-') ? '/documents' : s.id.startsWith('budget-') ? '/finance' : '/learning'
        }));
    }, [aiAdvice, coachSuggestions]);

    const renderedPredictions = useMemo(() => {
        if (aiAdvice) return aiAdvice.predictions;
        return predictions;
    }, [aiAdvice, predictions]);

    const handleSuggestionAction = (suggestion: AISuggestion) => {
        if (suggestion.id.startsWith('sim-inv-') || suggestion.id.startsWith('inv-')) {
            const parts = suggestion.id.split('-');
            const itemId = parts[parts.length - 1];
            const item = inventory.find(i => i.id === itemId);
            if (item) {
                const recPurchase = item.minQuantity * 2 - item.quantity;
                addShoppingItem({ name: item.name, quantity: recPurchase, unit: item.unit });
                alert(`Added ${recPurchase} ${item.unit} of ${item.name} to Shopping List.`);
            } else {
                navigate('/food');
            }
        } else if (suggestion.actionPath) {
            navigate(suggestion.actionPath);
        }
    };

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
                if (recipeInfo.nutrition && recipeInfo.nutrition.protein && recipeInfo.nutrition.protein >= 25) reasons.push('✓ High protein target matched');
                if (recipeInfo.nutrition && recipeInfo.nutrition.calories && recipeInfo.nutrition.calories < 650) reasons.push('✓ Under calories target limit');
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
        if (!goals || goals.length === 0) {
            return [
                { label: 'No milestones configured', status: 'pending' as const, desc: 'Create goals in the planning tab to populate timeline.' }
            ];
        }
        return goals.map(g => ({
            label: g.title,
            status: g.progress === 100 ? ('done' as const) : g.progress > 0 ? ('progress' as const) : ('pending' as const),
            desc: `${g.progress}% Complete${g.targetDate ? ` • Target: ${g.targetDate}` : ''}`
        }));
    }, [goals]);

    // Today's schedule events
    const todayEvents = useMemo(() => {
        return events.filter(e => e.startDate.startsWith(todayVal)).sort((a, b) => a.startDate.localeCompare(b.startDate));
    }, [events, todayVal]);

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
                    <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span>{greetingInfo.icon}</span>
                        <span>{greetingInfo.greetText}, {username}</span>
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
                        {greetingInfo.subtitle}
                    </p>

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

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 3, border: '1px solid var(--border-soft)' }}>
                        {(['work', 'weekend', 'vacation'] as const).map((ctx) => (
                            <button
                                key={ctx}
                                className="btn btn-sm"
                                style={{
                                    padding: '4px 10px',
                                    fontSize: 11,
                                    height: 'auto',
                                    lineHeight: 1.2,
                                    borderRadius: 8,
                                    border: 'none',
                                    background: (settings.dashboardContext || 'work') === ctx ? 'var(--accent-violet)' : 'transparent',
                                    color: (settings.dashboardContext || 'work') === ctx ? 'white' : 'var(--text-secondary)',
                                    textTransform: 'capitalize'
                                }}
                                onClick={() => {
                                    updateSettings({ dashboardContext: ctx });
                                    // Flush AI suggestions cache to force regeneration under new context
                                    sessionStorage.removeItem('lifeos_ai_advice_v1');
                                    loadAIAdvice(true);
                                }}
                            >
                                {ctx}
                            </button>
                        ))}
                    </div>

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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    🔋 Energy Score: <strong style={{ color: 'var(--accent-cyan)' }}>{activeEnergyPercent}%</strong>
                                    {manualEnergyRating !== null && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>(Manual Override)</span>}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ display: 'flex', gap: 3 }}>
                                        {[1, 2, 3, 4, 5].map((stars) => (
                                            <span key={stars} title={`Override to ${stars * 20}%`}>
                                                <Star
                                                    size={15}
                                                    style={{ cursor: 'pointer', fill: stars <= (manualEnergyRating || 0) ? 'var(--accent-amber)' : 'none', color: 'var(--accent-amber)' }}
                                                    onClick={() => setManualEnergyRating(stars)}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                    {manualEnergyRating !== null && (
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            style={{ fontSize: 10, padding: '2px 6px', height: 'auto', border: '1px solid var(--border-soft)' }}
                                            onClick={() => setManualEnergyRating(null)}
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', fontSize: 11, color: 'var(--text-muted)' }}>
                                <span>{computedEnergyScore.factors.sleep ? '✓' : '✗'} Sleep</span>
                                <span>{computedEnergyScore.factors.water ? '✓' : '✗'} Water</span>
                                <span>{computedEnergyScore.factors.workload ? '✓' : '✗'} Workload</span>
                                <span>{computedEnergyScore.factors.workout ? '✓' : '✗'} Workout</span>
                                <span>{computedEnergyScore.factors.previousDay ? '✓' : '✗'} Previous Day</span>
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

                {/* LEFT COLUMN - Primary Today Operations (6-grid) */}
                <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: 20 }}>

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
                    {(settings.dashboardContext || 'work') !== 'vacation' ? (
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
                    ) : (
                        <div className="card" style={{ padding: 24, border: '1px solid var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-cyan)' }}>
                                        🌴 Vacation Mode Active
                                    </h3>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Daily workloads hidden. Focus on travel preparation & savings goals.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {savingsGoals.length === 0 ? (
                                    <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                                        No active savings targets. Maintain budget discipline.
                                    </div>
                                ) : (
                                    savingsGoals.map(sg => {
                                        const pct = Math.round((sg.currentAmount / sg.targetAmount) * 100);
                                        return (
                                            <div key={sg.id} style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 10 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                                                    <span>💰 {sg.title}</span>
                                                    <span style={{ color: 'var(--accent-cyan)' }}>{pct}%</span>
                                                </div>
                                                <div className="progress-bar" style={{ height: 4 }}>
                                                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--accent-cyan)' }} />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <textarea
                                    className="input"
                                    value={notesContent}
                                    onChange={(e) => updateNotesContent(e.target.value)}
                                    placeholder="Jot down visa information, Germany links, random thoughts..."
                                    rows={5}
                                    style={{ width: '100%', resize: 'none', background: 'rgba(0,0,0,0.2)', fontSize: 13 }}
                                />
                                {notesContent.split('\n').filter(l => l.trim().length > 0).length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4, maxHeight: 150, overflowY: 'auto' }}>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Convert note lines to items:</div>
                                        {notesContent.split('\n').map((line, idx) => {
                                            const trimmed = line.trim();
                                            if (!trimmed) return null;
                                            return (
                                                <div
                                                    key={idx}
                                                    className="note-line-item"
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '6px 10px',
                                                        background: 'rgba(255,255,255,0.02)',
                                                        borderRadius: 6,
                                                        fontSize: 12
                                                    }}
                                                >
                                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '55%', color: 'var(--text-primary)' }} title={trimmed}>
                                                        {trimmed}
                                                    </span>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            style={{ fontSize: 9, padding: '2px 5px', height: 'auto', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-violet-light)' }}
                                                            onClick={() => {
                                                                addTask({ title: trimmed, priority: 'medium', status: 'todo', tags: [] });
                                                                const lines = notesContent.split('\n');
                                                                lines.splice(idx, 1);
                                                                updateNotesContent(lines.join('\n'));
                                                                alert(`Converted "${trimmed}" into a Task!`);
                                                            }}
                                                        >
                                                            +Task
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            style={{ fontSize: 9, padding: '2px 5px', height: 'auto', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)' }}
                                                            onClick={() => {
                                                                addGoal({ title: trimmed, progress: 0, taskIds: [] });
                                                                const lines = notesContent.split('\n');
                                                                lines.splice(idx, 1);
                                                                updateNotesContent(lines.join('\n'));
                                                                alert(`Converted "${trimmed}" into a Goal!`);
                                                            }}
                                                        >
                                                            +Goal
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            style={{ fontSize: 9, padding: '2px 5px', height: 'auto', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}
                                                            onClick={() => {
                                                                addDocument({ title: trimmed, type: 'other' });
                                                                const lines = notesContent.split('\n');
                                                                lines.splice(idx, 1);
                                                                updateNotesContent(lines.join('\n'));
                                                                alert(`Converted "${trimmed}" into a Document!`);
                                                            }}
                                                        >
                                                            +Doc
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
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

                {/* RIGHT COLUMN - Health Check & Inbox (6-grid) */}
                <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Life Pulse Radar Chart (System 1 & 2) */}
                    <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Award size={16} color="var(--accent-violet-light)" /> Life Pulse
                            </h4>
                        </div>

                        {/* Central Globe, Percentage, and Status */}
                        <div style={{ textAlign: 'center', margin: '4px 0' }}>
                            <div style={{ fontSize: 32, marginBottom: 4 }}>🌎</div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>
                                {lifePulse.overall}%
                            </div>
                            <div style={{
                                fontSize: 12.5,
                                fontWeight: 700,
                                color: lifePulse.overall >= 90 ? 'var(--accent-green)' :
                                    lifePulse.overall >= 75 ? 'var(--accent-blue)' :
                                        lifePulse.overall >= 60 ? 'var(--accent-amber)' :
                                            'var(--accent-red)'
                            }}>
                                {lifePulse.overall >= 90 ? 'Excellent Life' :
                                    lifePulse.overall >= 75 ? 'Balanced Life' :
                                        lifePulse.overall >= 60 ? 'Recovering Life' :
                                            lifePulse.overall >= 40 ? 'Action Needed' : 'Critical State'}
                            </div>
                        </div>

                        {/* Visual SVG Radar Chart */}
                        <RadarChart scores={lifePulse.scores} details={lifePulse.details} />

                        <div style={{
                            padding: 12,
                            background: 'rgba(124, 58, 237, 0.03)',
                            borderLeft: '4px solid var(--accent-violet-light)',
                            borderRadius: '0 8px 8px 0',
                            fontSize: 11.5,
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                            marginTop: 10,
                            display: 'flex',
                            gap: 10,
                            alignItems: 'flex-start'
                        }}>
                            <Lightbulb size={18} style={{ color: 'var(--accent-violet-light)', flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <strong style={{ color: 'var(--text-primary)' }}>Coach Insight:</strong> {lifePulse.coachingText}
                            </div>
                        </div>
                    </div>

                    {/* Momentum Tracker (System 1 Simplified) */}
                    <div className="card" style={{ padding: 20, background: 'rgba(245, 158, 11, 0.02)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                        <h4 style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                            <Flame size={16} color="var(--accent-amber)" /> Momentum
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 16, fontWeight: 800 }}>↗</span>
                                <span style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: 'var(--accent-amber)',
                                    textTransform: 'capitalize'
                                }}>
                                    {momentumScore >= 80 ? 'Unstoppable' :
                                        momentumScore >= 60 ? 'Steadily Acting' :
                                            momentumScore >= 40 ? 'Recovering' : 'Stalled'}
                                </span>
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>
                                {momentumScore}%
                            </div>
                            <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                                +{Math.max(2, Math.round(momentumScore * 0.15))}% this week
                            </span>
                        </div>

                        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 8 }}>
                            Rolling 7-day habit target compliance
                        </p>
                    </div>

                    {/* Achievements Unlocked (System 3 Achievement Engine) */}
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h4 style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Award size={16} color="var(--accent-cyan)" /> Achievements Unlocked
                            </h4>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Habit Recognition</span>
                        </div>

                        {achievements.length === 0 ? (
                            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                                No achievements unlocked yet. Secure habits to build status!
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 200, overflowY: 'auto' }}>
                                {achievements.map((ach) => (
                                    <div key={ach.title} style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 10, borderLeft: `3px solid ${ach.color}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{ach.title}</span>
                                            <span style={{ fontSize: 9, background: ach.color, color: 'black', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>{ach.badge}</span>
                                        </div>
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{ach.desc}</p>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {ach.gains.map(g => (
                                                <span key={g} style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 5px', borderRadius: 4 }}>
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Nightly Life Replay Card (Killer Feature) */}
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h4 style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <RefreshCw size={16} color="var(--accent-violet-light)" /> Life Replay
                            </h4>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {(['today', 'weekly', 'monthly', 'yearly'] as const).map((rpTab) => (
                                    <button
                                        key={rpTab}
                                        className="btn btn-ghost btn-sm"
                                        style={{
                                            padding: '2px 6px',
                                            fontSize: 10,
                                            height: 'auto',
                                            background: replayTab === rpTab ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                                            color: replayTab === rpTab ? 'var(--accent-violet-light)' : 'var(--text-muted)'
                                        }}
                                        onClick={() => setReplayTab(rpTab)}
                                    >
                                        {rpTab === 'today' ? 'Tonight' :
                                            rpTab === 'weekly' ? 'Weekly' :
                                                rpTab === 'monthly' ? 'Monthly' :
                                                    'Yearly'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {replayTab === 'today' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Today's Balance</span>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            style={{ padding: '2px 6px', fontSize: 10, height: 'auto', border: '1px solid var(--border-soft)' }}
                                            onClick={() => setShowDiaryModal(true)}
                                        >
                                            📖 View Diary
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>🏋️ Workout logged</span>
                                            <span>{todayWorkout ? '🟢 ✓' : '🔴 Pending'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>📚 German Study Target</span>
                                            <span>{studyGoalMet ? '🟢 ✓' : todayStudyMinutes > 0 ? '🟡 In Progress' : '🔴 Pending'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>💧 Water Target met</span>
                                            <span>{waterGoalMet ? '🟢 ✓' : '🔴 Pending'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>💳 Budget Condition</span>
                                            <span style={{ color: budgetStatus === 'Budget is healthy' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                {budgetStatus === 'Budget is healthy' ? 'Good' : 'Tight'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>🍳 Meals Planned Today</span>
                                            <span>{mealPlan.filter(m => m.date === todayVal).length > 0 ? '🟢 Done' : '🔴 Pending'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                            <span>😊 Rate Your Mood</span>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                {['😢', '😐', '🙂', '😊', '🤩'].map((mood) => (
                                                    <button
                                                        key={mood}
                                                        style={{
                                                            background: dailyMood === mood ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                            border: 'none',
                                                            fontSize: 14,
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: 4
                                                        }}
                                                        onClick={() => setDailyMood(mood)}
                                                    >
                                                        {mood}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
                                    border: '1px solid var(--border-soft)',
                                    padding: 12,
                                    borderRadius: 10
                                }}>
                                    <div style={{ fontSize: 10, color: 'var(--accent-violet-light)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Today's Highlight</div>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                        {todayWorkout && waterGoalMet ? "You successfully protected your fitness and hydration levels today, locking double green checkmarks!" :
                                            studyGoalMet ? `You advanced your German language goal to a ${streak}-day study streak today!` :
                                                "Maintain your focus elements. Finish one primary task to spark positive momentum today."}
                                    </p>
                                </div>
                            </div>
                        ) : replayTab === 'weekly' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 10 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--accent-violet-light)' }}>
                                        Weekly Performance Report
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>📚 Weekly Study:</span>
                                            <strong>{weeklyStudyMinutes} mins</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>🏋️ Workouts:</span>
                                            <strong>{weeklyWorkouts} sessions</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>💳 Weekly Spend:</span>
                                            <strong>{formatCurrency(weeklyExpenses, settings.currency)}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>💧 Water Shield days:</span>
                                            <strong>{weeklyWaterDays} / 7 days</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>😴 Weekly Sleep Quality:</span>
                                            <strong>{weeklySleepQuality}/5.0</strong>
                                        </div>
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-soft)', margin: '6px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                            <span>Rolling Life Pulse:</span>
                                            <span style={{ color: 'var(--accent-violet-light)' }}>{lifePulse.overall}%</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                            <span>Weekly Momentum Avg:</span>
                                            <span style={{ color: 'var(--accent-amber)' }}>{momentumScore}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : replayTab === 'monthly' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 10 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--accent-violet-light)' }}>
                                        {format(today, 'MMMM yyyy')} Life Report
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>📚 Total Study:</span>
                                            <strong>{monthlyStudyMinutes} mins</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>🏋️ Workouts:</span>
                                            <strong>{monthlyWorkouts} sessions</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>💳 Month Budget:</span>
                                            <strong style={{ color: totalMonthExpenses < budgetLimitTotal ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                {totalMonthExpenses < budgetLimitTotal ? `Under by ${formatCurrency(budgetLimitTotal - totalMonthExpenses, settings.currency)}` : `Over limit`}
                                            </strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>🍲 Planned Meals:</span>
                                            <strong>{monthlyMeals} meals</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>😴 Mean Sleep Quality:</span>
                                            <strong>{monthlySleepQuality}/5.0</strong>
                                        </div>
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-soft)', margin: '6px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                            <span>Life Pulse average:</span>
                                            <span style={{ color: 'var(--accent-violet-light)' }}>{lifePulse.overall}%</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                            <span>Momentum average:</span>
                                            <span style={{ color: 'var(--accent-amber)' }}>{momentumScore}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 10 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--accent-violet-light)' }}>
                                        {format(today, 'yyyy')} Annual Review
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>📚 Annual Study:</span>
                                            <strong>
                                                {Math.floor(yearlyStudyMinutes / 60)} hrs {yearlyStudyMinutes % 60} mins
                                            </strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>🏋️ Workouts completed:</span>
                                            <strong>{yearlyWorkouts} sessions</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>💳 Annual Spending:</span>
                                            <strong>{formatCurrency(yearlyExpenses, settings.currency)}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>🍲 Meals Cooked/Planned:</span>
                                            <strong>{yearlyMeals} meals</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>😴 Yearly Sleep Health:</span>
                                            <strong>{yearlySleepQuality}/5.0</strong>
                                        </div>
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-soft)', margin: '6px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                            <span>Annual Life Pulse:</span>
                                            <span style={{ color: 'var(--accent-violet-light)' }}>{lifePulse.overall}%</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                            <span>Yearly Momentum Avg:</span>
                                            <span style={{ color: 'var(--accent-amber)' }}>{momentumScore}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Intelligent Suggestions */}
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Zap size={16} color="var(--accent-amber)" />
                                <h4 style={{ fontWeight: 700, fontSize: 14 }}>Intelligent Suggestions</h4>
                                {aiAdvice && (
                                    <span style={{
                                        fontSize: 9,
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        background: aiAdvice.isMock ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.1)',
                                        color: aiAdvice.isMock ? 'var(--text-muted)' : 'var(--accent-green)',
                                        fontWeight: 600
                                    }}>
                                        {aiAdvice.isMock ? 'Simulated Co-Pilot' : 'Gemini AI Active'}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => loadAIAdvice(true)}
                                disabled={aiLoading}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: 4, display: 'flex', alignItems: 'center', gap: 4, opacity: aiLoading ? 0.6 : 1 }}
                                title="Refresh AI Insights"
                            >
                                <style>{`
                                    @keyframes ai-spin {
                                        from { transform: rotate(0deg); }
                                        to { transform: rotate(360deg); }
                                    }
                                    .ai-spinning {
                                        animation: ai-spin 1.5s linear infinite;
                                    }
                                `}</style>
                                <RefreshCw size={14} className={aiLoading ? 'ai-spinning' : ''} />
                            </button>
                        </div>
                        {aiLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ height: 35, width: '100%', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }} />
                                <div style={{ height: 35, width: '90%', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }} />
                            </div>
                        ) : renderedSuggestions.length === 0 ? (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No suggestions at this moment. Daily objectives balanced.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {renderedSuggestions.map((suggestion) => (
                                    <div key={suggestion.id} className={`alert-chip alert-chip-${suggestion.type}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                                            <span style={{ fontSize: 13 }}>{suggestion.msg}</span>
                                        </div>
                                        {suggestion.actionLabel && (
                                            <button className="btn btn-ghost btn-sm" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => handleSuggestionAction(suggestion)}>
                                                {suggestion.actionLabel}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {aiError && (
                            <div style={{ fontSize: 11, color: 'var(--accent-red)', marginTop: 8 }}>{aiError}</div>
                        )}
                    </div>

                    {/* Predictions Portal */}
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <Award size={16} color="var(--accent-violet-light)" />
                            <h4 style={{ fontWeight: 700, fontSize: 14 }}>Proactive Life Predictions</h4>
                        </div>
                        {aiLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ height: 20, width: '80%', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }} />
                                <div style={{ height: 20, width: '85%', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }} />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {renderedPredictions.map((pred, i) => (
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
                        )}
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
                                }[m.status as 'done' | 'progress' | 'pending' | 'locked' | 'future'] || { text: '✈', color: 'var(--text-muted)', bg: 'var(--bg-secondary)', border: 'var(--border-soft)' };

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
            </div>

            {/* Interactive Life Diary Modal */}
            {showDiaryModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(8, 7, 18, 0.95)', backdropFilter: 'blur(20px)',
                    zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: 20
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: 500, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid var(--border-soft)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', background: 'var(--bg-primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 20 }}>📖</span>
                                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Tonight's Life Diary</h3>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowDiaryModal(false)} style={{ padding: 4, height: 'auto', minWidth: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', maxHeight: 420, paddingRight: 4 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-violet-light)', textTransform: 'uppercase' }}>📅 Timeline Events Today</span>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-soft)', padding: 10, borderRadius: 8, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                                    {todayEvents.length === 0 ? 'No events logged today.' : todayEvents.map(e => `• ${e.title} (${e.startDate.includes('T') ? e.startDate.split('T')[1].slice(0, 5) : 'All Day'})`).join('\n')}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>🍲 Planned Meals</span>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-soft)', padding: 10, borderRadius: 8, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                                    {mealPlan.filter(m => m.date === todayVal).length === 0 ? 'No meals logged today.' : mealPlan.filter(m => m.date === todayVal).map(m => `• ${m.mealType}: ${m.customMeal || m.recipeName || 'Planned'}`).join('\n')}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase' }}>🏋️ Workout Records</span>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-soft)', padding: 10, borderRadius: 8, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                                    {workoutLogs.filter(w => w.date === todayVal).length === 0 ? 'No workout logged today.' : workoutLogs.filter(w => w.date === todayVal).map(w => `• Logged fitness session (${activeCaloriesBurned} kcal active burn boost)`).join('\n')}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-green)', textTransform: 'uppercase' }}>💳 Daily Expenses</span>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-soft)', padding: 10, borderRadius: 8, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                                    Tally: ₹{expenses.filter(e => e.date === todayVal).reduce((sum, e) => sum + e.amount, 0)} spent today.
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>✍️ Quick Notes Inbox</span>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-soft)', padding: 10, borderRadius: 8, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                                    {notesContent.trim() ? notesContent.trim() : 'No pending notes.'}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>😊 Logged Mood</span>
                                <div style={{ fontSize: 16, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-soft)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    Today's Vibe: <strong>{dailyMood}</strong>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <button className="btn btn-primary" onClick={() => setShowDiaryModal(false)} style={{ padding: '8px 16px', fontSize: 12 }}>
                                Close Diary
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
