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

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    if (!form.degree_type) return;
    if (!degreeFile) { setFileError('Please upload your degree document.'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    fd.append('degree_file', degreeFile);
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Degree Type */}
      <div>
        <label htmlFor="degree-type-select" className="block text-sm font-medium text-gray-700 mb-1">
          Degree Type <span className="text-red-500">*</span>
        </label>
        <select
          id="degree-type-select"
          name="degree_type"
          value={form.degree_type}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">— Select degree type —</option>
          {DEGREE_TYPES.map(dt => (
            <option key={dt.value} value={dt.value}>{dt.label}</option>
          ))}
        </select>
      </div>

      {/* Field of Study */}
      <div>
        <label htmlFor="degree-field" className="block text-sm font-medium text-gray-700 mb-1">
          Field of Study
        </label>
        <input
          id="degree-field"
          type="text"
          name="field_of_study"
          value={form.field_of_study}
          onChange={handleChange}
          placeholder="e.g. Computer Science"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* University */}
      {universities.length > 0 && (
        <div>
          <label htmlFor="degree-university" className="block text-sm font-medium text-gray-700 mb-1">
            University
          </label>
          <select
            id="degree-university"
            name="university_id"
            value={form.university_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">— Select university —</option>
            {universities.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Department */}
      {departments.length > 0 && (
        <div>
          <label htmlFor="degree-department" className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            id="degree-department"
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">— Select department —</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Graduation Year */}
      <div>
        <label htmlFor="degree-grad-year" className="block text-sm font-medium text-gray-700 mb-1">
          Graduation Year
        </label>
        <select
          id="degree-grad-year"
          name="graduation_year"
          value={form.graduation_year}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">— Select year —</option>
          {GRAD_YEARS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Degree File Upload */}
      <div>
        <label htmlFor="degree-file-input" className="block text-sm font-medium text-gray-700 mb-1">
          Degree Document <span className="text-red-500">*</span>
        </label>
        <input
          id="degree-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFile}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
        <p className="text-xs text-gray-400 mt-1">Upload your official degree certificate (JPG, PNG, WEBP, or PDF · max 5 MB)</p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Submit for Verification'}
        </button>
      </div>
    </form>
  );
};

export default AddDegreeForm;
