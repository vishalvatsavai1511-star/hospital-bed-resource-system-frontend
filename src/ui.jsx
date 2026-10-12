import { useEffect, useState } from 'react';
import { api } from './api';

export const Card = ({ title, children, right }) => (
  <div className="card">
    {(title || right) && (
      <div className="card-head"><h3>{title}</h3>{right}</div>
    )}
    {children}
  </div>
);

export const Msg = ({ text, ok }) => (text ? <div className={ok ? 'msg ok' : 'msg err'}>{text}</div> : null);

export const Badge = ({ value }) => <span className={`badge b-${String(value).toLowerCase()}`}>{String(value)}</span>;

export function Table({ columns, rows, actions }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map(c => <th key={c[0]}>{c[1]}</th>)}{actions && <th>Actions</th>}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length + 1} className="empty">No records</td></tr>}
          {rows.map(r => (
            <tr key={r.id}>
              {columns.map(c => (
                <td key={c[0]}>{c[2] ? c[2](r) : typeof r[c[0]] === 'boolean' ? (r[c[0]] ? 'Yes' : 'No') : (r[c[0]] ?? '-')}</td>
              ))}
              {actions && <td className="actions">{actions(r)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Generic add / edit / delete panel used by Patients, Doctors and Staff. */
export function CrudPanel({ title, endpoint, fields, columns, canEdit = true, onChange }) {
  const empty = Object.fromEntries(fields.map(f => [f.name, f.default ?? '']));
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');

  const load = () => api(endpoint).then(setRows).catch(e => setErr(e.message));
  useEffect(() => { load(); }, [endpoint]);

  const set = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const body = { ...form };
      fields.forEach(f => { if (f.type === 'number') body[f.name] = body[f.name] === '' ? null : Number(body[f.name]); });
      await api(editId ? `${endpoint}/${editId}` : endpoint, { method: editId ? 'PUT' : 'POST', body });
      setForm(empty);
      setEditId(null);
      await load();
      onChange && onChange();
    } catch (ex) { setErr(ex.message); }
  };

  const edit = (r) => {
    setEditId(r.id);
    setForm(Object.fromEntries(fields.map(f => [f.name, r[f.name] ?? (f.default ?? '')])));
  };

  const remove = async (r) => {
    if (!window.confirm('Delete this record?')) return;
    setErr('');
    try { await api(`${endpoint}/${r.id}`, { method: 'DELETE' }); await load(); onChange && onChange(); }
    catch (ex) { setErr(ex.message); }
  };

  return (
    <Card title={title}>
      {canEdit && (
        <form className="form-grid" onSubmit={submit}>
          {fields.map(f => (
            <label key={f.name}>
              <span>{f.label}</span>
              {f.type === 'select' ? (
                <select value={form[f.name]} required={f.required} onChange={e => set(f.name, e.target.value)}>
                  <option value="">Select</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'checkbox' ? (
                <input type="checkbox" checked={!!form[f.name]} onChange={e => set(f.name, e.target.checked)} />
              ) : (
                <input type={f.type || 'text'} value={form[f.name]} required={f.required}
                       min={f.type === 'number' ? 0 : undefined}
                       pattern={f.pattern} title={f.hint}
                       onChange={e => set(f.name, e.target.value)} />
              )}
            </label>
          ))}
          <div className="form-actions">
            <button className="btn primary" type="submit">{editId ? 'Update' : 'Register'}</button>
            {editId && <button type="button" className="btn" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
          </div>
        </form>
      )}
      <Msg text={err} />
      <Table columns={columns} rows={rows}
             actions={canEdit ? (r => (<>
               <button className="btn small" onClick={() => edit(r)}>Edit</button>
               <button className="btn small danger" onClick={() => remove(r)}>Delete</button>
             </>)) : null} />
    </Card>
  );
}
