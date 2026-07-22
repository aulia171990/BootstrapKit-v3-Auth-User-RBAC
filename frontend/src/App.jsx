import React, { useEffect, useState } from 'react';
import { api, getToken, setToken, clearToken } from './api.js';
import { leaveEcho } from './echo.js';
import PassengerApp from './passenger/index.js';
import AdminApp from './admin/AdminApp.jsx';
import DriverApp from './driver/index.js';
import OCCApp from './operations-center/index.js';

const TENANT = import.meta.env.VITE_APP_TENANT || 'admin';

export default function App() {
  const [token, setTk] = useState(getToken());
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (token) api.me().then(setMe).catch(() => {});
  }, [token]);

  const handleLogout = () => { clearToken(); leaveEcho(); setTk(null); };

  if (!token) return <Login onAuth={(t) => { setToken(t); setTk(t); }} />;

  if (TENANT === 'passenger') {
    return <PassengerApp user={me} onLogout={handleLogout} />;
  }

  if (TENANT === 'driver') {
    return <DriverApp user={me} onLogout={handleLogout} />;
  }

  if (TENANT === 'operations') {
    return <OCCApp user={me} onLogout={handleLogout} />;
  }

  return <AdminApp me={me} onLogout={handleLogout} />;
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


