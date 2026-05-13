import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Trash2, Download } from 'lucide-react';

interface LogEntry {
  id: number;
  level: 'info' | 'warn' | 'alert' | 'success' | 'data';
  msg: string;
}

const ALL_OUTPUTS = [
  { level: 'info', msg: 'Starting Nmap stealth scan on 10.0.0.0/24...' },
  { level: 'info', msg: 'Resolving hostnames for 256 hosts...' },
  { level: 'warn', msg: 'Open port 22/tcp (SSH) on 10.0.0.52' },
  { level: 'warn', msg: 'Open port 80/tcp (HTTP) on 10.0.0.52' },
  { level: 'warn', msg: 'Open port 443/tcp (HTTPS) on 10.0.0.52' },
  { level: 'info', msg: 'Running Nikto scan against 10.0.0.52:80...' },
  { level: 'alert', msg: 'Directory traversal possible at /api/v1/../config' },
  { level: 'info', msg: 'Launching SQLMap payload against parameter "id"' },
  { level: 'data', msg: 'Response 200 OK (len=4812) with error in body: "MySQL syntax error"' },
  { level: 'success', msg: 'Blind SQL injection confirmed! Dumping schema...' },
  { level: 'info', msg: 'Starting subdomain enumeration on staging.dev...' },
  { level: 'data', msg: 'Found: admin.staging.dev -> 10.0.0.90' },
  { level: 'data', msg: 'Found: api-v2.staging.dev -> 10.0.0.91' },
  { level: 'warn', msg: 'auth.staging.dev is publicly accessible (no auth)' },
  { level: 'info', msg: 'Testing CORS policy on api.example.com...' },
  { level: 'alert', msg: 'Wildcard CORS origin allowed: Access-Control-Allow-Origin: *' },
  { level: 'info', msg: 'Running nuclei templates (CVE 2023-*)...' },
  { level: 'success', msg: 'CVE-2023-44487 (HTTP/2 Rapid Reset) detected on legacy.system.org' },
  { level: 'info', msg: 'Spawning exploit worker threads...' },
  { level: 'data', msg: 'Worker 1: Testing XSS vector on /search?q=' },
  { level: 'alert', msg: 'Stored XSS confirmed in comment field at /profile/update' },
] as const;

export function Terminal({ isScanning }: { isScanning: boolean }) {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 0, level: 'info', msg: 'VulnForge Elite Terminal v1.0.0 ready.' },
    { id: 1, level: 'info', msg: 'Launch a hunt to begin streaming live output.' },
  ]);
  const [input, setInput] = useState('');
  // FIX: use a ref instead of state to avoid stale-closure / interval-restart bugs
  const outputIdxRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Stream log lines while scanning — stable interval with ref-based index
  useEffect(() => {
    if (!isScanning) return;
    const timer = setInterval(() => {
      const entry = ALL_OUTPUTS[outputIdxRef.current % ALL_OUTPUTS.length];
      outputIdxRef.current++;
      const ts = new Date().toLocaleTimeString();
      setLogs(prev => [...prev, { id: Date.now(), level: entry.level as LogEntry['level'], msg: `[${ts}] ${entry.msg}` }]);
    }, 1400);
    return () => clearInterval(timer);
  }, [isScanning]); // stable: no outputIdx state dep

  const colorFor = (level: LogEntry['level']) => {
    if (level === 'warn') return '#ffcc00';
    if (level === 'alert') return '#ff4444';
    if (level === 'success') return '#00e5ff';
    if (level === 'data') return '#a5b4fc';
    return '#4ade80';
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const ts = new Date().toLocaleTimeString();
    setLogs(prev => [
      ...prev,
      { id: Date.now(), level: 'data', msg: `[${ts}] > ${input}` },
      { id: Date.now() + 1, level: 'warn', msg: `[${ts}] Backend not connected. GUI-only mode.` },
    ]);
    setInput('');
  };

  const handleClear = () => setLogs([{ id: Date.now(), level: 'info', msg: 'Terminal cleared.' }]);

  const handleExport = () => {
    const text = logs.map(l => l.msg).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vulnforge-log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    // FIX: was `glass-panel` which doesn't exist — changed to `glass`
    <div className="glass" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TerminalIcon size={18} color="var(--accent-primary)" />
          Live Console
          {isScanning && (
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)' }}>
              ● Streaming
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={handleExport}><Download size={14} /></button>
          <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={handleClear}><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Log area */}
      <div style={{ flex: 1, background: '#050507', padding: '16px 20px', overflowY: 'auto', fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: '0.82rem', lineHeight: '1.8' }}>
        {logs.map(log => (
          <div key={log.id} style={{ color: colorFor(log.level), whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{log.msg}</div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Command input */}
      <form onSubmit={handleCommand} style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px 16px', gap: '10px', alignItems: 'center' }}>
        <span style={{ color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '0.9rem' }}>$</span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a command..."
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#4ade80', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '5px 14px', fontSize: '0.8rem' }}>Run</button>
      </form>
    </div>
  );
}
