import axios from 'axios';

// API base URL
const API_URL = '/api';

// Upload a new dataset
export const uploadDataset = async (formData) => {
  const response = await axios.post(`${API_URL}/uploads`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Get all datasets
export const getDatasets = async (type) => {
  const response = await axios.get(`${API_URL}/uploads`, {
    params: { type }
  });
  return response.data;
};

// Get dataset by ID
export const getDatasetById = async (id) => {
  const response = await axios.get(`${API_URL}/uploads/${id}`);
  return response.data;
};

// Delete dataset
export const deleteDataset = async (id) => {
  const response = await axios.delete(`${API_URL}/uploads/${id}`);
  return response.data;
};

// Get sample datasets
export const getSampleDatasets = async () => {
  try {
    // Call our new dedicated endpoint for sample datasets
    const response = await axios.get(`${API_URL}/samples`);
    return response.data;
  } catch (error) {
    console.error('Error loading sample datasets:', error);
    // Return an empty array rather than hardcoded datasets with string IDs
    // This prevents the ObjectId casting errors
    return [];
  }
};

// Create a new transformation
export const createTransformation = async (transformationData) => {
  const response = await axios.post(`${API_URL}/transformations`, transformationData);
  return response.data;
};

// Get all transformations
export const getTransformations = async () => {
  const response = await axios.get(`${API_URL}/transformations`);
  return response.data;
};

// Get transformation by ID
export const getTransformationById = async (id) => {
  const response = await axios.get(`${API_URL}/transformations/${id}`);
  return response.data;
};

// Update transformation
export const updateTransformation = async (id, transformationData) => {
  const response = await axios.put(`${API_URL}/transformations/${id}`, transformationData);
  return response.data;
};

// Delete transformation
export const deleteTransformation = async (id) => {
  const response = await axios.delete(`${API_URL}/transformations/${id}`);
  return response.data;
};

// Apply transformation to a specific dataset
export const applyTransformationToDataset = async (data) => {
  const response = await axios.post(`${API_URL}/transformations/applyToDataset`, data);
  return response.data;
};

// Download transformed data
export const downloadTransformedData = async (id) => {
  const response = await axios.get(`${API_URL}/transformations/download/${id}`, {
    responseType: 'blob'
  });
  
  // Create a URL for the blob and trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `transformed-data-${id}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  return true;
};

// Join datasets
export const joinDatasets = async (joinData) => {
  const response = await axios.post(`${API_URL}/jointools/join`, joinData);
  return response.data;
};

// Get join by ID
export const getJoinById = async (id) => {
  const response = await axios.get(`${API_URL}/jointools/${id}`);
  return response.data;
};

// Get fuzzy match options
export const getFuzzyMatchOptions = async () => {
  try {
    const response = await axios.get(`${API_URL}/jointools/fuzzy-options`);
    return response.data;
  } catch (error) {
    // If endpoint not implemented, return some hardcoded options
    console.warn('Fuzzy options endpoint not implemented, returning mock data');
    return {
      algorithms: [
        { id: 'levenshtein', name: 'Levenshtein Distance', description: 'Calculates the minimum number of single-character edits' },
        { id: 'jaroWinkler', name: 'Jaro-Winkler', description: 'Measures string similarity by character matching and transpositions' },
        { id: 'soundex', name: 'Soundex', description: 'Phonetic algorithm for indexing names by sound' }
      ],
      thresholds: [
        { id: 'strict', value: 0.9, name: 'Strict (90%)' },
        { id: 'moderate', value: 0.7, name: 'Moderate (70%)' },
        { id: 'relaxed', value: 0.5, name: 'Relaxed (50%)' }
      ]
    };
  }
};

// Download dataset
export const downloadDataset = async (id) => {
  const response = await axios.get(`${API_URL}/uploads/${id}/download`, {
    responseType: 'blob'
  });
  
  // Create a URL for the blob and trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `dataset-${id}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  return true;
};
