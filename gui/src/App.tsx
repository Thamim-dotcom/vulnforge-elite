import { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert, Activity, Radar, Target, Terminal as TerminalIcon,
  Settings as SettingsIcon, Search, Bell, Play, Pause, X, Lock, LogOut,
} from 'lucide-react';
import './index.css';

import { AppProvider, useApp } from './contexts/AppContext';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { Targets } from './components/Targets';
import { Terminal } from './components/Terminal';
import { Scans } from './components/Scans';
import { Settings } from './components/Settings';
import { authenticateProfile } from './lib/auth';

type TabId = 'dashboard' | 'targets' | 'scans' | 'terminal' | 'settings';

interface VulnEntry {
  id: number; target: string; vuln: string;
  severity: 'high' | 'medium' | 'low' | 'info'; status: string; ts: number;
}
interface Notif { id: number; title: string; desc: string; ts: number; read: boolean; }

const FINDINGS: Omit<VulnEntry,'id'|'ts'>[] = [
  { target:'api.example.com',    vuln:'Blind SQL Injection',         severity:'high',   status:'Exploiting...' },
  { target:'auth.staging.dev',   vuln:'OAuth Misconfiguration',      severity:'high',   status:'Reporting' },
  { target:'cdn.assets.net',     vuln:'CORS Wildcard Policy',        severity:'medium', status:'Verified' },
  { target:'app.production.io',  vuln:'Information Disclosure',      severity:'low',    status:'Verified' },
  { target:'legacy.system.org',  vuln:'CVE-2023-44487 (HTTP/2)',     severity:'high',   status:'Exploiting...' },
  { target:'admin.staging.dev',  vuln:'Unauthenticated Admin Panel', severity:'high',   status:'Reporting' },
  { target:'api-v2.example.com', vuln:'JWT None Algorithm',          severity:'high',   status:'Exploiting...' },
  { target:'cdn.assets.net',     vuln:'Stored XSS in Comment Field', severity:'medium', status:'Verified' },
];

const PAGE_INFO: Record<TabId, { title: string; subtitle: string }> = {
  dashboard: { title:'Command Center',       subtitle:'Real-time overview of active hunts and threat intelligence.' },
  targets:   { title:'Target Management',   subtitle:'Manage domains, IPs, and CIDR ranges in scope.' },
  scans:     { title:'Scans & Hunts',       subtitle:'Configure and monitor active vulnerability assessments.' },
  terminal:  { title:'Execution Terminal',  subtitle:'Live streaming logs from background scan workers.' },
  settings:  { title:'Settings',            subtitle:'Configure all aspects of VulnForge Elite.' },
};

// ── Lock Screen ────────────────────────────────────────────────────────────────
function LockScreen() {
  const { profile, unlock, handleLogout } = useApp();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const p = await authenticateProfile(profile!.username, pw);
      unlock(p);
    } catch {
      setErr('Incorrect password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-screen">
      <div className="login-bg-grid" />
      <div className="glass login-card" style={{ width:'360px', textAlign:'center' }}>
        <Lock size={40} style={{ color:'var(--accent-primary)', margin:'0 auto 16px', display:'block', filter:'drop-shadow(0 0 10px var(--accent-glow))' }} />
        <div style={{ fontSize:'1.2rem', fontWeight:700, marginBottom:'4px' }}>Session Locked</div>
        <div className="text-sm mb-4" style={{ color:'var(--text-muted)' }}>Enter your master password to continue as <strong>{profile?.displayName}</strong>.</div>
        <form onSubmit={handleUnlock} className="flex flex-col gap-3">
          <input
            autoFocus type="password" className="input" placeholder="Master password"
            value={pw} onChange={e => { setPw(e.target.value); setErr(''); }}
          />
          {err && <div className="error-text">{err}</div>}
          <button type="submit" className="btn btn-primary" style={{ justifyContent:'center' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Unlock'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            <LogOut size={14} /> Switch Profile
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main App Shell ─────────────────────────────────────────────────────────────
function AppShell() {
  const { profile, handleLogout, isLocked, addXP, grantAchievement } = useApp();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [isScanning, setIsScanning] = useState(false);
  const [vulnFeed, setVulnFeed] = useState<VulnEntry[]>([]);
  const [targets, setTargetsCount] = useState(4);
  const [critVulns, setCritVulns] = useState(0);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const findingIdx = useRef(0);

  // Stream findings while scanning
  useEffect(() => {
    if (!isScanning) return;
    const t = setInterval(() => {
      const f = FINDINGS[findingIdx.current % FINDINGS.length];
      findingIdx.current++;
      setVulnFeed(prev => [{ ...f, id: Date.now(), ts: Date.now() }, ...prev].slice(0, 40));
      if (f.severity === 'high') {
        setCritVulns(c => c + 1);
        addXP(25);
        grantAchievement('critical_hit');
        setNotifs(prev => [{
          id: Date.now(), title: `Critical: ${f.vuln}`,
          desc: `Found on ${f.target}`, ts: Date.now(), read: false,
        }, ...prev].slice(0, 20));
      }
    }, 3000);
    return () => clearInterval(t);
  }, [isScanning, addXP, grantAchievement]);

  // Close notif panel on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (isLocked) return <LockScreen />;

  const unread = notifs.filter(n => !n.read).length;
  const markRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const info = PAGE_INFO[tab];
  const searchResults = search.trim() ? FINDINGS.filter(f =>
    f.target.toLowerCase().includes(search.toLowerCase()) ||
    f.vuln.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const NAV = [
    { id:'dashboard' as TabId, icon:<Activity size={17} />,     label:'Dashboard' },
    { id:'targets'   as TabId, icon:<Target size={17} />,       label:'Targets' },
    { id:'scans'     as TabId, icon:<Radar size={17} />,        label:'Scans & Hunts', dot: isScanning },
    { id:'terminal'  as TabId, icon:<TerminalIcon size={17} />, label:'Terminal',      dot: isScanning },
    { id:'settings'  as TabId, icon:<SettingsIcon size={17} />, label:'Settings' },
  ];

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <ShieldAlert size={26} className="logo-icon" />
          VulnForge <span className="text-gradient" style={{ marginLeft:'4px' }}>Elite</span>
        </div>

        <div className="nav-group-label">Navigation</div>
        <nav>
          {NAV.map(n => (
            <div key={n.id} className={`nav-item ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span style={{ flex:1 }}>{n.label}</span>
              {n.dot && <div className="badge-dot" />}
            </div>
          ))}
        </nav>

        <div style={{ marginTop:'auto', padding:'12px' }}>
          {/* Profile card */}
          <div className="glass" style={{ padding:'12px', marginBottom:'8px' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="avatar" style={{ width:'28px', height:'28px', fontSize:'0.72rem' }}>
                {profile?.displayName?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div style={{ minWidth:0 }}>
                <div className="truncate" style={{ fontWeight:600, fontSize:'0.82rem' }}>{profile?.displayName}</div>
                <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Lv.{profile?.level} · {profile?.xp ?? 0} XP</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color:'var(--success)' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--success)', boxShadow:'0 0 6px var(--success)', animation:'pulseDot 2s infinite' }} />
              {isScanning ? 'Hunt Active' : 'System Online'}
            </div>
          </div>
          <button className="btn btn-ghost w-full btn-sm" style={{ justifyContent:'center' }} onClick={handleLogout}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ position:'relative' }}>
            <div className="search-bar">
              <Search size={15} color="var(--text-muted)" />
              <input placeholder="Search targets, vulns..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }} onClick={() => setSearch('')}><X size={13} /></button>}
            </div>
            {searchResults.length > 0 && (
              <div style={{ position:'absolute', top:'40px', left:0, width:'340px', zIndex:50 }}>
                <div className="glass" style={{ padding:'6px', maxHeight:'220px', overflowY:'auto' }}>
                  {searchResults.map((f, i) => (
                    <div key={i}
                      style={{ padding:'8px 12px', borderRadius:'6px', cursor:'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                      onClick={() => { setSearch(''); setTab('dashboard'); }}
                    >
                      <div style={{ fontWeight:500, fontSize:'0.85rem' }}>{f.vuln}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{f.target}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div style={{ position:'relative' }} ref={notifRef}>
              <button className="btn btn-ghost btn-icon" style={{ position:'relative' }}
                onClick={() => { setShowNotifs(x => !x); markRead(); }}>
                <Bell size={18} />
                {unread > 0 && (
                  <span style={{ position:'absolute', top:'2px', right:'2px', width:'16px', height:'16px', borderRadius:'50%', background:'var(--accent-red)', fontSize:'0.62rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800 }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div style={{ position:'absolute', right:0, top:'44px', width:'320px', zIndex:50, animation:'fadeUp 0.2s ease' }}>
                  <div className="glass" style={{ overflow:'hidden', maxHeight:'380px', overflowY:'auto' }}>
                    <div className="flex items-center justify-between p-4" style={{ borderBottom:'1px solid var(--border)' }}>
                      <span style={{ fontWeight:600 }}>Notifications</span>
                      <span className="text-xs" style={{ color:'var(--text-muted)' }}>{notifs.length} total</span>
                    </div>
                    {notifs.length === 0
                      ? <div style={{ padding:'24px', textAlign:'center', color:'var(--text-muted)', fontSize:'0.875rem' }}>No notifications yet.</div>
                      : notifs.map(n => (
                        <div key={n.id} style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ fontWeight:500, fontSize:'0.85rem', color:'#fca5a5', marginBottom:'2px' }}>{n.title}</div>
                          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{n.desc}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="avatar" title={profile?.displayName}
              onClick={() => setTab('settings')}
              style={{ cursor:'pointer' }}>
              {profile?.displayName?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page */}
        <div className="page-body" key={tab}>
          <div className="page-header">
            <div>
              <h1 className="page-title">{info.title}</h1>
              <p className="page-subtitle">{info.subtitle}</p>
            </div>
            {tab !== 'settings' && (
              <button
                className={`btn ${isScanning ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => { setIsScanning(x => !x); if (!isScanning) { addXP(10); grantAchievement('first_scan'); } }}
              >
                {isScanning ? <Pause size={16} /> : <Play size={16} />}
                {isScanning ? 'Halt Hunt' : 'Launch Hunt'}
              </button>
            )}
          </div>

          {tab === 'dashboard' && <Dashboard isScanning={isScanning} targets={targets} critVulns={critVulns} vulnFeed={vulnFeed} />}
          {tab === 'targets'   && <Targets onTargetCountChange={setTargetsCount} />}
          {tab === 'scans'     && <Scans />}
          {tab === 'terminal'  && <Terminal isScanning={isScanning} />}
          {tab === 'settings'  && <Settings />}
        </div>
      </main>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppRoot />
    </AppProvider>
  );
}

function AppRoot() {
  const { profile } = useApp();
  if (!profile) return <LoginScreen />;
  return <AppShell />;
}
