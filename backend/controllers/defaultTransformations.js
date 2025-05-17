// Default transformation functions that can be used as fallbacks

/**
 * Identity transformation - returns the row as is
 * Used as a fallback when no transformation function is defined
 */
const identityTransformation = `
// This is a default identity transformation
// It simply returns the row without any changes
return row;
`;

/**
 * Basic string transformation - capitalizes string values
 */
const basicStringTransformation = `
// Basic string transformation
// Capitalizes the first letter of string values
const transformed = {};
for (const key in row) {
  if (typeof row[key] === 'string') {
    transformed[key] = row[key].charAt(0).toUpperCase() + row[key].slice(1);
  } else {
    transformed[key] = row[key];
  }
}
return transformed;
`;

/**
 * Basic numerical transformation - rounds numeric values
 */
const basicNumericalTransformation = `
// Basic numerical transformation
// Rounds numeric values to 2 decimal places
const transformed = {};
for (const key in row) {
  if (typeof row[key] === 'number') {
    transformed[key] = Math.round(row[key] * 100) / 100;
  } else {
    transformed[key] = row[key];
  }
}
return transformed;
`;

module.exports = {
  identityTransformation,
  basicStringTransformation,
  basicNumericalTransformation
};
