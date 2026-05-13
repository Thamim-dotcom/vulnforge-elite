import { Play, Target, Plus, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Scan {
  id: number;
  name: string;
  target: string;
  type: 'Active' | 'Passive' | 'Intrusive';
  progress: number;
  status: 'Running' | 'Completed' | 'Queued' | 'Stopped';
}

const INITIAL_SCANS: Scan[] = [
  { id: 1, name: 'Full Network Audit', target: '192.168.1.0/24', type: 'Active', progress: 45, status: 'Running' },
  { id: 2, name: 'Web App Fuzzing', target: 'api.example.com', type: 'Intrusive', progress: 100, status: 'Completed' },
  { id: 3, name: 'Subdomain Enum', target: 'staging.dev', type: 'Passive', progress: 0, status: 'Queued' },
];

export function Scans() {
  const [scans, setScans] = useState<Scan[]>(INITIAL_SCANS);
  const [showModal, setShowModal] = useState(false);
  const [newScan, setNewScan] = useState({ name: '', target: '', type: 'Passive' as Scan['type'] });

  // Advance progress for running scans every second
  useEffect(() => {
    const timer = setInterval(() => {
      setScans(prev =>
        prev.map(s =>
          s.status === 'Running' && s.progress < 100
            ? { ...s, progress: Math.min(s.progress + 1, 100) }
            : s.status === 'Running' && s.progress >= 100
            ? { ...s, status: 'Completed' }
            : s
        )
      );
    }, 800);
    return () => clearInterval(timer);
  }, []);

  const handleStop = (id: number) => {
    setScans(prev => prev.map(s => s.id === id ? { ...s, status: 'Stopped' } : s));
  };

  const handleStart = (id: number) => {
    setScans(prev => prev.map(s => s.id === id ? { ...s, status: 'Running' } : s));
  };

  const handleDelete = (id: number) => {
    setScans(prev => prev.filter(s => s.id !== id));
  };

  const handleAddScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScan.name || !newScan.target) return;
    setScans(prev => [
      ...prev,
      { id: Date.now(), name: newScan.name, target: newScan.target, type: newScan.type, progress: 0, status: 'Queued' }
    ]);
    setNewScan({ name: '', target: '', type: 'Passive' });
    setShowModal(false);
  };

  const statusColor = (s: string) => {
    if (s === 'Completed') return 'var(--success)';
    if (s === 'Running') return 'var(--accent-primary)';
    if (s === 'Stopped') return 'var(--danger)';
    return 'var(--text-muted)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Modal — FIX: was glass-panel (doesn't exist) → glass */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass modal-box" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>New Scan Template</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddScan} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label className="label">Scan Name</label>
                <input
                  className="input"
                  placeholder="e.g. XSS Hunt on Login Portal"
                  value={newScan.name}
                  onChange={e => setNewScan(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="input-group">
                <label className="label">Target</label>
                <input
                  className="input"
                  placeholder="e.g. example.com or 10.0.0.0/24"
                  value={newScan.target}
                  onChange={e => setNewScan(p => ({ ...p, target: e.target.value }))}
                  required
                />
              </div>
              <div className="input-group">
                <label className="label">Scan Type</label>
                <select
                  className="input"
                  value={newScan.type}
                  onChange={e => setNewScan(p => ({ ...p, type: e.target.value as Scan['type'] }))}
                >
                  <option value="Passive">Passive (Recon only)</option>
                  <option value="Active">Active (Port scan + vuln detect)</option>
                  <option value="Intrusive">Intrusive (Exploit &amp; fuzz)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn flex-1" style={{ justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" style={{ justifyContent: 'center' }}>
                  <Play size={15} /> Launch Scan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FIX: was glass-panel (doesn't exist) → glass */}
      <div className="glass p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="panel-title" style={{ margin: 0 }}>Active Scans &amp; Hunts</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Scan
          </button>
        </div>

        {/* FIX: was table-wrapper (doesn't exist) → table-wrap */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Scan Name</th>
                <th>Target</th>
                <th>Type</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scans.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No scans. Click "New Scan" to begin.</td></tr>
              )}
              {scans.map(scan => (
                <tr key={scan.id}>
                  <td style={{ fontWeight: 500 }}>{scan.name}</td>
                  <td style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Target size={13} /> {scan.target}
                  </td>
                  <td><span className="badge badge-info">{scan.type}</span></td>
                  <td style={{ minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${scan.progress}%`,
                          background: scan.status === 'Completed' ? 'var(--success)' : scan.status === 'Stopped' ? 'var(--danger)' : 'var(--accent-primary)',
                          transition: 'width 0.6s ease',
                        }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '32px' }}>{scan.progress}%</span>
                    </div>
                  </td>
                  <td><span style={{ color: statusColor(scan.status), fontWeight: 500 }}>{scan.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {scan.status === 'Running' && (
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => handleStop(scan.id)}>Stop</button>
                      )}
                      {(scan.status === 'Queued' || scan.status === 'Stopped') && (
                        <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => handleStart(scan.id)}>Start</button>
                      )}
                      {scan.status === 'Completed' && (
                        <button className="btn btn-sm" style={{ fontSize: '0.8rem' }}>Report</button>
                      )}
                      <button className="btn btn-sm" style={{ color: 'var(--text-muted)' }} onClick={() => handleDelete(scan.id)}><Trash2 size={14} /></button>
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
