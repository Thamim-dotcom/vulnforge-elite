import { Plus, Server, Trash2, X, Scan } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TargetEntry {
  id: number;
  domain: string;
  ip: string;
  status: 'Idle' | 'Scanning' | 'Vulnerable' | 'Monitored';
  vulns: number;
}

const INITIAL_TARGETS: TargetEntry[] = [
  { id: 1, domain: 'api.example.com', ip: '192.168.1.105', status: 'Scanning', vulns: 3 },
  { id: 2, domain: 'auth.staging.dev', ip: '10.0.0.52', status: 'Vulnerable', vulns: 12 },
  { id: 3, domain: 'cdn.assets.net', ip: '172.16.0.12', status: 'Idle', vulns: 0 },
  { id: 4, domain: 'app.production.io', ip: '192.168.1.200', status: 'Monitored', vulns: 1 },
];

function fakeScanTarget(id: number, setTargets: React.Dispatch<React.SetStateAction<TargetEntry[]>>) {
  setTargets(prev => prev.map(t => t.id === id ? { ...t, status: 'Scanning' } : t));
  setTimeout(() => {
    setTargets(prev => prev.map(t => {
      if (t.id !== id) return t;
      const foundVulns = Math.floor(Math.random() * 6);
      return { ...t, status: foundVulns > 0 ? 'Vulnerable' : 'Monitored', vulns: t.vulns + foundVulns };
    }));
  }, 3000);
}

export function Targets({ onTargetCountChange }: { onTargetCountChange?: (n: number) => void }) {
  const [targets, setTargets] = useState<TargetEntry[]>(INITIAL_TARGETS);
  const [inputVal, setInputVal] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => { onTargetCountChange?.(targets.length); }, [targets.length, onTargetCountChange]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    setTargets(prev => [
      ...prev,
      { id: Date.now(), domain: trimmed, ip: 'Resolving...', status: 'Idle', vulns: 0 }
    ]);
    setInputVal('');
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setTargets(prev => prev.filter(t => t.id !== id));
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };


  const badgeClass = (s: TargetEntry['status']) => {
    if (s === 'Vulnerable') return 'high';
    if (s === 'Scanning') return 'info';
    return 'low';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {showModal && (
        <div className="modal-overlay">
          <div className="glass modal-box" style={{ padding: '28px' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add New Target</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div className="input-group">
                <label className="label">Domain / IP / CIDR</label>
                <input autoFocus className="input" placeholder="e.g. example.com or 192.168.0.0/24" value={inputVal} onChange={e => setInputVal(e.target.value)} required />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" className="btn flex-1" style={{ justifyContent:'center' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" style={{ justifyContent:'center' }}>Add Target</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="panel-title" style={{ margin:0 }}>
            Target Management
            <span className="text-xs" style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'10px' }}>{targets.length} in scope</span>
          </div>
          <div className="flex gap-2">
            {selected.size > 0 && (
              <button className="btn btn-danger btn-sm" onClick={() => { setTargets(prev => prev.filter(t => !selected.has(t.id))); setSelected(new Set()); }}>
                <Trash2 size={13} /> Delete ({selected.size})
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add Target
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Domain / Asset</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Vulnerabilities</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {targets.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No targets. Click "Add Target" to begin.</td></tr>
              )}
              {targets.map(t => (
                <tr key={t.id} style={{ opacity: selected.has(t.id) ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                  <td>
                    <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)}
                      style={{ width: '15px', height: '15px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }} />
                  </td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Server size={15} color="var(--accent-primary)" />
                    <span style={{ fontWeight: 500 }}>{t.domain}</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.ip}</td>
                  <td><span className={`badge badge-${badgeClass(t.status)}`}>{t.status}</span></td>
                  <td>
                    <span style={{ color: t.vulns > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: t.vulns > 0 ? 600 : 400 }}>
                      {t.vulns > 0 ? `⚠ ${t.vulns} found` : '—'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '4px 10px', fontSize: '0.8rem', opacity: t.status === 'Scanning' ? 0.5 : 1 }}
                        disabled={t.status === 'Scanning'}
                        onClick={() => fakeScanTarget(t.id, setTargets)}
                      >
                        <Scan size={13} /> {t.status === 'Scanning' ? 'Running...' : 'Scan'}
                      </button>
                      <button className="btn" style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--text-muted)' }} onClick={() => handleDelete(t.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
