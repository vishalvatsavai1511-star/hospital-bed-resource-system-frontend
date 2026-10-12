import { useEffect, useState } from 'react';
import { api, fmt } from '../api';
import { Card, Msg, Table } from '../ui.jsx';

export default function Reports({ role }) {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState({ text: '', ok: false });
  const canGenerate = role === 'ADMIN' || role === 'DOCTOR';

  const load = () => api('/reports').then(setRows).catch(e => setMsg({ text: e.message, ok: false }));
  useEffect(() => { load(); }, []);

  const generate = async () => {
    try { await api('/reports', { method: 'POST' }); setMsg({ text: 'Report generated.', ok: true }); load(); }
    catch (e) { setMsg({ text: e.message, ok: false }); }
  };

  return (
    <Card title="Hospital Reports (bed usage, admissions, emergency stats)"
          right={canGenerate && <button className="btn primary" onClick={generate}>Generate Report</button>}>
      <Msg text={msg.text} ok={msg.ok} />
      <Table rows={rows}
        columns={[['id', 'ID'], ['generatedAt', 'Generated', r => fmt(r.generatedAt)], ['generatedBy', 'By'],
                  ['totalBeds', 'Beds'], ['availableBeds', 'Free'], ['occupiedBeds', 'Occupied'],
                  ['totalAdmissions', 'Admissions'], ['activeAdmissions', 'Active'],
                  ['emergencyTotal', 'Emergencies'], ['emergencyAllocated', 'Allocated'], ['emergencyShortage', 'Shortage']]} />
    </Card>
  );
}
