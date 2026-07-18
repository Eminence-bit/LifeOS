import { useState } from 'react';
import { Plus, CheckSquare, Calendar as CalIcon, Target, Trash2, Check, Edit2 } from 'lucide-react';
import { usePlanningStore } from '@/store/planningStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { todayStr } from '@/lib/utils';
import type { Task, Event, Goal, TaskPriority, TaskStatus } from '@/types';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
    urgent: 'var(--accent-red)',
    high: 'var(--accent-amber)',
    medium: 'var(--accent-blue)',
    low: 'var(--text-muted)',
};
const STATUS_COLORS: Record<TaskStatus, string> = {
    todo: 'var(--text-muted)',
    in_progress: 'var(--accent-blue)',
    done: 'var(--accent-green)',
};

// ── Add Task Modal ──────────────────────────────────────────────
function AddTaskModal({ onClose }: { onClose: () => void }) {
    const { addTask } = usePlanningStore();
    const [form, setForm] = useState({ title: '', priority: 'medium' as TaskPriority, dueDate: '', category: '', description: '' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        addTask({ ...form, status: 'todo', tags: [] });
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Task</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" required /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label className="label">Priority</label>
                            <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}>
                                {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                            </select>
                        </div>
                        <div><label className="label">Due Date</label><input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
                    </div>
                    <div><label className="label">Category</label><input className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Work, Personal" /></div>
                    <div><label className="label">Description</label><textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional notes..." /></div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Add Event Modal ─────────────────────────────────────────────
function AddEventModal({ onClose }: { onClose: () => void }) {
    const { addEvent } = usePlanningStore();
    const [form, setForm] = useState({ title: '', startDate: '', endDate: '', allDay: true, category: '', color: '#7c3aed' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.startDate) return;
        addEvent(form);
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Event</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title" required /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label className="label">Start *</label><input className="input" type={form.allDay ? 'date' : 'datetime-local'} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required /></div>
                        <div><label className="label">End</label><input className="input" type={form.allDay ? 'date' : 'datetime-local'} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.allDay} onChange={e => setForm({ ...form, allDay: e.target.checked })} />
                        <span className="label" style={{ margin: 0 }}>All day event</span>
                    </label>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Event</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Calendar View ───────────────────────────────────────────────
function CalendarView() {
    const { events } = usePlanningStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });

    return (
        <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16 }}>{format(currentDate, 'MMMM yyyy')}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}>←</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(new Date())}>Today</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}>→</button>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '6px 0' }}>{d}</div>
                ))}
                {/* offset for first week */}
                {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => <div key={`empty-${i}`} />)}
                {days.map(day => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayEvents = events.filter(e => e.startDate.startsWith(dayStr));
                    const isToday = dayStr === todayStr();
                    return (
                        <div key={dayStr} style={{
                            padding: 6, borderRadius: 10, minHeight: 64,
                            background: isToday ? 'rgba(124,58,237,0.12)' : 'transparent',
                            border: isToday ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                        }}>
                            <div style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent-violet-light)' : 'var(--text-secondary)', marginBottom: 4 }}>
                                {format(day, 'd')}
                            </div>
                            {dayEvents.slice(0, 2).map(e => (
                                <div key={e.id} style={{
                                    fontSize: 10, fontWeight: 500, padding: '1px 4px', borderRadius: 4,
                                    background: e.color ? `${e.color}30` : 'rgba(124,58,237,0.2)',
                                    color: e.color ?? 'var(--accent-violet-light)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    marginBottom: 2,
                                }}>{e.title}</div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Task List ───────────────────────────────────────────────────
function TaskListView() {
    const { tasks, updateTask, deleteTask } = usePlanningStore();
    const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
    const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter);

    return (
        <div>
            <div className="tabs" style={{ marginBottom: 16 }}>
                {['all', 'todo', 'in_progress', 'done'].map(f => (
                    <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f as typeof filter)}>
                        {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><CheckSquare size={24} color="var(--text-muted)" /></div>
                        <h3>No tasks</h3><p>Add your first task to get started</p>
                    </div>
                ) : filtered.map(task => (
                    <div key={task.id} className="card card-interactive" style={{ padding: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button
                                className="btn btn-ghost btn-icon btn-sm"
                                style={{ color: STATUS_COLORS[task.status] }}
                                onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : 'done' })}
                            >
                                {task.status === 'done' ? <Check size={18} /> : <div style={{ width: 18, height: 18, borderRadius: 4, border: '2px solid currentColor' }} />}
                            </button>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: 14, fontWeight: 500,
                                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                                    color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                                }}>{task.title}</div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                                    <span className="badge" style={{ background: `${PRIORITY_COLORS[task.priority]}15`, color: PRIORITY_COLORS[task.priority], fontSize: 11 }}>{task.priority}</span>
                                    {task.category && <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 11 }}>{task.category}</span>}
                                    {task.dueDate && <span className="text-xs text-muted">{format(parseISO(task.dueDate), 'MMM d')}</span>}
                                </div>
                            </div>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteTask(task.id)}><Trash2 size={14} color="var(--accent-red)" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Add Goal Modal ──────────────────────────────────────────────
function AddGoalModal({ onClose }: { onClose: () => void }) {
    const { addGoal } = usePlanningStore();
    const [form, setForm] = useState({ title: '', description: '', targetDate: '', category: '', progress: 0 });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        addGoal({ title: form.title, description: form.description, targetDate: form.targetDate || undefined, category: form.category || undefined, progress: form.progress, taskIds: [] });
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Goal</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Learn Spanish B2" required /></div>
                    <div><label className="label">Description</label><textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does success look like?" /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label className="label">Target Date</label><input className="input" type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} /></div>
                        <div><label className="label">Category</label><input className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Health, Career" /></div>
                    </div>
                    <div>
                        <label className="label">Initial Progress: {form.progress}%</label>
                        <input type="range" min={0} max={100} value={form.progress} onChange={e => setForm({ ...form, progress: +e.target.value })} style={{ width: '100%', accentColor: 'var(--accent-violet)' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Goal</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Goals View ──────────────────────────────────────────────────
function GoalsView() {
    const { goals, tasks, updateGoal, deleteGoal } = usePlanningStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editProgress, setEditProgress] = useState(0);

    if (goals.length === 0) {
        return (
            <div className="empty-state card" style={{ padding: 48 }}>
                <div className="empty-state-icon"><Target size={24} color="var(--text-muted)" /></div>
                <h3>No goals yet</h3>
                <p>Set a goal and track your progress over time</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {goals.map(goal => {
                const linkedTasks = tasks.filter(t => t.goalId === goal.id);
                const doneTasks = linkedTasks.filter(t => t.status === 'done').length;
                const daysLeft = goal.targetDate ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000) : null;
                const isEditing = editingId === goal.id;

                return (
                    <div key={goal.id} className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{goal.title}</div>
                                {goal.category && <span className="chip" style={{ fontSize: 11 }}>{goal.category}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditingId(goal.id); setEditProgress(goal.progress); }}><Edit2 size={13} /></button>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteGoal(goal.id)}><Trash2 size={13} color="var(--accent-red)" /></button>
                            </div>
                        </div>

                        {goal.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{goal.description}</p>}

                        {/* Progress ring + bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                            <svg width={56} height={56} style={{ flexShrink: 0 }}>
                                <circle cx={28} cy={28} r={22} fill="none" stroke="var(--border-strong)" strokeWidth={5} />
                                <circle
                                    cx={28} cy={28} r={22} fill="none"
                                    stroke={goal.progress >= 100 ? 'var(--accent-green)' : 'var(--accent-violet)'}
                                    strokeWidth={5}
                                    strokeDasharray={`${2 * Math.PI * 22}`}
                                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - goal.progress / 100)}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 28 28)"
                                />
                                <text x={28} y={33} textAnchor="middle" fontSize={12} fontWeight={700} fill={goal.progress >= 100 ? 'var(--accent-green)' : 'var(--text-primary)'}>{goal.progress}%</text>
                            </svg>
                            <div style={{ flex: 1 }}>
                                {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <input type="range" min={0} max={100} value={editProgress} onChange={e => setEditProgress(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent-violet)' }} />
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-primary btn-sm" onClick={() => { updateGoal(goal.id, { progress: editProgress }); setEditingId(null); }}>Save</button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{goal.progress >= 100 ? '🎉 Completed!' : `${goal.progress}% done`}</div>
                                        {daysLeft !== null && (
                                            <div style={{ fontSize: 12, color: daysLeft < 0 ? 'var(--accent-red)' : daysLeft < 14 ? 'var(--accent-amber)' : 'var(--text-muted)', marginTop: 2 }}>
                                                {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today!' : `${daysLeft}d left`}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Linked tasks */}
                        {linkedTasks.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Linked Tasks ({doneTasks}/{linkedTasks.length})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {linkedTasks.slice(0, 3).map(t => (
                                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                            <Check size={12} style={{ color: t.status === 'done' ? 'var(--accent-green)' : 'var(--border-strong)', flexShrink: 0 }} />
                                            <span style={{ textDecoration: t.status === 'done' ? 'line-through' : 'none', color: t.status === 'done' ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{t.title}</span>
                                        </div>
                                    ))}
                                    {linkedTasks.length > 3 && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{linkedTasks.length - 3} more</div>}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Planning Page ───────────────────────────────────────────────
export function PlanningPage() {
    const [tab, setTab] = useState<'tasks' | 'calendar' | 'goals'>('tasks');
    const [modal, setModal] = useState<'task' | 'event' | 'goal' | null>(null);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 className="section-title">Planning</h2>
                    <p className="section-subtitle">Manage your tasks, events, and goals</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {tab !== 'goals' && <button className="btn btn-secondary" onClick={() => setModal('event')}><CalIcon size={16} />Add Event</button>}
                    {tab === 'goals'
                        ? <button className="btn btn-primary" onClick={() => setModal('goal')}><Plus size={16} />Add Goal</button>
                        : <button className="btn btn-primary" onClick={() => setModal('task')}><Plus size={16} />Add Task</button>
                    }
                </div>
            </div>

            <div className="tabs" style={{ marginBottom: 20 }}>
                <button className={`tab ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}><CheckSquare size={14} />Tasks</button>
                <button className={`tab ${tab === 'calendar' ? 'active' : ''}`} onClick={() => setTab('calendar')}><CalIcon size={14} />Calendar</button>
                <button className={`tab ${tab === 'goals' ? 'active' : ''}`} onClick={() => setTab('goals')}><Target size={14} />Goals</button>
            </div>

            {tab === 'tasks' && <TaskListView />}
            {tab === 'calendar' && <CalendarView />}
            {tab === 'goals' && <GoalsView />}

            {modal === 'task' && <AddTaskModal onClose={() => setModal(null)} />}
            {modal === 'event' && <AddEventModal onClose={() => setModal(null)} />}
            {modal === 'goal' && <AddGoalModal onClose={() => setModal(null)} />}
        </div>
    );
}
