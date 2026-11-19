import { Button, Field, Select, cn } from '../../components/ui';

/**
 * University and department filters as native selects (keyboard and screen
 * reader support for free). Values and handlers are Directory.jsx's.
 * Always visible from lg; below lg it is toggled by the "Filters" button.
 */
export default function DirectoryFilters({
  id,
  open,
  universities,
  departments,
  filters,
  departmentsLoading,
  onUniversityChange,
  onDepartmentChange,
  onClear,
  hasActiveFilters,
}) {
  const departmentDisabled = !filters.university_id || departmentsLoading || departments.length === 0;
  const departmentPlaceholder = !filters.university_id
    ? 'Choose a university first'
    : departmentsLoading
      ? 'Loading departments…'
      : departments.length === 0
        ? 'No departments listed'
        : 'All departments';

  return (
    <div
      id={id}
      className={cn(
        'gap-4 rounded-panel bg-tint p-4 sm:grid-cols-2 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end lg:bg-transparent lg:p-0',
        open ? 'grid' : 'hidden'
      )}
    >
      <Field label="University">
        <Select value={filters.university_id} onChange={(event) => onUniversityChange(event.target.value)}>
          <option value="">All universities</option>
          {universities.map((university) => (
            <option key={university.id} value={university.id}>
              {university.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Department">
        <Select
          value={filters.department_id}
          onChange={(event) => onDepartmentChange(event.target.value)}
          disabled={departmentDisabled}
        >
          <option value="">{departmentPlaceholder}</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </Select>
      </Field>

      <Button variant="secondary" onClick={onClear} disabled={!hasActiveFilters} className="sm:col-span-2 lg:col-span-1">
        Reset filters
      </Button>
    </div>
  );
}
