import { useMemo, useState } from 'react';
import { Select } from './ui';

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const parseDob = (iso) => {
  if (!iso) return { year: '', month: '', day: '' };
  const [year, month, day] = iso.split('-');
  return { year: year || '', month: month || '', day: day || '' };
};

const buildDob = (year, month, day) => {
  if (!year || !month || !day) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Date of birth as day / month / year selects on every screen size.
 *
 * Defect fix (Sprint 4): partial choices are kept in local state. Before, the
 * phone selects derived everything from `value`, which stays empty until all
 * three parts are chosen, so each pick reset itself; and a hidden desktop
 * <input type="date" required> blocked form submission on phones.
 *
 * `onChange` still receives a full ISO date (YYYY-MM-DD) or '' while incomplete.
 */
const DateOfBirthField = ({ value, onChange, min = '1950-01-01', max, required = false, invalid = false, describedBy }) => {
  const maxDate = max || new Date().toISOString().split('T')[0];
  const minYear = parseInt(min.split('-')[0], 10);
  const maxYear = parseInt(maxDate.split('-')[0], 10);
  const [parts, setParts] = useState(() => parseDob(value));

  // Follow outside changes (e.g. a reset) without fighting partial input.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (value) setParts(parseDob(value));
    else if (buildDob(parts.year, parts.month, parts.day)) setParts({ year: '', month: '', day: '' });
  }

  const years = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(maxYear - i)),
    [minYear, maxYear]
  );

  const daysInMonth = useMemo(() => {
    if (!parts.year || !parts.month) return 31;
    return new Date(parseInt(parts.year, 10), parseInt(parts.month, 10), 0).getDate();
  }, [parts.year, parts.month]);

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0')),
    [daysInMonth]
  );

  const updatePart = (field, partValue) => {
    const next = { ...parts, [field]: partValue };

    if (next.day && next.month && next.year) {
      const maxDay = new Date(parseInt(next.year, 10), parseInt(next.month, 10), 0).getDate();
      if (parseInt(next.day, 10) > maxDay) {
        next.day = String(maxDay).padStart(2, '0');
      }
    }

    setParts(next);
    const iso = buildDob(next.year, next.month, next.day);
    setLastValue(iso);
    onChange(iso);
  };

  const common = {
    required,
    'aria-invalid': invalid || undefined,
    'aria-describedby': describedBy,
  };

  return (
    <div className="grid grid-cols-[1fr_1.6fr_1.2fr] gap-2">
      <Select aria-label="Day of birth" value={parts.day} onChange={(e) => updatePart('day', e.target.value)} {...common}>
        <option value="">Day</option>
        {days.map((day) => (
          <option key={day} value={day}>
            {parseInt(day, 10)}
          </option>
        ))}
      </Select>
      <Select aria-label="Month of birth" value={parts.month} onChange={(e) => updatePart('month', e.target.value)} {...common}>
        <option value="">Month</option>
        {MONTHS.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </Select>
      <Select aria-label="Year of birth" value={parts.year} onChange={(e) => updatePart('year', e.target.value)} {...common}>
        <option value="">Year</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default DateOfBirthField;
