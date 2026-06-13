const DEGREE_LABELS = {
  BACHELOR:  "Bachelor's Degree",
  MASTER:    "Master's Degree",
  PHD:       'Doctor of Philosophy (PhD)',
  POSTDOC:   'Post-Doctoral Research',
  ASSOCIATE: 'Associate Degree',
  DIPLOMA:   'Diploma',
  Bachelor:  "Bachelor's Degree",
  Master:    "Master's Degree",
  PhD:       'Doctor of Philosophy (PhD)',
};

const normalizeDegreeType = (type) => {
  if (!type) return null;
  const upper = String(type).toUpperCase();
  if (upper === 'PHD') return 'PHD';
  return upper;
};

export const formatDegreeType = (type) => {
  if (!type) return null;
  return DEGREE_LABELS[type] || DEGREE_LABELS[normalizeDegreeType(type)] || type;
};

export const getPublicDegreeTypes = (person) => {
  if (Array.isArray(person?.verified_degree_types) && person.verified_degree_types.length > 0) {
    return person.verified_degree_types;
  }
  if (person?.degree_type) {
    return [normalizeDegreeType(person.degree_type)];
  }
  return [];
};

export default formatDegreeType;
