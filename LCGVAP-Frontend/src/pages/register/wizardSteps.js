// The four registration steps. A real sequence, so it is numbered.
export const WIZARD_STEPS = [
  {
    title: 'Identity',
    heading: 'Who you are',
    description: 'Use your name exactly as it is printed on your degree certificate.',
  },
  {
    title: 'Academic record',
    heading: 'What you studied',
    description: 'The university, department and degree you are asking us to verify.',
  },
  {
    title: 'Documents',
    heading: 'Your documents',
    description: 'A clear scan or photo of your degree certificate. A profile photo is optional.',
  },
  {
    title: 'Review',
    heading: 'Check and submit',
    description: 'Make sure everything is correct. An administrator reviews every application.',
  },
];

// Which step holds each field, so a failed submit can jump to the right place.
export const FIELD_STEP = {
  first_name: 0,
  last_name: 0,
  email: 0,
  passport_number: 0,
  date_of_birth: 0,
  university_id: 1,
  department_id: 1,
  degree_type: 1,
  graduation_year: 1,
  degreeFile: 2,
};
