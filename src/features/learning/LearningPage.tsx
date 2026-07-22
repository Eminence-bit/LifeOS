import { useState } from 'react';
import { Plus, Trash2, BookOpen, Globe, Code2, Flame, Target, CheckSquare } from 'lucide-react';
import { useLearningStore } from '@/store/learningStore';
import { format, parseISO } from 'date-fns';
import { todayStr } from '@/lib/utils';
import type { LearningTopic } from '@/types';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    german: <Globe size={16} />,
    programming: <Code2 size={16} />,
    course: <BookOpen size={16} />,
    book: <BookOpen size={16} />,
    other: <Target size={16} />,
};
const CATEGORY_COLORS: Record<string, string> = {
    german: 'var(--accent-amber)',
    programming: 'var(--accent-blue)',
    course: 'var(--accent-violet)',
    book: 'var(--accent-green)',
    other: 'var(--text-muted)',
};

function AddTopicModal({ onClose }: { onClose: () => void }) {
    const { addTopic } = useLearningStore();
    const [form, setForm] = useState({ name: '', description: '', category: 'other' as LearningTopic['category'], targetDate: '', progress: 0 });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;
        addTopic(form);
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Learning Topic</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Topic *</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. German A2, React Hooks" required /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="label">Category</label>
                            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as LearningTopic['category'] })}>
                                {['german', 'programming', 'course', 'book', 'other'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                        </div>
                        <div><label className="label">Target Date</label><input className="input" type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} /></div>
                    </div>
                    <div><label className="label">Description</label><textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Topic</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddVocabModal({ onClose }: { onClose: () => void }) {
    const { addVocabulary, topics } = useLearningStore();
    const [form, setForm] = useState({ word: '', translation: '', example: '', language: 'German', topicId: '' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.word || !form.translation) return;
        addVocabulary({ ...form, mastered: false, reviewCount: 0 });
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Vocabulary</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="label">Word *</label><input className="input" value={form.word} onChange={e => setForm({ ...form, word: e.target.value })} placeholder="e.g. der Bahnhof" required /></div>
                        <div><label className="label">Translation *</label><input className="input" value={form.translation} onChange={e => setForm({ ...form, translation: e.target.value })} placeholder="e.g. the train station" required /></div>
                    </div>
                    <div><label className="label">Example sentence</label><input className="input" value={form.example} onChange={e => setForm({ ...form, example: e.target.value })} placeholder="Optional example" /></div>
                    <div><label className="label">Topic</label>
                        <select className="input" value={form.topicId} onChange={e => setForm({ ...form, topicId: e.target.value })}>
                            <option value="">No topic</option>
                            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Word</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function LogStudyModal({ onClose }: { onClose: () => void }) {
    const { logStudySession, topics } = useLearningStore();
    const [form, setForm] = useState({ date: todayStr(), duration: 30, topicId: '', notes: '' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        logStudySession(form);
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Log Study Session</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="label">Duration (min)</label><input className="input" type="number" min="1" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} /></div>
                        <div><label className="label">Date</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                    </div>
                    <div><label className="label">Topic</label>
                        <select className="input" value={form.topicId} onChange={e => setForm({ ...form, topicId: e.target.value })}>
                            <option value="">General study</option>
                            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div><label className="label">Notes</label><textarea className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Log Session</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function LearningPage() {
    const [tab, setTab] = useState<'topics' | 'vocab' | 'progress' | 'sessions'>('topics');
    const [modal, setModal] = useState<'topic' | 'vocab' | 'session' | null>(null);
    const { topics, vocabulary, studySessions, streak, dailyGoalMinutes, deleteTopic, deleteVocabulary, updateVocabulary, updateTopic } = useLearningStore();
    const today = todayStr();
    const todayMinutes = studySessions.filter(s => s.date === today).reduce((sum, s) => sum + s.duration, 0);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 className="section-title">Learning</h2>
                    <p className="section-subtitle">Track languages, courses, books, and progress</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" onClick={() => setModal('session')}><CheckSquare size={16} />Log Session</button>
                    {tab === 'vocab' && <button className="btn btn-secondary" onClick={() => setModal('vocab')}><Plus size={16} />Add Word</button>}
                    <button className="btn btn-primary" onClick={() => setModal('topic')}><Plus size={16} />Add Topic</button>
                </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                        <Flame size={20} color="var(--accent-amber)" />
                        <div className="stat-value" style={{ fontSize: 24 }}>{streak}</div>
                    </div>
                    <div className="stat-label">Study Streak</div>
                </div>
                <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: 24, color: 'var(--accent-violet-light)' }}>{todayMinutes}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/{dailyGoalMinutes}m</span></div>
                    <div className="stat-label">Today's Study</div>
                    <div className="progress-bar" style={{ marginTop: 8 }}>
                        <div className="progress-bar-fill" style={{ width: `${Math.min(100, (todayMinutes / dailyGoalMinutes) * 100)}%` }} />
                    </div>
                </div>
                <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: 24 }}>{vocabulary.filter(v => v.mastered).length}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/{vocabulary.length}</span></div>
                    <div className="stat-label">Words Mastered</div>
                </div>
            </div>

            <div className="tabs" style={{ marginBottom: 20 }}>
                <button className={`tab ${tab === 'topics' ? 'active' : ''}`} onClick={() => setTab('topics')}><BookOpen size={14} />Topics</button>
                <button className={`tab ${tab === 'vocab' ? 'active' : ''}`} onClick={() => setTab('vocab')}><Globe size={14} />Vocabulary</button>
                <button className={`tab ${tab === 'progress' ? 'active' : ''}`} onClick={() => setTab('progress')}><Target size={14} />Progress</button>
                <button className={`tab ${tab === 'sessions' ? 'active' : ''}`} onClick={() => setTab('sessions')}><CheckSquare size={14} />Sessions</button>
            </div>

            {tab === 'topics' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {topics.length === 0 ? (
                        <div className="card empty-state" style={{ padding: 48, gridColumn: '1 / -1' }}>
                            <div className="empty-state-icon"><BookOpen size={24} color="var(--text-muted)" /></div>
                            <h3>No topics yet</h3><p>Add your first learning topic to get started</p>
                        </div>
                    ) : topics.map(topic => (
                        <div key={topic.id} className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ color: CATEGORY_COLORS[topic.category] }}>{CATEGORY_ICONS[topic.category]}</div>
                                    <h3 style={{ fontWeight: 600 }}>{topic.name}</h3>
                                </div>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteTopic(topic.id)}><Trash2 size={14} color="var(--accent-red)" /></button>
                            </div>
                            <div className="text-xs text-muted" style={{ textTransform: 'capitalize', marginBottom: 12 }}>{topic.category}</div>
                            <div className="progress-bar" style={{ marginBottom: 6 }}>
                                <div className="progress-bar-fill" style={{ width: `${topic.progress}%` }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-xs text-muted">{topic.progress}% complete</span>
                                <input type="range" min="0" max="100" value={topic.progress} onChange={e => updateTopic(topic.id, { progress: +e.target.value })}
                                    style={{ width: 80, accentColor: 'var(--accent-violet)' }} />
                            </div>
                            {topic.targetDate && <div className="text-xs text-muted" style={{ marginTop: 8 }}>Target: {format(parseISO(topic.targetDate), 'MMM d, yyyy')}</div>}
                        </div>
                    ))}
                </div>
            )}

            {tab === 'vocab' && (
                <div>
                    <div className="table-container card" style={{ padding: 0 }}>
                        <table>
                            <thead><tr><th>Word</th><th>Translation</th><th>Example</th><th>Status</th><th></th></tr></thead>
                            <tbody>
                                {vocabulary.length === 0 ? (
                                    <tr><td colSpan={5}><div className="empty-state"><Globe size={24} color="var(--text-muted)" /><p>No vocabulary yet</p></div></td></tr>
                                ) : vocabulary.map(v => (
                                    <tr key={v.id}>
                                        <td style={{ fontWeight: 600 }}>{v.word}</td>
                                        <td>{v.translation}</td>
                                        <td className="text-muted text-sm">{v.example ?? '—'}</td>
                                        <td>
                                            <button className="btn btn-ghost btn-sm" style={{ color: v.mastered ? 'var(--accent-green)' : 'var(--text-muted)' }} onClick={() => updateVocabulary(v.id, { mastered: !v.mastered })}>
                                                {v.mastered ? '✓ Mastered' : 'Learning'}
                                            </button>
                                        </td>
                                        <td><button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteVocabulary(v.id)}><Trash2 size={14} color="var(--accent-red)" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'progress' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {topics.map(t => (
                        <div key={t.id} className="card" style={{ padding: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: CATEGORY_COLORS[t.category] }}>{t.progress}%</div>
                            <div style={{ fontWeight: 500, margin: '4px 0' }}>{t.name}</div>
                            <div className="progress-bar">
                                <div className="progress-bar-fill" style={{ width: `${t.progress}%`, background: CATEGORY_COLORS[t.category] }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'sessions' && (
                <div className="table-container card" style={{ padding: 0 }}>
                    <table>
                        <thead><tr><th>Date</th><th>Duration</th><th>Topic</th><th>Notes</th></tr></thead>
                        <tbody>
                            {studySessions.length === 0 ? (
                                <tr><td colSpan={4}><div className="empty-state"><CheckSquare size={24} color="var(--text-muted)" /><p>No study sessions yet</p></div></td></tr>
                            ) : studySessions.sort((a, b) => b.date.localeCompare(a.date)).map(s => (
                                <tr key={s.id}>
                                    <td>{format(parseISO(s.date), 'MMM d, yyyy')}</td>
                                    <td>{s.duration} min</td>
                                    <td className="text-muted">{topics.find(t => t.id === s.topicId)?.name ?? 'General'}</td>
                                    <td className="text-muted text-sm">{s.notes ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal === 'topic' && <AddTopicModal onClose={() => setModal(null)} />}
            {modal === 'vocab' && <AddVocabModal onClose={() => setModal(null)} />}
            {modal === 'session' && <LogStudyModal onClose={() => setModal(null)} />}
        </div>
    );
}
