import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Editor } from '@monaco-editor/react';
import { 
  ArrowPathIcon, 
  CodeBracketIcon, 
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  PlayIcon,
  LightBulbIcon,
  KeyIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import PrebuiltTransformations from '../components/PrebuiltTransformations';

// Services imports
import { 
  getDatasetById, 
  createTransformation, 
  getTransformationById, 
  updateTransformation 
} from '../services/datasetService';
import { 
  classifyTransformation, 
  generateTransformationFunction, 
  explainTransformation 
} from '../services/llmService';

const transformationTypes = [
  { id: 'String-based', name: 'String-based', description: 'Text operations like concatenation, substring, etc.' },
  { id: 'Numerical', name: 'Numerical', description: 'Mathematical operations and formulas' },
  { id: 'Algorithmic', name: 'Algorithmic', description: 'Complex logic and conditional transformations' },
  { id: 'General', name: 'General', description: 'Mixed or other types of transformations' },
];

const TransformationAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  // Get source and target IDs from URL params
  const searchParams = new URLSearchParams(location.search);
  const sourceId = searchParams.get('source');
  const targetId = searchParams.get('target');
  
  // State variables
  const [sourceDataset, setSourceDataset] = useState(null);
  const [targetDataset, setTargetDataset] = useState(null);
  const [transformation, setTransformation] = useState(null);
  const [transformationType, setTransformationType] = useState('');
  const [isTypeLoading, setIsTypeLoading] = useState(false);
  const [transformationFunction, setTransformationFunction] = useState('');
  const [isFunctionLoading, setIsFunctionLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [samplePairs, setSamplePairs] = useState([]);
  
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [id, sourceId, targetId]);
  
  const loadData = async () => {
    try {
      // If transformation ID is provided, load existing transformation
      if (id) {
        const transformationData = await getTransformationById(id);
        setTransformation(transformationData);
        
        // Load related datasets
        const sourceData = await getDatasetById(transformationData.sourceTable);
        const targetData = await getDatasetById(transformationData.targetTable);
        
        setSourceDataset(sourceData);
        setTargetDataset(targetData);
        setTransformationType(transformationData.transformationType);
        setTransformationFunction(transformationData.transformationFunction || '');
        
        // Create sample pairs
        createSamplePairs(sourceData.sampleData, targetData.sampleData);
      } 
      // Otherwise load from source and target IDs
      else if (sourceId && targetId) {
        const sourceData = await getDatasetById(sourceId);
        const targetData = await getDatasetById(targetId);
        
        setSourceDataset(sourceData);
        setTargetDataset(targetData);
        
        // Create sample pairs
        createSamplePairs(sourceData.sampleData, targetData.sampleData);
        
        // Check if transformation already exists for these datasets
        try {
          // This API endpoint would need to be implemented on the backend
          const response = await axios.get(`/api/transformations/find?sourceId=${sourceId}&targetId=${targetId}`);
          if (response.data) {
            setTransformation(response.data);
            setTransformationType(response.data.transformationType);
            setTransformationFunction(response.data.transformationFunction || '');
          }
        } catch (error) {
          // If no transformation exists, that's ok
          console.log('No existing transformation found, creating a new one');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading data: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Create sample pairs for display
  const createSamplePairs = (sourceSamples, targetSamples) => {
    if (!sourceSamples || !targetSamples) return;
    
    const pairs = [];
    const minCount = Math.min(sourceSamples.length, targetSamples.length);
    
    for (let i = 0; i < minCount; i++) {
      pairs.push({ source: sourceSamples[i], target: targetSamples[i] });
    }
    
    setSamplePairs(pairs);
  };
  
  // Classify transformation type using LLM
  const handleClassifyTransformation = async () => {
    if (isTypeLoading) return;
    
    // Validate datasets exist and have IDs
    if (!sourceDataset || !sourceDataset._id) {
      toast.error('Source dataset information is missing or invalid');
      return;
    }
    
    if (!targetDataset || !targetDataset._id) {
      toast.error('Target dataset information is missing or invalid');
      return;
    }
    
    setIsTypeLoading(true);
    
    try {
      // Log the dataset IDs for debugging
      console.log('Classifying transformation with dataset IDs:', {
        sourceId: sourceDataset._id,
        targetId: targetDataset._id
      });
      
      const result = await classifyTransformation({
        sourceDatasetId: sourceDataset._id,
        targetDatasetId: targetDataset._id
      });
      
      setTransformationType(result.type);
      
      // Show success message with classification result
      toast.success(`Classified as: ${result.type} transformation`);
    } catch (error) {
      console.error('Error classifying transformation:', error);
      toast.error('Error classifying transformation: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsTypeLoading(false);
    }
  };
  
  // Generate transformation function using LLM
  const handleGenerateFunction = async () => {
    if (isFunctionLoading || !transformationType) return;
    
    // Validate datasets exist and have IDs
    if (!sourceDataset || !sourceDataset._id) {
      toast.error('Source dataset information is missing or invalid');
      return;
    }
    
    if (!targetDataset || !targetDataset._id) {
      toast.error('Target dataset information is missing or invalid');
      return;
    }
    
    setIsFunctionLoading(true);
    setTransformationFunction('');
    
    try {
      // Log the parameters for debugging
      console.log('Generating function with params:', {
        sourceId: sourceDataset._id,
        targetId: targetDataset._id,
        type: transformationType
      });
      
      const result = await generateTransformationFunction({
        sourceDatasetId: sourceDataset._id,
        targetDatasetId: targetDataset._id,
        transformationType
      });
      
      setTransformationFunction(result.function);
      
      // If explanation is provided, set it
      if (result.explanation) {
        setExplanation(result.explanation);
      }
      
      toast.success('Transformation function generated');
    } catch (error) {
      console.error('Error generating function:', error);
      toast.error('Error generating function: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsFunctionLoading(false);
    }
  };
  
  // Explain the transformation function using LLM
  const handleExplainFunction = async (functionText = null) => {
    if (isExplanationLoading) return;
    
    // Make sure we have dataset IDs
    if (!sourceDataset || !sourceDataset._id || !targetDataset || !targetDataset._id) {
      toast.error('Missing dataset information. Please reload the page.');
      return;
    }
    
    const funcToExplain = functionText || transformationFunction;
    if (!funcToExplain) {
      toast.error('No transformation function to explain');
      return;
    }
    
    setIsExplanationLoading(true);
    
    try {
      console.log('Sending explanation request with IDs:', {
        sourceId: sourceDataset._id,
        targetId: targetDataset._id
      });
      
      const result = await explainTransformation({
        sourceDatasetId: sourceDataset._id,
        targetDatasetId: targetDataset._id,
        transformationFunction: funcToExplain
      });
      
      setExplanation(result.explanation);
      
      toast.success('Explanation generated');
    } catch (error) {
      console.error('Error generating explanation:', error);
      toast.error('Error generating explanation: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsExplanationLoading(false);
    }
  };
  
  // Handle saving the transformation
  const handleSaveTransformation = async () => {
    if (saving || !transformationType || !transformationFunction) return;
    
    setSaving(true);
    
    try {
      let result;
      
      // Create or update transformation based on whether it already exists
      if (transformation && transformation._id) {
        // Update
        result = await updateTransformation(transformation._id, {
          transformationType,
          transformationFunction,
        });
        
        setTransformation(result);
        toast.success('Transformation updated successfully');
      } else {
        // Create
        const transformationName = `${sourceDataset.name} to ${targetDataset.name}`;
        result = await createTransformation({
          name: transformationName,
          sourceTableId: sourceDataset._id,
          targetTableId: targetDataset._id,
          transformationType,
        });
        
        // After creating the transformation, update it with the function
        if (result && result._id && transformationFunction) {
          result = await updateTransformation(result._id, {
            transformationFunction,
          });      
        }
        
        setTransformation(result);
        toast.success('Transformation saved successfully');
      }
    } catch (error) {
      console.error('Error saving transformation:', error);
      toast.error('Error saving transformation');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle applying the transformation
  const handleApplyTransformation = () => {
    if (!transformation || !transformation._id) return;
    
    // Navigate to the apply transformation page with the correct URL format
    navigate(`/apply?id=${transformation._id}`);
  };
  
  // Editor change handler
  const handleEditorChange = (value) => {
    setTransformationFunction(value);
  };
  
  // Handle selecting a pre-built transformation
  const handleSelectPrebuiltTransformation = (code) => {
    setTransformationFunction(code);
    // Optionally explain the pre-built transformation
    handleExplainFunction(code);
  };
  
  // Loading state
  if (!sourceDataset || !targetDataset) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <ArrowPathIcon className="h-12 w-12 mx-auto animate-spin text-primary-500" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">Loading transformation data...</h2>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transformation Analysis</h1>
        <p className="mt-2 text-gray-600">
          Analyze and generate transformation functions between two datasets
        </p>
        
        {/* LLM Provider Indicator */}
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <KeyIcon className="h-4 w-4 mr-1" />
          <p className="text-sm text-blue-800">
            Using <span className="font-semibold">OpenAI</span> as the LLM provider for generating transformations.
          </p>
        </div>
      </div>
      
      {/* Datasets Summary */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mb-10">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Source Dataset: {sourceDataset.name}</h2>
          <div className="mt-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Rows</dt>
                <dd className="mt-1 text-sm text-gray-900">{sourceDataset.rows || 'Unknown'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Columns</dt>
                <dd className="mt-1 text-sm text-gray-900">{sourceDataset.columns || 'Unknown'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Column Names</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-2">
                    {sourceDataset.columnNames && sourceDataset.columnNames.map((col, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Target Dataset: {targetDataset.name}</h2>
          <div className="mt-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Rows</dt>
                <dd className="mt-1 text-sm text-gray-900">{targetDataset.rows || 'Unknown'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Columns</dt>
                <dd className="mt-1 text-sm text-gray-900">{targetDataset.columns || 'Unknown'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Column Names</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-2">
                    {targetDataset.columnNames && targetDataset.columnNames.map((col, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Data Samples */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Sample Data Comparison</h2>
        <div className="overflow-x-auto">
          {samplePairs.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 w-1/2">
                    Source Data
                  </th>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 w-1/2">
                    Target Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {samplePairs.map((pair, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-500 sm:pl-6">
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(pair.source, null, 2)}</pre>
                    </td>
                    <td className="p-3 text-sm text-gray-500 sm:pl-6">
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(pair.target, null, 2)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-6 text-gray-500">
              No sample data available.
            </div>
          )}
        </div>
      </div>
      
      {/* Transformation Type */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Transformation Type</h2>
          <button
            onClick={handleClassifyTransformation}
            disabled={isTypeLoading}
            className="btn-secondary"
          >
            {isTypeLoading ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Classifying...
              </>
            ) : (
              <>
                <DocumentMagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Classify Automatically
              </>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {transformationTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => setTransformationType(type.id)}
              className={`cursor-pointer border rounded-lg p-4 transition duration-150 ${
                transformationType === type.id
                  ? 'bg-primary-50 border-primary-500 shadow-sm'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {transformationType === type.id && (
                    <CheckCircleIcon className="h-5 w-5 text-primary-500" />
                  )}
                </div>
                <div className="ml-2">
                  <h3 className="text-sm font-medium text-gray-900">{type.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Transformation Function */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Transformation Function</h2>
          <button
            onClick={handleGenerateFunction}
            disabled={isFunctionLoading || !transformationType}
            className={`btn-secondary ${(!transformationType || isFunctionLoading) && 'opacity-50 cursor-not-allowed'}`}
          >
            {isFunctionLoading ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <CodeBracketIcon className="h-4 w-4 mr-2" />
                Generate Function
              </>
            )}
          </button>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="border rounded-lg h-64">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={transformationFunction}
              onChange={handleEditorChange}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
        
        {/* Explanation */}
        {explanation && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-medium text-gray-900 mb-2">Explanation:</h3>
            <p className="text-sm text-gray-700">{explanation}</p>
          </div>
        )}
        
        {/* Loading explanation */}
        {isExplanationLoading && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin text-gray-500" />
              <span className="text-sm text-gray-500">Generating explanation...</span>
            </div>
          </div>
        )}
        
        {/* Explain button */}
        {transformationFunction && !explanation && !isExplanationLoading && (
          <button
            onClick={() => handleExplainFunction()}
            className="mt-4 text-sm text-primary-600 hover:text-primary-500"
          >
            Explain this transformation
          </button>
        )}
        
        {/* Pre-built Transformations Section */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-center">
            <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Need a reliable transformation?</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            If the generated transformation isn't working well, try one of these pre-built options for common scenarios:
          </p>
          <PrebuiltTransformations onSelect={handleSelectPrebuiltTransformation} />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <button
          onClick={handleSaveTransformation}
          disabled={saving || !transformationType || !transformationFunction}
          className={`btn-primary mb-4 sm:mb-0 ${
            (saving || !transformationType || !transformationFunction) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving...' : transformation ? 'Update Transformation' : 'Save Transformation'}
        </button>
        
        <button
          onClick={handleApplyTransformation}
          disabled={!transformation || !transformation._id}
          className={`btn-secondary ${(!transformation || !transformation._id) && 'opacity-50 cursor-not-allowed'}`}
        >
          <PlayIcon className="h-4 w-4 mr-2" />
          Apply Transformation to New Data
        </button>
      </div>
    </div>
  );
};

export default TransformationAnalysis;
