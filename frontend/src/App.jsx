import React, { useEffect, useState } from 'react';
import { api, getToken, setToken, clearToken } from './api.js';
import { leaveEcho } from './echo.js';
import { Loading } from './design-system/index.js';
import PassengerApp from './passenger/index.js';
import AdminApp from './admin/AdminApp.jsx';
import DriverApp from './driver/index.js';
import OCCApp from './operations-center/index.js';

const ROLE_APP_MAP = {
  customer: PassengerApp,
  driver: DriverApp,
  admin: AdminApp,
  superadmin: AdminApp,
};

export default function App() {
  const [token, setTk] = useState(getToken());
  const [me, setMe] = useState(null);
  const [meLoaded, setMeLoaded] = useState(false);

  useEffect(() => {
    if (token && !meLoaded) {
      api.me().then(setMe).catch(() => {}).finally(() => setMeLoaded(true));
    }
  }, [token]);

  const handleLogout = () => { clearToken(); leaveEcho(); setTk(null); setMe(null); setMeLoaded(false); };

  const handleAuth = (t, userData) => {
    setToken(t);
    setTk(t);
    if (userData) {
      setMe(userData);
      setMeLoaded(true);
    }
  };

  if (!token) return <Login onAuth={handleAuth} />;

  const envTenant = import.meta.env.VITE_APP_TENANT;

  // Login response includes user data — use it directly for role routing
  const user = me;
  let role = user?.roles?.[0];
  if (!role && envTenant) {
    role = envTenant === 'passenger' ? 'customer' : envTenant;
  }

  if (envTenant && !role) {
    if (envTenant === 'passenger') return <PassengerApp user={null} onLogout={handleLogout} />;
    if (envTenant === 'driver') return <DriverApp user={null} onLogout={handleLogout} />;
    if (envTenant === 'operations') return <OCCApp user={null} onLogout={handleLogout} />;
    return <AdminApp me={null} onLogout={handleLogout} />;
  }

  if (!role) {
    return meLoaded
      ? <AdminApp me={null} onLogout={handleLogout} />
      : <Loading label="Memuat profil..." />;
  }

  const AppComponent = ROLE_APP_MAP[role];
  if (!AppComponent) return <AdminApp me={user} onLogout={handleLogout} />;

  const props = role === 'admin' || role === 'superadmin'
    ? { me: user, onLogout: handleLogout }
    : { user, onLogout: handleLogout };

  return <AppComponent {...props} />;
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
      onAuth(d.token, d.user);
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


