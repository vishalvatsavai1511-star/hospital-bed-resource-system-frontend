import { useEffect, useState } from 'react';
import { api, fmt } from '../api';
import { Badge, Card, Msg, Table } from '../ui.jsx';

export default function Beds({ user }) {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [allocs, setAllocs] = useState([]);
  const [form, setForm] = useState({ patientId: '', bedId: '', doctorId: '' });
  const [newBed, setNewBed] = useState({ bedNumber: '', type: 'GENERAL', ward: '' });
  const [msg, setMsg] = useState({ text: '', ok: false });
  const isAdmin = user.role === 'ADMIN';

  const load = () => Promise.all([api('/beds'), api('/patients'), api('/doctors'), api('/allocations')])
    .then(([b, p, d, a]) => { setBeds(b.sort((x, y) => x.id - y.id)); setPatients(p); setDoctors(d); setAllocs(a); })
    .catch(e => setMsg({ text: e.message, ok: false }));
  useEffect(() => { load(); }, []);

  const fail = (e) => setMsg({ text: e.message, ok: false });
  const available = beds.filter(b => b.status === 'AVAILABLE');
  const active = allocs.filter(a => a.active);

  const allocate = async (e) => {
    e.preventDefault();
    try {
      await api('/allocations', { method: 'POST', body: {
        patientId: Number(form.patientId), bedId: Number(form.bedId), doctorId: form.doctorId ? Number(form.doctorId) : null } });
      setMsg({ text: 'Bed allocated.', ok: true });
      setForm({ patientId: '', bedId: '', doctorId: '' });
      load();
    } catch (ex) { fail(ex); }
  };

  const release = async (a) => {
    if (!window.confirm(`Discharge ${a.patient.name} and free bed ${a.bed.bedNumber}?`)) return;
    try { await api(`/allocations/${a.id}/release`, { method: 'POST' }); setMsg({ text: 'Bed released.', ok: true }); load(); }
    catch (ex) { fail(ex); }
  };

  const setStatus = async (b, status) => {
    try { await api(`/beds/${b.id}/status?status=${status}`, { method: 'PATCH' }); load(); } catch (ex) { fail(ex); }
  };

  const addBed = async (e) => {
    e.preventDefault();
    try { await api('/beds', { method: 'POST', body: { ...newBed, status: 'AVAILABLE' } }); setNewBed({ bedNumber: '', type: 'GENERAL', ward: '' }); load(); }
    catch (ex) { fail(ex); }
  };

  return (
    <>
      <Msg text={msg.text} ok={msg.ok} />
      <Card title="Bed Allocation">
        <form className="form-grid" onSubmit={allocate}>
          <label><span>Patient</span>
            <select required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>)}
            </select>
          </label>
          <label><span>Available Bed</span>
            <select required value={form.bedId} onChange={e => setForm({ ...form, bedId: e.target.value })}>
              <option value="">Select bed</option>
              {available.map(b => <option key={b.id} value={b.id}>{b.bedNumber} · {b.type}</option>)}
            </select>
          </label>
          <label><span>Doctor (optional)</span>
            <select value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">None</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>
          <div className="form-actions"><button className="btn primary">Allocate</button></div>
        </form>
      </Card>

      <Card title="Active Allocations">
        <Table rows={active}
          columns={[['id', 'ID'], ['patient', 'Patient', r => r.patient.name], ['bed', 'Bed', r => `${r.bed.bedNumber} (${r.bed.type})`],
                    ['doctor', 'Doctor', r => r.admission?.doctor?.name ?? '-'], ['allocatedAt', 'Since', r => fmt(r.allocatedAt)]]}
          actions={r => <button className="btn small" onClick={() => release(r)}>Discharge</button>} />
      </Card>

      <Card title="Bed Inventory">
        {isAdmin && (
          <form className="form-grid" onSubmit={addBed}>
            <label><span>Bed No</span><input required value={newBed.bedNumber} onChange={e => setNewBed({ ...newBed, bedNumber: e.target.value })} /></label>
            <label><span>Type</span>
              <select value={newBed.type} onChange={e => setNewBed({ ...newBed, type: e.target.value })}>
                {['GENERAL', 'ICU', 'SPECIAL'].map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label><span>Ward</span><input value={newBed.ward} onChange={e => setNewBed({ ...newBed, ward: e.target.value })} /></label>
            <div className="form-actions"><button className="btn primary">Add Bed</button></div>
          </form>
        )}
        <Table rows={beds}
          columns={[['bedNumber', 'Bed No'], ['type', 'Type'], ['ward', 'Ward'], ['status', 'Status', r => <Badge value={r.status} />]]}
          actions={isAdmin ? (b => b.status === 'AVAILABLE'
            ? <button className="btn small" onClick={() => setStatus(b, 'MAINTENANCE')}>Maintenance</button>
            : b.status === 'MAINTENANCE'
              ? <button className="btn small" onClick={() => setStatus(b, 'AVAILABLE')}>Make Available</button> : null) : null} />
      </Card>
    </>
  );
}
