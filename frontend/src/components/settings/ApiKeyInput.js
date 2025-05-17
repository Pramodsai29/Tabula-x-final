import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const ApiKeyInput = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Check local storage on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
      onApiKeyChange(savedKey);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey);
      setIsSaved(true);
      onApiKeyChange(apiKey);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setIsSaved(false);
    onApiKeyChange('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">OpenAI API Settings</h3>
      <div className="mt-4">
        <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
          OpenAI API Key
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type={showApiKey ? 'text' : 'password'}
            id="api-key"
            className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter your OpenAI API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
            onClick={() => setShowApiKey(!showApiKey)}
          >
            {showApiKey ? (
              <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <EyeIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="mt-4 flex space-x-3">
          <button
            type="button"
            onClick={handleSaveApiKey}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Save API Key
          </button>
          <button
            type="button"
            onClick={handleClearApiKey}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Clear API Key
          </button>
        </div>
        {isSaved && (
          <div className="mt-2 text-sm text-green-600">
            ✓ API key saved locally (never sent to our servers)
          </div>
        )}
        <div className="mt-3 text-xs text-gray-500">
          Your API key is stored only in your browser's local storage and is never sent to our servers except when making API calls to OpenAI.
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;
