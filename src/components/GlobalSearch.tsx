import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Calendar, CheckSquare, Receipt, Apple, Heart, BookOpen, Briefcase, FileText } from 'lucide-react';
import { usePlanningStore } from '@/store/planningStore';
import { useFinanceStore } from '@/store/financeStore';
import { useFoodStore } from '@/store/foodStore';
import { useLearningStore } from '@/store/learningStore';
import { useDocumentsStore } from '@/store/documentsStore';

interface SearchResult {
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    path: string;
    icon: React.ReactNode;
}

export function GlobalSearch({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const { tasks, events } = usePlanningStore();
    const { expenses } = useFinanceStore();
    const { inventory, recipes } = useFoodStore();
    const { topics } = useLearningStore();
    const { documents } = useDocumentsStore();

    useEffect(() => { inputRef.current?.focus(); }, []);

    const results: SearchResult[] = query.trim().length > 0
        ? [
            ...tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).map(t => ({
                id: t.id, type: 'Task', title: t.title, subtitle: t.priority,
                path: '/planning', icon: <CheckSquare size={14} color="var(--accent-blue)" />
            })),
            ...events.filter(e => e.title.toLowerCase().includes(query.toLowerCase())).map(e => ({
                id: e.id, type: 'Event', title: e.title, subtitle: e.startDate,
                path: '/planning', icon: <Calendar size={14} color="var(--accent-violet)" />
            })),
            ...expenses.filter(e => e.title.toLowerCase().includes(query.toLowerCase())).map(e => ({
                id: e.id, type: 'Expense', title: e.title, subtitle: `€${e.amount}`,
                path: '/finance', icon: <Receipt size={14} color="var(--accent-green)" />
            })),
            ...inventory.filter(i => i.name.toLowerCase().includes(query.toLowerCase())).map(i => ({
                id: i.id, type: 'Inventory', title: i.name, subtitle: `${i.quantity} ${i.unit}`,
                path: '/food', icon: <Apple size={14} color="var(--accent-amber)" />
            })),
            ...recipes.filter(r => r.title.toLowerCase().includes(query.toLowerCase())).map(r => ({
                id: r.id, type: 'Recipe', title: r.title, subtitle: `${r.prepTime + r.cookTime} min`,
                path: '/food', icon: <Heart size={14} color="var(--accent-red)" />
            })),
            ...topics.filter(t => t.name.toLowerCase().includes(query.toLowerCase())).map(t => ({
                id: t.id, type: 'Topic', title: t.name, subtitle: t.category,
                path: '/learning', icon: <BookOpen size={14} color="var(--accent-violet-light)" />
            })),
            ...documents.filter(d => d.title.toLowerCase().includes(query.toLowerCase())).map(d => ({
                id: d.id, type: 'Document', title: d.title, subtitle: d.type,
                path: '/documents', icon: <FileText size={14} color="var(--accent-pink)" />
            })),
        ].slice(0, 8)
        : [];

    const handleSelect = (result: SearchResult) => {
        navigate(result.path);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal"
                style={{ maxWidth: 580, padding: 0, overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <input
                        ref={inputRef}
                        className="input"
                        style={{ border: 'none', background: 'transparent', padding: 0, fontSize: 16 }}
                        placeholder="Search tasks, recipes, documents..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Results */}
                <div style={{ padding: 8, maxHeight: 400, overflowY: 'auto' }}>
                    {query.trim().length === 0 && (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                            Start typing to search across all your data
                        </div>
                    )}
                    {query.trim().length > 0 && results.length === 0 && (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                            No results for "<strong>{query}</strong>"
                        </div>
                    )}
                    {results.map((result) => (
                        <button
                            key={result.id}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 12px',
                                borderRadius: 10,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                fontFamily: 'inherit',
                                textAlign: 'left',
                                transition: 'background 0.1s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            onClick={() => handleSelect(result)}
                        >
                            <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: 'var(--bg-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                {result.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>{result.title}</div>
                                {result.subtitle && (
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{result.subtitle}</div>
                                )}
                            </div>
                            <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: 11 }}>
                                {result.type}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
