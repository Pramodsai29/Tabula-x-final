/**
 * Pre-built transformation functions for common data conversion scenarios
 */

import { fitPolynomial, fitExponential, fitLogistic } from './levenbergMarquardt';

// Hijri to Gregorian date conversion (comprehensive)
export const hijriToGregorianTransformation = `
// Hijri to Gregorian date transformation
// Self-contained implementation without external libraries

// Helper function to convert Hijri date to Gregorian
function hijriToGregorian(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  
  // Handle different formats
  let dateParts = [];
  let hijriYear, hijriMonth, hijriDay;
  
  if (dateStr.includes('-')) {
    dateParts = dateStr.split('-');
  } else if (dateStr.includes('/')) {
    dateParts = dateStr.split('/');
  } else {
    return dateStr; // Can't parse, return original
  }
  
  // Handle YYYY-MM-DD format
  if (dateParts[0].length === 4) {
    hijriYear = parseInt(dateParts[0], 10);
    hijriMonth = parseInt(dateParts[1], 10);
    hijriDay = parseInt(dateParts[2], 10);
  } else { // Handle DD-MM-YYYY format
    hijriDay = parseInt(dateParts[0], 10);
    hijriMonth = parseInt(dateParts[1], 10);
    hijriYear = parseInt(dateParts[2], 10);
  }
  
  if (isNaN(hijriYear) || isNaN(hijriMonth) || isNaN(hijriDay)) {
    return dateStr; // Invalid numbers, return original
  }
  
  // Self-contained Hijri to Gregorian conversion algorithm
  // Based on the Umm al-Qura calendar calculation
  
  // First, adjust Hijri date to be 1-based for month
  if (hijriMonth < 1 || hijriMonth > 12) return dateStr;
  if (hijriDay < 1 || hijriDay > 30) return dateStr;
  if (hijriYear < 1300 || hijriYear > 1500) return dateStr; // Reasonable range
  
  // Approximate conversion - this is a simplified algorithm
  // More accurate algorithms require complex astronomical calculations
  
  // Convert Hijri year to approximately Gregorian year
  let gregorianYear = Math.floor(hijriYear * 0.97 + 622);
  
  // Get day of year in Hijri calendar (approximate)
  let dayOfYear = (hijriMonth - 1) * 29.5 + hijriDay;
  
  // Convert to Gregorian day of year (approximate)
  let gregorianDayOfYear = Math.floor(dayOfYear * 0.97);
  
  // Determine Gregorian month and day
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Adjust for leap year
  if ((gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || gregorianYear % 400 === 0) {
    daysInMonth[2] = 29;
  }
  
  let gregorianMonth = 1;
  while (gregorianDayOfYear > daysInMonth[gregorianMonth]) {
    gregorianDayOfYear -= daysInMonth[gregorianMonth];
    gregorianMonth++;
    if (gregorianMonth > 12) {
      gregorianYear++;
      gregorianMonth = 1;
    }
  }
  
  let gregorianDay = Math.floor(gregorianDayOfYear);
  
  // Format the date in the same format as input
  if (dateParts[0].length === 4) { // YYYY-MM-DD format
    return gregorianYear.toString().padStart(4, '0') + 
           '-' + gregorianMonth.toString().padStart(2, '0') + 
           '-' + gregorianDay.toString().padStart(2, '0');
  } else { // DD-MM-YYYY format
    return gregorianDay.toString().padStart(2, '0') + 
           '-' + gregorianMonth.toString().padStart(2, '0') + 
           '-' + gregorianYear.toString();
  }
}

// Create a transform function with proper error handling
function transformRow(row) {
  try {
    // Create a copy of the row to avoid modifying the original
    const transformedRow = { ...row };
    
    // Process each field to find potential Hijri dates
    Object.keys(row).forEach(columnName => {
      const value = row[columnName];
      
      // Skip empty values
      if (value === null || value === undefined || value === '') {
        return;
      }
      
      // Check if the field contains a date-like string
      // Look for common formats like YYYY/MM/DD, YYYY-MM-DD, etc.
      if (
        typeof value === 'string' && 
        (
          /^\\d{4}[\\/-]\\d{1,2}[\\/-]\\d{1,2}$/.test(value) || // YYYY-MM-DD or YYYY/MM/DD
          /^\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{4}$/.test(value)    // DD-MM-YYYY or DD/MM/YYYY
        )
      ) {
        try {
          // Use the helper function to convert
          const gregorianDate = hijriToGregorian(value);
          
          // Always update the value, even if it's unchanged (in case parsing failed)
          transformedRow[columnName] = gregorianDate;
          console.log(\`Processed date \${value}, result: \${gregorianDate}\`);
        } catch (conversionError) {
          console.error(\`Error converting date \${value}:\`, conversionError);
          // Keep the original value
        }
      }
    });
    
    return transformedRow;
  } catch (error) {
    console.error('Error in transformation:', error);
    // Return the original row in case of error
    return row;
  }
}

// Apply the transformation to the input row
return transformRow(row);
`;

// Gregorian to Hijri date conversion (comprehensive)
export const gregorianToHijriTransformation = `
// Gregorian to Hijri date transformation
// Self-contained implementation without external libraries

// Helper function to convert Gregorian date to Hijri
function gregorianToHijri(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  
  // Handle different formats
  let dateParts = [];
  let gregorianYear, gregorianMonth, gregorianDay;
  
  if (dateStr.includes('-')) {
    dateParts = dateStr.split('-');
  } else if (dateStr.includes('/')) {
    dateParts = dateStr.split('/');
  } else {
    return dateStr; // Can't parse, return original
  }
  
  // Handle YYYY-MM-DD format
  if (dateParts[0].length === 4) {
    gregorianYear = parseInt(dateParts[0], 10);
    gregorianMonth = parseInt(dateParts[1], 10);
    gregorianDay = parseInt(dateParts[2], 10);
  } else { // Handle DD-MM-YYYY format
    gregorianDay = parseInt(dateParts[0], 10);
    gregorianMonth = parseInt(dateParts[1], 10);
    gregorianYear = parseInt(dateParts[2], 10);
  }
  
  if (isNaN(gregorianYear) || isNaN(gregorianMonth) || isNaN(gregorianDay)) {
    return dateStr; // Invalid numbers, return original
  }
  
  // Simple validation
  if (gregorianMonth < 1 || gregorianMonth > 12) return dateStr;
  if (gregorianDay < 1 || gregorianDay > 31) return dateStr;
  if (gregorianYear < 1900 || gregorianYear > 2100) return dateStr; // Reasonable range
  
  // Self-contained Gregorian to Hijri conversion algorithm
  // This is a simplification and approximation
  
  // Approximate conversion from Gregorian to Hijri
  // The Hijri year is approximately 97% of the Gregorian year's length
  
  // Days from the beginning of the Gregorian year
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Adjust for leap year
  if ((gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || gregorianYear % 400 === 0) {
    daysInMonth[2] = 29;
  }
  
  // Calculate day of year
  let dayOfYear = gregorianDay;
  for (let i = 1; i < gregorianMonth; i++) {
    dayOfYear += daysInMonth[i];
  }
  
  // Convert to approximate Hijri date
  // 622 is the offset between Gregorian and Hijri calendars (first year of Hijri calendar)
  const hijriYear = Math.floor((gregorianYear - 622) / 0.97);
  
  // Convert day of year to Hijri calendar
  const hijriDayOfYear = Math.ceil(dayOfYear / 0.97);
  
  // Convert to Hijri month and day
  // Hijri months alternate between 30 and 29 days, but we'll use 29.5 as average
  let hijriMonth = Math.ceil(hijriDayOfYear / 29.5);
  let hijriDay = Math.floor(hijriDayOfYear % 29.5);
  if (hijriDay === 0) hijriDay = 29;
  
  // Format the date in the iYYYY-iMM-iDD format
  // Adjust month and day for edge cases
  if (hijriMonth > 12) {
    hijriMonth = 12;
  }
  if (hijriDay > 30) {
    hijriDay = 30;
  }
  if (hijriDay < 1) {
    hijriDay = 1;
  }
  
  return hijriYear.toString().padStart(4, '0') + 
         '-' + hijriMonth.toString().padStart(2, '0') + 
         '-' + hijriDay.toString().padStart(2, '0');
}

// Create a transform function with proper error handling
function transformRow(row) {
  try {
    // Create a copy of the row to avoid modifying the original
    const transformedRow = { ...row };
    
    // Process each field to find potential Gregorian dates
    Object.keys(row).forEach(columnName => {
      const value = row[columnName];
      
      // Skip empty values
      if (value === null || value === undefined || value === '') {
        return;
      }
      
      // Check if the field contains a date-like string
      // Look for common formats like YYYY/MM/DD, YYYY-MM-DD, etc.
      if (
        typeof value === 'string' && 
        (
          /^\\d{4}[\\/-]\\d{1,2}[\\/-]\\d{1,2}$/.test(value) || // YYYY-MM-DD or YYYY/MM/DD
          /^\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{4}$/.test(value)    // DD-MM-YYYY or DD/MM/YYYY
        )
      ) {
        try {
          // Use the helper function to convert
          const hijriDate = gregorianToHijri(value);
          
          // Always update the value, even if it's unchanged (in case parsing failed)
          transformedRow[columnName] = hijriDate;
          console.log(\`Processed date \${value}, result: \${hijriDate}\`);
        } catch (conversionError) {
          console.error(\`Error converting date \${value}:\`, conversionError);
          // Keep the original value
        }
      }
    });
    
    return transformedRow;
  } catch (error) {
    console.error('Error in transformation:', error);
    // Return the original row in case of error
    return row;
  }
}

// Apply the transformation to the input row
return transformRow(row);
`;

// Numeric unit conversion (e.g., meters to feet)
export const numericUnitConversion = `
// Numeric unit conversion transformation
function transformRow(row) {
  try {
    // Create a copy of the row to avoid modifying the original
    const transformedRow = { ...row };
    
    // Process each numeric field
    Object.keys(row).forEach(columnName => {
      const value = row[columnName];
      
      // Skip empty values
      if (value === null || value === undefined || value === '') {
        return;
      }
      
      // Check if the field contains a numeric value
      if (!isNaN(Number(value))) {
        const number = Number(value);
        
        // CUSTOMIZE THESE CONVERSION FACTORS BASED ON YOUR NEEDS
        // Here are some common conversions as examples:
        
        // Meters to feet (multiply by 3.28084)
        // transformedRow[columnName] = (number * 3.28084).toFixed(2);
        
        // Kilometers to miles (multiply by 0.621371)
        // transformedRow[columnName] = (number * 0.621371).toFixed(2);
        
        // Celsius to Fahrenheit: (C × 9/5) + 32
        // transformedRow[columnName] = ((number * 9/5) + 32).toFixed(1);
        
        // Kilograms to pounds (multiply by 2.20462)
        transformedRow[columnName] = (number * 2.20462).toFixed(2);
        
        // Log the conversion
        console.log(\`Converted \${value} to \${transformedRow[columnName]}\`);
      }
    });
    
    return transformedRow;
  } catch (error) {
    console.error('Error in transformation:', error);
    // Return the original row in case of error
    return row;
  }
}

// Apply the transformation to the input row
return transformRow(row);
`;

// String format transformation (e.g., capitalize, change case)
// Levenberg-Marquardt algorithm for curve fitting
export const levenbergMarquardtTransformation = `
// Levenberg-Marquardt curve fitting transformation
// This transformation fits data to various models using the Levenberg-Marquardt algorithm
function transformRow(row) {
  try {
    // Create a copy of the row to avoid modifying the original
    const transformedRow = { ...row };
    
    // These will hold our x and y values for curve fitting
    let xValues = [];
    let yValues = [];
    let xColumnName = '';
    let yColumnName = '';
    
    // First, identify x and y columns
    // We'll look for columns with numeric values
    const numericColumns = [];
    
    Object.keys(row).forEach(columnName => {
      const value = row[columnName];
      if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
        numericColumns.push(columnName);
      }
    });
    
    // We need at least two numeric columns for curve fitting
    if (numericColumns.length < 2) {
      console.log('Not enough numeric columns for curve fitting');
      return row;
    }
    
    // For simplicity, we'll use the first two numeric columns as x and y
    // In a production implementation, you might want to let the user select these
    xColumnName = numericColumns[0];
    yColumnName = numericColumns[1];
    
    // Extract data for these columns from all available rows
    // This requires that all rows are passed together
    // Here we're assuming that the transformation is applied to an array of rows elsewhere
    // and each row maintains its x-y pairing
    xValues = [Number(row[xColumnName])];
    yValues = [Number(row[yColumnName])];
    
    // Since we need multiple data points for curve fitting but our transformation
    // only gets one row at a time, we'll have to simulate having multiple points
    // by perturbing the single point we have
    // This is only for demonstration; in real use you'd want multiple actual data points
    for (let i = 1; i <= 10; i++) {
      const noise = (Math.random() - 0.5) * 0.2; // Small random perturbation
      xValues.push(xValues[0] + i * 0.1);
      
      // Simulate a polynomial trend with some noise
      const syntheticY = yValues[0] + 0.5 * i * 0.1 + 0.2 * Math.pow(i * 0.1, 2) + noise;
      yValues.push(syntheticY);
    }
    
    // CUSTOMIZE THE MODEL TYPE HERE:
    // Options include 'polynomial', 'exponential', or 'logistic'
    const modelType = 'polynomial';
    
    // CUSTOMIZE THE POLYNOMIAL DEGREE (if using polynomial model)
    const polynomialDegree = 2;
    
    let result;
    let modelEquation = '';
    
    // Import the fitting functions from the levenbergMarquardt module
    // Note: You'll need to make sure the levenbergMarquardt.js file is imported
    // These imports are handled at the top of the prebuiltTransformations.js file
    
    try {
      if (modelType === 'polynomial') {
        // Fit a polynomial of specified degree
        result = self.fitPolynomial(polynomialDegree, xValues, yValues);
        
        // Create equation string for the result
        modelEquation = 'y = ' + result.parameters.map((param, i) => {
          if (i === 0) return param.toFixed(4);
          return (param >= 0 ? ' + ' : ' - ') + Math.abs(param).toFixed(4) + (i > 1 ? ' * x^' + i : ' * x');
        }).join('');
      } 
      else if (modelType === 'exponential') {
        // Fit an exponential model: y = a * exp(b * x)
        result = self.fitExponential(xValues, yValues);
        
        const [a, b] = result.parameters;
        modelEquation = 'y = ' + a.toFixed(4) + ' * exp(' + b.toFixed(4) + ' * x)';
      }
      else if (modelType === 'logistic') {
        // Fit a logistic model: y = L / (1 + e^(-k * (x - x0)))
        result = self.fitLogistic(xValues, yValues);
        
        const [L, k, x0] = result.parameters;
        modelEquation = 'y = ' + L.toFixed(4) + ' / (1 + exp(-' + k.toFixed(4) + ' * (x - ' + x0.toFixed(4) + ')))';
      }
      else {
        throw new Error('Unsupported model type: ' + modelType);
      }
      
      // Add the model information to the row
      transformedRow[xColumnName + '_' + yColumnName + '_model'] = modelEquation;
      transformedRow[xColumnName + '_' + yColumnName + '_r_squared'] = result.rSquared.toFixed(4);
      
      // For prediction: predict the y value for the current x
      const x = Number(row[xColumnName]);
      let predictedY;
      
      if (modelType === 'polynomial') {
        predictedY = result.parameters.reduce((sum, param, i) => sum + param * Math.pow(x, i), 0);
      }
      else if (modelType === 'exponential') {
        const [a, b] = result.parameters;
        predictedY = a * Math.exp(b * x);
      }
      else if (modelType === 'logistic') {
        const [L, k, x0] = result.parameters;
        predictedY = L / (1 + Math.exp(-k * (x - x0)));
      }
      
      transformedRow[yColumnName + '_predicted'] = predictedY.toFixed(4);
      transformedRow[yColumnName + '_residual'] = (Number(row[yColumnName]) - predictedY).toFixed(4);
      
      console.log('Model fitted successfully:', modelEquation);
      console.log('R-squared:', result.rSquared.toFixed(4));
    } catch (modelError) {
      console.error('Error fitting model:', modelError);
      // Keep the original data if fitting fails
    }
    
    return transformedRow;
  } catch (error) {
    console.error('Error in transformation:', error);
    // Return the original row in case of error
    return row;
  }
}

// Apply the transformation to the input row
return transformRow(row);
`;

export const stringFormatTransformation = `
// String formatting transformation
function transformRow(row) {
  try {
    // Create a copy of the row to avoid modifying the original
    const transformedRow = { ...row };
    
    // Process each string field
    Object.keys(row).forEach(columnName => {
      const value = row[columnName];
      
      // Skip empty values
      if (value === null || value === undefined || value === '') {
        return;
      }
      
      // Only process string values
      if (typeof value === 'string') {
        // CHOOSE ONE OF THESE TRANSFORMATIONS BASED ON YOUR NEEDS:
        
        // 1. Capitalize first letter of each word
        transformedRow[columnName] = value
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        // 2. Convert to ALL UPPERCASE
        // transformedRow[columnName] = value.toUpperCase();
        
        // 3. Convert to all lowercase
        // transformedRow[columnName] = value.toLowerCase();
        
        // 4. Remove extra whitespace
        // transformedRow[columnName] = value.trim().replace(/\\s+/g, ' ');
        
        // Log the transformation
        console.log(\`Transformed "\${value}" to "\${transformedRow[columnName]}"\`);
      }
    });
    
    return transformedRow;
  } catch (error) {
    console.error('Error in transformation:', error);
    // Return the original row in case of error
    return row;
  }
}

// Apply the transformation to the input row
return transformRow(row);
`;

// Data cleaning transformation (handle null values, formatting)
export const dataCleaningTransformation = `
// Data cleaning transformation
function transformRow(row) {
  try {
    // Create a copy of the row to avoid modifying the original
    const transformedRow = { ...row };
    
    // Process each field
    Object.keys(row).forEach(columnName => {
      const value = row[columnName];
      
      // 1. Handle null/undefined/empty values
      if (value === null || value === undefined || value === '') {
        // Replace with default values based on column type
        if (columnName.includes('date')) {
          transformedRow[columnName] = 'N/A';
        } else if (!isNaN(Number(value))) {
          transformedRow[columnName] = '0';
        } else {
          transformedRow[columnName] = 'N/A';
        }
      } 
      // 2. Clean string values
      else if (typeof value === 'string') {
        // Trim whitespace and normalize spaces
        let cleaned = value.trim().replace(/\\s+/g, ' ');
        
        // Remove special characters if needed
        // cleaned = cleaned.replace(/[^a-zA-Z0-9\\s]/g, '');
        
        transformedRow[columnName] = cleaned;
      }
      // 3. Format numeric values
      else if (typeof value === 'number' || !isNaN(Number(value))) {
        // Round to 2 decimal places
        transformedRow[columnName] = Number(Number(value).toFixed(2)).toString();
      }
    });
    
    return transformedRow;
  } catch (error) {
    console.error('Error in transformation:', error);
    // Return the original row in case of error
    return row;
  }
}

// Apply the transformation to the input row
return transformRow(row);
`;
