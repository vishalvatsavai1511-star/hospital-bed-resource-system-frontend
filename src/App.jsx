import { useState } from 'react';
import { api } from './api';
import Login from './pages/Login.jsx';
import RoleSelect from './pages/RoleSelect.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Patients from './pages/Patients.jsx';
import Staff from './pages/Staff.jsx';
import Emergency from './pages/Emergency.jsx';
import Beds from './pages/Beds.jsx';
import Reports from './pages/Reports.jsx';

const PAGES = {
  dashboard: ['Dashboard', Dashboard],
  patients: ['Patient Registration', Patients],
  staff: ['Doctors & Staff', Staff],
  emergency: ['Emergency Requests', Emergency],
  beds: ['Beds & Allocation', Beds],
  reports: ['Hospital Reports', Reports]
};

const MENU = {
  ADMIN: ['dashboard', 'patients', 'staff', 'emergency', 'beds', 'reports'],
  DOCTOR: ['dashboard', 'patients', 'emergency', 'beds', 'reports'],
  NURSE: ['dashboard', 'patients', 'emergency', 'beds'],
  RECEPTIONIST: ['dashboard', 'patients', 'emergency']
};

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [role, setRole] = useState(() => sessionStorage.getItem('role'));
  const [page, setPage] = useState('dashboard');

  const onLogin = (u) => {
    localStorage.setItem('token', u.token);
    localStorage.setItem('user', JSON.stringify(u));
    sessionStorage.setItem('role', u.role);
    setRole(u.role);
    setUser(u);
    setPage('dashboard');
  };

  const pickRole = (r) => { sessionStorage.setItem('role', r); setRole(r); setPage('dashboard'); };

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setRole(null);
  };

  if (!user) return <Login onLogin={onLogin} />;
  if (!role) return <RoleSelect user={user} onPick={pickRole} onLogout={logout} />;

  const menu = MENU[role];
  const Page = PAGES[page][1];

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>🏥 Hospital<br />Bed Allocation</h2>
        {menu.map(k => (
          <button key={k} className={k === page ? 'nav active' : 'nav'} onClick={() => setPage(k)}>{PAGES[k][0]}</button>
        ))}
        <div className="spacer" />
        <button className="nav" onClick={() => setRole(null)}>Switch Role</button>
        <button className="nav" onClick={logout}>Logout</button>
      </aside>
      <main>
        <header>
          <h1>{PAGES[page][0]}</h1>
          <div className="who">{user.username} · <b>{role}</b></div>
        </header>
        <Page user={user} role={role} />
      </main>
    </div>
  );
}
