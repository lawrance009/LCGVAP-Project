/**
 * AddDegreeForm.jsx
 * ---------------------------------------------------------------
 * Form for submitting a new academic degree for verification.
 *
 * Props:
 *   universities {Array}
 *   departments  {Array}
 *   onSubmit     {fn(formData)}
 *   onCancel     {fn}
 *   loading      {boolean}
 * ---------------------------------------------------------------
 */

import { useState } from 'react';
import { Button, Field, FileDrop, Input, Select } from '../ui';

const DEGREE_TYPES = [
  { value: 'BACHELOR',  label: "Bachelor's Degree" },
  { value: 'MASTER',    label: "Master's Degree"   },
  { value: 'PHD',       label: "Doctor of Philosophy (PhD)" },
  { value: 'POSTDOC',   label: "Post-Doctoral Research"     },
  { value: 'ASSOCIATE', label: "Associate Degree"           },
  { value: 'DIPLOMA',   label: "Diploma"                    },
];

const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS   = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - i);

const AddDegreeForm = ({ universities = [], departments = [], onSubmit, onCancel, loading }) => {
  const [form, setForm]         = useState({
    degree_type:     '',
    university_id:   '',
    department_id:   '',
    graduation_year: '',
    field_of_study:  '',
  });
  const [degreeFile, setDegreeFile] = useState(null);
  const [fileError, setFileError]   = useState('');
  const [typeError, setTypeError]   = useState('');

  const availableDepartments = (() => {
    if (!form.university_id) return [];

    const selectedUniversityId = String(form.university_id);
    const departmentsByName = new Map();

    departments.forEach((department) => {
      const departmentUniversityId = department.university_id ? String(department.university_id) : '';
      const isGlobal = !departmentUniversityId;
      const isForSelectedUniversity = departmentUniversityId === selectedUniversityId;

      if (!isGlobal && !isForSelectedUniversity) return;

      const key = String(department.name || '').trim().toLowerCase();
      if (!key) return;

      const existing = departmentsByName.get(key);
      if (!existing || isForSelectedUniversity) {
        departmentsByName.set(key, department);
      }
    });

    return Array.from(departmentsByName.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'university_id' ? { department_id: '' } : {}),
    }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setFileError('Only JPG, PNG, WEBP, or PDF files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size must be under 5 MB.');
      return;
    }
    setFileError('');
    setDegreeFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // UX fix (Sprint 4): this used to return silently when no type was chosen.
    if (!form.degree_type) { setTypeError('Choose the type of degree.'); return; }
    if (!degreeFile) { setFileError('Please upload your degree document.'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    fd.append('degree_file', degreeFile);
    onSubmit(fd);
  };

  const onChangeType = (e) => {
    setTypeError('');
    handleChange(e);
  };

  // FileDrop hands over a File; reuse the existing checks in handleFile.
  const onSelectFile = (file) => handleFile({ target: { files: [file] } });

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
      <Field label="Degree type" error={typeError} required>
        <Select name="degree_type" value={form.degree_type} onChange={onChangeType}>
          <option value="">Choose a degree type</option>
          {DEGREE_TYPES.map(dt => (
            <option key={dt.value} value={dt.value}>{dt.label}</option>
          ))}
        </Select>
      </Field>

      <Field label="Field of study" optional>
        <Input
          name="field_of_study"
          value={form.field_of_study}
          onChange={handleChange}
          placeholder="For example, Computer Science"
        />
      </Field>

      {universities.length > 0 && (
        <Field label="University" optional>
          <Select name="university_id" value={form.university_id} onChange={handleChange}>
            <option value="">Choose a university</option>
            {universities.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </Field>
      )}

      {form.university_id && availableDepartments.length > 0 && (
        <Field label="Department" optional>
          <Select name="department_id" value={form.department_id} onChange={handleChange}>
            <option value="">Choose a department</option>
            {availableDepartments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Graduation year" optional>
        <Select name="graduation_year" value={form.graduation_year} onChange={handleChange}>
          <option value="">Choose a year</option>
          {GRAD_YEARS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>
      </Field>

      <Field
        label="Degree document"
        hint="Your official certificate as JPG, PNG, WEBP or PDF, up to 5 MB."
        error={fileError}
        required
        className="sm:col-span-2"
      >
        <FileDrop
          accept="image/jpeg,image/png,image/webp,application/pdf"
          file={degreeFile}
          onSelect={onSelectFile}
          prompt="Choose your degree certificate"
        />
      </Field>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" loading={loading}>
          {loading ? 'Submitting…' : 'Submit for verification'}
        </Button>
      </div>
    </form>
  );
};

export default AddDegreeForm;
