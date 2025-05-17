import axios from 'axios';

// API base URL
const API_URL = '/api';

// Classify transformation type using LLM
export const classifyTransformation = async (params) => {
  try {
    // Ensure we have the required parameters
    if (!params.sourceDatasetId || !params.targetDatasetId) {
      throw new Error('Please provide source and target dataset IDs');
    }
    
    // Log the parameters for debugging
    console.log('Classifying transformation with params:', {
      sourceId: params.sourceDatasetId,
      targetId: params.targetDatasetId
    });
    
    const response = await axios.post(`${API_URL}/llm/classify`, {
      sourceDatasetId: params.sourceDatasetId,
      targetDatasetId: params.targetDatasetId
    });
    
    return response.data;
  } catch (error) {
    console.error('Error classifying transformation:', error);
    throw error;
  }
};

// Generate transformation function using LLM
export const generateTransformationFunction = async (params) => {
  try {
    // Ensure we have the required parameters
    if (!params.sourceDatasetId || !params.targetDatasetId) {
      throw new Error('Please provide source and target dataset IDs');
    }
    
    if (!params.transformationType) {
      throw new Error('Please provide a transformation type');
    }
    
    // Log the parameters for debugging
    console.log('Generating transformation function with params:', {
      sourceId: params.sourceDatasetId,
      targetId: params.targetDatasetId,
      type: params.transformationType
    });
    
    const response = await axios.post(`${API_URL}/llm/generate`, {
      sourceDatasetId: params.sourceDatasetId,
      targetDatasetId: params.targetDatasetId,
      transformationType: params.transformationType
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating transformation function:', error);
    throw error;
  }
};

// Explain transformation logic using LLM
export const explainTransformation = async (params) => {
  try {
    // Ensure we have the required parameters
    if (!params.sourceDatasetId || !params.targetDatasetId) {
      throw new Error('Please provide source and target dataset IDs');
    }
    
    // Pass the correct parameters to the API
    const response = await axios.post(`${API_URL}/llm/explain`, {
      sourceDatasetId: params.sourceDatasetId,
      targetDatasetId: params.targetDatasetId,
      transformationFunction: params.transformationFunction
    });
    
    return response.data;
  } catch (error) {
    console.error('Error explaining transformation:', error);
    throw error;
  }
};
