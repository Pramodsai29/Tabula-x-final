import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, DocumentChartBarIcon, CodeBracketIcon, CpuChipIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'String-based Transformations',
    description: 'Handle complex text operations like concatenation, substrings, pattern matching, and more.',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Numerical Transformations',
    description: 'Apply mathematical formulas, statistical analysis, and numerical operations to your tabular data.',
    icon: CodeBracketIcon,
  },
  {
    name: 'LLM-Powered Intelligence',
    description: 'Leverage large language models to understand and generate complex transformation logic automatically.',
    icon: CpuChipIcon,
  },
];

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-primary-700 to-secondary-700">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
            alt="People working on laptops"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">TabulaX</h1>
          <p className="mt-6 text-xl text-gray-100 max-w-3xl">
            A powerful LLM-based framework for multi-class table transformations. Analyze, transform, and join tabular data with unprecedented ease and intelligence.
          </p>
          <div className="mt-10 flex space-x-4">
            <Link
              to="/upload"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Get Started
            </Link>
            <a
              href="#workflow"
              className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-opacity-20 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('workflow').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Capabilities</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Transform your data with intelligence
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              TabulaX helps you analyze, understand, and transform complex tabular data with the power of LLMs.
            </p>
          </div>

          <div className="mt-12">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {features.map((feature, index) => (
                <div key={feature.name} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div id="workflow" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">How it works</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Simple, powerful workflow
            </p>
          </div>

          <div className="mt-12">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600 mb-4 mx-auto">
                  <span className="font-bold text-lg">1</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center">Upload your tables</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Upload your source and target tables in CSV or Excel format to begin the transformation process.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600 mb-4 mx-auto">
                  <span className="font-bold text-lg">2</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center">Analyze transformations</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  TabulaX automatically analyzes and identifies the transformation patterns between your tables.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600 mb-4 mx-auto">
                  <span className="font-bold text-lg">3</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center">Apply and validate</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Apply the transformation to your entire dataset and validate the results with comprehensive metrics.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/upload"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Try it now
              <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
