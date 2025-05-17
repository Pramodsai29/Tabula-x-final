import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowPathIcon, 
  ChartBarIcon, 
  ArrowDownTrayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  getTransformationById, 
  joinDatasets, 
  getJoinById,
  getFuzzyMatchOptions,
  downloadDataset
} from '../services/datasetService';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const JoinResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [transformation, setTransformation] = useState(null);
  const [sourceDataset, setSourceDataset] = useState(null);
  const [targetDataset, setTargetDataset] = useState(null);
  const [joinedDataset, setJoinedDataset] = useState(null);
  const [matchType, setMatchType] = useState('exact'); // 'exact' or 'fuzzy'
  const [matchColumns, setMatchColumns] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [fuzzyOptions, setFuzzyOptions] = useState(null);
  const [selectedFuzzyAlgorithm, setSelectedFuzzyAlgorithm] = useState('');
  const [selectedThreshold, setSelectedThreshold] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinStats, setJoinStats] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Load transformation and datasets
  useEffect(() => {
    const loadData = async () => {
      try {
        // If no ID provided, redirect to upload
        if (!id) {
          toast.error('No transformation selected');
          navigate('/upload');
          return;
        }
        
        // Load transformation
        const transformationData = await getTransformationById(id);
        setTransformation(transformationData);
        
        // Load source and target datasets
        setSourceDataset(transformationData.sourceTable);
        setTargetDataset(transformationData.targetTable);
        
        // Set available columns from source dataset
        if (transformationData.sourceTable.columnNames) {
          setAvailableColumns(transformationData.sourceTable.columnNames);
          
          // Default to first column for matching if available
          if (transformationData.sourceTable.columnNames.length > 0) {
            setMatchColumns([transformationData.sourceTable.columnNames[0]]);
          }
        }
        
        // Load fuzzy matching options
        const options = await getFuzzyMatchOptions();
        setFuzzyOptions(options);
        
        if (options.algorithms.length > 0) {
          setSelectedFuzzyAlgorithm(options.algorithms[0].id);
        }
        
        if (options.thresholds.length > 0) {
          setSelectedThreshold(options.thresholds[1].id); // Medium threshold by default
        }
        
        // Check if this transformation already has a joined dataset
        try {
          const joinResult = await getJoinById(id);
          if (joinResult) {
            setJoinedDataset(joinResult.dataset);
            setJoinStats(joinResult.stats);
            setPreviewData(joinResult.dataset.sampleData || []);
          }
        } catch (error) {
          // No existing join found, which is fine
          console.log('No existing join found');
        }
      } catch (error) {
        console.error('Error loading transformation:', error);
        toast.error('Failed to load transformation: ' + (error.response?.data?.message || error.message));
        navigate('/upload');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate]);
  
  // Handle join operation
  const handleJoinData = async () => {
    if (!transformation || !transformation._id || !transformation.transformationFunction) {
      toast.error('Transformation function is required');
      return;
    }
    
    if (matchColumns.length === 0) {
      toast.error('Please select at least one column for matching');
      return;
    }
    
    setJoining(true);
    
    try {
      const joinData = {
        sourceDatasetId: sourceDataset._id,
        targetDatasetId: targetDataset._id,
        transformationFunction: transformation.transformationFunction,
        matchType,
        matchColumns,
        outputName: `${sourceDataset.name} joined with ${targetDataset.name}`
      };
      
      // Add fuzzy matching parameters if using fuzzy match
      if (matchType === 'fuzzy') {
        joinData.fuzzyAlgorithm = selectedFuzzyAlgorithm;
        joinData.threshold = selectedThreshold;
      }
      
      const result = await joinDatasets(joinData);
      
      setJoinedDataset(result.dataset);
      setJoinStats(result.stats);
      setPreviewData(result.dataset.sampleData || []);
      
      toast.success('Data joined successfully!');
    } catch (error) {
      console.error('Error joining data:', error);
      toast.error('Error joining data: ' + (error.response?.data?.message || error.message));
    } finally {
      setJoining(false);
    }
  };
  
  // Handle column selection for matching
  const handleColumnSelect = (column) => {
    if (matchColumns.includes(column)) {
      setMatchColumns(matchColumns.filter(col => col !== column));
    } else {
      setMatchColumns([...matchColumns, column]);
    }
  };
  
  // Handle download joined dataset
  const handleDownload = async () => {
    if (!joinedDataset || !joinedDataset._id) {
      toast.error('No joined dataset to download');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      await downloadDataset(joinedDataset._id);
      toast.success('Dataset downloaded successfully');
    } catch (error) {
      console.error('Error downloading dataset:', error);
      toast.error('Error downloading dataset: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <ArrowPathIcon className="h-12 w-12 mx-auto animate-spin text-primary-500" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">Loading join data...</h2>
      </div>
    );
  }
  
  // Prepare chart data for match statistics
  const matchChartData = {
    labels: ['Matched', 'Unmatched'],
    datasets: [
      {
        data: joinStats ? [joinStats.matched, joinStats.unmatched] : [0, 0],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#047857', '#B91C1C'],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare chart data for match rate
  const metricsChartData = {
    labels: ['Precision', 'Recall', 'F1 Score', 'Match Rate'],
    datasets: [
      {
        label: 'Metrics',
        data: joinStats 
          ? [
              joinStats.precision * 100 || 0, 
              joinStats.recall * 100 || 0, 
              joinStats.f1Score * 100 || 0,
              joinStats.matchRate * 100 || 0
            ]
          : [0, 0, 0, 0],
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Join Results</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
          Apply the transformation to your source data and join with target data using exact or fuzzy matching.
        </p>
      </div>
      
      {/* Transformation Summary */}
      {transformation && (
        <div className="card mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transformation Summary</h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{transformation.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {transformation.transformationType}
                </span>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transformation.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : transformation.status === 'processing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : transformation.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {transformation.status}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      )}
      
      {/* Join Configuration */}
      <div className="card mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Join Configuration</h2>
        
        {/* Match Type Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-2">Match Type</label>
          <div className="flex space-x-4">
            <div 
              className={`cursor-pointer rounded-lg border p-4 transition-all flex-1 ${
                matchType === 'exact'
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}
              onClick={() => setMatchType('exact')}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Exact Match</h3>
                  <p className="mt-1 text-sm text-gray-500">Match rows using exact equality on selected columns</p>
                </div>
                {matchType === 'exact' && <CheckCircleIcon className="h-5 w-5 text-primary-500" />}
              </div>
            </div>
            
            <div 
              className={`cursor-pointer rounded-lg border p-4 transition-all flex-1 ${
                matchType === 'fuzzy'
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}
              onClick={() => setMatchType('fuzzy')}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Fuzzy Match</h3>
                  <p className="mt-1 text-sm text-gray-500">Match rows using similarity algorithms on selected columns</p>
                </div>
                {matchType === 'fuzzy' && <CheckCircleIcon className="h-5 w-5 text-primary-500" />}
              </div>
            </div>
          </div>
        </div>
        
        {/* Fuzzy Match Options (if fuzzy selected) */}
        {matchType === 'fuzzy' && fuzzyOptions && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
            {/* Algorithm Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Fuzzy Matching Algorithm
              </label>
              <select
                value={selectedFuzzyAlgorithm}
                onChange={(e) => setSelectedFuzzyAlgorithm(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {fuzzyOptions.algorithms.map((algorithm) => (
                  <option key={algorithm.id} value={algorithm.id}>
                    {algorithm.name} - {algorithm.description}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Threshold Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Match Threshold
              </label>
              <select
                value={selectedThreshold}
                onChange={(e) => setSelectedThreshold(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {fuzzyOptions.thresholds.map((threshold) => (
                  <option key={threshold.id} value={threshold.id}>
                    {threshold.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {/* Column Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Match Columns (Select at least one)
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {availableColumns.map((column) => (
              <div 
                key={column}
                onClick={() => handleColumnSelect(column)}
                className={`cursor-pointer rounded-lg border p-2 transition-all text-center ${
                  matchColumns.includes(column)
                    ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <span className="text-sm font-medium">
                  {column}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Join Button */}
        <button
          onClick={handleJoinData}
          disabled={joining || matchColumns.length === 0}
          className={`btn-primary ${(joining || matchColumns.length === 0) && 'opacity-50 cursor-not-allowed'}`}
        >
          {joining ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Joining Data...
            </>
          ) : (
            'Apply Transformation & Join Data'
          )}
        </button>
      </div>
      
      {/* Results Section (shown only after join) */}
      {joinedDataset && (
        <div className="space-y-10">
          {/* Stats and Charts */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Join Statistics</h2>
            
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
              <div className="bg-primary-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-primary-900">Total Rows</dt>
                <dd className="mt-1 text-2xl font-semibold text-primary-700">
                  {joinedDataset.rows || 0}
                </dd>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-green-900">Matched</dt>
                <dd className="mt-1 text-2xl font-semibold text-green-700">
                  {joinStats?.matched || 0}
                </dd>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-red-900">Unmatched</dt>
                <dd className="mt-1 text-2xl font-semibold text-red-700">
                  {joinStats?.unmatched || 0}
                </dd>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-yellow-900">Match Rate</dt>
                <dd className="mt-1 text-2xl font-semibold text-yellow-700">
                  {joinStats?.matchRate ? (joinStats.matchRate * 100).toFixed(1) + '%' : '0%'}
                </dd>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="h-64 p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Match Distribution</h3>
                <div className="h-44">
                  <Pie data={matchChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
              
              <div className="h-64 p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Match Metrics</h3>
                <div className="h-44">
                  <Bar 
                    data={metricsChartData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: 'Percentage (%)'
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Preview Data */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Data Preview</h2>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn-secondary"
              >
                {isDownloading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download CSV
                  </>
                )}
              </button>
            </div>
            
            {/* Data table */}
            <div className="overflow-x-auto">
              {previewData.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th
                          key={key}
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.entries(row).map(([key, value], cellIndex) => (
                          <td
                            key={`${rowIndex}-${cellIndex}`}
                            className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm ${
                              key === '__matchStatus' 
                                ? value === 'matched' ? 'text-green-600' : 'text-red-600'
                                : 'text-gray-900'
                            }`}
                          >
                            {value !== null && value !== undefined ? String(value) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-4 text-gray-500">No preview data available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinResults;
