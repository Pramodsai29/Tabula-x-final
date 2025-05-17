import axios from 'axios';

// API base URL
const API_URL = '/api';

// Classify transformation type using Grok
export const classifyTransformation = async (sourceDatasetId, targetDatasetId) => {
  const response = await axios.post(`${API_URL}/grok/classify`, {
    sourceDatasetId,
    targetDatasetId
  });
  return response.data;
};

// Generate transformation function using Grok
export const generateTransformationFunction = async (sourceDatasetId, targetDatasetId, transformationType) => {
  const response = await axios.post(`${API_URL}/grok/generate`, {
    sourceDatasetId,
    targetDatasetId,
    transformationType
  });
  return response.data;
};

// Explain transformation logic using Grok
export const explainTransformation = async (transformationFunction) => {
  const response = await axios.post(`${API_URL}/grok/explain`, {
    transformationFunction
  });
  return response.data;
};
