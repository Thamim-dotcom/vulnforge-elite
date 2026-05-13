import { Target, Activity, AlertTriangle, Server, Eye, Star, Trophy, Zap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { getLevelTitle, xpForNextLevel } from '../lib/auth';

interface VulnEntry {
  id: number; target: string; vuln: string;
  severity: 'high' | 'medium' | 'low' | 'info'; status: string; ts: number;
}
interface DashboardProps {
  isScanning: boolean; targets: number; critVulns: number; vulnFeed: VulnEntry[];
}

function timeAgo(ms: number) {
  const d = Math.floor((Date.now() - ms) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d/60)}m ago`;
  return `${Math.floor(d/3600)}h ago`;
}

function AnimatedCount({ value, prefix='' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current, to = value;
    if (from === to) return;
    const steps = 25, delta = (to - from) / steps;
    let i = 0, cur = from;
    const t = setInterval(() => {
      i++; cur += delta;
      setDisplay(Math.round(i < steps ? cur : to));
      if (i >= steps) clearInterval(t);
    }, 28);
    prev.current = to;
    return () => clearInterval(t);
  }, [value]);
  return <>{prefix}{display}</>;
}

const ACHIEVEMENTS = [
  { id:'first_scan', icon:'🎯', label:'First Blood', desc:'Complete your first scan' },
  { id:'sql_inject', icon:'💉', label:'Injection King', desc:'Find 3 SQL injection vulnerabilities' },
  { id:'hundred_xp', icon:'⚡', label:'XP Grinder', desc:'Reach 100 XP' },
  { id:'five_targets', icon:'🗺️', label:'Cartographer', desc:'Add 5 targets to scope' },
  { id:'critical_hit', icon:'💀', label:'Critical Hit', desc:'Discover a critical severity vulnerability' },
  { id:'night_owl',   icon:'🦉', label:'Night Owl', desc:'Hack between midnight and 5am' },
];

function XPRing({ xp, level }: { xp: number; level: number }) {
  const needed = xpForNextLevel(level);
  const current = xp - xpForNextLevel(level - 1 < 1 ? 0 : level - 1);
  const range   = needed - xpForNextLevel(level - 1 < 1 ? 0 : level - 1);
  const pct = Math.min(1, Math.max(0, current / range));
  const circumference = 2 * Math.PI * 44; // r=44
  const offset = circumference * (1 - pct);
  return (
    <div style={{ position:'relative', width:'100px', height:'100px', flexShrink:0 }}>
      <svg width="100" height="100" className="xp-ring-svg">
        <circle cx="50" cy="50" r="44" className="xp-ring-bg" />
        <circle
          cx="50" cy="50" r="44"
          className="xp-ring-fill"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontWeight:800, fontSize:'1.4rem', lineHeight:1, color:'var(--accent-primary)' }}>{level}</div>
        <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Level</div>
      </div>
    </div>
  );
}

export function Dashboard({ isScanning, targets, critVulns, vulnFeed }: DashboardProps) {
  const { profile } = useApp();
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick(x => x+1), 10_000); return () => clearInterval(t); }, []);

  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const title = getLevelTitle(level);
  const nextLevelXP = xpForNextLevel(level);
  const unlocked = new Set(profile?.achievements ?? []);

  // Skill scores (derived from mock scan data)
  const skills = [
    { label:'Web App',  score: Math.min(100, critVulns * 8 + 20) },
    { label:'Network',  score: Math.min(100, targets * 10 + 10) },
    { label:'OSINT',    score: 35 },
    { label:'Crypto',   score: 15 },
    { label:'Recon',    score: Math.min(100, targets * 12) },
    { label:'Exploit',  score: Math.min(100, critVulns * 6) },
  ];

  return (
    <>
      {/* ── Stats Row ── */}
      <div className="dashboard-grid">
        <div className="glass stat-card">
          <div className="flex items-center justify-between">
            <div className="stat-label">Active Targets</div>
            <div className="stat-icon-wrap" style={{ background:'rgba(0,229,255,0.1)' }}>
              <Target size={18} color="var(--accent-primary)" />
            </div>
          </div>
          <div className="stat-value text-gradient"><AnimatedCount value={targets} /></div>
          <div className="stat-trend neutral"><Activity size={13} /> In scope</div>
        </div>

        <div className="glass stat-card">
          <div className="flex items-center justify-between">
            <div className="stat-label">Critical Findings</div>
            <div className="stat-icon-wrap" style={{ background:'rgba(255,45,85,0.1)' }}>
              <AlertTriangle size={18} color="var(--accent-red)" />
            </div>
          </div>
          <div className="stat-value" style={{ color: critVulns > 0 ? 'var(--accent-red)' : 'var(--text-main)' }}>
            <AnimatedCount value={critVulns} />
          </div>
          <div className={`stat-trend ${critVulns > 5 ? 'down' : 'up'}`}>
            <Activity size={13} /> {critVulns > 5 ? 'Action required' : critVulns > 0 ? 'Investigating' : 'All clear'}
          </div>
        </div>

        {/* Mission XP card */}
        <div className="glass stat-card" style={{ gridColumn: 'span 1' }}>
          <div className="flex items-center gap-4">
            <XPRing xp={xp} level={level} />
            <div style={{ flex:1, minWidth:0 }}>
              <div className="stat-label" style={{ marginBottom:'4px' }}>
                <Zap size={12} style={{ display:'inline', marginRight:'4px', color:'var(--accent-yellow)' }} />
                Mission XP
              </div>
              <div style={{ fontWeight:800, fontSize:'1.2rem', color:'var(--accent-primary)' }} className="text-neon">{title}</div>
              <div className="text-xs" style={{ color:'var(--text-muted)', marginTop:'2px' }}>{xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</div>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width:`${Math.min(100,(xp/nextLevelXP)*100)}%`, background:'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Activity Section ── */}
      <div className="activity-grid">
        {/* Live Feed */}
        <div className="glass p-6">
          <div className="panel-title">
            <Activity size={16} color="var(--accent-primary)" />
            Live Vulnerability Feed
            {isScanning && <span style={{ marginLeft:'auto', fontSize:'0.72rem', color:'var(--success)', background:'rgba(34,197,94,0.1)', padding:'2px 8px', borderRadius:'20px', border:'1px solid rgba(34,197,94,0.2)' }}>● LIVE</span>}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Target</th><th>Vulnerability</th><th>Severity</th><th>Status</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {vulnFeed.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)', padding:'32px' }}>
                    No findings yet — Launch a Hunt to begin.
                  </td></tr>
                )}
                {vulnFeed.map(e => (
                  <tr key={e.id} style={{ animation:'fadeUp 0.3s ease' }}>
                    <td style={{ fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>{e.target}</td>
                    <td style={{ fontWeight:500, fontSize:'0.875rem' }}>{e.vuln}</td>
                    <td>
                      <span className={`badge badge-${e.severity === 'high' ? 'critical' : e.severity}`}>
                        {e.severity === 'high' ? 'Critical' : e.severity}
                      </span>
                    </td>
                    <td style={{ fontSize:'0.8rem', color: e.status.includes('Exploit') ? 'var(--accent-red)' : e.status === 'Verified' ? 'var(--success)' : 'var(--text-muted)' }}>{e.status}</td>
                    <td style={{ fontSize:'0.78rem', color:'var(--text-dim)' }}>{timeAgo(e.ts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Radar + Achievements + Skills */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* Radar */}
          <div className="glass p-6">
            <div className="panel-title"><Eye size={16} color="var(--accent-primary)" /> Recon Radar</div>
            <div style={{ display:'flex', justifyContent:'center' }}>
              <div className="radar-wrap" style={{ width:'180px', height:'180px' }}>
                {[60,40,20].map(s => (
                  <div key={s} className="radar-ring" style={{ width:`${s}%`, height:`${s}%`, top:`${50-s/2}%`, left:`${50-s/2}%` }} />
                ))}
                {isScanning && <div className="radar-sweep" />}
                {isScanning && (
                  <>
                    <div className="radar-dot" style={{ top:'28%', left:'38%' }} />
                    <div className="radar-dot" style={{ top:'62%', left:'68%', animationDelay:'0.6s' }} />
                    <div className="radar-dot" style={{ top:'74%', left:'24%', animationDelay:'1.2s' }} />
                  </>
                )}
                <div style={{ position:'absolute', display:'flex', flexDirection:'column', alignItems:'center', zIndex:2 }}>
                  <Server size={24} color="var(--accent-primary)" style={{ filter:'drop-shadow(0 0 8px var(--accent-glow))', opacity: isScanning ? 1 : 0.4 }} />
                  <span style={{ fontSize:'0.65rem', color:'var(--accent-primary)', marginTop:'4px' }}>
                    {isScanning ? `${targets} targets` : 'Idle'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Progress */}
          <div className="glass p-6">
            <div className="panel-title"><Star size={16} color="var(--accent-yellow)" /> Skill Tree</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {skills.map(sk => (
                <div key={sk.label}>
                  <div className="flex justify-between text-xs mb-1" style={{ color:'var(--text-muted)' }}>
                    <span>{sk.label}</span><span>{sk.score}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${sk.score}%`, background: sk.score > 70 ? 'var(--success)' : sk.score > 40 ? 'var(--accent-primary)' : 'var(--accent-secondary)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Achievements ── */}
      <div className="glass p-6 mt-4">
        <div className="panel-title"><Trophy size={16} color="var(--accent-yellow)" /> Achievements</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'10px' }}>
          {ACHIEVEMENTS.map(a => {
            const earned = unlocked.has(a.id);
            return (
              <div key={a.id}
                title={a.desc}
                style={{
                  padding:'12px 14px',
                  borderRadius:'8px',
                  border:`1px solid ${earned ? 'rgba(0,229,255,0.25)' : 'var(--border)'}`,
                  background: earned ? 'rgba(0,229,255,0.05)' : 'rgba(255,255,255,0.02)',
                  opacity: earned ? 1 : 0.4,
                  display:'flex', alignItems:'center', gap:'10px',
                  transition:'all 0.3s',
                  cursor:'default',
                }}
              >
                <span style={{ fontSize:'1.4rem', filter: earned ? 'none' : 'grayscale(1)' }}>{a.icon}</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:'0.82rem' }}>{a.label}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{a.desc}</div>
                </div>
                {earned && <Zap size={12} color="var(--accent-yellow)" style={{ marginLeft:'auto', flexShrink:0 }} />}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
