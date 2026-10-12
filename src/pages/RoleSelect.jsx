const ROLES = [
  { key: 'ADMIN', label: 'Admin', desc: 'Full hospital control, bed & staff management' },
  { key: 'DOCTOR', label: 'Doctor', desc: 'Patients, emergency triage, bed allocations & reports' },
  { key: 'NURSE', label: 'Nurse', desc: 'Patient care, bed status & emergency allocations' },
  { key: 'RECEPTIONIST', label: 'Receptionist', desc: 'Patient admissions & emergency intake' }
];

export default function RoleSelect({ user, onPick, onLogout }) {
  const isAllowed = (r) => user.role === 'ADMIN' || user.role === r;

  return (
    <div className="center-screen">
      <div className="login-box" style={{ maxWidth: '420px' }}>
        <h2>Select Workspace Role</h2>
        <p className="hint" style={{ margin: '4px 0 14px' }}>
          Signed in as <b>{user.username}</b> (Assigned Role: <b style={{ color: '#1565d8' }}>{user.role}</b>)
        </p>

        <p style={{ fontSize: '13px', color: '#44566f', margin: '0 0 12px', textAlign: 'left' }}>
          {user.role === 'ADMIN'
            ? 'As an Admin, choose any role perspective to enter:'
            : `Click below to enter the dashboard with your account role:`}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ROLES.map(r => {
            const allowed = isAllowed(r.key);
            const isSelf = user.role === r.key;
            return (
              <button
                key={r.key}
                type="button"
                className={`btn ${isSelf ? 'primary' : ''}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: allowed ? 'pointer' : 'not-allowed',
                  opacity: allowed ? 1 : 0.4
                }}
                disabled={!allowed}
                onClick={() => onPick(r.key)}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>
                    {r.label} {isSelf && '(Your Role)'}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                    {r.desc}
                  </div>
                </div>
                <div>{allowed ? '➜' : '🔒'}</div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: '14px', borderTop: '1px solid #e6ecf4', paddingTop: '12px' }}>
          <button className="btn wide" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
