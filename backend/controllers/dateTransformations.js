// Date conversion transformations for Hijri/Gregorian calendars

/**
 * Transformation function for converting Gregorian to Hijri dates
 * This is a template that needs to be customized based on your data format
 */
const gregorianToHijriTransformation = `
// This transformation converts Gregorian dates to Hijri dates
// Requires date fields in the format YYYY-MM-DD or similar standard format

// First, identify which columns contain dates
const transformedRow = { ...row };

// Process each field that might contain a date
Object.keys(row).forEach(key => {
  const value = row[key];
  
  // Skip null/undefined values
  if (value === null || value === undefined) {
    return;
  }
  
  // Check if the value looks like a date (basic check)
  if (typeof value === 'string' && /\\d{4}-\\d{1,2}-\\d{1,2}/.test(value)) {
    try {
      // Parse the Gregorian date
      const gregorianDate = new Date(value);
      
      // Skip invalid dates
      if (isNaN(gregorianDate.getTime())) {
        return;
      }
      
      // Manual calculation of Hijri date (simplified algorithm)
      // For a proper implementation, use a dedicated library
      const gregorianYear = gregorianDate.getFullYear();
      const gregorianMonth = gregorianDate.getMonth() + 1;
      const gregorianDay = gregorianDate.getDate();
      
      // This is a simplified calculation - not accurate for all dates
      // Formula: Hijri year = Gregorian year - 622 + (Gregorian month < 3 ? -1 : 0)
      const hijriYear = gregorianYear - 622 + (gregorianMonth < 3 ? -1 : 0);
      
      // Approximate month conversion (very rough estimation)
      // In a real implementation, use a proper conversion library
      const hijriMonth = ((gregorianMonth + 9) % 12) + 1;
      
      // For day, we're just using the same day number (very rough estimation)
      // In a real implementation, this needs proper calculation
      const hijriDay = gregorianDay;
      
      // Format the result as a Hijri date string
      transformedRow[key] = \`\${hijriYear}-\${hijriMonth.toString().padStart(2, '0')}-\${hijriDay.toString().padStart(2, '0')}\`;
    } catch (error) {
      console.error(\`Error converting date \${value}:\`, error);
      // Keep the original value if conversion fails
    }
  }
});

return transformedRow;
`;

/**
 * Transformation function for converting Hijri to Gregorian dates
 * This is a template that needs to be customized based on your data format
 */
const hijriToGregorianTransformation = `
// This transformation converts Hijri dates to Gregorian dates
// Requires date fields in the format YYYY-MM-DD or similar standard format

// First, identify which columns contain dates
const transformedRow = { ...row };

// Process each field that might contain a date
Object.keys(row).forEach(key => {
  const value = row[key];
  
  // Skip null/undefined values
  if (value === null || value === undefined) {
    return;
  }
  
  // Check if the value looks like a date (basic check)
  if (typeof value === 'string' && /\\d{4}-\\d{1,2}-\\d{1,2}/.test(value)) {
    try {
      // Parse the Hijri date components
      const [hijriYear, hijriMonth, hijriDay] = value.split('-').map(num => parseInt(num, 10));
      
      // Skip invalid date components
      if (isNaN(hijriYear) || isNaN(hijriMonth) || isNaN(hijriDay)) {
        return;
      }
      
      // Manual calculation of Gregorian date (simplified algorithm)
      // For a proper implementation, use a dedicated library
      
      // This is a simplified calculation - not accurate for all dates
      // Formula: Gregorian year = Hijri year + 622 - (Hijri month > 10 ? -1 : 0)
      const gregorianYear = hijriYear + 622 - (hijriMonth > 10 ? -1 : 0);
      
      // Approximate month conversion (very rough estimation)
      // In a real implementation, use a proper conversion library
      const gregorianMonth = ((hijriMonth + 2) % 12) + 1;
      
      // For day, we're just using the same day number (very rough estimation)
      // In a real implementation, this needs proper calculation
      const gregorianDay = hijriDay;
      
      // Format the result as a Gregorian date string
      transformedRow[key] = \`\${gregorianYear}-\${gregorianMonth.toString().padStart(2, '0')}-\${gregorianDay.toString().padStart(2, '0')}\`;
    } catch (error) {
      console.error(\`Error converting date \${value}:\`, error);
      // Keep the original value if conversion fails
    }
  }
});

return transformedRow;
`;

module.exports = {
  gregorianToHijriTransformation,
  hijriToGregorianTransformation
};
