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

const DEGREE_SORT_ORDER = ['BACHELOR', 'MASTER', 'PHD', 'POSTDOC', 'ASSOCIATE', 'DIPLOMA'];

const normalizeDegreeType = (type) => {
  if (!type) return null;
  const upper = String(type).toUpperCase();
  if (upper === 'PHD') return 'PHD';
  return upper;
};

const parseDegreeTypes = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(normalizeDegreeType).filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.replace(/^\{|\}$/g, '').trim();
    if (!trimmed) return [];
    return trimmed
      .split(',')
      .map((part) => normalizeDegreeType(part.replace(/^"|"$/g, '').trim()))
      .filter(Boolean);
  }
  return [];
};

const uniqueSortedDegreeTypes = (types) => {
  const unique = [...new Set(types.map(normalizeDegreeType).filter(Boolean))];
  return unique.sort((a, b) => {
    const aIndex = DEGREE_SORT_ORDER.indexOf(a);
    const bIndex = DEGREE_SORT_ORDER.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
};

export const formatDegreeType = (type) => {
  if (!type) return null;
  return DEGREE_LABELS[type] || DEGREE_LABELS[normalizeDegreeType(type)] || type;
};

export const getPublicDegreeTypes = (person) => {
  const fromVerified = parseDegreeTypes(person?.verified_degree_types);
  if (fromVerified.length > 0) {
    return uniqueSortedDegreeTypes(fromVerified);
  }

  if (Array.isArray(person?.verified_degrees) && person.verified_degrees.length > 0) {
    return uniqueSortedDegreeTypes(
      person.verified_degrees.map((degree) => degree.degree_type)
    );
  }

  if (person?.degree_type) {
    return uniqueSortedDegreeTypes([person.degree_type]);
  }

  return [];
};

export const isPublicPremiumVeteran = (person) => {
  if (person?.is_premium_veteran === true || person?.is_premium_veteran === 't') {
    return true;
  }
  const types = getPublicDegreeTypes(person);
  return types.includes('BACHELOR') && types.includes('MASTER');
};

export default formatDegreeType;
