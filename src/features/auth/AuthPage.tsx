import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Lock, Mail, User, CheckCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [signUpSuccess, setSignUpSuccess] = useState(false);

    const { isSupabaseConfigured } = useAuthStore();

    if (!isSupabaseConfigured) {
        return (
            <div style={{
                height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)', color: '#fff', padding: 20
            }}>
                <div className="card" style={{ maxWidth: 440, padding: 32, textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{
                        width: 56, height: 56, background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                        border: '1.5px solid var(--accent-orange)'
                    }}>
                        <AlertTriangle size={24} color="var(--accent-orange)" />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.3px' }}>Local Configuration</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
                        Supabase credentials are not detected in the environment. The application is running in fully offline, local-first mode using local storage.
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', gap: 8 }}
                        onClick={() => useAuthStore.getState().setSession(null)}
                    >
                        <Zap size={15} /> Enter Local Workspace
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!email || !password) {
            setError('Please enter both email and password.');
            setLoading(false);
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        if (!isLogin && !fullName.trim()) {
            setError('Please enter your name.');
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                // Sign In
                const { error: signInError } = await supabase!.auth.signInWithPassword({
                    email,
                    password
                });
                if (signInError) throw signInError;
            } else {
                // Sign Up
                const { data, error: signUpError } = await supabase!.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: fullName.trim()
                        }
                    }
                });

                if (signUpError) throw signUpError;

                // Check if user is auto-confirmed or needs confirmation
                if (data.session) {
                    // Auto-logged in
                    useAuthStore.getState().setSession(data.session);
                } else {
                    setSignUpSuccess(true);
                }
            }
        } catch (err: any) {
            console.error('Authentication Error:', err);
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(circle at top left, #120d24 0%, #030206 100%)', color: '#fff', overflow: 'auto',
            padding: 20
        }}>
            <div style={{ position: 'absolute', top: '10%', left: '15%', width: 220, height: 220, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.08)', filter: 'blur(60px)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.05)', filter: 'blur(70px)', zIndex: 0 }} />

            <div className="card" style={{
                width: '100%', maxWidth: 420, padding: 36, position: 'relative', zIndex: 5,
                background: 'rgba(30, 30, 46, 0.3)', border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
            }}>
                {/* Brand Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 44, height: 44, background: 'var(--gradient-primary)', borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)'
                    }}>
                        <Zap size={20} color="#fff" fill="#fff" />
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px' }}>Life OS</h1>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Command Center & Synchronization</p>
                </div>

                {signUpSuccess ? (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <div style={{
                            width: 52, height: 52, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                            border: '1.5px solid var(--accent-green)'
                        }}>
                            <CheckCircle size={22} color="var(--accent-green)" />
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Verify your email</h2>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 24 }}>
                            A confirmation link has been sent to **{email}**. Please click the link inside the mail to verify your account and start syncing.
                        </p>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%' }}
                            onClick={() => {
                                setSignUpSuccess(false);
                                setIsLogin(true);
                                setPassword('');
                                setConfirmPassword('');
                            }}
                        >
                            Back to Sign In
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Tab Headers */}
                        <div style={{
                            display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                            padding: 4, marginBottom: 24, border: '1px solid rgba(255,255,255,0.04)'
                        }}>
                            <button
                                style={{
                                    flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 650,
                                    background: isLogin ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    color: isLogin ? '#fff' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onClick={() => { setIsLogin(true); setError(null); }}
                            >
                                Sign In
                            </button>
                            <button
                                style={{
                                    flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 650,
                                    background: !isLogin ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    color: !isLogin ? '#fff' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onClick={() => { setIsLogin(false); setError(null); }}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Error Indicator */}
                        {error && (
                            <div style={{
                                display: 'flex', gap: 10, background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 8,
                                padding: '12px 14px', marginBottom: 18, fontSize: 12, color: 'var(--accent-red)',
                                lineHeight: 1.4, alignItems: 'center'
                            }}>
                                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Interactive Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {!isLogin && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className="input"
                                            style={{ paddingLeft: 36, height: 42, background: 'rgba(255,255,255,0.03)' }}
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            placeholder="Jane Doe"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        className="input"
                                        style={{ paddingLeft: 36, height: 42, background: 'rgba(255,255,255,0.03)' }}
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="jane.doe@example.com"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        className="input"
                                        style={{ paddingLeft: 36, height: 42, background: 'rgba(255,255,255,0.03)' }}
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className="input"
                                            style={{ paddingLeft: 36, height: 42, background: 'rgba(255,255,255,0.03)' }}
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', height: 42, marginTop: 12, gap: 8 }}
                                disabled={loading}
                            >
                                <ShieldCheck size={16} />
                                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
