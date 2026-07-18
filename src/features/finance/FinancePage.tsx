import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, PieChart, Wallet, PiggyBank } from 'lucide-react';
import { useFinanceStore } from '@/store/financeStore';
import { useSettingsStore } from '@/store/settingsStore';
import { formatCurrency, currentMonth, createBaseEntity } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import type { ExpenseCategory } from '@/types';

const CATEGORIES: ExpenseCategory[] = ['rent', 'groceries', 'transport', 'utilities', 'health', 'entertainment', 'education', 'clothing', 'dining', 'insurance', 'savings', 'other'];
const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6', '#f97316', '#84cc16', '#14b8a6', '#6b7280'];

function AddExpenseModal({ onClose }: { onClose: () => void }) {
    const { addExpense } = useFinanceStore();
    const [form, setForm] = useState({ title: '', amount: '', category: 'other' as ExpenseCategory, date: format(new Date(), 'yyyy-MM-dd'), notes: '', recurring: '' as '' | 'monthly' | 'weekly' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.amount) return;
        addExpense({ title: form.title, amount: parseFloat(form.amount), category: form.category, date: form.date, notes: form.notes, recurring: form.recurring || undefined });
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Expense</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Rent" required /></div>
                        <div><label className="label">Amount (€) *</label><input className="input" type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label className="label">Category</label>
                            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                        </div>
                        <div><label className="label">Date</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                    </div>
                    <div><label className="label">Recurring</label>
                        <select className="input" value={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.value as '' | 'monthly' })}>
                            <option value="">One-time</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddIncomeModal({ onClose }: { onClose: () => void }) {
    const { addIncome } = useFinanceStore();
    const [form, setForm] = useState({ title: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'), source: '' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.amount) return;
        addIncome({ title: form.title, amount: parseFloat(form.amount), date: form.date, source: form.source });
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Income</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Monthly salary" required /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label className="label">Amount (€) *</label><input className="input" type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
                        <div><label className="label">Date</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                    </div>
                    <div><label className="label">Source</label><input className="input" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="e.g. Employer, Freelance" /></div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Income</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SetBudgetModal({ onClose }: { onClose: () => void }) {
    const { setBudget } = useFinanceStore();
    const [form, setForm] = useState({ category: 'groceries' as ExpenseCategory, limit: '', month: currentMonth() });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.limit) return;
        setBudget({ category: form.category, limit: parseFloat(form.limit), month: form.month });
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Set Budget</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Category</label>
                        <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label className="label">Monthly Limit (€)</label><input className="input" type="number" step="0.01" min="0" value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} required /></div>
                        <div><label className="label">Month</label><input className="input" type="month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Budget</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddSavingsModal({ onClose }: { onClose: () => void }) {
    const { addSavingsGoal } = useFinanceStore();
    const { settings } = useSettingsStore();
    const [form, setForm] = useState({ title: '', targetAmount: '', currentAmount: '0', targetDate: '', description: '' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.targetAmount) return;
        addSavingsGoal({ title: form.title, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount) || 0, targetDate: form.targetDate || undefined, description: form.description || undefined });
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>New Savings Goal</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Goal Name *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Emergency Fund" required /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label className="label">Target ({settings.currency})</label><input className="input" type="number" step="0.01" min="0" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} required /></div>
                        <div><label className="label">Current ({settings.currency})</label><input className="input" type="number" step="0.01" min="0" value={form.currentAmount} onChange={e => setForm({ ...form, currentAmount: e.target.value })} /></div>
                    </div>
                    <div><label className="label">Target Date</label><input className="input" type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} /></div>
                    <div><label className="label">Description</label><input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is this for?" /></div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Goal</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function FinancePage() {
    const [tab, setTab] = useState<'overview' | 'expenses' | 'income' | 'budget' | 'savings' | 'reports'>('overview');
    const [modal, setModal] = useState<'expense' | 'income' | 'budget' | 'savings' | null>(null);
    const { expenses, incomes, budgets, savingsGoals, deleteExpense, deleteIncome, deleteSavingsGoal, updateSavingsGoal } = useFinanceStore();
    const { settings } = useSettingsStore();
    const month = currentMonth();

    const monthExpenses = expenses.filter(e => e.date.startsWith(month));
    const monthIncomes = incomes.filter(i => i.date.startsWith(month));
    const totalIncome = monthIncomes.reduce((s, i) => s + i.amount, 0);
    const totalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpense;

    // Spending by category for pie chart
    const categoryData = CATEGORIES.map((cat, i) => ({
        name: cat, value: monthExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0), color: COLORS[i],
    })).filter(d => d.value > 0);

    // Last 6 months for bar chart
    const barData = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - 5 + i);
        const m = d.toISOString().substring(0, 7);
        const label = format(d, 'MMM');
        return {
            month: label,
            income: incomes.filter(inc => inc.date.startsWith(m)).reduce((s, inc) => s + inc.amount, 0),
            expenses: expenses.filter(exp => exp.date.startsWith(m)).reduce((s, exp) => s + exp.amount, 0),
        };
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 className="section-title">Finance</h2>
                    <p className="section-subtitle">Track your income, expenses, and budget</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" onClick={() => setModal('budget')}><Wallet size={16} />Set Budget</button>
                    <button className="btn btn-secondary" onClick={() => setModal('income')}><TrendingUp size={16} />Add Income</button>
                    {tab === 'savings'
                        ? <button className="btn btn-primary" onClick={() => setModal('savings')}><PiggyBank size={16} />New Goal</button>
                        : <button className="btn btn-primary" onClick={() => setModal('expense')}><Plus size={16} />Add Expense</button>
                    }
                </div>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                {[
                    { label: 'Balance', value: balance, color: balance >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', icon: <Wallet size={20} /> },
                    { label: 'Income', value: totalIncome, color: 'var(--accent-green)', icon: <TrendingUp size={20} /> },
                    { label: 'Expenses', value: totalExpense, color: 'var(--accent-red)', icon: <TrendingDown size={20} /> },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-value" style={{ color: s.color, fontSize: 24 }}>{formatCurrency(s.value, settings.currency)}</div>
                            </div>
                            <div style={{ color: s.color, opacity: 0.7 }}>{s.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="tabs" style={{ marginBottom: 20 }}>
                {(['overview', 'expenses', 'income', 'budget', 'savings', 'reports'] as const).map(t => (
                    <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {tab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)' }}>6-MONTH TREND</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={barData}>
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)' }}>SPENDING BY CATEGORY</h3>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <RechartsPie>
                                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                                        {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }} formatter={(v: number) => formatCurrency(v, settings.currency)} />
                                </RechartsPie>
                            </ResponsiveContainer>
                        ) : <div className="empty-state" style={{ padding: '40px 0' }}><PieChart size={24} color="var(--text-muted)" /><p>No spending data</p></div>}
                    </div>
                </div>
            )}

            {tab === 'expenses' && (
                <div className="card" style={{ padding: 20 }}>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Amount</th><th></th></tr></thead>
                            <tbody>
                                {expenses.length === 0 ? (
                                    <tr><td colSpan={5}><div className="empty-state"><TrendingDown size={24} color="var(--text-muted)" /><p>No expenses yet</p></div></td></tr>
                                ) : expenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                                    <tr key={e.id}>
                                        <td style={{ fontWeight: 500 }}>{e.title}</td>
                                        <td><span className="chip" style={{ textTransform: 'capitalize' }}>{e.category}</span></td>
                                        <td className="text-muted">{format(parseISO(e.date), 'MMM d, yyyy')}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--accent-red)' }}>-{formatCurrency(e.amount, settings.currency)}</td>
                                        <td><button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteExpense(e.id)}><Trash2 size={14} color="var(--accent-red)" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'income' && (
                <div className="card" style={{ padding: 20 }}>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Title</th><th>Source</th><th>Date</th><th>Amount</th><th></th></tr></thead>
                            <tbody>
                                {incomes.length === 0 ? (
                                    <tr><td colSpan={5}><div className="empty-state"><TrendingUp size={24} color="var(--text-muted)" /><p>No income recorded</p></div></td></tr>
                                ) : incomes.sort((a, b) => b.date.localeCompare(a.date)).map(i => (
                                    <tr key={i.id}>
                                        <td style={{ fontWeight: 500 }}>{i.title}</td>
                                        <td className="text-muted">{i.source ?? '—'}</td>
                                        <td className="text-muted">{format(parseISO(i.date), 'MMM d, yyyy')}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>+{formatCurrency(i.amount, settings.currency)}</td>
                                        <td><button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteIncome(i.id)}><Trash2 size={14} color="var(--accent-red)" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'budget' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {budgets.filter(b => b.month === month).length === 0 ? (
                        <div className="card empty-state" style={{ padding: 48 }}>
                            <div className="empty-state-icon"><Wallet size={24} color="var(--text-muted)" /></div>
                            <h3>No budgets set</h3><p>Set category budgets to track your spending</p>
                        </div>
                    ) : budgets.filter(b => b.month === month).map(budget => {
                        const spent = monthExpenses.filter(e => e.category === budget.category).reduce((s, e) => s + e.amount, 0);
                        const pct = Math.min(100, (spent / budget.limit) * 100);
                        return (
                            <div key={budget.id} className="card" style={{ padding: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{budget.category}</span>
                                    <span style={{ fontSize: 13, color: pct >= 90 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                                        {formatCurrency(spent, settings.currency)} / {formatCurrency(budget.limit, settings.currency)}
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{
                                        width: `${pct}%`,
                                        background: pct >= 90 ? 'var(--gradient-danger)' : pct >= 70 ? 'var(--gradient-amber)' : 'var(--gradient-success)',
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {tab === 'savings' && (() => {
                const totalSaved = savingsGoals.reduce((s, g) => s + g.currentAmount, 0);
                const totalTarget = savingsGoals.reduce((s, g) => s + g.targetAmount, 0);
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {savingsGoals.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                {[
                                    { label: 'Total Saved', value: formatCurrency(totalSaved, settings.currency), color: 'var(--accent-green)' },
                                    { label: 'Total Target', value: formatCurrency(totalTarget, settings.currency), color: 'var(--accent-violet)' },
                                    { label: 'Overall Progress', value: `${totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%`, color: 'var(--accent-cyan)' },
                                ].map(s => (
                                    <div key={s.label} className="card" style={{ padding: 16 }}>
                                        <div className="stat-label">{s.label}</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {savingsGoals.length === 0 ? (
                            <div className="card empty-state" style={{ padding: 48 }}>
                                <div className="empty-state-icon"><PiggyBank size={24} color="var(--text-muted)" /></div>
                                <h3>No savings goals</h3>
                                <p>Create a goal to start tracking your savings</p>
                            </div>
                        ) : savingsGoals.map(goal => {
                            const pct = Math.min(100, goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0);
                            const remaining = goal.targetAmount - goal.currentAmount;
                            const daysLeft = goal.targetDate ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000) : null;
                            return (
                                <div key={goal.id} className="card" style={{ padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>{goal.title}</div>
                                            {goal.description && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{goal.description}</div>}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            {daysLeft !== null && (
                                                <span style={{ fontSize: 12, color: daysLeft < 0 ? 'var(--accent-red)' : daysLeft < 30 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                                                    {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                                                </span>
                                            )}
                                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteSavingsGoal(goal.id)}><Trash2 size={14} color="var(--accent-red)" /></button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent-green)' }}>{formatCurrency(goal.currentAmount, settings.currency)}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>of {formatCurrency(goal.targetAmount, settings.currency)}</span>
                                    </div>
                                    <div className="progress-bar" style={{ height: 8, marginBottom: 8 }}>
                                        <div className="progress-bar-fill" style={{
                                            width: `${pct}%`,
                                            background: pct >= 100 ? 'var(--gradient-success)' : 'var(--gradient-primary)',
                                        }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct.toFixed(0)}% · {formatCurrency(remaining > 0 ? remaining : 0, settings.currency)} to go</span>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {[50, 100, 200].map(amt => (
                                                <button key={amt} className="btn btn-secondary btn-sm"
                                                    onClick={() => updateSavingsGoal(goal.id, { currentAmount: Math.min(goal.targetAmount, goal.currentAmount + amt) })}>
                                                    +{formatCurrency(amt, settings.currency)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })()}

            {tab === 'reports' && (
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)' }}>6-MONTH OVERVIEW</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} formatter={(v: number) => formatCurrency(v, settings.currency)} />
                            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                            <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {modal === 'expense' && <AddExpenseModal onClose={() => setModal(null)} />}
            {modal === 'income' && <AddIncomeModal onClose={() => setModal(null)} />}
            {modal === 'budget' && <SetBudgetModal onClose={() => setModal(null)} />}
            {modal === 'savings' && <AddSavingsModal onClose={() => setModal(null)} />}
        </div>
    );
}
