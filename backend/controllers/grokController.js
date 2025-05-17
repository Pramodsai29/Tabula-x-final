const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Dataset = require('../models/datasetModel');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');

// Helper function to read sample data from datasets (reused from llmController)
const getSampleData = async (datasetId, numSamples = 5) => {
  try {
    const dataset = await Dataset.findById(datasetId);
    
    if (!dataset) {
      throw new Error(`Dataset not found with ID: ${datasetId}`);
    }
    
    console.log(`Getting sample data for dataset: ${datasetId}, fileType: ${dataset.fileType}`);
    
    // If we already have sample data in the dataset document, return it
    if (dataset.sampleData && dataset.sampleData.length > 0) {
      console.log('Using existing sample data from dataset document');
      return dataset.sampleData.slice(0, numSamples);
    }
    
    // Check if filePath exists
    if (!dataset.filePath) {
      console.error('Dataset has no filePath:', dataset);
      // Return some dummy data if no file path exists
      return [{"id": "sample1"}, {"id": "sample2"}];
    }
    
    // Check if file exists
    if (!fs.existsSync(dataset.filePath)) {
      console.error(`File does not exist at path: ${dataset.filePath}`);
      // Return some dummy data if file doesn't exist
      return [{"id": "sample1"}, {"id": "sample2"}];
    }
    
    // Otherwise, read from the file
    return new Promise((resolve, reject) => {
      const samples = [];
      
      if (dataset.fileType === 'csv') {
        fs.createReadStream(dataset.filePath)
          .pipe(csv())
          .on('data', (row) => {
            if (samples.length < numSamples) {
              samples.push(row);
            }
          })
          .on('end', () => {
            console.log(`Read ${samples.length} samples from CSV file`);
            resolve(samples.length > 0 ? samples : [{"id": "sample1"}, {"id": "sample2"}]);
          })
          .on('error', (err) => {
            console.error(`Error reading CSV file: ${err.message}`);
            reject(err);
          });
      } else if (dataset.fileType === 'excel' || dataset.fileType === 'xlsx' || dataset.fileType === 'xls') {
        try {
          const workbook = xlsx.readFile(dataset.filePath);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = xlsx.utils.sheet_to_json(worksheet);
          console.log(`Read ${jsonData.length} rows from Excel file`);
          resolve(jsonData.length > 0 ? jsonData.slice(0, numSamples) : [{"id": "sample1"}, {"id": "sample2"}]);
        } catch (error) {
          console.error(`Error reading Excel file: ${error.message}`);
          reject(error);
        }
      } else {
        console.error(`Unsupported file type: ${dataset.fileType}`);
        // Return some dummy data for unsupported file types instead of failing
        resolve([{"id": "sample1"}, {"id": "sample2"}]);
      }
    });
  } catch (error) {
    console.error(`Error in getSampleData: ${error.message}`);
    // Return some dummy data on error rather than failing
    return [{"id": "sample1"}, {"id": "sample2"}];
  }
};

// @desc    Classify transformation type using Grok
// @route   POST /api/grok/classify
// @access  Public
const classifyTransformation = asyncHandler(async (req, res) => {
  console.log('Classification request received:', req.body);
  const { sourceDatasetId, targetDatasetId } = req.body;
  
  if (!sourceDatasetId || !targetDatasetId) {
    console.log('Missing dataset IDs');
    res.status(400);
    throw new Error('Please provide source and target dataset IDs');
  }
  
  // Check if Grok API key is available
  if (!process.env.GROK_API_KEY) {
    console.error('GROK_API_KEY not found in environment variables');
    res.status(500);
    throw new Error('API key not configured. Please add GROK_API_KEY to .env file');
  }
  
  try {
    console.log('Retrieving sample data for datasets');
    // Get sample data from both datasets
    const sourceSamples = await getSampleData(sourceDatasetId);
    const targetSamples = await getSampleData(targetDatasetId);
    
    console.log('Getting column names from datasets');
    // Get column names from datasets
    const sourceDataset = await Dataset.findById(sourceDatasetId);
    const targetDataset = await Dataset.findById(targetDatasetId);
    
    if (!sourceDataset || !targetDataset) {
      throw new Error('One or both datasets not found');
    }
    
    // Prepare a prompt for Grok
    const prompt = `
      Classify the transformation type between these two datasets. 
      Choose one of: String-based, Numerical, Algorithmic, or General.
      
      SOURCE COLUMNS: ${JSON.stringify(sourceDataset.columnNames)}
      TARGET COLUMNS: ${JSON.stringify(targetDataset.columnNames)}
      
      SOURCE SAMPLE:
      ${JSON.stringify(sourceSamples.slice(0, 3), null, 2)}
      
      TARGET SAMPLE:
      ${JSON.stringify(targetSamples.slice(0, 3), null, 2)}
      
      Answer with just one of the four transformation types.
    `;
    
    console.log('Sending request to Grok API');
    
    try {
      const response = await axios.post(
        'https://api.grok.x/v1/chat/completions',
        {
          model: "grok-1",
          messages: [
            {
              role: "system",
              content: "You are an expert in data transformation analysis that must classify transformation types between datasets."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 50
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROK_API_KEY}`
          },
          timeout: 20000 // 20 second timeout
        }
      );
      
      console.log('Received Grok API response');
      
      // Extract the classification type from response
      const responseText = response.data.choices[0].message.content.trim();
      
      // Simple parsing to extract just the transformation type
      let classifiedType = 'General'; // Default
      
      // Check for each possible type in the response
      if (responseText.includes('String-based')) {
        classifiedType = 'String-based';
      } else if (responseText.includes('Numerical')) {
        classifiedType = 'Numerical';
      } else if (responseText.includes('Algorithmic')) {
        classifiedType = 'Algorithmic';
      }
      
      res.status(200).json({ 
        type: classifiedType,
        message: 'Classification successful'
      });
    } catch (error) {
      console.error('Error with Grok API:', error.message);
      // Fallback to a default classification
      res.status(200).json({ 
        type: 'General',
        usedFallback: true,
        message: 'Using fallback classification due to API issues'
      });
    }
  } catch (error) {
    console.error('Error classifying transformation:', error.message);
    res.status(500);
    throw new Error(`Error classifying transformation: ${error.message}`);
  }
});

// @desc    Generate transformation function using Grok
// @route   POST /api/grok/generate
// @access  Public
const generateTransformationFunction = asyncHandler(async (req, res) => {
  console.log('Function generation request received:', req.body);
  const { sourceDatasetId, targetDatasetId, transformationType } = req.body;
  
  if (!sourceDatasetId || !targetDatasetId) {
    console.log('Missing dataset IDs');
    res.status(400);
    throw new Error('Please provide source and target dataset IDs');
  }
  
  // Check if Grok API key is available
  if (!process.env.GROK_API_KEY) {
    console.error('GROK_API_KEY not found in environment variables');
    res.status(500);
    throw new Error('API key not configured. Please add GROK_API_KEY to .env file');
  }
  
  try {
    console.log('Retrieving sample data for datasets');
    // Get sample data from both datasets
    const sourceSamples = await getSampleData(sourceDatasetId);
    const targetSamples = await getSampleData(targetDatasetId);
    
    console.log('Getting column names from datasets');
    // Get column names from datasets
    const sourceDataset = await Dataset.findById(sourceDatasetId);
    const targetDataset = await Dataset.findById(targetDatasetId);
    
    if (!sourceDataset || !targetDataset) {
      throw new Error('One or both datasets not found');
    }
    
    // Prepare an improved prompt for Grok
    const prompt = `
      Generate a JavaScript function that transforms rows from source to target format. The function must be detailed, accurate, and handle edge cases.
      
      SOURCE COLUMNS: ${JSON.stringify(sourceDataset.columnNames)}
      TARGET COLUMNS: ${JSON.stringify(targetDataset.columnNames)}
      
      SOURCE SAMPLE (${sourceSamples.length} rows):
      ${JSON.stringify(sourceSamples.slice(0, 3), null, 2)}
      
      TARGET SAMPLE (${targetSamples.length} rows):
      ${JSON.stringify(targetSamples.slice(0, 3), null, 2)}
      
      TRANSFORMATION TYPE: ${transformationType}
      
      SPECIAL INSTRUCTIONS:
      1. If dealing with dates, detect the format precisely and handle calendar conversions properly.
      2. For Hijri/Gregorian date conversions, use proper calculation methods for accurate conversion.
      3. Handle missing or null values gracefully with appropriate defaults.
      4. Add detailed comments explaining the transformation logic.
      5. Add error handling for edge cases.
      6. Validate inputs and outputs.
      7. For numerical transformations, maintain precision and handle unit conversions accurately.
      8. For string transformations, handle text encoding, case sensitivity, and special characters.
      
      AVAILABLE LIBRARIES:
      - moment-hijri (for Hijri/Gregorian date conversions)
      - moment (for standard date operations)
      
      Example usage of moment-hijri (if needed):
      // For Hijri to Gregorian
      const momentHijri = require('moment-hijri');
      const date = momentHijri(hijriDateString);
      const gregorianDate = date.format('YYYY-MM-DD');
      
      // For Gregorian to Hijri
      const momentHijri = require('moment-hijri');
      const date = momentHijri(gregorianDateString);
      const hijriDate = date.format('iYYYY-iMM-iDD');
      
      Function format:
      function transformRow(row) {
        try {
          const transformedRow = {};
          // Transformation logic here with proper validation and error handling
          return transformedRow;
        } catch (error) {
          console.error('Error transforming row:', error);
          return row; // Return original row as fallback
        }
      }
      
      Return only the code with no additional text, explanations, or markdown.
    `;
    
    console.log('Sending request to Grok API for function generation');
    
    try {
      const response = await axios.post(
        'https://api.grok.x/v1/chat/completions',
        {
          model: "grok-1",
          messages: [
            {
              role: "system",
              content: "You are an expert JavaScript programmer specialized in data transformation. Generate precise, robust functions that handle all edge cases."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 1500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROK_API_KEY}`
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      console.log('Received Grok API response');
      
      // Extract the function from the response
      let functionCode = response.data.choices[0].message.content.trim();
      
      // Clean the code of any markdown code blocks if present
      if (functionCode.startsWith('```javascript')) {
        functionCode = functionCode.replace(/^```javascript\n/, '').replace(/```$/, '');
      } else if (functionCode.startsWith('```js')) {
        functionCode = functionCode.replace(/^```js\n/, '').replace(/```$/, '');
      } else if (functionCode.startsWith('```')) {
        functionCode = functionCode.replace(/^```\n/, '').replace(/```$/, '');
      }
      
      res.status(200).json({ 
        function: functionCode,
        message: 'Function generation successful'
      });
    } catch (error) {
      console.error('Error with Grok API:', error.message);
      // Provide a fallback transformation function
      const fallbackFunction = createFallbackFunction(transformationType, sourceDataset.columnNames, targetDataset.columnNames);
      
      res.status(200).json({ 
        function: fallbackFunction,
        usedFallback: true,
        message: 'Using fallback function due to API issues'
      });
    }
  } catch (error) {
    console.error('Error generating transformation function:', error.message);
    res.status(500);
    throw new Error(`Error generating transformation function: ${error.message}`);
  }
});

// @desc    Explain transformation using Grok
// @route   POST /api/grok/explain
// @access  Public
const explainTransformation = asyncHandler(async (req, res) => {
  console.log('Explanation request received:', req.body);
  const { transformationFunction } = req.body;
  
  if (!transformationFunction) {
    console.log('Missing transformation function');
    res.status(400);
    throw new Error('Please provide a transformation function to explain');
  }
  
  // Check if Grok API key is available
  if (!process.env.GROK_API_KEY) {
    console.error('GROK_API_KEY not found in environment variables');
    res.status(500);
    throw new Error('API key not configured. Please add GROK_API_KEY to .env file');
  }
  
  try {
    console.log('Preparing explanation prompt');
    // Prepare a concise prompt for Grok
    const prompt = `
      Explain the following JavaScript transformation function in simple, non-technical terms:
      
      ${transformationFunction}
      
      Explain what this function does, in 3-4 sentences that a non-technical person could understand.
    `;
    
    console.log('Sending request to Grok API');
    
    try {
      const response = await axios.post(
        'https://api.grok.x/v1/chat/completions',
        {
          model: "grok-1",
          messages: [
            {
              role: "system",
              content: "You are an expert at explaining technical code to non-technical audiences. Provide clear, concise explanations."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROK_API_KEY}`
          },
          timeout: 15000 // 15 second timeout
        }
      );
      
      console.log('Received Grok API response');
      
      // Extract the explanation from response
      const explanation = response.data.choices[0].message.content.trim();
      
      res.status(200).json({ 
        explanation,
        message: 'Explanation generated successfully'
      });
    } catch (error) {
      console.error('Error with Grok API:', error.message);
      // Create a basic explanation as fallback
      const basicExplanation = createBasicExplanation(transformationFunction);
      
      res.status(200).json({ 
        explanation: basicExplanation,
        usedFallback: true,
        message: 'Using fallback explanation due to API issues'
      });
    }
  } catch (error) {
    console.error('Error generating explanation:', error.message);
    res.status(500);
    throw new Error(`Error generating explanation: ${error.message}`);
  }
});

// Helper function to create a fallback function based on transformation type
const createFallbackFunction = (transformationType, sourceColumns, targetColumns) => {
  // Simple function to find the most similar column name
  const findSimilarColumn = (targetCol, sourceColumns) => {
    // First try exact match
    if (sourceColumns.includes(targetCol)) {
      return targetCol;
    }
    
    // Try lowercase match
    const targetLower = targetCol.toLowerCase();
    for (const sourceCol of sourceColumns) {
      if (sourceCol.toLowerCase() === targetLower) {
        return sourceCol;
      }
    }
    
    // Try partial match
    for (const sourceCol of sourceColumns) {
      if (sourceCol.toLowerCase().includes(targetLower) || 
          targetLower.includes(sourceCol.toLowerCase())) {
        return sourceCol;
      }
    }
    
    // If no match found, return the first source column or null
    return sourceColumns.length > 0 ? sourceColumns[0] : null;
  };

  if (transformationType === 'String-based') {
    return `
// String-based transformation (fallback function)
function transformRow(row) {
  try {
    const transformedRow = {};
    
    // Map source fields to target fields with string handling
    ${targetColumns.map(targetCol => {
      const sourceCol = findSimilarColumn(targetCol, sourceColumns);
      if (sourceCol) {
        return `transformedRow['${targetCol}'] = row['${sourceCol}'] ? String(row['${sourceCol}']).trim() : '';`;
      } else {
        return `transformedRow['${targetCol}'] = '';`;
      }
    }).join('\n    ')}
    
    return transformedRow;
  } catch (error) {
    console.error('Error transforming row:', error);
    return row; // Return original row as fallback
  }
}

// Return the transformed row
return transformRow(row);
    `;
  } else if (transformationType === 'Numerical') {
    return `
// Numerical transformation (fallback function)
function transformRow(row) {
  try {
    const transformedRow = {};
    
    // Map source fields to target fields with numerical handling
    ${targetColumns.map(targetCol => {
      const sourceCol = findSimilarColumn(targetCol, sourceColumns);
      if (sourceCol) {
        return `transformedRow['${targetCol}'] = row['${sourceCol}'] !== undefined ? Number(row['${sourceCol}']) || 0 : 0;`;
      } else {
        return `transformedRow['${targetCol}'] = 0;`;
      }
    }).join('\n    ')}
    
    return transformedRow;
  } catch (error) {
    console.error('Error transforming row:', error);
    return row; // Return original row as fallback
  }
}

// Return the transformed row
return transformRow(row);
    `;
  } else {
    // General or Algorithmic, or any other
    return `
// General transformation (fallback function)
function transformRow(row) {
  try {
    const transformedRow = {};
    
    // Map source fields to target fields
    ${targetColumns.map(targetCol => {
      const sourceCol = findSimilarColumn(targetCol, sourceColumns);
      if (sourceCol) {
        return `transformedRow['${targetCol}'] = row['${sourceCol}'] !== undefined ? row['${sourceCol}'] : null;`;
      } else {
        return `transformedRow['${targetCol}'] = null;`;
      }
    }).join('\n    ')}
    
    return transformedRow;
  } catch (error) {
    console.error('Error transforming row:', error);
    return row; // Return original row as fallback
  }
}

// Return the transformed row
return transformRow(row);
    `;
  }
};

// Helper function to create a basic explanation of a function when the API is unavailable
const createBasicExplanation = (functionText) => {
  // Default explanation if we can't parse anything
  let explanation = 'This function transforms data from the source format to the target format.';
  
  try {
    // Check if the function creates a new object
    if (functionText.includes('const transformedRow = {}') || functionText.includes('let transformedRow = {}')) {
      explanation += ' It creates a new empty object to hold the transformed data.';
    }
    
    // Check for mapping operations
    if (functionText.includes('map(') || functionText.match(/\bmap\s*\(/)) {
      explanation += ' It uses mapping operations to transform the data elements.';
    }
    
    // Check for mathematical operations
    if (functionText.match(/[\+\-\*\/]/) || functionText.match(/Math\./)) {
      explanation += ' It performs mathematical calculations on numerical values.';
    }
    
    // Check for string operations
    if (functionText.match(/\.split\(/) || functionText.match(/\.concat\(/) || 
        functionText.match(/\.substring\(/) || functionText.match(/\.replace\(/)) {
      explanation += ' It manipulates text strings by splitting, concatenating, or replacing parts.';
    }
    
    // Check for conditional logic
    if (functionText.match(/if\s*\(/) || functionText.match(/\?/) || functionText.match(/\:/)) {
      explanation += ' It uses conditional logic to make decisions about how to transform the data.';
    }
    
    // Check for date operations
    if (functionText.includes('Date(') || functionText.includes('moment(') || 
        functionText.includes('format(') || functionText.includes('iYYYY')) {
      explanation += ' It performs date conversions or formatting between different calendar systems.';
    }
    
    // Add a conclusion
    explanation += ' The function returns the transformed data in the format expected by the target system.';
  } catch (error) {
    console.error('Error generating basic explanation:', error);
  }
  
  return explanation;
};

module.exports = {
  classifyTransformation,
  generateTransformationFunction,
  explainTransformation
};
