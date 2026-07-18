import { useState } from 'react';
import { Plus, Trash2, Dumbbell, Scale, Droplets, Moon, TrendingUp, Activity } from 'lucide-react';
import { useHealthStore } from '@/store/healthStore';
import { todayStr } from '@/lib/utils';
import { format, parseISO, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, AreaChart, Area } from 'recharts';
import type { WorkoutExercise } from '@/types';

function AddWorkoutModal({ onClose }: { onClose: () => void }) {
    const { addWorkoutLog } = useHealthStore();
    const [form, setForm] = useState({
        date: todayStr(), duration: 30, notes: '', caloriesBurned: '',
        exercises: [{ name: '', sets: 3, reps: 10, weight: undefined as number | undefined }] as WorkoutExercise[],
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        addWorkoutLog({ ...form, exercises: form.exercises.filter(ex => ex.name), caloriesBurned: form.caloriesBurned ? +form.caloriesBurned : undefined });
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Log Workout</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div><label className="label">Date</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                        <div><label className="label">Duration (min)</label><input className="input" type="number" min="1" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} /></div>
                        <div><label className="label">Calories Burned</label><input className="input" type="number" min="0" value={form.caloriesBurned} onChange={e => setForm({ ...form, caloriesBurned: e.target.value })} placeholder="Optional" /></div>
                    </div>
                    <div>
                        <label className="label">Exercises</label>
                        {form.exercises.map((ex, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, marginBottom: 6 }}>
                                <input className="input" placeholder="Exercise name" value={ex.name} onChange={e => { const upd = [...form.exercises]; upd[i] = { ...upd[i], name: e.target.value }; setForm({ ...form, exercises: upd }); }} />
                                <input className="input" type="number" placeholder="Sets" value={ex.sets ?? ''} onChange={e => { const upd = [...form.exercises]; upd[i] = { ...upd[i], sets: +e.target.value }; setForm({ ...form, exercises: upd }); }} />
                                <input className="input" type="number" placeholder="Reps" value={ex.reps ?? ''} onChange={e => { const upd = [...form.exercises]; upd[i] = { ...upd[i], reps: +e.target.value }; setForm({ ...form, exercises: upd }); }} />
                                <input className="input" type="number" placeholder="kg" value={ex.weight ?? ''} onChange={e => { const upd = [...form.exercises]; upd[i] = { ...upd[i], weight: +e.target.value || undefined }; setForm({ ...form, exercises: upd }); }} />
                            </div>
                        ))}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, exercises: [...form.exercises, { name: '', sets: 3, reps: 10 }] })}><Plus size={14} />Add exercise</button>
                    </div>
                    <div><label className="label">Notes</label><textarea className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Workout</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddBodyMetricModal({ onClose }: { onClose: () => void }) {
    const { addBodyMetric } = useHealthStore();
    const [form, setForm] = useState({ date: todayStr(), weight: '', height: '', bodyFat: '' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        addBodyMetric({ date: form.date, weight: form.weight ? +form.weight : undefined, height: form.height ? +form.height : undefined, bodyFat: form.bodyFat ? +form.bodyFat : undefined });
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Log Body Metrics</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Date</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div><label className="label">Weight (kg)</label><input className="input" type="number" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></div>
                        <div><label className="label">Height (cm)</label><input className="input" type="number" step="0.5" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} /></div>
                        <div><label className="label">Body Fat %</label><input className="input" type="number" step="0.1" value={form.bodyFat} onChange={e => setForm({ ...form, bodyFat: e.target.value })} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function HealthPage() {
    const [tab, setTab] = useState<'workouts' | 'body' | 'water' | 'sleep' | 'progress'>('workouts');
    const [modal, setModal] = useState<'workout' | 'body' | null>(null);
    const { workoutLogs, bodyMetrics, waterIntakes, sleepLogs, deleteWorkoutLog, addWaterIntake, addSleepLog } = useHealthStore();
    const today = todayStr();

    const todayWater = waterIntakes.filter(w => w.date === today).reduce((s, w) => s + w.amount, 0);
    const weightData = bodyMetrics.filter(m => m.weight).slice(-20).map(m => ({ date: format(parseISO(m.date), 'MMM d'), weight: m.weight }));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h2 className="section-title">Health</h2>
                    <p className="section-subtitle">Track workouts, body metrics, water, and sleep</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {tab === 'workouts' && <button className="btn btn-primary" onClick={() => setModal('workout')}><Plus size={16} />Log Workout</button>}
                    {tab === 'body' && <button className="btn btn-primary" onClick={() => setModal('body')}><Plus size={16} />Log Metrics</button>}
                    {tab === 'water' && <button className="btn btn-primary" onClick={() => addWaterIntake({ date: today, amount: 250 })}><Droplets size={16} />+250ml</button>}
                </div>
            </div>

            <div className="tabs" style={{ marginBottom: 20 }}>
                <button className={`tab ${tab === 'workouts' ? 'active' : ''}`} onClick={() => setTab('workouts')}><Dumbbell size={14} />Workouts</button>
                <button className={`tab ${tab === 'body' ? 'active' : ''}`} onClick={() => setTab('body')}><Scale size={14} />Body</button>
                <button className={`tab ${tab === 'water' ? 'active' : ''}`} onClick={() => setTab('water')}><Droplets size={14} />Water</button>
                <button className={`tab ${tab === 'sleep' ? 'active' : ''}`} onClick={() => setTab('sleep')}><Moon size={14} />Sleep</button>
                <button className={`tab ${tab === 'progress' ? 'active' : ''}`} onClick={() => setTab('progress')}><TrendingUp size={14} />Progress</button>
            </div>

            {tab === 'workouts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {workoutLogs.length === 0 ? (
                        <div className="card empty-state" style={{ padding: 48 }}><div className="empty-state-icon"><Dumbbell size={24} color="var(--text-muted)" /></div><h3>No workouts yet</h3><p>Start logging your training sessions</p></div>
                    ) : workoutLogs.sort((a, b) => b.date.localeCompare(a.date)).map(log => (
                        <div key={log.id} className="card" style={{ padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{format(parseISO(log.date), 'EEEE, MMM d')}</div>
                                    <div className="text-sm text-muted">{log.duration} min · {log.exercises.length} exercises{log.caloriesBurned ? ` · ${log.caloriesBurned} kcal` : ''}</div>
                                </div>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteWorkoutLog(log.id)}><Trash2 size={14} color="var(--accent-red)" /></button>
                            </div>
                            {log.exercises.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                                    {log.exercises.map((ex, i) => (
                                        <span key={i} className="chip">{ex.name}{ex.sets ? ` ${ex.sets}×${ex.reps}` : ''}{ex.weight ? ` @${ex.weight}kg` : ''}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {tab === 'body' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {bodyMetrics.length > 0 && (
                        <div className="card" style={{ padding: 20 }}>
                            <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)' }}>WEIGHT TREND</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={weightData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                                    <Line type="monotone" dataKey="weight" stroke="var(--accent-violet)" strokeWidth={2} dot={{ r: 3, fill: 'var(--accent-violet)' }} name="Weight (kg)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="table-container card" style={{ padding: 0 }}>
                        <table>
                            <thead><tr><th>Date</th><th>Weight</th><th>Height</th><th>Body Fat</th></tr></thead>
                            <tbody>
                                {bodyMetrics.length === 0 ? (
                                    <tr><td colSpan={4}><div className="empty-state"><Scale size={24} color="var(--text-muted)" /><p>No body metrics yet</p></div></td></tr>
                                ) : bodyMetrics.sort((a, b) => b.date.localeCompare(a.date)).map(m => (
                                    <tr key={m.id}>
                                        <td>{format(parseISO(m.date), 'MMM d, yyyy')}</td>
                                        <td>{m.weight ? `${m.weight} kg` : '—'}</td>
                                        <td>{m.height ? `${m.height} cm` : '—'}</td>
                                        <td>{m.bodyFat ? `${m.bodyFat}%` : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'water' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
                    <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 360, width: '100%' }}>
                        <div style={{ fontSize: 64 }}>💧</div>
                        <div className="stat-value" style={{ margin: '12px 0', color: 'var(--accent-cyan)' }}>{todayWater}ml</div>
                        <div className="stat-label">Today's intake</div>
                        <div className="progress-bar" style={{ marginTop: 20 }}>
                            <div className="progress-bar-fill" style={{ width: `${Math.min(100, (todayWater / 2000) * 100)}%`, background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' }} />
                        </div>
                        <div className="text-xs text-muted" style={{ marginTop: 8 }}>Goal: 2000ml</div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
                            {[125, 250, 500].map(ml => (
                                <button key={ml} className="btn btn-secondary" onClick={() => addWaterIntake({ date: today, amount: ml })}>+{ml}ml</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'sleep' && (
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <button className="btn btn-primary" onClick={() => {
                            const bedTime = prompt('Bed time (HH:MM):', '23:00');
                            const wakeTime = prompt('Wake time (HH:MM):', '07:00');
                            const quality = parseInt(prompt('Sleep quality (1-5):', '4') ?? '3');
                            if (bedTime && wakeTime) {
                                const [bh, bm] = bedTime.split(':').map(Number);
                                const [wh, wm] = wakeTime.split(':').map(Number);
                                const dur = ((wh + 24 - bh) % 24) + (wm - bm) / 60;
                                addSleepLog({ date: today, bedTime, wakeTime, duration: Math.round(dur * 10) / 10, quality: Math.max(1, Math.min(5, quality)) as 1 | 2 | 3 | 4 | 5 });
                            }
                        }}><Moon size={16} />Log Sleep</button>
                    </div>
                    <div className="table-container card" style={{ padding: 0 }}>
                        <table>
                            <thead><tr><th>Date</th><th>Bed Time</th><th>Wake Time</th><th>Duration</th><th>Quality</th></tr></thead>
                            <tbody>
                                {sleepLogs.length === 0 ? <tr><td colSpan={5}><div className="empty-state"><Moon size={24} color="var(--text-muted)" /><p>No sleep logs yet</p></div></td></tr> : sleepLogs.sort((a, b) => b.date.localeCompare(a.date)).map(l => (
                                    <tr key={l.id}>
                                        <td>{format(parseISO(l.date), 'MMM d, yyyy')}</td>
                                        <td>{l.bedTime}</td><td>{l.wakeTime}</td>
                                        <td>{l.duration}h</td>
                                        <td>{'⭐'.repeat(l.quality)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'progress' && (() => {
                // Last 30 days workout volume (minutes)
                const last30 = Array.from({ length: 30 }).map((_, i) => {
                    const d = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
                    const label = format(subDays(new Date(), 29 - i), 'MMM d');
                    return {
                        date: label,
                        minutes: workoutLogs.filter(l => l.date === d).reduce((s, l) => s + l.duration, 0),
                        calories: workoutLogs.filter(l => l.date === d).reduce((s, l) => s + (l.caloriesBurned ?? 0), 0),
                    };
                }).filter(d => d.minutes > 0 || (workoutLogs.length === 0));

                const weightData = bodyMetrics.filter(m => m.weight).slice(-20).map(m => ({ date: format(parseISO(m.date), 'MMM d'), weight: m.weight }));
                const bodyFatData = bodyMetrics.filter(m => m.bodyFat).slice(-20).map(m => ({ date: format(parseISO(m.date), 'MMM d'), bodyFat: m.bodyFat }));
                const sleepData = sleepLogs.slice(-14).map(l => ({ date: format(parseISO(l.date), 'MMM d'), hours: l.duration, quality: l.quality }));

                const totalWorkouts = workoutLogs.length;
                const avgDuration = totalWorkouts > 0 ? Math.round(workoutLogs.reduce((s, l) => s + l.duration, 0) / totalWorkouts) : 0;
                const totalCalories = workoutLogs.reduce((s, l) => s + (l.caloriesBurned ?? 0), 0);
                const avgSleep = sleepLogs.length > 0 ? (sleepLogs.reduce((s, l) => s + l.duration, 0) / sleepLogs.length).toFixed(1) : 0;
                const latestWeight = bodyMetrics.filter(m => m.weight).slice(-1)[0]?.weight;
                const firstWeight = bodyMetrics.filter(m => m.weight)[0]?.weight;
                const weightDelta = latestWeight && firstWeight ? +(latestWeight - firstWeight).toFixed(1) : null;

                const tooltipStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 };

                if (totalWorkouts === 0 && bodyMetrics.length === 0 && sleepLogs.length === 0) {
                    return (
                        <div className="card empty-state" style={{ padding: 48 }}>
                            <div className="empty-state-icon"><Activity size={24} color="var(--text-muted)" /></div>
                            <h3>No data yet</h3>
                            <p>Log workouts, body metrics, and sleep to see progress charts</p>
                        </div>
                    );
                }

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Stats summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                            {[
                                { label: 'Total Workouts', value: totalWorkouts, color: 'var(--accent-violet)' },
                                { label: 'Avg Duration', value: `${avgDuration}min`, color: 'var(--accent-blue)' },
                                { label: 'Total Calories', value: `${totalCalories}kcal`, color: 'var(--accent-amber)' },
                                { label: 'Avg Sleep', value: `${avgSleep}h`, color: 'var(--accent-cyan)' },
                            ].map(s => (
                                <div key={s.label} className="card" style={{ padding: 16 }}>
                                    <div className="stat-label">{s.label}</div>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Workout volume */}
                        {workoutLogs.length > 0 && (
                            <div className="card" style={{ padding: 20 }}>
                                <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WORKOUT VOLUME (minutes)</h3>
                                <ResponsiveContainer width="100%" height={180}>
                                    <AreaChart data={workoutLogs.slice(-20).sort((a, b) => a.date.localeCompare(b.date)).map(l => ({ date: format(parseISO(l.date), 'MMM d'), minutes: l.duration, calories: l.caloriesBurned ?? 0 }))}>
                                        <defs>
                                            <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--accent-violet)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--accent-violet)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Area type="monotone" dataKey="minutes" stroke="var(--accent-violet)" fill="url(#volGrad)" strokeWidth={2} name="Duration (min)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Weight + Body Fat side by side */}
                        {(weightData.length > 0 || bodyFatData.length > 0) && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {weightData.length > 0 && (
                                    <div className="card" style={{ padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <h3 style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WEIGHT (kg)</h3>
                                            {weightDelta !== null && (
                                                <span style={{ fontSize: 13, fontWeight: 600, color: weightDelta > 0 ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
                                                    {weightDelta > 0 ? '+' : ''}{weightDelta} kg
                                                </span>
                                            )}
                                        </div>
                                        <ResponsiveContainer width="100%" height={160}>
                                            <LineChart data={weightData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                                                <Tooltip contentStyle={tooltipStyle} />
                                                <Line type="monotone" dataKey="weight" stroke="var(--accent-cyan)" strokeWidth={2} dot={{ r: 3, fill: 'var(--accent-cyan)' }} name="Weight (kg)" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                {bodyFatData.length > 0 && (
                                    <div className="card" style={{ padding: 20 }}>
                                        <h3 style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>BODY FAT %</h3>
                                        <ResponsiveContainer width="100%" height={160}>
                                            <LineChart data={bodyFatData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                                                <Tooltip contentStyle={tooltipStyle} />
                                                <Line type="monotone" dataKey="bodyFat" stroke="var(--accent-pink)" strokeWidth={2} dot={{ r: 3, fill: 'var(--accent-pink)' }} name="Body Fat %" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sleep chart */}
                        {sleepData.length > 0 && (
                            <div className="card" style={{ padding: 20 }}>
                                <h3 style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>SLEEP (last 14 nights)</h3>
                                <ResponsiveContainer width="100%" height={160}>
                                    <BarChart data={sleepData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Bar dataKey="hours" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} name="Sleep (h)" opacity={0.8} />
                                        <Line type="monotone" dataKey="quality" stroke="var(--accent-amber)" strokeWidth={2} dot={false} name="Quality (1-5)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                );
            })()}

            {modal === 'workout' && <AddWorkoutModal onClose={() => setModal(null)} />}
            {modal === 'body' && <AddBodyMetricModal onClose={() => setModal(null)} />}
        </div>
    );
}
