import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowUpTrayIcon, CheckIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

// API service
import { uploadDataset, getSampleDatasets } from '../services/datasetService';

const UploadTables = () => {
  const navigate = useNavigate();
  const [sourceFile, setSourceFile] = useState(null);
  const [targetFile, setTargetFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sampleDatasets, setSampleDatasets] = useState([]);
  const [showSamples, setShowSamples] = useState(false);

  // Fetch sample datasets on mount
  useEffect(() => {
    const fetchSampleDatasets = async () => {
      try {
        const data = await getSampleDatasets();
        setSampleDatasets(data);
      } catch (error) {
        console.error('Error fetching sample datasets:', error);
      }
    };

    fetchSampleDatasets();
  }, []);

  // Source file dropzone
  const onSourceDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Check if file is CSV or Excel
      if (!file.type.includes('csv') && !file.type.includes('excel') && !file.type.includes('sheet')) {
        toast.error('Please upload only CSV or Excel files');
        return;
      }
      
      setSourceFile(file);
      toast.success(`Source file "${file.name}" ready for upload`);
    }
  }, []);

  // Target file dropzone
  const onTargetDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Check if file is CSV or Excel
      if (!file.type.includes('csv') && !file.type.includes('excel') && !file.type.includes('sheet')) {
        toast.error('Please upload only CSV or Excel files');
        return;
      }
      
      setTargetFile(file);
      toast.success(`Target file "${file.name}" ready for upload`);
    }
  }, []);

  // Source dropzone configuration
  const {
    getRootProps: getSourceRootProps,
    getInputProps: getSourceInputProps,
    isDragActive: isSourceDragActive
  } = useDropzone({ 
    onDrop: onSourceDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  // Target dropzone configuration
  const {
    getRootProps: getTargetRootProps,
    getInputProps: getTargetInputProps,
    isDragActive: isTargetDragActive
  } = useDropzone({ 
    onDrop: onTargetDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  // Handle file upload
  const handleUpload = async () => {
    if (!sourceFile || !targetFile) {
      toast.error('Please upload both source and target files');
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload source file
      const sourceFormData = new FormData();
      sourceFormData.append('file', sourceFile);
      sourceFormData.append('name', sourceFile.name);
      sourceFormData.append('datasetType', 'source');
      
      const sourceResponse = await uploadDataset(sourceFormData);
      
      // Upload target file
      const targetFormData = new FormData();
      targetFormData.append('file', targetFile);
      targetFormData.append('name', targetFile.name);
      targetFormData.append('datasetType', 'target');
      
      const targetResponse = await uploadDataset(targetFormData);
      
      toast.success('Files uploaded successfully!');
      
      // Navigate to transformation analysis with source and target IDs
      navigate(`/transform?source=${sourceResponse._id}&target=${targetResponse._id}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading files: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle using sample datasets
  const handleUseSamples = () => {
    setShowSamples(!showSamples);
  };

  // Handle selecting a sample dataset pair
  const handleSelectSample = async (sourceId, targetId) => {
    navigate(`/transform?source=${sourceId}&target=${targetId}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Upload Your Tables</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Upload your source and target tables to analyze and generate transformations between them.
          We support CSV and Excel formats.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Source File Upload */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Source Table</h2>
          <div
            {...getSourceRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition duration-150
              ${isSourceDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
              ${sourceFile ? 'bg-green-50 border-green-300' : ''}
            `}
          >
            <input {...getSourceInputProps()} />
            <div className="space-y-2">
              {sourceFile ? (
                <>
                  <CheckIcon className="h-12 w-12 mx-auto text-green-500" />
                  <p className="text-sm font-medium text-gray-900">{sourceFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(sourceFile.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSourceFile(null);
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
                    {isSourceDragActive ? 'Drop the file here' : 'Drag & drop your source file here'}
                  </p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                  <p className="text-xs text-gray-400 mt-2">Supports CSV, XLS, XLSX</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Target File Upload */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Target Table</h2>
          <div
            {...getTargetRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition duration-150
              ${isTargetDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
              ${targetFile ? 'bg-green-50 border-green-300' : ''}
            `}
          >
            <input {...getTargetInputProps()} />
            <div className="space-y-2">
              {targetFile ? (
                <>
                  <CheckIcon className="h-12 w-12 mx-auto text-green-500" />
                  <p className="text-sm font-medium text-gray-900">{targetFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(targetFile.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetFile(null);
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
                    {isTargetDragActive ? 'Drop the file here' : 'Drag & drop your target file here'}
                  </p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                  <p className="text-xs text-gray-400 mt-2">Supports CSV, XLS, XLSX</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
        <button
          onClick={handleUpload}
          disabled={!sourceFile || !targetFile || isUploading}
          className={`btn-primary ${(!sourceFile || !targetFile || isUploading) && 'opacity-50 cursor-not-allowed'}`}
        >
          {isUploading ? 'Uploading...' : 'Upload and Continue'}
        </button>
        
        <button
          onClick={handleUseSamples}
          className="btn-secondary"
        >
          {showSamples ? 'Hide Samples' : 'Try with Sample Datasets'}
        </button>
      </div>

      {/* Sample Datasets Section */}
      {showSamples && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Datasets</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {sampleDatasets.length > 0 ? (
                sampleDatasets.map((sample) => (
                  <li key={sample.id}>
                    <button
                      onClick={() => handleSelectSample(sample.sourceId, sample.targetId)}
                      className="block hover:bg-gray-50 w-full text-left"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-sm font-medium text-primary-600 truncate">{sample.name}</p>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {sample.description}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {sample.transformationType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-5 sm:px-6">
                  <p className="text-sm text-gray-500">No sample datasets available.</p>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTables;
