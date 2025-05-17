import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowUpTrayIcon, ArrowDownTrayIcon, CheckIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { getTransformationById, uploadDataset, applyTransformationToDataset, downloadTransformedData } from '../services/datasetService';

const ApplyTransformation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dataFile, setDataFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transformationId, setTransformationId] = useState('');
  const [transformation, setTransformation] = useState(null);
  const [transformedDataId, setTransformedDataId] = useState(null);
  const [transformedData, setTransformedData] = useState(null);
  
  // Extract transformation ID from URL or state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setTransformationId(id);
      fetchTransformationDetails(id);
    } else if (location.state?.transformationId) {
      setTransformationId(location.state.transformationId);
      fetchTransformationDetails(location.state.transformationId);
    }
  }, [location]);
  
  // Fetch transformation details
  const fetchTransformationDetails = async (id) => {
    try {
      const data = await getTransformationById(id);
      console.log('Loaded transformation:', data);
      
      // Log transformation details
      console.log('Transformation details:', {
        id: data._id,
        name: data.name,
        hasFunctionDefined: !!data.transformationFunction
      });
      
      // If no transformation function, warn but don't block
      if (!data || !data.transformationFunction) {
        console.warn('No transformation function defined, using backend fallback');
        toast('No transformation function defined. A basic identity transformation will be used as fallback.');
      }
      
      setTransformation(data);
    } catch (error) {
      console.error('Error fetching transformation:', error);
      toast.error('Error loading transformation details: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Handle file drop
  const onFileDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Check if file is CSV or Excel
      if (!file.type.includes('csv') && !file.type.includes('excel') && !file.type.includes('sheet')) {
        toast.error('Please upload only CSV or Excel files');
        return;
      }
      
      setDataFile(file);
      toast.success(`File "${file.name}" ready for transformation`);
    }
  }, []);
  
  // File dropzone configuration
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({ 
    onDrop: onFileDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });
  
  // Handle file upload and transformation
  const handleTransform = async () => {
    if (!dataFile) {
      toast.error('Please upload a file to transform');
      return;
    }
    
    if (!transformationId) {
      toast.error('No transformation selected');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // First upload the file
      const formData = new FormData();
      formData.append('file', dataFile);
      formData.append('name', dataFile.name);
      formData.append('datasetType', 'target'); // Use 'target' as it's a valid enum value
      
      const uploadResponse = await uploadDataset(formData);
      const datasetId = uploadResponse._id;
      
      // Then apply the transformation
      setIsProcessing(true);
      toast.loading('Applying transformation...', { id: 'transform' });
      
      console.log('Applying transformation with params:', {
        datasetId,
        transformationId,
        outputName: `Transformed ${dataFile.name}`
      });
      
      const transformResponse = await applyTransformationToDataset({
        datasetId,
        transformationId,
        outputName: `Transformed ${dataFile.name}`
      });
      
      console.log('Transformation response:', transformResponse);
      
      if (!transformResponse || !transformResponse._id) {
        console.error('Invalid transformation response:', transformResponse);
        toast.error('Received invalid transformation result', { id: 'transform' });
        return;
      }
      
      toast.success('Transformation applied successfully!', { id: 'transform' });
      setTransformedDataId(transformResponse._id);
      setTransformedData(transformResponse);
      
      // Log the data that should be displayed
      console.log('Setting transformed data:', {
        id: transformResponse._id,
        name: transformResponse.name,
        columns: transformResponse.columns,
        rows: transformResponse.rows,
        hasSampleData: !!transformResponse.sampleData && transformResponse.sampleData.length > 0
      });
      
      // If there's no sample data to display, show a message but still allow download
      if (!transformResponse.sampleData || transformResponse.sampleData.length === 0) {
        console.warn('No sample data available in the transformed result');
        toast.info('Transformation completed, but no preview data is available. You can still download the results.');
      }
      
    } catch (error) {
      console.error('Error in transformation process:', error);
      toast.error('Error applying transformation: ' + (error.response?.data?.message || error.message), { id: 'transform' });
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };
  
  // Handle download of transformed data
  const handleDownload = async () => {
    if (!transformedDataId) {
      toast.error('No transformed data available to download');
      return;
    }
    
    try {
      await downloadTransformedData(transformedDataId);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Error downloading file');
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Apply Transformation</h1>
        <p className="mt-2 text-lg text-gray-600">
          Upload a dataset and apply the transformation function to get results.
        </p>
      </div>
      
      {transformation && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Transformation Details
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {transformation.name}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {transformation.transformationType}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date Created</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(transformation.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Upload Data to Transform
          </h3>
          <div className="mt-4">
            <div {...getRootProps()} className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'} border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors`}>
              <div className="space-y-1 text-center">
                <input {...getInputProps()} />
                {dataFile ? (
                  <>
                    <CheckIcon className="mx-auto h-12 w-12 text-green-500" />
                    <p className="text-sm font-medium text-gray-900">{dataFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(dataFile.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDataFile(null);
                      }}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      <XMarkIcon className="mr-1 h-4 w-4" />
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="text-base font-medium text-gray-900">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop your file here'}
                    </p>
                    <p className="text-sm text-gray-500">or click to browse files</p>
                    <p className="text-xs text-gray-400 mt-2">Supports CSV, XLS, XLSX</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-5">
            <button
              type="button"
              onClick={handleTransform}
              disabled={!dataFile || isUploading || isProcessing}
              className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${(!dataFile || isUploading || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? 'Uploading...' : isProcessing ? 'Processing...' : 'Apply Transformation'}
            </button>
          </div>
        </div>
      </div>
      
      {transformedData && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Transformation Results
            </h3>
            <div className="mt-5 sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <p className="mt-2 text-sm text-gray-500">
                  Your data has been transformed successfully. You can download the results below.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Download Results
                </button>
              </div>
            </div>
            
            {transformedData && (
              <div className="mt-8 flex flex-col">
                <div className="mt-2 mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Dataset Information</h4>
                  <p className="text-sm text-gray-600">Name: {transformedData.name}</p>
                  <p className="text-sm text-gray-600">Rows: {transformedData.rows || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">Columns: {transformedData.columns || 'Unknown'}</p>
                </div>
                
                {transformedData.sampleData && transformedData.sampleData.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Data Preview</h4>
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(transformedData.sampleData[0]).map((column, index) => (
                                  <th
                                    key={index}
                                    scope="col"
                                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                  >
                                    {column}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {transformedData.sampleData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {Object.keys(row).map((column, colIndex) => (
                                    <td
                                      key={colIndex}
                                      className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                                    >
                                      {typeof row[column] === 'object' ? JSON.stringify(row[column]) : String(row[column])}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">No preview available</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>The transformation was completed successfully, but no preview data is available. You can still download the complete results using the button above.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyTransformation;
