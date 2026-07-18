import { useState } from 'react';
import { Settings, Moon, Sun, Globe, Bell, Save, User, LogOut, Shield } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';

const AVATAR_COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4'];

export function SettingsPage() {
    const { settings, updateSettings } = useSettingsStore();
    const [saved, setSaved] = useState(false);
    const { signOut, isSupabaseConfigured } = useAuthStore();

    const profile = settings.userProfile || { name: 'John Doe', email: 'john.doe@example.com', avatarColor: '#7c3aed', bio: '' };

    const updateProfile = (updates: Partial<typeof profile>) => {
        updateSettings({
            userProfile: {
                ...profile,
                ...updates,
            }
        });
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleThemeToggle = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        updateSettings({ theme: newTheme });
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 24 }}>
                <h2 className="section-title">Settings</h2>
                <p className="section-subtitle">Customize your Life OS experience</p>
            </div>

            {/* User Profile */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={18} /> User Profile
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 6 }}>
                        <div style={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: profile.avatarColor,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 22,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        }}>
                            {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label">Avatar Color</label>
                            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                {AVATAR_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => updateProfile({ avatarColor: color })}
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            background: color,
                                            border: profile.avatarColor === color ? '2px solid #fff' : 'none',
                                            cursor: 'pointer',
                                            outline: profile.avatarColor === color ? '2px solid var(--accent-violet)' : 'none',
                                        }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label className="label">Full Name</label>
                            <input
                                className="input"
                                value={profile.name}
                                onChange={e => updateProfile({ name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="label">Email Address</label>
                            <input
                                className="input"
                                type="email"
                                value={profile.email}
                                onChange={e => updateProfile({ email: e.target.value })}
                                placeholder="john.doe@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">Short Bio</label>
                        <textarea
                            className="input"
                            value={profile.bio}
                            onChange={e => updateProfile({ bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows={2}
                        />
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {settings.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    Appearance
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontWeight: 500 }}>Theme</div>
                        <div className="text-sm text-muted">Choose between dark and light mode</div>
                    </div>
                    <button
                        className="btn btn-secondary"
                        onClick={handleThemeToggle}
                        style={{ minWidth: 100 }}
                    >
                        {settings.theme === 'dark' ? <><Sun size={16} />Light</> : <><Moon size={16} />Dark</>}
                    </button>
                </div>
            </div>

            {/* Locale */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Globe size={18} /> Regional Settings
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label className="label">Currency</label>
                            <select className="input" value={settings.currency} onChange={e => updateSettings({ currency: e.target.value })}>
                                <option value="EUR">EUR (€) — Euro</option>
                                <option value="USD">USD ($) — US Dollar</option>
                                <option value="GBP">GBP (£) — British Pound</option>
                                <option value="INR">INR (₹) — Indian Rupee</option>
                                <option value="CAD">CAD ($) — Canadian Dollar</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Timezone</label>
                            <select className="input" value={settings.timezone} onChange={e => updateSettings({ timezone: e.target.value })}>
                                <option value="Europe/Berlin">Europe/Berlin</option>
                                <option value="Europe/London">Europe/London</option>
                                <option value="Asia/Kolkata">Asia/Kolkata</option>
                                <option value="America/New_York">America/New_York</option>
                                <option value="America/Los_Angeles">America/Los_Angeles</option>
                                <option value="Asia/Dubai">Asia/Dubai</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Week starts on</label>
                        <select className="input" value={settings.weekStartsOn} onChange={e => updateSettings({ weekStartsOn: +e.target.value as 0 | 1 })}>
                            <option value={1}>Monday</option>
                            <option value={0}>Sunday</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={18} /> Notifications
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(Object.keys(settings.notifications) as (keyof typeof settings.notifications)[]).map(key => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{key.charAt(0).toUpperCase() + key.slice(1)} Alerts</div>
                                <div className="text-sm text-muted">
                                    {{
                                        inventory: 'Alert when items are running low',
                                        documents: 'Alert before documents expire',
                                        bills: 'Alert for upcoming bills',
                                        study: 'Daily study reminder',
                                        workout: 'Workout reminder',
                                    }[key]}
                                </div>
                            </div>
                            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications[key]}
                                    onChange={e => updateSettings({ notifications: { ...settings.notifications, [key]: e.target.checked } })}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: 'absolute', inset: 0, borderRadius: 999,
                                    background: settings.notifications[key] ? 'var(--accent-violet)' : 'var(--border-strong)',
                                    transition: 'background 0.2s ease',
                                }}>
                                    <span style={{
                                        position: 'absolute', left: settings.notifications[key] ? 22 : 2, top: 2,
                                        width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                        transition: 'left 0.2s ease',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                    }} />
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* About */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Settings size={18} /> About Life OS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Version</span><span>1.0.0 MVP</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Storage</span><span>{isSupabaseConfigured ? 'Supabase Sync Active' : 'Local (localStorage)'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Status</span><span>{isSupabaseConfigured ? 'Cloud Connected' : 'Offline Mode'}</span>
                    </div>
                </div>
            </div>

            {/* Account Settings */}
            {isSupabaseConfigured && (
                <div className="card" style={{ padding: 24, marginBottom: 24, border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-red)' }}>
                        <Shield size={18} /> Account Security
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                        Signed in as **{settings.userProfile?.email || 'authenticated user'}**. Wiping workspace local state will log you out cleanly.
                    </p>
                    <button
                        className="btn"
                        onClick={signOut}
                        style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.2)', gap: 8 }}
                    >
                        <LogOut size={14} /> Sign Out & Clear Workspace
                    </button>
                </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
                {saved ? <>✓ Settings Saved</> : <><Save size={16} />Save Settings</>}
            </button>
        </div>
    );
}
