import { useState } from 'react';
import type { AppSettings } from '../lib/settings';
import {
  Settings as SettingsIcon, Palette, Shield, Cpu, Plug, FlaskConical,
  FileText, Wrench, Info, Save, RotateCcw, CheckCircle2, Eye, EyeOff,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { resetSettings } from '../lib/settings';

type SectionId = 'general' | 'appearance' | 'security' | 'scanning' | 'api' | 'simulation' | 'reporting' | 'advanced' | 'about';

const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: 'general',    label: 'General',            icon: <SettingsIcon size={15} /> },
  { id: 'appearance', label: 'Appearance',          icon: <Palette size={15} /> },
  { id: 'security',   label: 'Security & Privacy',  icon: <Shield size={15} /> },
  { id: 'scanning',   label: 'Scanning Engine',     icon: <Cpu size={15} /> },
  { id: 'api',        label: 'API & Integrations',  icon: <Plug size={15} /> },
  { id: 'simulation', label: 'Simulation & Lab',    icon: <FlaskConical size={15} /> },
  { id: 'reporting',  label: 'Reporting',           icon: <FileText size={15} /> },
  { id: 'advanced',   label: 'Advanced',            icon: <Wrench size={15} /> },
  { id: 'about',      label: 'About & Updates',     icon: <Info size={15} /> },
];

const ACCENT_PRESETS = ['#00e5ff','#9d4edd','#39ff14','#ff2d55','#ffd600','#ff6b35','#4fc3f7','#f72585'];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button className={`toggle-wrap ${checked ? 'on' : ''}`} onClick={onChange} type="button">
      <div className="toggle-knob" />
    </button>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between" style={{ padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
      <div>
        <div style={{ fontWeight:500, fontSize:'0.875rem' }}>{label}</div>
        {desc && <div className="text-sm" style={{ color:'var(--text-muted)', marginTop:'2px', maxWidth:'380px' }}>{desc}</div>}
      </div>
      <div style={{ flexShrink:0, marginLeft:'16px' }}>{children}</div>
    </div>
  );
}

function ApiKeyInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:'relative', width:'260px' }}>
      <input
        className="input"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingRight:'36px', fontFamily: value && !show ? 'var(--font-mono)' : undefined, fontSize:'0.82rem' }}
      />
      <button type="button" onClick={() => setShow(x => !x)}
        style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

export function Settings() {
  const { settings, updateSettings, persistSettings } = useApp();
  const [section, setSection] = useState<SectionId>('general');
  const [saved, setSaved] = useState(false);

  const save = () => {
    persistSettings();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (!confirm('Reset all settings to defaults?')) return;
    const def = resetSettings();
    updateSettings(def);
    setSaved(false);
  };

  const s = settings;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      {/* Header bar: Save / Reset */}
      <div className="flex items-center justify-end gap-2">
          <button className="btn" onClick={handleReset}><RotateCcw size={15} /> Reset</button>
          <button
            className="btn btn-primary"
            onClick={save}
            style={{ minWidth:'130px', justifyContent:'center', background: saved ? 'linear-gradient(135deg, var(--success), #15803d)' : undefined }}
          >
            {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save All</>}
          </button>
        </div>

      {/* Layout */}
      <div className="settings-layout" style={{ alignItems:'start' }}>
        {/* Left nav */}
        <div className="glass" style={{ padding:'8px' }}>
          {SECTIONS.map(sec => (
            <div
              key={sec.id}
              className={`settings-nav-item ${section === sec.id ? 'active' : ''}`}
              onClick={() => setSection(sec.id)}
            >
              {sec.icon} {sec.label}
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div className="glass p-6" style={{ animation:'fadeIn 0.2s ease' }} key={section}>
          {section === 'general' && (
            <>
              <div className="panel-title"><SettingsIcon size={16} /> General</div>
              <SettingRow label="Language" desc="Interface language">
                <select className="input" style={{ width:'160px' }} value={s.language} onChange={e => updateSettings({ language: e.target.value })}>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </SettingRow>
              <SettingRow label="Time Format" desc="12-hour or 24-hour clock">
                <select className="input" style={{ width:'120px' }} value={s.dateFormat} onChange={e => updateSettings({ dateFormat: e.target.value as '12h'|'24h' })}>
                  <option value="24h">24h</option>
                  <option value="12h">12h AM/PM</option>
                </select>
              </SettingRow>
              <SettingRow label="Default Project Path" desc="Where new engagements are saved">
                <input className="input" style={{ width:'260px' }} value={s.defaultProjectPath} onChange={e => updateSettings({ defaultProjectPath: e.target.value })} />
              </SettingRow>
              <SettingRow label="Auto-Save Interval" desc="Save project automatically (minutes, 0 = off)">
                <input className="input" type="number" min="0" max="60" style={{ width:'80px' }} value={s.autoSaveIntervalMin} onChange={e => updateSettings({ autoSaveIntervalMin: +e.target.value })} />
              </SettingRow>
              <SettingRow label="Desktop Notifications" desc="Show OS notifications for critical events">
                <Toggle checked={s.notificationsEnabled} onChange={() => updateSettings({ notificationsEnabled: !s.notificationsEnabled })} />
              </SettingRow>
              <SettingRow label="Notify on Critical" desc="Alert when a critical vulnerability is found">
                <Toggle checked={s.notifyOnCritical} onChange={() => updateSettings({ notifyOnCritical: !s.notifyOnCritical })} />
              </SettingRow>
              <SettingRow label="Notify on Complete" desc="Alert when a scan finishes">
                <Toggle checked={s.notifyOnComplete} onChange={() => updateSettings({ notifyOnComplete: !s.notifyOnComplete })} />
              </SettingRow>
              <SettingRow label="Notification Sounds" desc="Play audio cues for alerts">
                <Toggle checked={s.notifySoundEnabled} onChange={() => updateSettings({ notifySoundEnabled: !s.notifySoundEnabled })} />
              </SettingRow>
            </>
          )}

          {section === 'appearance' && (
            <>
              <div className="panel-title"><Palette size={16} /> Appearance</div>
              <SettingRow label="Theme" desc="Color scheme of the interface">
                <div className="flex gap-2">
                  {(['dark','light','system'] as const).map(t => (
                    <button key={t} onClick={() => updateSettings({ theme: t })}
                      className="btn btn-sm"
                      style={{ background: s.theme === t ? 'var(--accent-primary)' : undefined, color: s.theme === t ? '#080b12' : undefined, fontWeight: s.theme === t ? 700 : undefined }}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Accent Color" desc="Primary neon highlight color">
                <div className="flex gap-2 items-center">
                  {ACCENT_PRESETS.map(c => (
                    <button key={c} onClick={() => updateSettings({ accentColor: c })}
                      style={{ width:'22px', height:'22px', borderRadius:'50%', background:c, border: s.accentColor === c ? '2px solid white' : '2px solid transparent', cursor:'pointer', boxShadow: s.accentColor === c ? `0 0 8px ${c}` : 'none', transition:'all 0.2s' }} />
                  ))}
                  <input type="color" value={s.accentColor} onChange={e => updateSettings({ accentColor: e.target.value })}
                    style={{ width:'28px', height:'28px', borderRadius:'50%', border:'none', cursor:'pointer', padding:0, background:'none' }} />
                </div>
              </SettingRow>
              <SettingRow label="Font Size" desc="UI text size">
                <div className="flex gap-2">
                  {(['sm','md','lg'] as const).map(sz => (
                    <button key={sz} onClick={() => updateSettings({ fontSize: sz })}
                      className="btn btn-sm"
                      style={{ background: s.fontSize === sz ? 'var(--accent-primary)' : undefined, color: s.fontSize === sz ? '#080b12' : undefined }}>
                      {sz.toUpperCase()}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Animations" desc="UI transitions and motion effects">
                <Toggle checked={s.animationsEnabled} onChange={() => updateSettings({ animationsEnabled: !s.animationsEnabled })} />
              </SettingRow>
              <SettingRow label="Glassmorphism" desc="Frosted glass panel effects">
                <Toggle checked={s.glassmorphismEnabled} onChange={() => updateSettings({ glassmorphismEnabled: !s.glassmorphismEnabled })} />
              </SettingRow>
              <SettingRow label="Matrix Rain" desc="Animated matrix rain background effect">
                <Toggle checked={s.matrixRainEnabled} onChange={() => updateSettings({ matrixRainEnabled: !s.matrixRainEnabled })} />
              </SettingRow>
              <SettingRow label="Reduced Motion" desc="Minimize animations (accessibility)">
                <Toggle checked={s.reducedMotion} onChange={() => updateSettings({ reducedMotion: !s.reducedMotion })} />
              </SettingRow>
            </>
          )}

          {section === 'security' && (
            <>
              <div className="panel-title"><Shield size={16} /> Security & Privacy</div>
              <SettingRow label="Auto-Lock After" desc="Lock session after inactivity (minutes, 0 = never)">
                <input className="input" type="number" min="0" max="120" style={{ width:'80px' }} value={s.autoLockMinutes} onChange={e => updateSettings({ autoLockMinutes: +e.target.value })} />
              </SettingRow>
              <SettingRow label="Require Password on Wake" desc="Ask for password when unlocking after auto-lock">
                <Toggle checked={s.requirePasswordOnWake} onChange={() => updateSettings({ requirePasswordOnWake: !s.requirePasswordOnWake })} />
              </SettingRow>
              <SettingRow label="Clear Clipboard on Exit" desc="Wipe clipboard contents when closing the app">
                <Toggle checked={s.clearClipboardOnExit} onChange={() => updateSettings({ clearClipboardOnExit: !s.clearClipboardOnExit })} />
              </SettingRow>
              <SettingRow label="Session Recording" desc="Record terminal sessions for review (local only)">
                <Toggle checked={s.sessionRecording} onChange={() => updateSettings({ sessionRecording: !s.sessionRecording })} />
              </SettingRow>
              <SettingRow label="Log Retention (Days)" desc="How long to keep activity logs">
                <input className="input" type="number" min="1" max="365" style={{ width:'80px' }} value={s.logRetentionDays} onChange={e => updateSettings({ logRetentionDays: +e.target.value })} />
              </SettingRow>
            </>
          )}

          {section === 'scanning' && (
            <>
              <div className="panel-title"><Cpu size={16} /> Scanning Engine</div>
              <SettingRow label="Default Thread Count" desc="Concurrent scan workers">
                <input className="input" type="number" min="1" max="100" style={{ width:'80px' }} value={s.defaultThreads} onChange={e => updateSettings({ defaultThreads: +e.target.value })} />
              </SettingRow>
              <SettingRow label="Request Timeout (sec)" desc="Max seconds before timing out a request">
                <input className="input" type="number" min="1" max="120" style={{ width:'80px' }} value={s.requestTimeoutSec} onChange={e => updateSettings({ requestTimeoutSec: +e.target.value })} />
              </SettingRow>
              <SettingRow label="Stealth Delay (ms)" desc="Milliseconds between requests in stealth mode">
                <input className="input" type="number" min="0" max="10000" style={{ width:'100px' }} value={s.stealthDelayMs} onChange={e => updateSettings({ stealthDelayMs: +e.target.value })} />
              </SettingRow>
              <SettingRow label="Max Redirects" desc="Maximum HTTP redirects to follow">
                <input className="input" type="number" min="0" max="20" style={{ width:'80px' }} value={s.maxRedirects} onChange={e => updateSettings({ maxRedirects: +e.target.value })} />
              </SettingRow>
              <SettingRow label="User-Agent Rotation" desc="Rotate UA strings to evade fingerprinting">
                <Toggle checked={s.userAgentRotation} onChange={() => updateSettings({ userAgentRotation: !s.userAgentRotation })} />
              </SettingRow>
              <SettingRow label="Ignore SSL Errors" desc="Continue scanning past TLS certificate errors">
                <Toggle checked={s.followSSLErrors} onChange={() => updateSettings({ followSSLErrors: !s.followSSLErrors })} />
              </SettingRow>
              <SettingRow label="Custom Wordlist Path" desc="Absolute path to a custom fuzzing wordlist">
                <input className="input" style={{ width:'260px' }} placeholder="/opt/wordlists/dirbuster.txt" value={s.customWordlistPath} onChange={e => updateSettings({ customWordlistPath: e.target.value })} />
              </SettingRow>
            </>
          )}

          {section === 'api' && (
            <>
              <div className="panel-title"><Plug size={16} /> API & Integrations</div>
              <div className="text-sm mb-4" style={{ color:'var(--text-muted)', background:'rgba(0,229,255,0.05)', padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(0,229,255,0.12)' }}>
                🔐 API keys are stored locally and never transmitted to any external server by VulnForge.
              </div>
              <SettingRow label="OpenAI API Key" desc="Used for AI Assistant features">
                <ApiKeyInput value={s.openAIApiKey} onChange={v => updateSettings({ openAIApiKey: v })} placeholder="sk-..." />
              </SettingRow>
              <SettingRow label="HackerOne Token" desc="For auto-reporting to HackerOne">
                <ApiKeyInput value={s.hackerOneToken} onChange={v => updateSettings({ hackerOneToken: v })} placeholder="h1-..." />
              </SettingRow>
              <SettingRow label="Bugcrowd Token" desc="For auto-reporting to Bugcrowd">
                <ApiKeyInput value={s.bugcrowdToken} onChange={v => updateSettings({ bugcrowdToken: v })} placeholder="bc-..." />
              </SettingRow>
              <SettingRow label="Shodan API Key" desc="For passive OSINT reconnaissance">
                <ApiKeyInput value={s.shodanApiKey} onChange={v => updateSettings({ shodanApiKey: v })} placeholder="a1b2c3d4..." />
              </SettingRow>
              <div className="divider" />
              <SettingRow label="Enable Proxy" desc="Route scan traffic through proxy (e.g. Burp Suite)">
                <Toggle checked={s.proxyEnabled} onChange={() => updateSettings({ proxyEnabled: !s.proxyEnabled })} />
              </SettingRow>
              <SettingRow label="Proxy Host" desc="Proxy server hostname or IP">
                <input className="input" style={{ width:'180px' }} placeholder="127.0.0.1" value={s.proxyHost} onChange={e => updateSettings({ proxyHost: e.target.value })} disabled={!s.proxyEnabled} />
              </SettingRow>
              <SettingRow label="Proxy Port" desc="Proxy server port (default: 8080)">
                <input className="input" type="number" style={{ width:'100px' }} value={s.proxyPort} onChange={e => updateSettings({ proxyPort: +e.target.value })} disabled={!s.proxyEnabled} />
              </SettingRow>
            </>
          )}

          {section === 'simulation' && (
            <>
              <div className="panel-title"><FlaskConical size={16} /> Simulation & Lab</div>
              <SettingRow label="Safe Mode" desc="Prevent destructive payloads from being sent to real targets">
                <Toggle checked={s.safeMode} onChange={() => updateSettings({ safeMode: !s.safeMode })} />
              </SettingRow>
              <SettingRow label="Enable DVWA" desc="Start a local DVWA instance for practice (requires Docker)">
                <Toggle checked={s.dvwaEnabled} onChange={() => updateSettings({ dvwaEnabled: !s.dvwaEnabled })} />
              </SettingRow>
              <SettingRow label="Auto-Start Lab" desc="Launch lab environment on app start">
                <Toggle checked={s.autoStartLab} onChange={() => updateSettings({ autoStartLab: !s.autoStartLab })} />
              </SettingRow>
              <SettingRow label="Lab Network CIDR" desc="Internal network range for simulated lab">
                <input className="input" style={{ width:'180px' }} placeholder="10.13.37.0/24" value={s.labNetworkCIDR} onChange={e => updateSettings({ labNetworkCIDR: e.target.value })} />
              </SettingRow>
              <SettingRow label="Max Exploit Threads" desc="Maximum parallel exploit workers (safe mode off only)">
                <input className="input" type="number" min="1" max="10" style={{ width:'80px' }} value={s.maxExploitThreads} onChange={e => updateSettings({ maxExploitThreads: +e.target.value })} disabled={s.safeMode} />
              </SettingRow>
            </>
          )}

          {section === 'reporting' && (
            <>
              <div className="panel-title"><FileText size={16} /> Reporting</div>
              <SettingRow label="Default Format" desc="Output format for generated reports">
                <select className="input" style={{ width:'140px' }} value={s.reportFormat} onChange={e => updateSettings({ reportFormat: e.target.value as AppSettings['reportFormat'] })}>
                  <option value="html">HTML</option>
                  <option value="pdf">PDF</option>
                  <option value="json">JSON</option>
                  <option value="markdown">Markdown</option>
                </select>
              </SettingRow>
              <SettingRow label="Company Name" desc="Appears in report header">
                <input className="input" style={{ width:'220px' }} placeholder="Acme Security Inc." value={s.companyName} onChange={e => updateSettings({ companyName: e.target.value })} />
              </SettingRow>
              <SettingRow label="Reporter Name" desc="Pentester name for report attribution">
                <input className="input" style={{ width:'220px' }} placeholder="Your Name" value={s.reporterName} onChange={e => updateSettings({ reporterName: e.target.value })} />
              </SettingRow>
              <SettingRow label="Include PoC Screenshots" desc="Embed evidence screenshots in report">
                <Toggle checked={s.includePoCScreenshots} onChange={() => updateSettings({ includePoCScreenshots: !s.includePoCScreenshots })} />
              </SettingRow>
              <SettingRow label="Include Remediation Code" desc="Include code snippets showing fixes">
                <Toggle checked={s.includeRemediationCode} onChange={() => updateSettings({ includeRemediationCode: !s.includeRemediationCode })} />
              </SettingRow>
              <SettingRow label="Severity Color Scheme" desc="Color palette used in reports">
                <select className="input" style={{ width:'140px' }} value={s.severityColorScheme} onChange={e => updateSettings({ severityColorScheme: e.target.value as AppSettings['severityColorScheme'] })}>
                  <option value="standard">Standard</option>
                  <option value="bold">Bold</option>
                  <option value="minimal">Minimal</option>
                </select>
              </SettingRow>
            </>
          )}

          {section === 'advanced' && (
            <>
              <div className="panel-title"><Wrench size={16} /> Advanced</div>
              <div className="text-sm mb-4" style={{ color:'var(--warning)', background:'rgba(245,158,11,0.06)', padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(245,158,11,0.2)' }}>
                ⚠ These settings affect stability and security. Change only if you know what you're doing.
              </div>
              <SettingRow label="Developer Mode" desc="Enable debug tools, component inspector, raw API responses">
                <Toggle checked={s.developerMode} onChange={() => updateSettings({ developerMode: !s.developerMode })} />
              </SettingRow>
              <SettingRow label="Verbose Logging" desc="Log all internal events to console">
                <Toggle checked={s.verboseLogging} onChange={() => updateSettings({ verboseLogging: !s.verboseLogging })} />
              </SettingRow>
              <SettingRow label="Experimental Features" desc="Enable unstable features in active development">
                <Toggle checked={s.experimentalFeatures} onChange={() => updateSettings({ experimentalFeatures: !s.experimentalFeatures })} />
              </SettingRow>
              <SettingRow label="Concurrent Scan Limit" desc="Max simultaneous scan sessions">
                <input className="input" type="number" min="1" max="10" style={{ width:'80px' }} value={s.concurrentScanLimit} onChange={e => updateSettings({ concurrentScanLimit: +e.target.value })} />
              </SettingRow>
              <SettingRow label="Memory Limit (MB)" desc="Soft limit before garbage collection warning">
                <input className="input" type="number" min="128" max="4096" step="128" style={{ width:'100px' }} value={s.memoryLimitMB} onChange={e => updateSettings({ memoryLimitMB: +e.target.value })} />
              </SettingRow>
            </>
          )}

          {section === 'about' && (
            <>
              <div className="panel-title"><Info size={16} /> About & Updates</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div className="glass" style={{ padding:'20px', textAlign:'center' }}>
                  <div className="text-gradient" style={{ fontSize:'1.8rem', fontWeight:800, marginBottom:'4px' }}>VulnForge Elite</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>Version 1.0.0-alpha · Build 2026.05.12</div>
                  <div style={{ marginTop:'12px', fontSize:'0.8rem', color:'var(--text-dim)' }}>
                    The Ultimate VAPT Training & Simulation Platform
                  </div>
                </div>
                <div className="grid-2">
                  {[
                    { label:'Frontend', value:'React 19 + TypeScript' },
                    { label:'Runtime', value:'Electron 42' },
                    { label:'Auth', value:'PBKDF2-SHA256 (210k iters)' },
                    { label:'Storage', value:'Local (no cloud)' },
                    { label:'License', value:'AGPLv3' },
                    { label:'Platform', value:'Linux · Windows · macOS' },
                  ].map(i => (
                    <div key={i.label} className="glass" style={{ padding:'12px 16px' }}>
                      <div className="text-xs" style={{ color:'var(--text-muted)', marginBottom:'4px' }}>{i.label}</div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.82rem', color:'var(--accent-primary)' }}>{i.value}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary flex-1" style={{ justifyContent:'center' }}>Check for Updates</button>
                  <button className="btn flex-1" style={{ justifyContent:'center' }}>View Changelog</button>
                  <button className="btn flex-1" style={{ justifyContent:'center' }}>Open GitHub</button>
                </div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-dim)', textAlign:'center' }}>
                  © 2024–2026 VulnForge Elite Team · AGPLv3 · For authorized use only
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
