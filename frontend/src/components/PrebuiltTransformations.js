import React from 'react';
import { 
  hijriToGregorianTransformation,
  gregorianToHijriTransformation,
  numericUnitConversion,
  stringFormatTransformation,
  dataCleaningTransformation
} from '../utils/prebuiltTransformations';

// Component for selecting and using pre-built transformation functions
const PrebuiltTransformations = ({ onSelect }) => {
  const handleSelectTransformation = (transformationCode) => {
    if (onSelect && typeof onSelect === 'function') {
      onSelect(transformationCode);
    }
  };

  return (
    <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Pre-built Transformation Functions
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Use these reliable transformations for common conversion scenarios
        </p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Hijri to Gregorian Date Conversion</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              Converts Hijri calendar dates to Gregorian dates using moment-hijri
              <button
                onClick={() => handleSelectTransformation(hijriToGregorianTransformation)}
                className="ml-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Use This Transformation
              </button>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Gregorian to Hijri Date Conversion</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              Converts Gregorian calendar dates to Hijri dates using moment-hijri
              <button
                onClick={() => handleSelectTransformation(gregorianToHijriTransformation)}
                className="ml-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Use This Transformation
              </button>
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Numeric Unit Conversion</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              Converts numeric values between different units (e.g., kg to lb)
              <button
                onClick={() => handleSelectTransformation(numericUnitConversion)}
                className="ml-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Use This Transformation
              </button>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">String Format Transformation</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              Changes text formatting (capitalization, case, whitespace)
              <button
                onClick={() => handleSelectTransformation(stringFormatTransformation)}
                className="ml-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Use This Transformation
              </button>
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Data Cleaning Transformation</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              Handles null values, formats data for consistency
              <button
                onClick={() => handleSelectTransformation(dataCleaningTransformation)}
                className="ml-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Use This Transformation
              </button>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default PrebuiltTransformations;
