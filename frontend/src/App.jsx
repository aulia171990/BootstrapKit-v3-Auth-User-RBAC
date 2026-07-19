import React, { useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken, clearToken } from './api.js';
import { getEcho, leaveEcho } from './echo.js';
import PassengerApp from './passenger/index.js';

const TENANT = import.meta.env.VITE_APP_TENANT || 'admin';

export default function App() {
  const [token, setTk] = useState(getToken());
  const [me, setMe] = useState(null);
  const [view, setView] = useState('orders');
  const [selId, setSelId] = useState(null);

  useEffect(() => {
    if (token) api.me().then(setMe).catch(() => {});
  }, [token]);

  if (!token) return <Login onAuth={(t) => { setToken(t); setTk(t); }} />;

  if (TENANT === 'passenger') {
    return <PassengerApp user={me} onLogout={() => { clearToken(); leaveEcho(); setTk(null); }} />;
  }

  const go = (v) => { setView(v); setSelId(null); };

  return (
    <div className="app">
      <Sidebar
        me={me}
        active={view}
        onDashboard={() => go('dashboard')}
        onOrders={() => go('orders')}
        onDrivers={() => go('drivers')}
        onCustomers={() => go('customers')}
        onPayments={() => go('payments')}
        onTrips={() => go('trips')}
      />
      <div className="main">
        <Topbar
          title={
            view === 'dashboard' ? 'Dashboard' :
            view === 'orders' ? 'Orders' :
            view === 'drivers' ? 'Drivers' :
            view === 'driver' ? 'Driver' :
            view === 'customers' ? 'Customers' :
            view === 'payments' ? 'Payments' :
            view === 'trips' ? 'Trips' : 'Detail Order'
          }
          onLogout={() => { clearToken(); leaveEcho(); setTk(null); }}
        />
        <div className="content">
          {view === 'dashboard' && <Dashboard />}
          {view === 'orders' && <Orders onOpen={(id) => { setView('detail'); setSelId(id); }} />}
          {view === 'drivers' && <Drivers onOpen={(id) => { setView('driver'); setSelId(id); }} />}
          {view === 'customers' && <Customers />}
          {view === 'payments' && <Payments />}
          {view === 'trips' && <Trips />}
          {view === 'detail' && <Detail id={selId} onBack={() => go('orders')} />}
          {view === 'driver' && <DriverDetail id={selId} onBack={() => go('drivers')} />}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ me, active, onDashboard, onOrders, onDrivers, onCustomers, onPayments, onTrips }) {
  const initial = (me?.name || me?.email || 'A').trim().charAt(0).toUpperCase();
  const items = [
    { key: 'dashboard', label: 'Dashboard', ico: '◧', onClick: onDashboard },
    { key: 'orders', label: 'Orders', ico: '▦', onClick: onOrders },
    { key: 'drivers', label: 'Drivers', ico: '🛵', onClick: onDrivers },
    { key: 'customers', label: 'Customers', ico: '👥', onClick: onCustomers },
    { key: 'trips', label: 'Trips', ico: '🚦', onClick: onTrips },
    { key: 'payments', label: 'Payments', ico: '💳', onClick: onPayments },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">O</div>
        <div>
          <b>Ojol</b>
          <small>Admin Panel</small>
        </div>
      </div>
      {items.map((it) => (
        <button key={it.key} className={'nav-item' + (active === it.key ? ' active' : '')} onClick={it.onClick}>
          <span className="ico">{it.ico}</span> {it.label}
        </button>
      ))}
      <div className="sidebar-foot">
        <div className="avatar-row">
          <div className="avatar">{initial}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me?.name || me?.email || 'Admin'}</div>
            <div style={{ color: 'var(--muted)', fontSize: 11.5 }}>{me?.email ? me.email : 'online'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ title, onLogout }) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <div className="sub">Kelola pesanan &amp; armada driver secara realtime</div>
      </div>
      <button className="btn-ghost" onClick={onLogout}>Keluar</button>
    </header>
  );
}

function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const d = await api.login(email, password);
      onAuth(d.token);
    } catch (ex) {
      setErr(ex.message);
    } finally { setBusy(false); }
  };
  return (
    <div className="login-wrap">
      <div className="login-aside">
        <div>
          <div className="hero-tag">Ojol Operations</div>
          <h2>Kendalikan seluruh armada dari satu dashboard.</h2>
          <p>Pantau pesanan, status driver, dan tracking lokasi secara live langsung dari panel admin.</p>
        </div>
        <div className="feats">
          <div><span className="ck">⚡</span> Update status order realtime</div>
          <div><span className="ck">📍</span> Live tracking posisi driver</div>
          <div><span className="ck">🔐</span> Akses berbasis peran (RBAC)</div>
        </div>
      </div>
      <div className="login-form-side">
        <form className="login-card" onSubmit={submit}>
          <h3>Selamat datang 👋</h3>
          <p className="lead">Masuk ke akun admin Anda untuk melanjutkan.</p>
          {err && <div className="alert">{err}</div>}
          <div className="field">
            <label>Email</label>
            <input placeholder="admin@ojol.id" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPw(e.target.value)} />
          </div>
          <button className="btn btn-primary w100" type="submit" disabled={busy}>
            {busy ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Orders({ onOpen }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState('');
  const load = useCallback(async () => {
    try {
      const d = await api.orders();
      setRows(d.data ?? d);
    } catch (ex) { setErr(ex.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (id, fn) => {
    setBusy(id);
    try { await fn(id); await load(); }
    catch (ex) { setErr(ex.message); }
    finally { setBusy(''); }
  };

  const counts = rows.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a; }, {});
  const stats = [
    { label: 'Total Order', value: rows.length, color: 'var(--primary)' },
    { label: 'Pending', value: counts.pending || 0, color: 'var(--muted)' },
    { label: 'Ongoing', value: counts.ongoing || counts.in_progress || 0, color: 'var(--info)' },
    { label: 'Completed', value: counts.completed || counts.done || 0, color: 'var(--success)' },
  ];

  return (
    <>
      <div className="stats">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <div className="label"><span className="dot" style={{ background: s.color }} />{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head"><h2>Daftar Order</h2></div>
        <div className="panel-body">
          {err && <div className="alert" style={{ margin: 12 }}>{err}</div>}
          {rows.length === 0 && !err
            ? <div className="empty">Belum ada order.</div>
            : (
              <table className="tbl">
                <thead>
                  <tr><th>ID</th><th>Status</th><th>Harga</th><th>Driver</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.id}>
                      <td className="id">{o.id.slice(0, 8)}</td>
                      <td><span className={'badge b-' + o.status}>{o.status}</span></td>
                      <td>{o.price}</td>
                      <td>{o.driver ? o.driver.vehicle_type : '-'}</td>
                      <td>
                        <button className="btn" onClick={() => onOpen(o.id)}>Detail</button>
                        {o.status === 'pending' && (
                          <button className="btn btn-primary" disabled={!!busy} onClick={() => act(o.id, api.acceptOrder)}>Accept</button>
                        )}
                        {o.status === 'ongoing' && (
                          <button className="btn btn-success" disabled={!!busy} onClick={() => act(o.id, (id) => api.updateStatus(id, 'completed'))}>Selesai</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </>
  );
}

function Detail({ id, onBack }) {
  const [order, setOrder] = useState(null);
  const [pos, setPos] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    api.order(id).then((d) => alive && setOrder(d)).catch((ex) => setErr(ex.message));
    const echo = getEcho(getToken());
    const ch = echo.private('order.' + id);
    ch.listen('.driver.location.updated', (e) => setPos(e.driver));
    ch.listen('.order.status.updated', () => api.order(id).then((d) => alive && setOrder(d)).catch(() => {}));
    return () => { alive = false; try { echo.leave('order.' + id); } catch {} };
  }, [id]);

  const pushLoc = async () => {
    setBusy(true);
    try {
      await api.updateLocation(id, { latitude: -6.2 + Math.random() * 0.1, longitude: 106.8 + Math.random() * 0.1, heading: 90, speed: 10 });
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="detail-grid">
      <div className="panel">
        <div className="panel-head"><h2>Order #{id.slice(0, 8)}</h2><button className="btn" onClick={onBack}>← Kembali</button></div>
        <div className="panel-body" style={{ padding: 18 }}>
          {err && <div className="alert">{err}</div>}
          {order ? (
            <>
              <div className="kv"><span className="k">Status</span><span className={'badge b-' + order.status}>{order.status}</span></div>
              <div className="kv"><span className="k">Harga</span><span className="v">{order.price}</span></div>
              <div className="kv"><span className="k">Driver</span><span className="v">{order.driver ? order.driver.vehicle_type : 'belum ada'}</span></div>
              <div className="kv"><span className="k">Order ID</span><span className="v id">{order.id}</span></div>
            </>
          ) : <div className="empty">Memuat…</div>}
        </div>
      </div>

      <div className="track-box">
        <span className="pulse" />
        <strong style={{ fontSize: 15 }}>Live Tracking</strong>
        {pos ? (
          <div className="coord">
            📍 {pos.latitude.toFixed(4)}, {pos.longitude.toFixed(4)}<br />
            status: <b>{pos.status || 'moving'}</b> · {pos.speed ?? 0} km/jam
          </div>
        ) : (
          <div className="waiting">Menunggu update posisi driver…</div>
        )}
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={pushLoc} disabled={busy}>
          {busy ? 'Mengirim…' : 'Simulasi driver bergerak'}
        </button>
      </div>
    </div>
  );
}

function Drivers({ onOpen }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    try {
      const d = await api.drivers();
      const list = d.data ?? d;
      setRows(Array.isArray(list) ? list : (list.data ?? []));
    } catch (ex) { setErr(ex.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const counts = rows.reduce((a, x) => { a[x.status] = (a[x.status] || 0) + 1; return a; }, {});
  const online = rows.filter((x) => x.online_status === 'online' || x.status === 'online').length;
  const stats = [
    { label: 'Total Driver', value: rows.length, color: 'var(--primary)' },
    { label: 'Online', value: online, color: 'var(--success)' },
    { label: 'Approved', value: counts.approved || 0, color: 'var(--info)' },
    { label: 'Pending', value: counts.pending || 0, color: 'var(--warning)' },
  ];

  return (
    <>
      <div className="stats">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <div className="label"><span className="dot" style={{ background: s.color }} />{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head"><h2>Daftar Driver</h2></div>
        <div className="panel-body">
          {err && <div className="alert" style={{ margin: 12 }}>{err}</div>}
          {rows.length === 0 && !err
            ? <div className="empty">Belum ada driver.</div>
            : (
              <table className="tbl">
                <thead>
                  <tr><th>Kode</th><th>Nama</th><th>Kendaraan</th><th>Status</th><th>Online</th><th>Rating</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {rows.map((d) => (
                    <tr key={d.id}>
                      <td className="id">{d.driver_code || d.id.slice(0, 8)}</td>
                      <td>{d.user ? d.user.name : '-'}</td>
                      <td>{d.vehicle_type || '-'}</td>
                      <td><span className={'badge b-' + (d.status || 'pending')}>{d.status || 'pending'}</span></td>
                      <td>
                        <span className={'badge ' + (d.online_status === 'online' ? 'b-online' : 'b-offline')}>
                          {d.online_status || 'offline'}
                        </span>
                      </td>
                      <td>{d.rating != null ? '★ ' + Number(d.rating).toFixed(1) : '-'}</td>
                      <td><button className="btn" onClick={() => onOpen(d.id)}>Detail</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </>
  );
}

function DriverDetail({ id, onBack }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let alive = true;
    api.driver(id).then((x) => alive && setD(x)).catch((ex) => setErr(ex.message));
    return () => { alive = false; };
  }, [id]);

  return (
    <div className="detail-grid">
      <div className="panel">
        <div className="panel-head"><h2>Driver {d?.driver_code || id.slice(0, 8)}</h2><button className="btn" onClick={onBack}>← Kembali</button></div>
        <div className="panel-body" style={{ padding: 18 }}>
          {err && <div className="alert">{err}</div>}
          {d ? (
            <>
              <div className="kv"><span className="k">Nama</span><span className="v">{d.user ? d.user.name : '-'}</span></div>
              <div className="kv"><span className="k">Email</span><span className="v">{d.user ? d.user.email : '-'}</span></div>
              <div className="kv"><span className="k">Plat</span><span className="v">{d.license_plate || '-'}</span></div>
              <div className="kv"><span className="k">Kendaraan</span><span className="v">{d.vehicle_type || '-'}</span></div>
              <div className="kv"><span className="k">Status</span><span className={'badge b-' + (d.status || 'pending')}>{d.status || 'pending'}</span></div>
              <div className="kv"><span className="k">Online</span><span className="v">{d.online_status || 'offline'}</span></div>
              <div className="kv"><span className="k">Verifikasi</span><span className="v">{d.verification_status || '-'}</span></div>
              <div className="kv"><span className="k">Rating</span><span className="v">{d.rating != null ? '★ ' + Number(d.rating).toFixed(1) : '-'}</span></div>
              <div className="kv"><span className="k">Trip selesai</span><span className="v">{d.completed_trips ?? 0}</span></div>
            </>
          ) : <div className="empty">Memuat…</div>}
        </div>
      </div>

      <div className="track-box">
        <span className="pulse" />
        <strong style={{ fontSize: 15 }}>Posisi Driver</strong>
        {d && d.latitude != null ? (
          <div className="coord">📍 {Number(d.latitude).toFixed(4)}, {Number(d.longitude).toFixed(4)}</div>
        ) : (
          <div className="waiting">Lokasi belum tersedia.</div>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let alive = true;
    api.dashboardStats().then((d) => alive && setS(d)).catch((ex) => setErr(ex.message));
    return () => { alive = false; };
  }, []);

  const cards = s ? [
    { label: 'Trip Hari Ini', value: s.today_trips, color: 'var(--primary)' },
    { label: 'Driver Online', value: s.online_drivers, color: 'var(--success)' },
    { label: 'Trip Aktif', value: s.active_trips, color: 'var(--info)' },
    { label: 'Trip Selesai', value: s.completed_trips, color: 'var(--success)' },
    { label: 'Trip Batal', value: s.cancelled_trips, color: 'var(--danger)' },
    { label: 'Pending Payment', value: s.pending_payments, color: 'var(--warning)' },
    { label: 'Total Revenue', value: 'Rp ' + Number(s.revenue_summary || 0).toLocaleString('id-ID'), color: 'var(--primary)' },
  ] : [];

  return (
    <>
      {err && <div className="alert" style={{ marginBottom: 16 }}>{err}</div>}
      {!s && !err && <div className="empty">Memuat statistik…</div>}
      <div className="stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {cards.map((c) => (
          <div className="stat" key={c.label}>
            <div className="label"><span className="dot" style={{ background: c.color }} />{c.label}</div>
            <div className="value">{c.value}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function Payments() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    try {
      const d = await api.payments();
      const list = d.data ?? d;
      setRows(Array.isArray(list) ? list : (list.data ?? []));
    } catch (ex) { setErr(ex.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="panel">
      <div className="panel-head"><h2>Daftar Payment</h2></div>
      <div className="panel-body">
        {err && <div className="alert" style={{ margin: 12 }}>{err}</div>}
        {rows.length === 0 && !err
          ? <div className="empty">Belum ada transaksi pembayaran.</div>
          : (
            <table className="tbl">
              <thead>
                <tr><th>ID</th><th>Tipe</th><th>Status</th><th>Jumlah</th><th>Ref</th></tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="id">{String(p.id).slice(0, 8)}</td>
                    <td>{p.type || '-'}</td>
                    <td><span className={'badge b-' + (p.status || 'pending')}>{p.status || 'pending'}</span></td>
                    <td>{p.currency || 'IDR'} {Number(p.amount || 0).toLocaleString('id-ID')}</td>
                    <td className="id">{p.reference || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}

function Trips() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    try {
      const d = await api.trips();
      const list = d.data ?? d;
      setRows(Array.isArray(list) ? list : (list.data ?? []));
    } catch (ex) { setErr(ex.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const fmt = (v) => (v != null ? Number(v).toLocaleString('id-ID') : '-');

  return (
    <div className="panel">
      <div className="panel-head"><h2>Daftar Trip</h2></div>
      <div className="panel-body">
        {err && <div className="alert" style={{ margin: 12 }}>{err}</div>}
        {rows.length === 0 && !err
          ? <div className="empty">Belum ada trip.</div>
          : (
            <table className="tbl">
              <thead>
                <tr><th>Kode</th><th>Status</th><th>Est. Fare</th><th>Final Fare</th><th>Jarak</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td className="id">{t.trip_code || t.id.slice(0, 8)}</td>
                    <td><span className={'badge b-' + (t.status || 'created')}>{t.status || 'created'}</span></td>
                    <td>Rp {fmt(t.estimated_fare)}</td>
                    <td>Rp {fmt(t.final_fare)}</td>
                    <td>{fmt(t.actual_distance)} km</td>
                    <td><span style={{ color: 'var(--muted)', fontSize: 13 }}>read-only</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}

function Customers() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    try {
      const d = await api.customers();
      const list = d.data ?? d;
      setRows(Array.isArray(list) ? list : (list.data ?? []));
    } catch (ex) { setErr(ex.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const statusLabel = (s) => ({ 1: 'active', 0: 'suspended', '-1': 'banned' }[s] ?? 'unknown');
  const verified = (u) => (u.email_verified ? '✓ email' : '') + (u.phone_verified ? ' · ✓ phone' : '');

  return (
    <div className="panel">
      <div className="panel-head"><h2>Daftar Customer</h2></div>
      <div className="panel-body">
        {err && <div className="alert" style={{ margin: 12 }}>{err}</div>}
        {rows.length === 0 && !err
          ? <div className="empty">Belum ada customer.</div>
          : (
            <table className="tbl">
              <thead>
                <tr><th>ID</th><th>Nama</th><th>Email</th><th>Phone</th><th>Status</th><th>Verifikasi</th></tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td className="id">{String(u.id).slice(0, 8)}</td>
                    <td>{u.name || '-'}</td>
                    <td>{u.email || '-'}</td>
                    <td>{u.phone || '-'}</td>
                    <td><span className={'badge b-' + statusLabel(u.status)}>{statusLabel(u.status)}</span></td>
                    <td>{verified(u) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
