import { useEffect, useState } from 'react';
import { api, fmt } from '../api';
import { Card, Msg } from '../ui.jsx';

const Stat = ({ label, value, tone }) => (
  <div className={`stat ${tone || ''}`}><div className="num">{value ?? '-'}</div><div>{label}</div></div>
);

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [err, setErr] = useState('');

  const load = () => Promise.all([api('/reports/summary'), api('/alerts')])
    .then(([sum, al]) => { setS(sum); setAlerts(al); setErr(''); })
    .catch(e => setErr(e.message));

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []);

  const ack = async (a) => { await api(`/alerts/${a.id}/ack`, { method: 'PATCH' }); load(); };
  const open = alerts.filter(a => !a.acknowledged);

  return (
    <>
      <Msg text={err} />
      {s && (
        <>
          <div className="stats">
            <Stat label="Total Beds" value={s.totalBeds} />
            <Stat label="Available" value={s.availableBeds} tone="good" />
            <Stat label="Occupied" value={s.occupiedBeds} tone="warn" />
            <Stat label="Active Admissions" value={s.activeAdmissions} />
            <Stat label="Emergency Requests" value={s.emergencyTotal} />
            <Stat label="Shortages" value={s.emergencyShortage} tone={s.emergencyShortage ? 'bad' : ''} />
          </div>
          <Card title="Bed Availability by Type">
            <div className="stats">
              {Object.entries(s.byType).map(([t, v]) => (
                <Stat key={t} label={`${t} (free / total)`} value={`${v.available} / ${v.total}`} tone={v.available === 0 ? 'bad' : v.available <= 1 ? 'warn' : 'good'} />
              ))}
            </div>
          </Card>
        </>
      )}
      <Card title={`Shortage Alerts & Notifications (${open.length} open)`}>
        {open.length === 0 && <p className="hint">No open alerts.</p>}
        {open.map(a => (
          <div key={a.id} className={`alert ${a.type === 'SHORTAGE' ? 'bad' : 'warn'}`}>
            <div><b>{a.type}</b> · {a.message}<br /><small>{fmt(a.createdAt)}</small></div>
            <button className="btn small" onClick={() => ack(a)}>Acknowledge</button>
          </div>
        ))}
      </Card>
    </>
  );
}
