import { useState } from 'react';
import { Plus, Trash2, Briefcase, Code2, Award, Star, ChevronRight } from 'lucide-react';
import { useCareerStore } from '@/store/careerStore';
import { format, parseISO } from 'date-fns';
import type { ApplicationStatus, Project, CareerSkill } from '@/types';

const STATUS_COLUMNS: ApplicationStatus[] = ['saved', 'applied', 'interview', 'offer', 'rejected'];
const STATUS_COLORS: Record<ApplicationStatus, string> = {
    saved: 'var(--text-muted)',
    applied: 'var(--accent-blue)',
    interview: 'var(--accent-amber)',
    offer: 'var(--accent-green)',
    rejected: 'var(--accent-red)',
    accepted: 'var(--accent-green)',
};
const SKILL_LEVELS: CareerSkill['level'][] = ['beginner', 'intermediate', 'advanced', 'expert'];
const SKILL_COLORS: Record<string, string> = { beginner: 'var(--accent-blue)', intermediate: 'var(--accent-amber)', advanced: 'var(--accent-violet)', expert: 'var(--accent-green)' };

function AddApplicationModal({ onClose }: { onClose: () => void }) {
    const { addApplication } = useCareerStore();
    const [form, setForm] = useState({ company: '', role: '', status: 'saved' as ApplicationStatus, appliedDate: '', deadline: '', notes: '', url: '', salary: '', location: '', remote: false });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.company || !form.role) return;
        addApplication(form);
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Job Application</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="label">Company *</label><input className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required /></div>
                        <div><label className="label">Role *</label><input className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div><label className="label">Status</label>
                            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ApplicationStatus })}>
                                {STATUS_COLUMNS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </div>
                        <div><label className="label">Applied Date</label><input className="input" type="date" value={form.appliedDate} onChange={e => setForm({ ...form, appliedDate: e.target.value })} /></div>
                        <div><label className="label">Deadline</label><input className="input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="label">Location</label><input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Berlin, Germany" /></div>
                        <div><label className="label">Salary Range</label><input className="input" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="e.g. €35,000 - €45,000" /></div>
                    </div>
                    <div><label className="label">Job URL</label><input className="input" type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
                    <div><label className="label">Notes</label><textarea className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Application</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddProjectModal({ onClose }: { onClose: () => void }) {
    const { addProject } = useCareerStore();
    const [form, setForm] = useState({ title: '', description: '', status: 'active' as Project['status'], startDate: '', endDate: '', technologies: '', url: '', githubUrl: '' });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) return;
        addProject({ ...form, technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean) });
        onClose();
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Project</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                    <div><label className="label">Technologies (comma-separated)</label><input className="input" value={form.technologies} onChange={e => setForm({ ...form, technologies: e.target.value })} placeholder="React, TypeScript, Node.js" /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="label">GitHub URL</label><input className="input" value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." /></div>
                        <div><label className="label">Live URL</label><input className="input" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
                    </div>
                    <div><label className="label">Description</label><textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function CareerPage() {
    const [tab, setTab] = useState<'applications' | 'projects' | 'skills' | 'certificates'>('applications');
    const [modal, setModal] = useState<'application' | 'project' | 'skill' | 'cert' | null>(null);
    const { applications, projects, skills, certificates, updateApplication, deleteApplication, deleteProject, addSkill, deleteSkill, addCertificate, deleteCertificate } = useCareerStore();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 className="section-title">Career</h2>
                    <p className="section-subtitle">Job applications, projects, skills, and certificates</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {tab === 'applications' && <button className="btn btn-primary" onClick={() => setModal('application')}><Plus size={16} />Add Application</button>}
                    {tab === 'projects' && <button className="btn btn-primary" onClick={() => setModal('project')}><Plus size={16} />Add Project</button>}
                    {tab === 'skills' && <button className="btn btn-primary" onClick={() => setModal('skill')}><Plus size={16} />Add Skill</button>}
                    {tab === 'certificates' && <button className="btn btn-primary" onClick={() => setModal('cert')}><Plus size={16} />Add Certificate</button>}
                </div>
            </div>

            <div className="tabs" style={{ marginBottom: 20 }}>
                <button className={`tab ${tab === 'applications' ? 'active' : ''}`} onClick={() => setTab('applications')}><Briefcase size={14} />Applications</button>
                <button className={`tab ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}><Code2 size={14} />Projects</button>
                <button className={`tab ${tab === 'skills' ? 'active' : ''}`} onClick={() => setTab('skills')}><Star size={14} />Skills</button>
                <button className={`tab ${tab === 'certificates' ? 'active' : ''}`} onClick={() => setTab('certificates')}><Award size={14} />Certificates</button>
            </div>

            {tab === 'applications' && (
                <div style={{ overflowX: 'auto' }}>
                    <div style={{ display: 'flex', gap: 12, minWidth: 900 }}>
                        {STATUS_COLUMNS.map(status => {
                            const apps = applications.filter(a => a.status === status);
                            return (
                                <div key={status} className="kanban-column" style={{ flex: 1, minWidth: 180 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: STATUS_COLORS[status] }}>{status}</span>
                                        <span className="badge" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>{apps.length}</span>
                                    </div>
                                    {apps.map(app => (
                                        <div key={app.id} className="kanban-card">
                                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{app.company}</div>
                                            <div className="text-xs text-muted" style={{ marginBottom: 8 }}>{app.role}</div>
                                            {app.location && <div className="text-xs text-muted" style={{ marginBottom: 8 }}>📍 {app.location}</div>}
                                            {app.salary && <div className="text-xs" style={{ color: 'var(--accent-green)' }}>{app.salary}</div>}
                                            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                                                {STATUS_COLUMNS.filter(s => s !== status && s !== 'rejected').map(s => (
                                                    <button key={s} className="btn btn-ghost btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => updateApplication(app.id, { status: s })}>
                                                        → {s}
                                                    </button>
                                                ))}
                                                <button className="btn btn-ghost btn-sm" style={{ fontSize: 10, padding: '3px 8px', color: 'var(--accent-red)' }} onClick={() => deleteApplication(app.id)}><Trash2 size={10} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {tab === 'projects' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {projects.length === 0 ? (
                        <div className="card empty-state" style={{ padding: 48, gridColumn: '1 / -1' }}><div className="empty-state-icon"><Code2 size={24} color="var(--text-muted)" /></div><h3>No projects yet</h3></div>
                    ) : projects.map(p => (
                        <div key={p.id} className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <h3 style={{ fontWeight: 600 }}>{p.title}</h3>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteProject(p.id)}><Trash2 size={14} color="var(--accent-red)" /></button>
                            </div>
                            <div className="badge" style={{ marginBottom: 12, background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', width: 'fit-content' }}>{p.status}</div>
                            <p className="text-sm text-muted" style={{ marginBottom: 12 }}>{p.description}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                                {p.technologies.map(t => <span key={t} className="chip">{t}</span>)}
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><Code2 size={12} />GitHub</a>}
                                {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><ChevronRight size={12} />Live</a>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'skills' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {skills.length === 0 ? (
                        <div className="card empty-state" style={{ padding: 48, gridColumn: '1 / -1' }}><div className="empty-state-icon"><Star size={24} color="var(--text-muted)" /></div><h3>No skills yet</h3></div>
                    ) : skills.map(s => (
                        <div key={s.id} className="card" style={{ padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{s.name}</div>
                                    <span className="badge" style={{ background: `${SKILL_COLORS[s.level]}18`, color: SKILL_COLORS[s.level] }}>{s.level}</span>
                                </div>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteSkill(s.id)}><Trash2 size={12} color="var(--accent-red)" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'certificates' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {certificates.length === 0 ? (
                        <div className="card empty-state" style={{ padding: 48 }}><div className="empty-state-icon"><Award size={24} color="var(--text-muted)" /></div><h3>No certificates yet</h3></div>
                    ) : certificates.map(c => (
                        <div key={c.id} className="card" style={{ padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                                    <div className="text-sm text-muted">{c.issuer} · {format(parseISO(c.issueDate), 'MMM yyyy')}</div>
                                    {c.expiryDate && <div className="text-xs" style={{ color: 'var(--accent-amber)', marginTop: 4 }}>Expires: {format(parseISO(c.expiryDate), 'MMM yyyy')}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View</a>}
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteCertificate(c.id)}><Trash2 size={14} color="var(--accent-red)" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal === 'application' && <AddApplicationModal onClose={() => setModal(null)} />}
            {modal === 'project' && <AddProjectModal onClose={() => setModal(null)} />}
            {modal === 'skill' && (
                <div className="modal-backdrop" onClick={() => setModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Skill</h3>
                        <form onSubmit={e => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            addSkill({ name: fd.get('name') as string, level: fd.get('level') as CareerSkill['level'], category: fd.get('category') as string });
                            setModal(null);
                        }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div><label className="label">Skill Name *</label><input className="input" name="name" required placeholder="e.g. TypeScript" /></div>
                            <div><label className="label">Level</label><select className="input" name="level">{SKILL_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}</select></div>
                            <div><label className="label">Category</label><input className="input" name="category" placeholder="e.g. Frontend, Backend" /></div>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Skill</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {modal === 'cert' && (
                <div className="modal-backdrop" onClick={() => setModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Add Certificate</h3>
                        <form onSubmit={e => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            addCertificate({ title: fd.get('title') as string, issuer: fd.get('issuer') as string, issueDate: fd.get('issueDate') as string, expiryDate: (fd.get('expiryDate') as string) || undefined, url: (fd.get('url') as string) || undefined });
                            setModal(null);
                        }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div><label className="label">Title *</label><input className="input" name="title" required /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div><label className="label">Issuer *</label><input className="input" name="issuer" required /></div>
                                <div><label className="label">Issue Date *</label><input className="input" type="date" name="issueDate" required /></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div><label className="label">Expiry Date</label><input className="input" type="date" name="expiryDate" /></div>
                                <div><label className="label">URL</label><input className="input" type="url" name="url" placeholder="https://..." /></div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Certificate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
