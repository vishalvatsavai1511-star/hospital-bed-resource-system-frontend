import { CrudPanel } from '../ui.jsx';

const doctorFields = [
  { name: 'name', label: 'Doctor Name', required: true },
  { name: 'specialization', label: 'Specialization', required: true },
  { name: 'phone', label: 'Phone' },
  { name: 'available', label: 'Available', type: 'checkbox', default: true }
];
const doctorCols = [['id', 'ID'], ['name', 'Name'], ['specialization', 'Specialization'], ['phone', 'Phone'], ['available', 'Available']];

const staffFields = [
  { name: 'name', label: 'Staff Name', required: true },
  { name: 'role', label: 'Role', required: true },
  { name: 'phone', label: 'Phone' }
];
const staffCols = [['id', 'ID'], ['name', 'Name'], ['role', 'Role'], ['phone', 'Phone']];

export default function Staff({ user }) {
  const canEdit = user.role === 'ADMIN';
  return (
    <>
      {!canEdit && <p className="hint">View only — Admin can add or change doctor and staff records.</p>}
      <CrudPanel title="Doctors" endpoint="/doctors" fields={doctorFields} columns={doctorCols} canEdit={canEdit} />
      <CrudPanel title="Hospital Staff" endpoint="/staff" fields={staffFields} columns={staffCols} canEdit={canEdit} />
    </>
  );
}
