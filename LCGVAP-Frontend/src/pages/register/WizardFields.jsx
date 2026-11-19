import { ImagePlus, Pencil } from 'lucide-react';
import DateOfBirthField from '../../components/DateOfBirthField';
import { Button, Field, FileDrop, Input, Select } from '../../components/ui';

/** Step 1: identity. */
export function StepIdentity({ formData, errors, onInput, onDob, minDob, maxDob }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="First name" error={errors.first_name} required>
        <Input name="first_name" value={formData.first_name} onChange={onInput} autoComplete="given-name" />
      </Field>
      <Field label="Last name" error={errors.last_name} required>
        <Input name="last_name" value={formData.last_name} onChange={onInput} autoComplete="family-name" />
      </Field>
      <Field
        label="Email address"
        hint="We send your sign-in codes and the review result here."
        error={errors.email}
        required
        className="sm:col-span-2"
      >
        <Input name="email" type="email" value={formData.email} onChange={onInput} autoComplete="email" spellCheck={false} />
      </Field>
      <Field label="Passport number" hint="Used only to confirm your identity. Never shown publicly." error={errors.passport_number} required>
        <Input name="passport_number" value={formData.passport_number} onChange={onInput} autoComplete="off" spellCheck={false} />
      </Field>

      {/* Three selects, so a fieldset + legend rather than a single label. */}
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-caption font-semibold text-ink">
          Date of birth <span className="text-muted" aria-hidden="true">*</span>
        </legend>
        <DateOfBirthField
          value={formData.date_of_birth}
          min={minDob}
          max={maxDob}
          required
          invalid={Boolean(errors.date_of_birth)}
          describedBy={errors.date_of_birth ? 'dob-error' : undefined}
          onChange={onDob}
        />
        {errors.date_of_birth && (
          <p id="dob-error" className="text-caption font-medium text-danger">
            {errors.date_of_birth}
          </p>
        )}
      </fieldset>
    </div>
  );
}

/** Step 2: academic record. */
export function StepAcademic({
  formData,
  errors,
  onInput,
  universities,
  universitiesLoading,
  departments,
  departmentsLoading,
  degreeOptions,
  currentYear,
  onUniversity,
  onField,
}) {
  const departmentPlaceholder = !formData.university_id
    ? 'Choose a university first'
    : departmentsLoading
      ? 'Loading departments…'
      : departments.length === 0
        ? 'No departments listed'
        : 'Choose a department';

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="University" error={errors.university_id} required className="sm:col-span-2">
        <Select
          value={formData.university_id}
          onChange={(event) => onUniversity(event.target.value)}
          disabled={universitiesLoading}
        >
          <option value="">{universitiesLoading ? 'Loading universities…' : 'Choose a university'}</option>
          {universities.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Department" error={errors.department_id} required className="sm:col-span-2">
        <Select
          value={formData.department_id}
          onChange={(event) => onField('department_id', event.target.value)}
          disabled={!formData.university_id || departmentsLoading || departments.length === 0}
        >
          <option value="">{departmentPlaceholder}</option>
          {departments.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Degree" error={errors.degree_type} required>
        <Select value={formData.degree_type} onChange={(event) => onField('degree_type', event.target.value)}>
          {degreeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Year of graduation" error={errors.graduation_year} required>
        <Input
          name="graduation_year"
          type="number"
          inputMode="numeric"
          min="1950"
          max={currentYear}
          value={formData.graduation_year}
          onChange={onInput}
          className="tabular-nums"
        />
      </Field>
    </div>
  );
}

/** Step 3: documents. */
export function StepDocuments({ degreeFile, profilePhoto, errors, onDegreeFile, onPhoto }) {
  return (
    <div className="grid gap-6">
      <Field
        label="Degree certificate"
        hint="Every page must be readable. Blurry or cropped scans slow the review down."
        error={errors.degreeFile}
        required
      >
        <FileDrop accept=".pdf,image/*" file={degreeFile} onSelect={onDegreeFile} prompt="PDF or image of your certificate" />
      </Field>
      <Field label="Profile photo" hint="Shown on your public record once you are verified." optional>
        <FileDrop accept="image/*" file={profilePhoto} onSelect={onPhoto} icon={ImagePlus} prompt="A clear photo of your face" />
      </Field>
    </div>
  );
}

/** Step 4: review everything, with a way back to each step. */
export function StepReview({ sections, onChange }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.title} aria-label={section.title} className="rounded-panel border border-line">
          <div className="flex items-center justify-between gap-4 border-b border-line bg-wash px-4 py-2.5 sm:px-5">
            <h3 className="font-semibold text-ink">{section.title}</h3>
            <Button variant="ghost" size="sm" leadingIcon={Pencil} onClick={() => onChange(section.step)}>
              Change<span className="sr-only"> {section.title.toLowerCase()}</span>
            </Button>
          </div>
          <dl className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2 sm:px-5">
            {section.items.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-caption text-muted">{label}</dt>
                <dd className="mt-0.5 font-semibold break-words text-ink">{value || <span className="font-normal text-faint">Not given</span>}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
