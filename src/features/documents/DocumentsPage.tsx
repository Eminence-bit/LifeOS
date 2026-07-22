import { useState } from 'react';
import { Plus, Trash2, FileText, AlertTriangle, CheckCircle, Clock, Upload } from 'lucide-react';
import { useDocumentsStore } from '@/store/documentsStore';
import { daysUntil, formatDate } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import type { DocumentType } from '@/types';

const DOC_TYPES: DocumentType[] = ['passport', 'visa', 'residence_permit', 'insurance', 'bank', 'education', 'certificate', 'tax', 'contract', 'medical', 'other'];
const TYPE_EMOJIS: Partial<Record<DocumentType, string>> = {
    passport: '🛂',
    visa: '✈️',
    residence_permit: '🏠',
    insurance: '🛡️',
    bank: '🏦',
    education: '🎓',
    certificate: '📜',
    tax: '💰',
    contract: '📋',
    medical: '🏥',
    other: '📄',
};

function AddDocumentModal({ onClose }: { onClose: () => void }) {
    const { addDocument } = useDocumentsStore();
    const [form, setForm] = useState({ title: '', type: 'other' as DocumentType, issuer: '', issueDate: '', expiryDate: '', documentNumber: '', country: '', notes: '' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) return;
        addDocument(form);
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Document</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="label">Document Name *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. German Residence Permit" required /></div>
                        <div><label className="label">Type</label>
                            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as DocumentType })}>
                                {DOC_TYPES.map(t => <option key={t} value={t}>{TYPE_EMOJIS[t]} {t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="label">Issuer / Authority</label><input className="input" value={form.issuer} onChange={e => setForm({ ...form, issuer: e.target.value })} placeholder="e.g. Ausländerbehörde" /></div>
                        <div><label className="label">Country</label><input className="input" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="e.g. Germany" /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div><label className="label">Issue Date</label><input className="input" type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} /></div>
                        <div><label className="label">Expiry Date</label><input className="input" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
                        <div><label className="label">Document Number</label><input className="input" value={form.documentNumber} onChange={e => setForm({ ...form, documentNumber: e.target.value })} /></div>
                    </div>
                    <div><label className="label">Notes</label><textarea className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." /></div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Document</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const STATUS_CONFIG = {
    valid: { label: 'Valid', color: 'var(--accent-green)', icon: <CheckCircle size={14} />, bg: 'rgba(16,185,129,0.1)' },
    expiring_soon: { label: 'Expiring Soon', color: 'var(--accent-amber)', icon: <AlertTriangle size={14} />, bg: 'rgba(245,158,11,0.1)' },
    expired: { label: 'Expired', color: 'var(--accent-red)', icon: <AlertTriangle size={14} />, bg: 'rgba(239,68,68,0.1)' },
    pending: { label: 'Pending', color: 'var(--text-muted)', icon: <Clock size={14} />, bg: 'var(--bg-secondary)' },
};

export function DocumentsPage() {
    const { documents, deleteDocument, refreshStatuses } = useDocumentsStore();
    const [modal, setModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'valid' | 'expiring_soon' | 'expired'>('all');

    const filtered = documents.filter(d => filter === 'all' ? true : d.status === filter);
    const expiringSoon = documents.filter(d => d.status === 'expiring_soon').length;
    const expired = documents.filter(d => d.status === 'expired').length;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 className="section-title">Documents</h2>
                    <p className="section-subtitle">Passports, visas, permits, and important documents</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" onClick={refreshStatuses}>Refresh Status</button>
                    <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} />Add Document</button>
                </div>
            </div>

            {/* Alert banner */}
            {(expiringSoon > 0 || expired > 0) && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    {expired > 0 && (
                        <div className="alert-chip alert-chip-danger" style={{ flex: 1 }}>
                            <AlertTriangle size={16} />
                            <strong>{expired}</strong> document{expired !== 1 ? 's' : ''} expired — action required
                        </div>
                    )}
                    {expiringSoon > 0 && (
                        <div className="alert-chip alert-chip-warning" style={{ flex: 1 }}>
                            <Clock size={16} />
                            <strong>{expiringSoon}</strong> document{expiringSoon !== 1 ? 's' : ''} expiring within 30 days
                        </div>
                    )}
                </div>
            )}

            {/* Filter tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
                {(['all', 'valid', 'expiring_soon', 'expired'] as const).map(f => (
                    <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                        {f === 'all' ? 'All' : f === 'expiring_soon' ? 'Expiring' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Document grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {filtered.length === 0 ? (
                    <div className="card empty-state" style={{ padding: 48, gridColumn: '1 / -1' }}>
                        <div className="empty-state-icon"><FileText size={24} color="var(--text-muted)" /></div>
                        <h3>No documents</h3>
                        <p>Add your important documents to track expiry dates</p>
                        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} />Add Document</button>
                    </div>
                ) : filtered.map(doc => {
                    const statusCfg = STATUS_CONFIG[doc.status];
                    const daysLeft = doc.expiryDate ? daysUntil(doc.expiryDate) : null;

                    return (
                        <div key={doc.id} className="card" style={{ padding: 20, borderColor: doc.status === 'expired' ? 'rgba(239,68,68,0.2)' : doc.status === 'expiring_soon' ? 'rgba(245,158,11,0.2)' : undefined }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ fontSize: 28 }}>{TYPE_EMOJIS[doc.type] ?? '📄'}</div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{doc.title}</div>
                                        <div className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>{doc.type.replace(/_/g, ' ')}</div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteDocument(doc.id)}><Trash2 size={14} color="var(--accent-red)" /></button>
                            </div>

                            {/* Status badge */}
                            <div className="badge" style={{ background: statusCfg.bg, color: statusCfg.color, marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                {statusCfg.icon} {statusCfg.label}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                                {doc.issuer && <div><span className="text-muted">Issuer: </span>{doc.issuer}</div>}
                                {doc.country && <div><span className="text-muted">Country: </span>{doc.country}</div>}
                                {doc.documentNumber && <div><span className="text-muted">Number: </span>{doc.documentNumber}</div>}
                                {doc.issueDate && <div><span className="text-muted">Issued: </span>{format(parseISO(doc.issueDate), 'MMM d, yyyy')}</div>}
                                {doc.expiryDate && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                        <span><span className="text-muted">Expires: </span>{format(parseISO(doc.expiryDate), 'MMM d, yyyy')}</span>
                                        {daysLeft !== null && (
                                            <span style={{ fontSize: 12, fontWeight: 600, color: daysLeft < 0 ? 'var(--accent-red)' : daysLeft <= 30 ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
                                                {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d left`}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {doc.notes && <div className="text-xs text-muted" style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10 }}>{doc.notes}</div>}

                            {/* Upload placeholder */}
                            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: '100%', borderRadius: 8, border: '1px dashed var(--border-strong)' }}>
                                <Upload size={14} />Attach File
                            </button>
                        </div>
                    );
                })}
            </div>

            {modal && <AddDocumentModal onClose={() => setModal(false)} />}
        </div>
    );
}
