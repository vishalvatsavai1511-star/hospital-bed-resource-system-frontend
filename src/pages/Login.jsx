import { useState } from 'react';
import { api } from '../api';
import { Msg } from '../ui.jsx';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    setErr('');
    setPassword('');
    setConfirmPassword('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    if (mode === 'register') {
      if (password.length < 6) {
        setErr('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setErr('Passwords do not match');
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'register') {
        const res = await api('/auth/register', {
          method: 'POST',
          body: { username, password, role }
        });
        onLogin(res);
      } else {
        const res = await api('/auth/login', {
          method: 'POST',
          body: { username, password }
        });
        onLogin(res);
      }
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="center-screen">
      <form className="login-box" onSubmit={submit}>
        <div className="logo">🏥</div>
        <h2>{mode === 'register' ? 'Create New Account' : 'Hospital Bed Allocation'}</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          autoFocus
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {mode === 'register' && (
          <>
            <input
              placeholder="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <div className="role-select-group">
              <label htmlFor="reg-role">Account Role:</label>
              <select
                id="reg-role"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="ADMIN">Admin (Full access to all pages & settings)</option>
                <option value="DOCTOR">Doctor (Patients, Emergency, Beds & Reports)</option>
                <option value="NURSE">Nurse (Patients, Emergency & Beds)</option>
                <option value="RECEPTIONIST">Receptionist (Patients & Emergency intake)</option>
              </select>
            </div>
          </>
        )}

        <Msg text={err} />

        <button className="btn primary wide" disabled={busy}>
          {busy
            ? (mode === 'register' ? 'Creating account…' : 'Signing in…')
            : (mode === 'register' ? 'Create Account' : 'Login')}
        </button>

        <div style={{ marginTop: '8px' }}>
          {mode === 'login' ? (
            <p style={{ margin: 0, fontSize: '14px', color: '#5a6b85' }}>
              New user?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => switchMode('register')}
              >
                Create new account
              </button>
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: '14px', color: '#5a6b85' }}>
              Already have an account?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => switchMode('login')}
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        {mode === 'login' && (
          <p className="hint">
            Demo: admin / admin123 · doctor1 / doctor123 · nurse1 / nurse123 · reception1 / reception123
          </p>
        )}
      </form>
    </div>
  );
}
