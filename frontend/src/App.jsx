import React, { useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken, clearToken } from './api.js';
import { getEcho, leaveEcho } from './echo.js';

export default function App() {
  const [token, setTk] = useState(getToken());
  const [view, setView] = useState('orders'); // 'orders' | 'detail'
  const [selId, setSelId] = useState(null);

  if (!token) return <Login onAuth={(t) => { setToken(t); setTk(t); }} />;

  return (
    <div style={s.wrap}>
      <Header
        onOrders={() => { setView('orders'); setSelId(null); }}
        onLogout={() => { clearToken(); leaveEcho(); setTk(null); }}
      />
      {view === 'orders' ? (
        <Orders onOpen={(id) => { setView('detail'); setSelId(id); }} />
      ) : (
        <Detail id={selId} onBack={() => { setView('orders'); setSelId(null); }} />
      )}
    </div>
  );
}

function Header({ onOrders, onLogout }) {
  return (
    <div style={s.header}>
      <strong>Ojol Admin</strong>
      <div>
        <button style={s.btn} onClick={onOrders}>Orders</button>
        <button style={s.btn} onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPw] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try {
      const d = await api.login(email, password);
      onAuth(d.token);
    } catch (ex) {
      setErr(ex.message);
    }
  };
  return (
    <form style={s.card} onSubmit={submit}>
      <h2>Login</h2>
      <input style={s.input} placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input style={s.input} type="password" placeholder="password" value={password} onChange={(e) => setPw(e.target.value)} />
      <button style={s.btnPrimary} type="submit">Masuk</button>
      {err && <p style={s.err}>{err}</p>}
    </form>
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
    } catch (ex) {
      setErr(ex.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (id, fn, label) => {
    setBusy(label + id);
    try { await fn(id); await load(); }
    catch (ex) { setErr(ex.message); }
    finally { setBusy(''); }
  };

  return (
    <div style={s.card}>
      <h2>Orders</h2>
      {err && <p style={s.err}>{err}</p>}
      <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
          <thead>
            <tr><th>ID</th><th>Status</th><th>Price</th><th>Driver</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td>{o.id.slice(0, 8)}</td>
                <td><span style={s.badge(o.status)}>{o.status}</span></td>
                <td>{o.price}</td>
                <td>{o.driver ? o.driver.vehicle_type : '-'}</td>
                <td>
                  <button style={s.btn} onClick={() => onOpen(o.id)}>Detail</button>
                  {o.status === 'pending' && (
                    <button style={s.btn} disabled={!!busy} onClick={() => act(o.id, api.acceptOrder, 'accept:')}>Accept</button>
                  )}
                  {o.status === 'ongoing' && (
                    <button style={s.btn} disabled={!!busy} onClick={() => act(o.id, (id) => api.updateStatus(id, 'completed'), 'done:')}>Selesai</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Detail({ id, onBack }) {
  const [order, setOrder] = useState(null);
  const [pos, setPos] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    api.order(id).then((d) => alive && setOrder(d)).catch((ex) => setErr(ex.message));
    const echo = getEcho(getToken());
    const ch = echo.private('order.' + id);
    ch.listen('.driver.location.updated', (e) => setPos(e.driver));
    ch.listen('.order.status.updated', (e) => { api.order(id).then((d) => alive && setOrder(d)).catch(() => {}); });
    return () => { alive = false; try { echo.leave('order.' + id); } catch {} };
  }, [id]);

  const pushLoc = async () => {
    try {
      await api.updateLocation(id, { latitude: -6.2 + Math.random() * 0.1, longitude: 106.8 + Math.random() * 0.1, heading: 90, speed: 10 });
    } catch (ex) { setErr(ex.message); }
  };

  return (
    <div style={s.card}>
      <button style={s.btn} onClick={onBack}>← Back</button>
      <h2>Order {id.slice(0, 8)}</h2>
      {err && <p style={s.err}>{err}</p>}
      {order && (
        <div>
          <p>Status: <span style={s.badge(order.status)}>{order.status}</span></p>
          <p>Price: {order.price}</p>
          <p>Driver: {order.driver ? order.driver.vehicle_type : 'belum ada'}</p>
        </div>
      )}
      <h3>Live Tracking</h3>
      {pos ? (
        <p>Driver @ {pos.latitude.toFixed(4)}, {pos.longitude.toFixed(4)} ({pos.status})</p>
      ) : (
        <p style={{ color: '#888' }}>menunggu update posisi…</p>
      )}
      <button style={s.btnPrimary} onClick={pushLoc}>Simulasi driver bergerak</button>
    </div>
  );
}

const s = {
  wrap: { fontFamily: 'system-ui, sans-serif', maxWidth: 860, margin: '0 auto', padding: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
  card: { background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 16, marginTop: 16 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  btn: { border: '1px solid #ccc', background: '#fafafa', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', marginRight: 4 },
  btnPrimary: { background: '#0d6efd', color: '#fff', border: 0, borderRadius: 6, padding: '8px 14px', cursor: 'pointer' },
  input: { display: 'block', width: '100%', padding: 8, marginBottom: 8, borderRadius: 6, border: '1px solid #ccc' },
  err: { color: '#dc3545', fontSize: 13 },
  badge: (st) => ({ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: badgeColor(st), color: '#fff' }),
};

function badgeColor(st) {
  return ({ pending: '#6c757d', accepted: '#fd7e14', ongoing: '#0d6efd', completed: '#198754', cancelled: '#dc3545' }[st] || '#6c757d');
}
