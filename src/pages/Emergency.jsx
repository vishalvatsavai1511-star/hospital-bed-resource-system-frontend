import { useEffect, useState } from 'react';
import { api, fmt } from '../api';
import { Badge, Card, Msg, Table } from '../ui.jsx';

export default function Emergency() {
  const [patients, setPatients] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ patientId: '', urgency: 'HIGH', requiredBedType: 'ICU', notes: '' });
  const [msg, setMsg] = useState({ text: '', ok: false });

  const load = () => {
    api('/emergency-requests').then(setRows).catch(e => setMsg({ text: e.message, ok: false }));
    api('/patients').then(setPatients).catch(() => {});
  };
  useEffect(load, []);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', ok: false });
    try {
      const r = await api('/emergency-requests', { method: 'POST', body: { ...form, patientId: Number(form.patientId) } });
      setMsg(r.status === 'ALLOCATED'
        ? { text: `Bed ${r.allocatedBed.bedNumber} (${r.allocatedBed.type}) allocated to ${r.patient.name}.`, ok: true }
        : { text: `Shortage: no ${r.requiredBedType} bed free. Admin/staff have been alerted.`, ok: false });
      setForm({ ...form, patientId: '', notes: '' });
      load();
    } catch (ex) { setMsg({ text: ex.message, ok: false }); }
  };

  const retry = async (r) => {
    try { await api(`/emergency-requests/${r.id}/retry`, { method: 'POST' }); setMsg({ text: '', ok: true }); }
    catch (ex) { setMsg({ text: ex.message, ok: false }); }
    load();
  };

  return (
    <>
      <Card title="Submit Emergency Request">
        <form className="form-grid" onSubmit={submit}>
          <label><span>Patient</span>
            <select required value={form.patientId} onChange={e => set('patientId', e.target.value)}>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>)}
            </select>
          </label>
          <label><span>Urgency</span>
            <select value={form.urgency} onChange={e => set('urgency', e.target.value)}>
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(u => <option key={u}>{u}</option>)}
            </select>
          </label>
          <label><span>Required Bed Type</span>
            <select value={form.requiredBedType} onChange={e => set('requiredBedType', e.target.value)}>
              {['GENERAL', 'ICU', 'SPECIAL'].map(u => <option key={u}>{u}</option>)}
            </select>
          </label>
          <label><span>Notes</span><input value={form.notes} onChange={e => set('notes', e.target.value)} /></label>
          <div className="form-actions"><button className="btn primary">Submit &amp; Allocate</button></div>
        </form>
        <Msg text={msg.text} ok={msg.ok} />
      </Card>
      <Card title="All Emergency Requests">
        <Table rows={rows}
          columns={[
            ['id', 'ID'],
            ['patient', 'Patient', r => r.patient?.name],
            ['urgency', 'Urgency', r => <Badge value={r.urgency} />],
            ['requiredBedType', 'Bed Type'],
            ['status', 'Status', r => <Badge value={r.status} />],
            ['allocatedBed', 'Bed', r => r.allocatedBed?.bedNumber ?? '-'],
            ['createdAt', 'Time', r => fmt(r.createdAt)]
          ]}
          actions={r => r.status === 'SHORTAGE' ? <button className="btn small" onClick={() => retry(r)}>Retry</button> : null} />
      </Card>
    </>
  );
}
