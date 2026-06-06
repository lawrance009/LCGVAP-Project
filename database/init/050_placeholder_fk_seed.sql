-- =============================================================================
-- Minimal FK chain for createAdmin placeholders (IDs 1,1,1) — fresh DB only.
-- Mirrors userModel.createAdmin reliance on universities/departments/advisors row 1.
-- =============================================================================

INSERT INTO universities (id, name, acronym, country)
SELECT 1, 'System placeholder university', 'SYS', 'N/A'
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE id = 1);

INSERT INTO departments (id, name, university_id)
SELECT 1, 'System placeholder department', 1
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE id = 1);

INSERT INTO advisors (id, first_name, last_name, email, department_id)
SELECT 1, 'System', 'Placeholder', 'placeholder.advisor@lcgvap.invalid', 1
WHERE NOT EXISTS (SELECT 1 FROM advisors WHERE id = 1);

SELECT setval(
  pg_get_serial_sequence('universities', 'id'),
  COALESCE((SELECT MAX(id) FROM universities), 1),
  TRUE
);

SELECT setval(
  pg_get_serial_sequence('departments', 'id'),
  COALESCE((SELECT MAX(id) FROM departments), 1),
  TRUE
);

SELECT setval(
  pg_get_serial_sequence('advisors', 'id'),
  COALESCE((SELECT MAX(id) FROM advisors), 1),
  TRUE
);
