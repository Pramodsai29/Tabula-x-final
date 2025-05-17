import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  ArrowTopRightOnSquareIcon, 
  BookOpenIcon 
} from '@heroicons/react/24/outline';

const Documentation = () => {
  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: `
        <h3>Introduction to TabulaX</h3>
        <p>
          TabulaX is a platform that leverages Large Language Models (LLMs) to analyze, understand, and generate
          transformations between tabular datasets. The platform helps you identify how source data needs to be
          transformed to match target data, then generates executable code to perform these transformations.
        </p>
        
        <h3>Basic Workflow</h3>
        <p>The typical TabulaX workflow consists of these steps:</p>
        <ol>
          <li><strong>Upload datasets</strong>: Provide source and target tables in CSV or Excel format</li>
          <li><strong>Analyze transformations</strong>: Let TabulaX identify the transformation patterns</li>
          <li><strong>Review and edit</strong>: Examine the generated code and make any necessary adjustments</li>
          <li><strong>Apply transformation</strong>: Run the transformation on your data and join with target data</li>
          <li><strong>Evaluate results</strong>: Review metrics and download the transformed dataset</li>
        </ol>
      `
    },
    {
      id: 'uploading-data',
      title: 'Uploading Data',
      content: `
        <h3>Supported File Formats</h3>
        <p>TabulaX supports the following file formats:</p>
        <ul>
          <li><strong>CSV files</strong> (.csv)</li>
          <li><strong>Excel spreadsheets</strong> (.xls, .xlsx)</li>
        </ul>
        
        <h3>File Size Limits</h3>
        <p>
          The maximum file size for uploads is 10MB. For larger datasets, we recommend splitting them into smaller
          chunks or using the sample datasets feature to test the transformation logic before applying it to your
          full dataset externally.
        </p>
        
        <h3>Sample Datasets</h3>
        <p>
          If you're new to TabulaX or want to experiment with different transformation types, you can use our
          sample datasets. These pre-loaded examples showcase various transformation patterns, from simple
          string manipulations to complex algorithmic transformations.
        </p>
      `
    },
    {
      id: 'transformation-types',
      title: 'Transformation Types',
      content: `
        <h3>String-based Transformations</h3>
        <p>
          These transformations involve text operations such as concatenation, substring extraction, case conversion,
          pattern replacement, and other string manipulations. For example, combining first and last name fields into
          a full name field, or extracting domain names from email addresses.
        </p>
        
        <h3>Numerical Transformations</h3>
        <p>
          These involve mathematical operations like arithmetic calculations, unit conversions, normalization,
          rounding, and other numerical processing. For example, converting temperatures from Celsius to Fahrenheit,
          or calculating BMI from height and weight fields.
        </p>
        
        <h3>Algorithmic Transformations</h3>
        <p>
          These are more complex transformations that involve conditional logic, lookup operations, multi-step
          processing, or other algorithmic approaches. For example, assigning categories based on multiple field
          values, or implementing business rules that determine output values.
        </p>
        
        <h3>General Transformations</h3>
        <p>
          This catch-all category includes transformations that combine multiple types or don't fit neatly into
          the other categories. It can include data reshaping, complex aggregations, or domain-specific transformations.
        </p>
      `
    },
    {
      id: 'join-options',
      title: 'Join Options',
      content: `
        <h3>Exact Matching</h3>
        <p>
          Exact matching joins rows from the transformed dataset with rows from the target dataset when the
          values in the specified matching columns are exactly equal. This is the fastest and most precise
          method, but it doesn't handle variations, typos, or formatting differences.
        </p>
        
        <h3>Fuzzy Matching</h3>
        <p>
          Fuzzy matching allows for approximate matching between values, accommodating slight variations,
          typos, or formatting differences. TabulaX offers several fuzzy matching algorithms:
        </p>
        
        <ul>
          <li>
            <strong>Levenshtein Distance</strong>: Measures the minimum number of single-character edits
            (insertions, deletions, or substitutions) required to change one string into another.
          </li>
          <li>
            <strong>Jaro-Winkler</strong>: A string similarity metric that gives higher scores to strings
            that match from the beginning, making it useful for comparing names or identifiers.
          </li>
          <li>
            <strong>Soundex</strong>: A phonetic algorithm that indexes names by their sound when pronounced
            in English, making it useful for matching names with spelling variations.
          </li>
        </ul>
        
        <h3>Match Threshold</h3>
        <p>
          When using fuzzy matching, you can select a threshold that determines how similar values must be
          to be considered a match:
        </p>
        
        <ul>
          <li><strong>Strict (90%)</strong>: Requires very high similarity, minimizing false positives</li>
          <li><strong>Moderate (70%)</strong>: Balanced approach suitable for most use cases</li>
          <li><strong>Relaxed (50%)</strong>: More lenient matching that may include more potential matches but also more false positives</li>
        </ul>
      `
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      content: `
        <h3>RESTful API Endpoints</h3>
        <p>
          TabulaX provides a comprehensive RESTful API that allows you to integrate its capabilities into your
          own applications or workflows. The API follows standard HTTP conventions and returns JSON responses.
        </p>
        
        <h4>Dataset Operations</h4>
        <ul>
          <li><code>POST /api/uploads</code> - Upload a new dataset</li>
          <li><code>GET /api/uploads</code> - List all datasets</li>
          <li><code>GET /api/uploads/:id</code> - Get dataset details</li>
          <li><code>DELETE /api/uploads/:id</code> - Delete a dataset</li>
        </ul>
        
        <h4>Transformation Operations</h4>
        <ul>
          <li><code>POST /api/transformations</code> - Create a new transformation</li>
          <li><code>GET /api/transformations</code> - List all transformations</li>
          <li><code>GET /api/transformations/:id</code> - Get transformation details</li>
          <li><code>PUT /api/transformations/:id</code> - Update a transformation</li>
          <li><code>DELETE /api/transformations/:id</code> - Delete a transformation</li>
          <li><code>POST /api/transformations/:id/apply</code> - Apply a transformation</li>
        </ul>
        
        <h4>LLM Integration</h4>
        <ul>
          <li><code>POST /api/llm/classify</code> - Classify transformation type</li>
          <li><code>POST /api/llm/generate</code> - Generate transformation function</li>
          <li><code>POST /api/llm/explain</code> - Explain transformation logic</li>
        </ul>
        
        <h4>Join Tools</h4>
        <ul>
          <li><code>POST /api/jointools/join</code> - Join datasets</li>
          <li><code>GET /api/jointools/fuzzy-options</code> - Get fuzzy matching options</li>
          <li><code>GET /api/jointools/history</code> - Get join history</li>
          <li><code>GET /api/jointools/:id</code> - Get join details</li>
        </ul>
        
        <p>
          For detailed API documentation, including request and response formats, please refer to our
          <a href="#" className="text-primary-600 hover:text-primary-500">API Documentation</a>.
        </p>
      `
    }
  ];
  
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Documentation</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
          Everything you need to know about using TabulaX for table transformations
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2 text-primary-600" />
              Contents
            </h2>
            <nav className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  <span>{section.title}</span>
                </a>
              ))}
              <div className="border-t border-gray-200 my-4"></div>
              <Link
                to="/upload"
                className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              >
                Try TabulaX Now
                <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="prose prose-primary max-w-none">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="mb-12">
                  <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                    <DocumentTextIcon className="h-6 w-6 mr-2 text-primary-600" />
                    {section.title}
                  </h2>
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
