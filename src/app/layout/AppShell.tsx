import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, Wallet, UtensilsCrossed,
    Heart, BookOpen, Briefcase, FileText, Settings,
    ChevronLeft, Search, Bell, X, Zap, Menu
} from 'lucide-react';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useSettingsStore } from '@/store/settingsStore';

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, color: '#7c3aed' },
    { path: '/planning', label: 'Planner', icon: Calendar, color: '#3b82f6' },
    { path: '/finance', label: 'Finance', icon: Wallet, color: '#10b981' },
    { path: '/food', label: 'Food', icon: UtensilsCrossed, color: '#f59e0b' },
    { path: '/health', label: 'Health', icon: Heart, color: '#ef4444' },
    { path: '/learning', label: 'Learning', icon: BookOpen, color: '#8b5cf6' },
    { path: '/career', label: 'Career', icon: Briefcase, color: '#06b6d4' },
    { path: '/documents', label: 'Documents', icon: FileText, color: '#ec4899' },
    { path: '/settings', label: 'Settings', icon: Settings, color: '#6b7280' },
];

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { settings } = useSettingsStore();

    // Context theme updater
    React.useEffect(() => {
        if (settings.disableDynamicAccents) {
            document.documentElement.setAttribute('data-feature', 'default');
            return;
        }
        const path = location.pathname;
        let featureStr = 'default';
        if (path === '/') featureStr = 'dashboard';
        else if (path.startsWith('/planning')) featureStr = 'planning';
        else if (path.startsWith('/finance')) featureStr = 'finance';
        else if (path.startsWith('/food')) featureStr = 'food';
        else if (path.startsWith('/health')) featureStr = 'health';
        else if (path.startsWith('/learning')) featureStr = 'learning';
        else if (path.startsWith('/career')) featureStr = 'career';
        else if (path.startsWith('/documents')) featureStr = 'documents';
        else if (path.startsWith('/settings')) featureStr = 'settings';

        document.documentElement.setAttribute('data-feature', featureStr);
    }, [location.pathname, settings.disableDynamicAccents]);

    // Theme style attribute updater
    React.useEffect(() => {
        const style = settings.themeStyle || 'cozy-earth';
        document.documentElement.setAttribute('data-theme-style', style);
    }, [settings.themeStyle]);

    // Theme mode attribute updater (dark/light)
    React.useEffect(() => {
        const mode = settings.theme || 'dark';
        document.documentElement.setAttribute('data-theme', mode);
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings.theme]);

    // Global keyboard shortcut
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') setSearchOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const currentNav = NAV_ITEMS.find(
        (n) => n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path)
    );

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col flex-shrink-0 overflow-hidden transition-all duration-300 transform md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                style={{
                    width: collapsed ? 64 : 220,
                    background: 'var(--bg-sidebar)',
                    borderRight: '1px solid var(--border)',
                }}
            >
                {/* Logo */}
                <div style={{
                    padding: collapsed ? '20px 16px' : '20px 16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minHeight: 64,
                }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        background: 'var(--gradient-primary)',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
                    }}>
                        <Zap size={16} color="#fff" fill="#fff" />
                    </div>
                    {!collapsed && (
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                                Life OS
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                Personal Dashboard
                            </div>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {NAV_ITEMS.map(({ path, label, icon: Icon, color }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === '/'}
                            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                            title={collapsed ? label : undefined}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="nav-icon" style={{ display: 'flex', flexShrink: 0 }}>
                                <Icon size={18} />
                            </span>
                            {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Collapse toggle (hidden on mobile) */}
                <div className="hidden md:block" style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
                    <button
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10, padding: '8px 12px' }}
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease', flexShrink: 0 }} />
                        {!collapsed && <span style={{ fontSize: 13 }}>Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top bar */}
                <header
                    className="flex items-center flex-shrink-0 px-4 md:px-6 gap-3 md:gap-4 h-16"
                    style={{
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-sidebar)',
                    }}
                >
                    {/* Mobile Hamburger */}
                    <button
                        className="md:hidden btn btn-ghost btn-icon"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu size={20} />
                    </button>

                    {/* Page title */}
                    <div className="flex-1 truncate">
                        <h1 className="text-sm md:text-base font-bold tracking-tight truncate">
                            {currentNav?.label ?? 'Life OS'}
                        </h1>
                    </div>

                    {/* Search button */}
                    <button
                        className="btn btn-secondary btn-sm flex-shrink-0 w-8 md:w-auto md:min-w-[160px] justify-center md:justify-start"
                        onClick={() => setSearchOpen(true)}
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <Search size={14} />
                        <span className="hidden md:inline">Search</span>
                        <span className="hidden md:inline ml-auto text-[11px] bg-[var(--bg-card)] px-1.5 py-0.5 rounded">⌘K</span>
                    </button>

                    {/* Notifications bell */}
                    <button className="btn btn-ghost btn-icon" title="Notifications" style={{ marginRight: 4 }}>
                        <Bell size={18} />
                    </button>

                    {/* Dynamic Profile Avatar */}
                    <NavLink
                        to="/settings"
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: settings.userProfile?.avatarColor || 'var(--accent-violet)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: 12,
                            textDecoration: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            flexShrink: 0,
                        }}
                        title="Profile Settings"
                    >
                        {settings.userProfile?.name ? getInitials(settings.userProfile.name) : 'GU'}
                    </NavLink>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto main-content-area">
                    {children}
                </main>
            </div>

            {/* Global Search Modal */}
            {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
        </div>
    );
}
