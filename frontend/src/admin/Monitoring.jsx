import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Badge, Skeleton, ErrorState, StatusIndicator, Icon,
} from '../design-system/index.js';
import {
  Activity, Server, Database, Wifi, Cpu, HardDrive, Clock,
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Zap, Thermometer,
  Users, Truck, BookOpen, DollarSign, TrendingUp, TrendingDown,
} from 'lucide-react';
import './admin.css';

const SERVICES = [
  { id: 'api', label: 'API Server', icon: Server, status: 'healthy', uptime: '12d 7h 34m', latency: 42 },
  { id: 'websocket', label: 'WebSocket', icon: Wifi, status: 'healthy', uptime: '12d 7h 30m', latency: 18 },
  { id: 'database', label: 'Database', icon: Database, status: 'healthy', uptime: '14d 2h 11m', latency: 8 },
  { id: 'redis', label: 'Redis Cache', icon: Zap, status: 'healthy', uptime: '14d 2h 11m', latency: 3 },
  { id: 'queue', label: 'Queue Worker', icon: Activity, status: 'degraded', uptime: '10d 14h 22m', latency: 230 },
];

const RECENT_LOGS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  level: ['info', 'info', 'info', 'warn', 'info', 'info', 'error', 'info', 'info', 'warn',
    'info', 'info', 'info', 'error', 'info', 'info', 'warn', 'info', 'info', 'info'][i],
  service: ['api', 'api', 'database', 'queue', 'websocket', 'api', 'api', 'database', 'api', 'redis',
    'api', 'api', 'websocket', 'api', 'database', 'api', 'queue', 'api', 'api', 'websocket'][i],
  message: [
    'GET /api/v1/trips — 200 OK (45ms)', 'POST /api/v1/auth/login — 200 OK (32ms)',
    'Query completed — users.findMany (12ms)', 'Job processed — tripReminder (#3842)',
    'Client connected — driver_2005', 'GET /api/v1/customers — 200 OK (28ms)',
    'POST /api/v1/payments — 500 DB timeout (12.4s)', 'Connection pool — 12/20 active connections',
    'PUT /api/v1/drivers/2010 — 200 OK (18ms)', 'Cache miss — drivers:location:2005',
    'DELETE /api/v1/bookings/3021 — 200 OK (15ms)', 'GET /api/v1/wallet — 200 OK (22ms)',
    'Client disconnected — customer_1023', 'POST /api/v1/promotions — 500 ValidationError',
    'Migration completed — 2024_09_01_add_indexes (320ms)',
    'PATCH /api/v1/trips/4015 — 200 OK (14ms)', 'Job retried — notificationPush (#915) (attempt 3/3)',
    'GET /api/v1/dashboard — 200 OK (38ms)', 'Rate limit — client 192.168.1.50 exceeded',
    'Client connected — customer_1045',
  ][i],
  time: new Date(Date.now() - i * 30000 - Math.random() * 10000).toISOString(),
}));

const LEVEL_COLORS = { info: 'info', warn: 'warning', error: 'danger' };
const LEVEL_BG = {
  info: 'var(--ds-color-info-soft, #eef2ff)',
  warn: 'var(--ds-color-warning-soft, #fffbeb)',
  error: 'var(--ds-color-danger-soft, #fef2f2)',
};
const LEVEL_DOT = {
  info: 'var(--ds-color-info, #3b82f6)',
  warn: 'var(--ds-color-warning, #d97706)',
  error: 'var(--ds-color-danger, #dc2626)',
};

const SERVICE_LABELS = { api: 'API', websocket: 'WS', database: 'DB', redis: 'Redis', queue: 'Queue' };

export default function Monitoring() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [logs, setLogs] = useState(RECENT_LOGS);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setLastUpdated(new Date());
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refreshLogs = () => {
    setLogs(RECENT_LOGS.map((l) => ({
      ...l,
      time: new Date(Date.now() - l.id * 30000 - Math.random() * 10000).toISOString(),
    })));
    setLastUpdated(new Date());
  };

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ flex: 1 }}><Skeleton variant="card" lines={2} /></div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 2 }}><Skeleton variant="card" lines={6} /></div>
          <div style={{ flex: 1 }}><Skeleton variant="card" lines={6} /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Gagal memuat monitoring" description="Periksa koneksi server." onRetry={load} />;
  }

  return (
    <div>
      <div className="admin-section__header">
        <h2 className="admin-section__title">Monitoring Sistem</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastUpdated && (
            <span style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
              Terakhir diperbarui {lastUpdated.toLocaleTimeString('id-ID')}
            </span>
          )}
          <button type="button" className="admin-section__action" onClick={refreshLogs}>
            <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Muat ulang
          </button>
        </div>
      </div>

      {/* Service Health */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {SERVICES.map((svc) => (
          <Card key={svc.id} style={{ flex: 1, minWidth: 160, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <svc.icon size={16} style={{
                color: svc.status === 'healthy' ? 'var(--ds-color-success, #16a34a)'
                  : svc.status === 'degraded' ? 'var(--ds-color-warning, #d97706)'
                  : 'var(--ds-color-danger, #dc2626)',
              }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>{svc.label}</div>
              <div style={{ marginLeft: 'auto' }}>
                <StatusIndicator tone={svc.status === 'healthy' ? 'success' : svc.status === 'degraded' ? 'warning' : 'danger'} label="" size="sm" pulse={svc.status === 'healthy'} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ds-color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Uptime: {svc.uptime}</span>
              <span>{svc.latency}ms</span>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* System Metrics */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <Card>
            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Metrik Sistem</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span><Cpu size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />CPU</span>
                    <span style={{ fontWeight: 600 }}>32%</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--ds-color-surface-2, #f1f5f9)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '32%', height: '100%', background: 'var(--ds-color-primary, #4f46e5)', borderRadius: 3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span><Cpu size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />Memory</span>
                    <span style={{ fontWeight: 600 }}>2.4 / 8.0 GB</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--ds-color-surface-2, #f1f5f9)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '30%', height: '100%', background: 'var(--ds-color-warning, #d97706)', borderRadius: 3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span><HardDrive size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />Disk</span>
                    <span style={{ fontWeight: 600 }}>45 / 120 GB</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--ds-color-surface-2, #f1f5f9)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '37.5%', height: '100%', background: 'var(--ds-color-info, #3b82f6)', borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-detail__section">
              <h3 className="admin-detail__section-title">Ringkasan</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Uptime Server</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>14d 8h</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Avg Response</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>38ms</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Req/min</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>1,247</div>
                </div>
              </div>
            </div>

            <div className="admin-detail__section" style={{ borderBottom: 'none' }}>
              <h3 className="admin-detail__section-title">Aktif Saat Ini</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={14} style={{ color: 'var(--ds-color-text-muted)' }} />
                  <div><span style={{ fontWeight: 700 }}>23</span> <span style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Pelanggan</span></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Truck size={14} style={{ color: 'var(--ds-color-text-muted)' }} />
                  <div><span style={{ fontWeight: 700 }}>15</span> <span style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Driver</span></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={14} style={{ color: 'var(--ds-color-text-muted)' }} />
                  <div><span style={{ fontWeight: 700 }}>8</span> <span style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Trip Aktif</span></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Logs */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <Card>
            <div className="admin-detail__section" style={{ borderBottom: 'none' }}>
              <div className="admin-detail__section-header">
                <h3 className="admin-detail__section-title">Aktivitas Terbaru</h3>
                <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>{logs.length} entri</div>
              </div>
              <div style={{ maxHeight: 520, overflowY: 'auto', margin: '0 -20px', padding: '0 20px' }}>
                {logs.map((log) => (
                  <div key={log.id} style={{
                    display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--ds-color-border, #eceef3)',
                    fontSize: 12, alignItems: 'flex-start',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: LEVEL_DOT[log.level], flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Badge variant={LEVEL_COLORS[log.level] || 'neutral'} size="sm" style={{ textTransform: 'uppercase', fontSize: 9 }}>
                          {log.level}
                        </Badge>
                        <span style={{ color: 'var(--ds-color-text-muted)', fontWeight: 500 }}>{SERVICE_LABELS[log.service] || log.service}</span>
                      </div>
                      <div style={{ marginTop: 2, color: 'var(--ds-color-text, #111)', fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all' }}>
                        {log.message}
                      </div>
                      <div style={{ marginTop: 1, fontSize: 10, color: 'var(--ds-color-text-muted, #9aa0b0)' }}>
                        {new Date(log.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
