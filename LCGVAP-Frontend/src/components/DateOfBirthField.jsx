import { useMemo } from 'react';

const MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
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

const fieldClass =
  'w-full bg-white border-2 border-gray-200 px-3 py-3.5 text-gray-900 text-base text-left focus:border-indigo-600 focus:outline-none transition-all duration-200 appearance-none rounded-none';

const DateOfBirthField = ({ value, onChange, min = '1950-01-01', max, required = false }) => {
  const maxDate = max || new Date().toISOString().split('T')[0];
  const minYear = parseInt(min.split('-')[0], 10);
  const maxYear = parseInt(maxDate.split('-')[0], 10);
  const parts = parseDob(value);

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

    onChange(buildDob(next.year, next.month, next.day));
  };

  return (
    <>
      {/* Mobile: separate selects — reliable on iOS/Android */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <select
          aria-label="Birth month"
          value={parts.month}
          required={required && !value}
          onChange={(e) => updatePart('month', e.target.value)}
          className={fieldClass}
        >
          <option value="">Month</option>
          {MONTHS.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Birth day"
          value={parts.day}
          required={required && !value}
          onChange={(e) => updatePart('day', e.target.value)}
          className={fieldClass}
        >
          <option value="">Day</option>
          {days.map((day) => (
            <option key={day} value={day}>
              {parseInt(day, 10)}
            </option>
          ))}
        </select>

        <select
          aria-label="Birth year"
          value={parts.year}
          required={required && !value}
          onChange={(e) => updatePart('year', e.target.value)}
          className={fieldClass}
        >
          <option value="">Year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: native date picker */}
      <input
        type="date"
        value={value}
        min={min}
        max={maxDate}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} hidden sm:block sm:px-6 sm:py-4 sm:text-lg [color-scheme:light] min-h-[3.25rem]`}
      />
    </>
  );
};

export default DateOfBirthField;
