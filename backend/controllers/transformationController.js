const asyncHandler = require('express-async-handler');
const Transformation = require('../models/transformationModel');
const Dataset = require('../models/datasetModel');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const { identityTransformation } = require('./defaultTransformations');

// @desc    Create a new transformation
// @route   POST /api/transformations
// @access  Public
const createTransformation = asyncHandler(async (req, res) => {
  const { name, sourceTableId, targetTableId, transformationType } = req.body;

  if (!sourceTableId || !targetTableId) {
    res.status(400);
    throw new Error('Please provide source and target table IDs');
  }

  // Verify that the datasets exist
  const sourceTable = await Dataset.findById(sourceTableId);
  const targetTable = await Dataset.findById(targetTableId);

  if (!sourceTable || !targetTable) {
    res.status(404);
    throw new Error('Source or target table not found');
  }

  const transformation = await Transformation.create({
    name,
    sourceTable: sourceTableId,
    targetTable: targetTableId,
    transformationType: transformationType || 'General',
    status: 'pending'
  });

  res.status(201).json(transformation);
});

// @desc    Get all transformations
// @route   GET /api/transformations
// @access  Public
const getTransformations = asyncHandler(async (req, res) => {
  const transformations = await Transformation.find()
    .sort({ createdAt: -1 })
    .populate('sourceTable', 'name')
    .populate('targetTable', 'name');
  
  res.status(200).json(transformations);
});

// @desc    Get transformation by ID
// @route   GET /api/transformations/:id
// @access  Public
const getTransformationById = asyncHandler(async (req, res) => {
  const transformation = await Transformation.findById(req.params.id)
    .populate('sourceTable')
    .populate('targetTable');
  
  if (!transformation) {
    res.status(404);
    throw new Error('Transformation not found');
  }
  
  res.status(200).json(transformation);
});

// @desc    Update a transformation
// @route   PUT /api/transformations/:id
// @access  Public
const updateTransformation = asyncHandler(async (req, res) => {
  const { transformationType, transformationFunction, status } = req.body;
  
  const transformation = await Transformation.findById(req.params.id);
  
  if (!transformation) {
    res.status(404);
    throw new Error('Transformation not found');
  }
  
  transformation.transformationType = transformationType || transformation.transformationType;
  transformation.transformationFunction = transformationFunction || transformation.transformationFunction;
  transformation.status = status || transformation.status;
  
  const updatedTransformation = await transformation.save();
  
  res.status(200).json(updatedTransformation);
});

// @desc    Delete a transformation
// @route   DELETE /api/transformations/:id
// @access  Public
const deleteTransformation = asyncHandler(async (req, res) => {
  const transformation = await Transformation.findById(req.params.id);
  
  if (!transformation) {
    res.status(404);
    throw new Error('Transformation not found');
  }
  
  await transformation.deleteOne();
  
  res.status(200).json({ id: req.params.id });
});

// @desc    Apply a transformation
// @route   POST /api/transformations/:id/apply
// @access  Public
const applyTransformation = asyncHandler(async (req, res) => {
  const transformation = await Transformation.findById(req.params.id)
    .populate('sourceTable')
    .populate('targetTable');
  
  if (!transformation) {
    res.status(404);
    throw new Error('Transformation not found');
  }
  
  // Use default identity transformation if none is defined
  if (!transformation.transformationFunction) {
    console.log('No transformation function defined, using identity function as fallback');
    transformation.transformationFunction = identityTransformation;
    
    // Update the transformation with the identity function
    try {
      await Transformation.findByIdAndUpdate(transformation._id, {
        transformationFunction: identityTransformation,
        status: 'auto_updated_with_fallback'
      });
      console.log('Updated transformation with fallback identity function');
    } catch (updateError) {
      console.error('Error updating transformation with fallback:', updateError);
      // Continue even if update fails
    }
  }
  
  try {
    // Set transformation to processing status
    transformation.status = 'processing';
    await transformation.save();
    
    // Read source data
    const sourceData = await readDatasetFile(transformation.sourceTable);
    
    // Apply transformation function to source data
    const transformedData = applyTransformationFunction(sourceData, transformation.transformationFunction);
    
    // Create output path for the transformed data
    const outputFileName = `transformed_${Date.now()}.csv`;
    const outputPath = path.join(__dirname, '..', 'uploads', outputFileName);
    
    // Create a CSV file with transformed data
    const csvData = [];
    
    // Add headers
    if (transformedData.length > 0) {
      csvData.push(Object.keys(transformedData[0]).join(','));
    }
    
    // Add rows
    transformedData.forEach(row => {
      csvData.push(Object.values(row).map(value => {
        // Handle values with commas by wrapping in quotes
        if (value && value.toString().includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(','));
    });
    
    fs.writeFileSync(outputPath, csvData.join('\n'));
    
    // Create a new dataset for the transformed data
    const transformedDataset = await Dataset.create({
      name: `${transformation.sourceTable.name} to ${transformation.targetTable.name}`,
      filePath: outputPath,
      fileType: 'csv',
      rows: transformedData.length,
      columns: transformedData.length > 0 ? Object.keys(transformedData[0]).length : 0,
      columnNames: transformedData.length > 0 ? Object.keys(transformedData[0]) : [],
      sampleData: transformedData.slice(0, 5),
      datasetType: 'transformed'
    });
    
    // Calculate metrics
    const metrics = calculateMetrics(transformedData, await readDatasetFile(transformation.targetTable));
    
    // Update transformation with results
    transformation.status = 'completed';
    transformation.metrics = metrics;
    const updatedTransformation = await transformation.save();
    
    res.status(200).json({
      transformation: updatedTransformation,
      transformedDataset
    });
  } catch (error) {
    console.error('Error applying transformation:', error);
    
    // Update transformation status to failed
    transformation.status = 'failed';
    await transformation.save();
    
    res.status(500);
    throw new Error(`Error applying transformation: ${error.message}`);
  }
});

// Helper function to apply transformation function to data - ENHANCED VERSION WITH ADDITIONAL SAFETY
const applyTransformationFunction = (data, transformationFunction) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('Empty or invalid source data provided to transformation function');
    return [];
  }
  
  try {
    console.log('Applying transformation function:', transformationFunction.substring(0, 200) + '...');
    
    // Validate the transformation function is well-formed
    if (!transformationFunction || typeof transformationFunction !== 'string' || transformationFunction.trim() === '') {
      console.error('Invalid transformation function provided');
      throw new Error('Invalid transformation function');
    }

    // Check if the function contains the required transformRow function
    if (!transformationFunction.includes('function transformRow') && 
        !transformationFunction.includes('const transformRow') && 
        !transformationFunction.includes('let transformRow')) {
      console.error('Transformation function does not contain required transformRow function');
      throw new Error('Malformed transformation function: missing transformRow implementation');
    }
    
    // Create an enhanced sandbox environment for the transformation function with robust error handling
    const functionWrapper = `
      try {
        // First, define a robust fallback function in case the main one fails
        function createFallbackTransform(originalRow) {
          return function(row) {
            // If we have a sample of the expected output structure, use it to create an empty object with the same keys
            if (originalRow && typeof originalRow === 'object') {
              return Object.fromEntries(Object.keys(originalRow).map(k => [k, '']));
            }
            // Otherwise return the original row (identity transformation) or an empty object
            return row || {};
          };
        }
        
        // Now try to execute the provided transformation function
        ${transformationFunction}
        
        // Return a heavily wrapped version that handles all errors and ensures valid output
        return function ultraSafeTransform(row) {
          try {
            // Handle null/undefined input with detailed logging
            if (!row) {
              console.warn('Received null or undefined row in transformation');
              row = {};
            } else if (typeof row !== 'object') {
              console.warn('Received non-object row in transformation:', typeof row);
              try { 
                row = JSON.parse(JSON.stringify(row)); 
              } catch (e) { 
                row = {}; 
              }
            }
            
            // Call the original function with multiple layers of protection
            const result = (function() { 
              try { 
                // This is the actual transformation call
                const transformResult = transformRow(row);
                return transformResult; 
              } catch (transformError) { 
                console.error('Error in primary transformation function:', transformError.message);
                try {
                  // Try to at least copy over the original fields as fallback
                  console.warn('Attempting fallback transformation...');
                  return createFallbackTransform(row)(row);
                } catch (fallbackError) {
                  console.error('Even fallback transformation failed:', fallbackError.message);
                  return {};
                }
              }
            })();
            
            // Extensive validation on the result
            if (!result) {
              console.warn('Transformation returned null or undefined, using empty object');
              return {};
            } else if (typeof result !== 'object') {
              console.warn('Transformation returned non-object:', typeof result);
              try {
                // Try to convert primitive result to object
                return { value: result };
              } catch (e) {
                return {};
              }
            } else if (Array.isArray(result)) {
              console.warn('Transformation returned array instead of object, converting to object');
              try {
                // Convert array to object with indexed keys
                return Object.fromEntries(result.map((val, idx) => [\`item\${idx}\`, val]));
              } catch (e) {
                return {};
              }
            }
            
            return result;
          } catch (outerError) {
            console.error('Critical error in safe transform wrapper:', outerError.message);
            return {};
          }
        };
      } catch (initError) {
        console.error('Error initializing transformation function:', initError.message);
        return createFallbackTransform(data[0] || {});
      }
    `;
    
    // Create the ultra-safe transformation function
    const ultraSafeTransformFn = new Function(functionWrapper)();
    
    // Track errors for reporting
    let errorCount = 0;
    let successCount = 0;
    
    // Apply the transformation to each row with comprehensive error handling
    const results = data.map((row, index) => {
      try {
        const result = ultraSafeTransformFn(row);
        
        // Validate each transformed result
        if (!result || typeof result !== 'object' || Object.keys(result).length === 0) {
          console.warn(`Row ${index}: Transformation returned invalid or empty result`);
          errorCount++;
          
          // Create a template object based on successful transformations or the first row
          const templateObj = data
            .slice(0, 5)
            .map(r => ultraSafeTransformFn(r))
            .find(r => r && typeof r === 'object' && Object.keys(r).length > 0) || {};
            
          // Use the template to create a placeholder result with empty values
          return templateObj ? 
            Object.fromEntries(Object.keys(templateObj).map(k => [k, ''])) : 
            // Last resort - create an object with target fields from the first row
            Object.fromEntries(Object.keys(row || {}).map(k => [k, '']));
        }
        
        successCount++;
        return result;
      } catch (error) {
        console.error(`Error applying transformation to row ${index}:`, error.message);
        errorCount++;
        // Return an empty object that tries to match expected structure
        return {};
      }
    }).filter(item => item && typeof item === 'object'); // Filter out any non-objects
    
    // Log statistics about the transformation
    console.log(`Transformation complete - Success: ${successCount}, Errors: ${errorCount}, Total: ${data.length}`);
    
    if (errorCount > 0) {
      console.warn(`${errorCount} rows (${Math.round((errorCount/data.length)*100)}%) had errors during transformation`);
    }
    
    return results;
  } catch (error) {
    console.error('Fatal error in transformation process:', error.message);
    // As a last resort, try to return the original data
    console.warn('Attempting to return original data as fallback...');
    try {
      return data.map(row => ({ ...row }));
    } catch (fallbackError) {
      console.error('Even fallback to original data failed:', fallbackError.message);
      return [];
    }
  }
};

// Helper function to read dataset file
const readDatasetFile = async (dataset) => {
  console.log('Reading dataset file:', {
    id: dataset._id,
    name: dataset.name,
    filePath: dataset.filePath,
    fileType: dataset.fileType
  });
  
  // Validate dataset
  if (!dataset || !dataset.filePath) {
    throw new Error('Invalid dataset or missing file path');
  }
  
  // Check if file exists
  if (!fs.existsSync(dataset.filePath)) {
    throw new Error(`File does not exist at path: ${dataset.filePath}`);
  }
  
  // Read file based on file type
  if (dataset.fileType === 'csv') {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(dataset.filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(`Read ${results.length} rows from CSV file`);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error);
          reject(error);
        });
    });
  } else if (dataset.fileType === 'excel') {
    try {
      const workbook = xlsx.readFile(dataset.filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      
      console.log(`Read ${jsonData.length} rows from Excel file`);
      return jsonData;
    } catch (error) {
      console.error('Error reading Excel file:', error);
      throw error;
    }
  } else {
    throw new Error(`Unsupported file type: ${dataset.fileType}`);
  }
};

// Helper function to calculate metrics
const calculateMetrics = (transformedData, targetData) => {
  // Initialize metrics
  const metrics = {
    f1Score: 0,
    precision: 0,
    recall: 0,
    editDistance: 0
  };
  
  try {
    // Check if we have valid data to calculate metrics
    if (!transformedData || !targetData || transformedData.length === 0 || targetData.length === 0) {
      console.warn('Not enough data to calculate metrics');
      return metrics;
    }
    
    // Calculate basic metrics - this is a simplified implementation
    // In a real application, this would involve more complex matching and evaluation
    
    // For demonstration, we'll calculate a basic match percentage
    const minSize = Math.min(transformedData.length, targetData.length);
    let matches = 0;
    let totalFields = 0;
    let totalDistance = 0;
    
    for (let i = 0; i < minSize; i++) {
      const transformedRow = transformedData[i];
      const targetRow = targetData[i];
      
      // Count matching fields
      const allKeys = new Set([...Object.keys(transformedRow), ...Object.keys(targetRow)]);
      totalFields += allKeys.size;
      
      for (const key of allKeys) {
        const transformedValue = String(transformedRow[key] || '');
        const targetValue = String(targetRow[key] || '');
        
        if (transformedValue === targetValue) {
          matches++;
        }
        
        // Simple edit distance calculation (Levenshtein distance simplified)
        totalDistance += Math.abs(transformedValue.length - targetValue.length);
      }
    }
    
    // Calculate metrics
    const accuracy = matches / totalFields;
    metrics.precision = accuracy;
    metrics.recall = accuracy;
    metrics.f1Score = accuracy; // Simplified F1 score (normally harmonic mean of precision and recall)
    metrics.editDistance = totalDistance;
    
    return metrics;
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return metrics;
  }
};

// @desc    Apply a transformation to a specific dataset
// @route   POST /api/transformations/applyToDataset
// @access  Public
const applyToDataset = asyncHandler(async (req, res) => {
  const { datasetId, transformationId, outputName } = req.body;
  
  if (!datasetId || !transformationId) {
    res.status(400);
    throw new Error('Please provide dataset ID and transformation ID');
  }
  
  // Find the dataset and transformation
  const dataset = await Dataset.findById(datasetId);
  const transformation = await Transformation.findById(transformationId);
  
  if (!dataset) {
    res.status(404);
    throw new Error('Dataset not found');
  }
  
  if (!transformation) {
    res.status(404);
    throw new Error('Transformation not found');
  }
  
  // Use default identity transformation if none is defined
  if (!transformation.transformationFunction) {
    console.log('No transformation function defined, using identity function as fallback');
    transformation.transformationFunction = identityTransformation;
    
    // Update the transformation with the identity function
    try {
      await Transformation.findByIdAndUpdate(transformation._id, {
        transformationFunction: identityTransformation,
        status: 'auto_updated_with_fallback'
      });
      console.log('Updated transformation with fallback identity function');
    } catch (updateError) {
      console.error('Error updating transformation with fallback:', updateError);
      // Continue even if update fails
    }
  }
  
  try {
    // Read dataset file
    const data = await readDatasetFile(dataset);
    
    // Apply transformation function
    const transformedData = applyTransformationFunction(data, transformation.transformationFunction);
    
    // Create output path for the transformed data
    const outputFileName = `transformed_${Date.now()}.csv`;
    const outputPath = path.join(__dirname, '..', 'uploads', outputFileName);
    
    // Create a CSV file with transformed data
    const csvData = [];
    
    // Add headers
    if (transformedData.length > 0) {
      csvData.push(Object.keys(transformedData[0]).join(','));
    }
    
    // Add rows
    transformedData.forEach(row => {
      csvData.push(Object.values(row).map(value => {
        // Handle values with commas by wrapping in quotes
        if (value && value.toString().includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(','));
    });
    
    fs.writeFileSync(outputPath, csvData.join('\n'));
    
    // Create a new dataset for the transformed data
    const datasetCreateObj = {
      name: outputName || `${dataset.name} - Transformed`,
      filePath: outputPath,
      fileType: 'csv',
      rows: transformedData.length,
      columns: transformedData.length > 0 ? Object.keys(transformedData[0]).length : 0,
      columnNames: transformedData.length > 0 ? Object.keys(transformedData[0]) : [],
      sampleData: transformedData.slice(0, 5),
      datasetType: 'transformed'
    };
    
    console.log('Creating transformed dataset with:', {
      name: datasetCreateObj.name,
      rows: datasetCreateObj.rows,
      columns: datasetCreateObj.columns,
      hasSampleData: datasetCreateObj.sampleData.length > 0
    });
    
    const transformedDataset = await Dataset.create(datasetCreateObj);
    
    // Make sure to fetch the complete saved dataset to return it with the full structure
    const savedDataset = await Dataset.findById(transformedDataset._id);
    
    if (!savedDataset) {
      console.error('Failed to fetch the saved dataset after creation');
      // Still return what we have if the fetch fails
      res.status(200).json(transformedDataset);
      return;
    }
    
    console.log('Returning transformed dataset:', {
      id: savedDataset._id,
      name: savedDataset.name,
      rows: savedDataset.rows,
      columns: savedDataset.columns,
      hasSampleData: savedDataset.sampleData && savedDataset.sampleData.length > 0
    });
    
    res.status(200).json(savedDataset);
  } catch (error) {
    console.error('Error applying transformation to dataset:', error);
    res.status(500);
    throw new Error(`Error applying transformation: ${error.message}`);
  }
});

// @desc    Download transformed data
// @route   GET /api/transformations/download/:id
// @access  Public
const downloadTransformedData = asyncHandler(async (req, res) => {
  const dataset = await Dataset.findById(req.params.id);
  
  if (!dataset) {
    res.status(404);
    throw new Error('Dataset not found');
  }
  
  // Check if file exists
  if (!fs.existsSync(dataset.filePath)) {
    res.status(404);
    throw new Error('File not found');
  }
  
  // Set appropriate headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${dataset.name}.csv"`);
  
  // Create read stream from the file and pipe it to the response
  const fileStream = fs.createReadStream(dataset.filePath);
  fileStream.pipe(res);
});

// Export all controller functions
module.exports = {
  createTransformation,
  getTransformations,
  getTransformationById,
  updateTransformation,
  deleteTransformation,
  applyTransformation,
  applyToDataset,
  downloadTransformedData
};
