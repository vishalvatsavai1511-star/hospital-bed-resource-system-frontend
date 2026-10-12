import { CrudPanel, Table } from '../ui.jsx';
import { fmt } from '../api';

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'age', label: 'Age', type: 'number', required: true },
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
  { name: 'contact', label: 'Contact No', required: true, pattern: '[0-9+ ]{7,15}', hint: '7-15 digits' },
  { name: 'medicalCondition', label: 'Condition / Notes' }
];
const columns = [
  ['id', 'ID'], ['name', 'Name'], ['age', 'Age'], ['gender', 'Gender'], ['contact', 'Contact'],
  ['medicalCondition', 'Condition'], ['createdAt', 'Registered', r => fmt(r.createdAt)]
];

export default function Patients() {
  return <CrudPanel title="Add / Update Patient Details" endpoint="/patients" fields={fields} columns={columns} />;
}
