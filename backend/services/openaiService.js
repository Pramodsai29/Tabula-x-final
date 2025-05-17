const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Analyzes source and target data to detect transformation patterns
 * @param {Object} sourceRow - Sample row from source data
 * @param {Object} targetRow - Sample row from target data
 * @param {Array<string>} sourceColumns - List of source columns
 * @param {Array<string>} targetColumns - List of target columns
 * @returns {Array<string>} - List of detected patterns
 */
const analyzeDataPatterns = (sourceRow, targetRow, sourceColumns, targetColumns) => {
  const patterns = [];
  
  try {
    // Check for common column name patterns
    const directMatches = targetColumns.filter(col => sourceColumns.includes(col));
    if (directMatches.length > 0) {
      patterns.push(`Direct field mapping for: ${directMatches.join(', ')}`);
    }

    // Check for case transformations
    const caseTransforms = [];
    sourceColumns.forEach(srcCol => {
      targetColumns.forEach(tgtCol => {
        if (srcCol.toLowerCase() === tgtCol.toLowerCase() && srcCol !== tgtCol) {
          caseTransforms.push(`${srcCol} → ${tgtCol} (case transformation)`);
        }
      });
    });
    if (caseTransforms.length > 0) {
      patterns.push(`Case transformations: ${caseTransforms.join(', ')}`);
    }

    // Check for prefix/suffix additions or removals
    const prefixSuffixPatterns = [];
    sourceColumns.forEach(srcCol => {
      targetColumns.forEach(tgtCol => {
        if (tgtCol.endsWith(srcCol) && tgtCol !== srcCol) {
          prefixSuffixPatterns.push(`Added prefix: ${tgtCol.substring(0, tgtCol.length - srcCol.length)} to ${srcCol}`);
        } else if (tgtCol.startsWith(srcCol) && tgtCol !== srcCol) {
          prefixSuffixPatterns.push(`Added suffix: ${tgtCol.substring(srcCol.length)} to ${srcCol}`);
        } else if (srcCol.endsWith(tgtCol) && tgtCol !== srcCol) {
          prefixSuffixPatterns.push(`Removed prefix: ${srcCol.substring(0, srcCol.length - tgtCol.length)} from ${srcCol}`);
        } else if (srcCol.startsWith(tgtCol) && tgtCol !== srcCol) {
          prefixSuffixPatterns.push(`Removed suffix: ${srcCol.substring(tgtCol.length)} from ${srcCol}`);
        }
      });
    });
    if (prefixSuffixPatterns.length > 0) {
      patterns.push(`Prefix/suffix modifications: ${prefixSuffixPatterns.join(', ')}`);
    }

    // Check for data type transformations
    const typeTransforms = [];
    if (sourceRow && targetRow) {
      Object.keys(targetRow).forEach(tgtCol => {
        sourceColumns.forEach(srcCol => {
          if (sourceRow[srcCol] !== undefined && targetRow[tgtCol] !== undefined) {
            const srcType = typeof sourceRow[srcCol];
            const tgtType = typeof targetRow[tgtCol];
            
            if (srcType !== tgtType) {
              typeTransforms.push(`${srcCol} (${srcType}) → ${tgtCol} (${tgtType})`);
            }
          }
        });
      });
    }
    if (typeTransforms.length > 0) {
      patterns.push(`Data type conversions: ${typeTransforms.join(', ')}`);
    }

    // Check for string transformations like concatenation or splitting
    if (sourceRow && targetRow) {
      const stringOps = [];
      targetColumns.forEach(tgtCol => {
        if (typeof targetRow[tgtCol] === 'string') {
          // Check if target field might be a concatenation of multiple source fields
          const targetVal = String(targetRow[tgtCol] || '');
          let potentialConcatSources = [];
          
          sourceColumns.forEach(srcCol => {
            if (typeof sourceRow[srcCol] === 'string') {
              const srcVal = String(sourceRow[srcCol] || '');
              if (srcVal && targetVal.includes(srcVal) && srcVal.length > 2) { // Avoid false positives with very short strings
                potentialConcatSources.push(srcCol);
              }
            }
          });
          
          if (potentialConcatSources.length > 1) {
            stringOps.push(`${tgtCol} may be concatenation of: ${potentialConcatSources.join(' + ')}`);
          }
        }
      });
      
      if (stringOps.length > 0) {
        patterns.push(`String operations: ${stringOps.join(', ')}`);
      }
    }

    // Check for date formatting changes
    const datePatterns = [];
    if (sourceRow && targetRow) {
      sourceColumns.forEach(srcCol => {
        targetColumns.forEach(tgtCol => {
          const srcVal = sourceRow[srcCol];
          const tgtVal = targetRow[tgtCol];
          
          // Check if both values can be parsed as dates
          const srcDate = new Date(srcVal);
          const tgtDate = new Date(tgtVal);
          
          if (!isNaN(srcDate) && !isNaN(tgtDate) && 
              srcDate.getTime() === tgtDate.getTime() && 
              String(srcVal) !== String(tgtVal)) {
            datePatterns.push(`Date format change: ${srcCol} to ${tgtCol}`);
          }
        });
      });
    }
    if (datePatterns.length > 0) {
      patterns.push(`Date transformations: ${datePatterns.join(', ')}`);
    }
  } catch (error) {
    console.error('Error analyzing data patterns:', error);
  }
  
  return patterns;
};

/**
 * Generates a high-quality transformation function based on source and target data
 * @param {Object} params - Parameters for generating the transformation
 * @returns {Promise<Object>} - Generated transformation function and explanation
 */
const generateTransformation = async (params) => {
  const {
    sourceData,
    targetData,
    sourceColumns,
    targetColumns,
    transformationType = 'General',
    examples = []
  } = params;

  console.log('Generating transformation with params:', {
    sourceColumnsCount: sourceColumns?.length,
    targetColumnsCount: targetColumns?.length,
    transformationType,
    examplesCount: examples?.length,
    sourceSampleCount: sourceData?.length,
    targetSampleCount: targetData?.length
  });

  // First, analyze the data to find common patterns and transformations
  let detectedPatterns = [];
  try {
    if (sourceData.length > 0 && targetData.length > 0) {
      // Detect common patterns between source and target data
      detectedPatterns = analyzeDataPatterns(sourceData[0], targetData[0], sourceColumns, targetColumns);
      console.log('Detected transformation patterns:', detectedPatterns);
    }
  } catch (analysisError) {
    console.warn('Error analyzing data patterns:', analysisError);
  }

  // Build an enhanced prompt for the model with domain-specific examples and instructions
  const prompt = `
I need you to act as a Data Transformation Expert with advanced expertise in JavaScript, data mapping, and ETL processes. Your task is to create a precise, professional-grade transformation function that follows industry best practices.

### SOURCE DATA SCHEMA
Columns: ${JSON.stringify(sourceColumns)}
Sample: ${JSON.stringify(sourceData.slice(0, 2), null, 2)}

### TARGET DATA SCHEMA
Columns: ${JSON.stringify(targetColumns)}
Sample: ${JSON.stringify(targetData.slice(0, 2), null, 2)}

### IDENTIFIED TRANSFORMATION PATTERNS
${detectedPatterns.length > 0 ? detectedPatterns.map(p => `- ${p}`).join('\n') : 'No specific patterns detected - please analyze carefully'}

### TRANSFORMATION TYPE
${transformationType}

### COMPLETE EXAMPLES (SOURCE → TARGET MAPPINGS)
${JSON.stringify(examples, null, 2)}

### YOUR TASK: CODE GENERATION
Create a production-quality JavaScript function that transforms rows from source to target schema with 100% accuracy, handling all edge cases and exceptional conditions.

### STRICT REQUIREMENTS (You MUST implement ALL of these):
1. Use TypeScript-style JSDoc documentation with parameter and return types
2. Include COMPREHENSIVE null/undefined/empty handling for EVERY field
3. Implement per-field error handling with try/catch for each transformation
4. Provide intelligent type-specific defaults when source values are missing
5. Handle automatic type conversions with validation (string->number, date parsing, etc.)
6. Return a complete object matching the target schema (never null/undefined)
7. Handle edge cases: empty arrays, malformed data, invalid field formats
8. Add detailed comments explaining each field's transformation logic
9. Generate clear debug logging that identifies issues per field
10. Include explicit field validation for ranges, formats, and integrity

### QUALITY GATES (Your code MUST pass ALL of these):
1. CORRECTNESS: Properly emulates all example transformations with 100% accuracy
2. ROBUSTNESS: Handles unexpected, malformed, or missing data without crashing
3. READABILITY: Uses clear variable names, consistent formatting, and informative comments
4. MAINTAINABILITY: Follows single-responsibility principle for clear field mapping
5. PERFORMANCE: Avoids unnecessary operations while maintaining safety

### CODE STRUCTURE
Use this production-quality structure pattern for your implementation:

\`\`\`javascript
/**
 * Transforms a source row into the target schema with robust error handling
 * @param {Object} sourceRow - The source data row to transform
 * @returns {Object} - The transformed data matching the target schema
 */
function transformRow(sourceRow) {
  // Initialize result object with default values
  const result = {
    // Initialize ALL target fields with appropriate defaults
    // Example: targetField1: null,
    //          targetField2: '',
    //          targetField3: 0,
  };

  try {
    // IMPORTANT: Process each target field separately with proper error handling
    
    // Field 1 transformation
    try {
      // Type-safe transformation logic with validation
    } catch (fieldError) {
      // Field-specific error handling with appropriate fallback
    }
    
    // Field 2 transformation 
    try {
      // Type-safe transformation logic with validation
    } catch (fieldError) {
      // Field-specific error handling with appropriate fallback
    }
    
    // Additional helper functions can be defined here
    
  } catch (error) {
    // Global error handler as a safeguard
    console.error('Error in transformation function:', error);
  }
  
  return result;
}
\`\`\`

### COMMON FIELD TRANSFORMATION EXAMPLES (Reference these for your implementation)

#### 1. String Transformations
\`\`\`javascript
// String concatenation with null safety
result.fullName = [sourceRow.firstName || '', sourceRow.lastName || ''].filter(Boolean).join(' ') || 'Unknown';

// Case transformation with validation
result.email = typeof sourceRow.email === 'string' ? sourceRow.email.toLowerCase().trim() : '';

// Substring extraction with bounds checking
result.code = typeof sourceRow.productId === 'string' && sourceRow.productId.length >= 5 
  ? sourceRow.productId.substring(0, 5) 
  : 'XXXXX';

// Pattern replacement with fallback
result.phoneFormatted = typeof sourceRow.phone === 'string' && /^\\d{10}$/.test(sourceRow.phone)
  ? sourceRow.phone.replace(/(\\d{3})(\\d{3})(\\d{4})/, '($1) $2-$3')
  : 'Invalid Phone';
\`\`\`

#### 2. Numeric Transformations
\`\`\`javascript
// Safe number conversion with validation and fallback
result.quantity = (() => {
  try {
    const num = Number(sourceRow.quantity);
    return !isNaN(num) ? Math.max(0, Math.round(num)) : 0;
  } catch (e) {
    return 0; // Safe default
  }
})();

// Calculated field with bounds and default
result.totalPrice = (() => {
  try {
    const price = parseFloat(sourceRow.price) || 0;
    const qty = parseInt(sourceRow.quantity, 10) || 0;
    return (price * qty).toFixed(2);
  } catch (e) {
    return '0.00';
  }
})();

// Percentage calculation with bounds
result.discountRate = (() => {
  try {
    const value = parseFloat(sourceRow.discount) || 0;
    return Math.min(Math.max(value, 0), 100) / 100; // Ensure between 0-1
  } catch (e) {
    return 0;
  }
})();
\`\`\`

#### 3. Date Transformations
\`\`\`javascript
// Date parsing and formatting with validation
result.formattedDate = (() => {
  try {
    const date = new Date(sourceRow.timestamp);
    return !isNaN(date.getTime()) 
      ? date.toISOString().split('T')[0] 
      : 'Invalid Date';
  } catch (e) {
    return 'Invalid Date';
  }
})();

// Date component extraction
result.year = (() => {
  try {
    const date = new Date(sourceRow.dateCreated);
    return !isNaN(date.getTime()) ? date.getFullYear() : null;
  } catch (e) {
    return null;
  }
})();

// Add time period to date
result.expiryDate = (() => {
  try {
    const date = new Date(sourceRow.startDate);
    if (isNaN(date.getTime())) return null;
    
    // Add days to the date
    const daysToAdd = parseInt(sourceRow.validityDays, 10) || 30; // Default 30 days
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString();
  } catch (e) {
    return null;
  }
})();
\`\`\`

#### 4. Boolean and Conditional Transformations
\`\`\`javascript
// String to boolean conversion with validation
result.isActive = (() => {
  try {
    if (typeof sourceRow.status === 'boolean') return sourceRow.status;
    if (typeof sourceRow.status === 'string') {
      const status = sourceRow.status.toLowerCase().trim();
      return ['yes', 'true', 'active', 'y', '1'].includes(status);
    }
    return false;
  } catch (e) {
    return false;
  }
})();

// Conditional field mapping
result.category = (() => {
  try {
    const value = String(sourceRow.type || '').toLowerCase();
    switch (value) {
      case 'a': return 'Electronics';
      case 'b': return 'Clothing';
      case 'c': return 'Food';
      default: return 'Other';
    }
  } catch (e) {
    return 'Unknown';
  }
})();

// Complex conditional logic
result.riskLevel = (() => {
  try {
    const age = parseInt(sourceRow.age, 10) || 0;
    const income = parseFloat(sourceRow.income) || 0;
    const score = parseFloat(sourceRow.creditScore) || 0;
    
    if (score > 750) return 'Low';
    if (score > 650 && income > 50000) return 'Moderate';
    if (score < 580 || age < 21) return 'High';
    return 'Medium';
  } catch (e) {
    return 'Unknown';
  }
})();
\`\`\`

Now, create a robust transformation function that satisfies ALL the above requirements for my specific transformation task.

### RESPONSE FORMAT
Provide only the complete, runnable JavaScript transformation function, with no introduction or conclusion text. The function MUST use proper JSDoc comments and include all the required error handling.
`;

  // Initialize OpenAI configuration and API
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found in environment variables');
    }

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(configuration);

    console.log('Making OpenAI API request for transformation function generation...');
    
    // Make API request
    const response = await openai.createChatCompletion({
      model: "gpt-4",  // Use GPT-4 for more sophisticated reasoning
      messages: [
        { role: "system", content: "You are a senior JavaScript developer specializing in ETL and data transformation" },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,  // Lower temperature for more deterministic and focused output
      max_tokens: 2500,  // Allow reasonable space for a complete function
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Extract the transformation function from the response
    const generatedFunction = response.data.choices[0].message.content;
    console.log('Successfully generated transformation function');

    // Extract explanation from the function (if any)
    let explanation = "";
    try {
      // Try to extract JSDoc comments for explanation
      const jsdocPattern = /\/\*\*\s*\n([\s\S]*?)\s*\*\//g;
      const jsdocMatches = [...generatedFunction.matchAll(jsdocPattern)];
      
      if (jsdocMatches.length > 0) {
        // Extract description part from JSDoc
        explanation = jsdocMatches[0][1]
          .split('\n')
          .map(line => line.trim().replace(/^\*\s*/, ''))
          .filter(line => !line.startsWith('@'))
          .join(' ')
          .trim();
      }
      
      // If no meaningful explanation from JSDoc, generate a basic one
      if (!explanation || explanation.length < 20) {
        explanation = `This function transforms data from the source schema to the target schema using the following approach: ` +
          `It initializes a result object with all target fields, applies transformations to each field with proper error handling, ` +
          `and ensures type safety and validation according to the transformation patterns identified.`;
      }
    } catch (error) {
      console.warn('Error extracting explanation from transformation function:', error);
      explanation = "A robust data transformation function that maps source data to target schema with comprehensive error handling.";
    }

    return {
      transformationFunction: generatedFunction,
      explanation: explanation
    };
  } catch (error) {
    console.error('Error generating transformation function:', error);
    throw new Error(`Failed to generate transformation function: ${error.message}`);
  }
};

// Generate classification for transformation
const classifyTransformation = async (params) => {
  const { sourceData, targetData, sourceColumns, targetColumns } = params;

  console.log('Classifying transformation with params:', {
    sourceColumnsCount: sourceColumns?.length,
    targetColumnsCount: targetColumns?.length,
    sourceSampleCount: sourceData?.length,
    targetSampleCount: targetData?.length
  });

  // Build prompt for the model
  const prompt = `
I have two datasets that I want to transform from one to the other. Based on the sample data and columns, can you identify what kind of transformation is needed?

Source columns: ${JSON.stringify(sourceColumns)}
Source data sample: ${JSON.stringify(sourceData?.slice(0, 2), null, 2)}

Target columns: ${JSON.stringify(targetColumns)}
Target data sample: ${JSON.stringify(targetData?.slice(0, 2), null, 2)}

Based on this information, classify this transformation into one of the following categories:
1. Identity/Direct mapping (columns are nearly identical)
2. Rename (columns are the same but with different names)
3. Restructure (columns are reorganized, combined, or split)
4. Format Change (data types or formats are changed but meaning is preserved)
5. Calculation (new values are calculated from existing ones)
6. Aggregation (data is summarized or grouped)
7. Enrichment (data is enhanced with additional information)
8. Filtering (some data is excluded)
9. Complex (multiple types of transformations combined)

Please provide your classification and a brief explanation of your reasoning.
`;

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found in environment variables');
    }

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(configuration);

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",  // GPT-3.5 is sufficient for classification
      messages: [
        { role: "system", content: "You are a data transformation expert specializing in categorizing and identifying data transformation patterns." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Extract classification and reasoning
    const analysis = response.data.choices[0].message.content;

    // Parse the analysis to extract the classification type
    let classificationType = 'General';
    const classificationTypes = [
      'Identity', 'Direct', 'Rename', 'Restructure', 'Format', 
      'Calculation', 'Aggregation', 'Enrichment', 'Filtering', 'Complex'
    ];

    for (const type of classificationTypes) {
      if (analysis.includes(type)) {
        classificationType = type;
        break;
      }
    }

    return {
      classificationType,
      analysis
    };
  } catch (error) {
    console.error('Error classifying transformation:', error);
    throw new Error(`Failed to classify transformation: ${error.message}`);
  }
};

module.exports = {
  generateTransformation,
  classifyTransformation
};
