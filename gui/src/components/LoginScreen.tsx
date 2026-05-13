import { useState } from 'react';
import { ShieldAlert, Eye, EyeOff, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { authenticateProfile, createProfile, getProfiles } from '../lib/auth';
import { useApp } from '../contexts/AppContext';

type View = 'login' | 'register';

export function LoginScreen() {
  const { setProfile } = useApp();
  const [view, setView] = useState<View>(() => getProfiles().length === 0 ? 'register' : 'login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const profiles = getProfiles();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const p = await authenticateProfile(username, password);
      setProfile(p);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const p = await createProfile(username, password, displayName);
      setProfile(p);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally { setLoading(false); }
  }

  return (
    <div className="login-screen">
      <div className="login-bg-grid" />
      {/* Glow orbs */}
      <div style={{ position:'absolute', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)', top:'-100px', left:'-100px', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(157,78,221,0.08) 0%, transparent 70%)', bottom:'-60px', right:'-60px', pointerEvents:'none' }} />

      <div className="glass login-card">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert size={32} style={{ color:'var(--accent-primary)', filter:'drop-shadow(0 0 8px var(--accent-glow))' }} />
          <div>
            <div className="text-gradient" style={{ fontSize:'1.4rem', fontWeight:800, lineHeight:1 }}>VulnForge Elite</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:'2px', letterSpacing:'1px', textTransform:'uppercase' }}>
              {view === 'login' ? 'Secure Access Portal' : 'Create Operator Profile'}
            </div>
          </div>
        </div>

        {/* Profile switcher (login view only) */}
        {view === 'login' && profiles.length > 0 && (
          <div className="mb-4">
            <div className="label mb-2">Select Profile</div>
            <div className="flex flex-col gap-2">
              {profiles.map(p => (
                <button
                  key={p.id}
                  className="btn btn-ghost"
                  style={{ justifyContent:'flex-start', borderColor: username === p.username ? 'var(--accent-primary)' : undefined }}
                  onClick={() => setUsername(p.username)}
                >
                  <div className="avatar" style={{ width:'26px', height:'26px', fontSize:'0.7rem' }}>{p.displayName[0].toUpperCase()}</div>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{p.displayName}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>@{p.username} · Level {p.level}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="divider" />
          </div>
        )}

        <form onSubmit={view === 'login' ? handleLogin : handleRegister}>
          <div className="flex flex-col gap-3">
            {view === 'register' && (
              <div className="input-group">
                <label className="label">Display Name</label>
                <input className="input" placeholder="e.g. Ghost Operator" value={displayName} onChange={e => setDisplayName(e.target.value)} autoFocus />
              </div>
            )}

            <div className="input-group">
              <label className="label">Username</label>
              <input
                className="input"
                placeholder="operator_id"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                autoFocus={view === 'login'}
                required
              />
            </div>

            <div className="input-group">
              <label className="label">Master Password</label>
              <div style={{ position:'relative' }}>
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder={view === 'register' ? 'Min. 8 characters' : '••••••••'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={{ paddingRight:'40px' }}
                  required
                />
                <button type="button" onClick={() => setShowPw(x => !x)}
                  style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {view === 'register' && (
              <div className="input-group">
                <label className="label">Confirm Password</label>
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(''); }}
                  required
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 error-text">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* Password strength (register) */}
            {view === 'register' && password.length > 0 && (
              <PasswordStrength password={password} />
            )}

            <button type="submit" className="btn btn-primary w-full" style={{ justifyContent:'center', marginTop:'4px' }} disabled={loading}>
              {loading
                ? <span style={{ animation:'pulseGlow 1s infinite' }}>Processing...</span>
                : view === 'login'
                  ? <><LogIn size={16} /> Access System</>
                  : <><UserPlus size={16} /> Create Profile</>
              }
            </button>
          </div>
        </form>

        <div className="divider" />
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color:'var(--text-muted)' }}>
          {view === 'login' ? (
            <>No profile yet?
              <button className="btn btn-ghost btn-sm" onClick={() => { setView('register'); setError(''); setUsername(''); setPassword(''); }}>
                <UserPlus size={14} /> Create Profile
              </button>
            </>
          ) : (
            <>Already registered?
              <button className="btn btn-ghost btn-sm" onClick={() => { setView('login'); setError(''); setPassword(''); setConfirm(''); }}>
                <LogIn size={14} /> Sign In
              </button>
            </>
          )}
        </div>

        <div className="text-xs mt-4" style={{ color:'var(--text-dim)', textAlign:'center' }}>
          🔐 Local-only · PBKDF2-SHA256 · No data leaves your machine
        </div>
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Symbol', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['var(--danger)', 'var(--accent-red)', 'var(--warning)', 'var(--success)', 'var(--accent-primary)'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return (
    <div>
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex:1, height:'3px', borderRadius:'2px', background: i <= score ? colors[score] : 'var(--border)', transition:'background 0.3s' }} />
        ))}
      </div>
      <div className="flex justify-between text-xs" style={{ color:'var(--text-muted)' }}>
        <span>{labels[score] || 'Very Weak'}</span>
        <div className="flex gap-2">
          {checks.map(c => (
            <span key={c.label} style={{ color: c.ok ? 'var(--success)' : 'var(--text-dim)' }}>{c.ok ? '✓' : '○'} {c.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
