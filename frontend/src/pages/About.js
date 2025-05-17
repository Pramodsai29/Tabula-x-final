import React from 'react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">About TabulaX</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
          Transforming how data professionals work with tabular data
        </p>
      </div>
      
      <div className="bg-white overflow-hidden shadow-soft rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="prose prose-primary max-w-none">
            <h2>Our Mission</h2>
            <p>
              TabulaX was created to address a common challenge in data science and analytics: understanding and automating
              the transformation logic between tables. Our mission is to leverage the power of Large Language Models (LLMs)
              to make these transformations transparent, reproducible, and accessible to everyone.
            </p>
            
            <h2>How TabulaX Works</h2>
            <p>
              TabulaX uses advanced LLM technology to analyze pairs of tables and identify the transformation patterns
              between them. These transformations are then classified, explained in plain language, and converted into
              executable code that can be applied to new data.
            </p>
            
            <h3>Key Capabilities</h3>
            <ul>
              <li><strong>Multi-class Transformation Recognition:</strong> TabulaX can identify string-based, numerical, algorithmic, and general transformations.</li>
              <li><strong>Automatic Code Generation:</strong> Generate JavaScript transformation functions with a single click.</li>
              <li><strong>Human-readable Explanations:</strong> Get plain-language descriptions of how transformations work.</li>
              <li><strong>Powerful Joining Tools:</strong> Apply transformations and join data with exact or fuzzy matching.</li>
              <li><strong>Comprehensive Metrics:</strong> Evaluate transformation quality with precision, recall, F1-score, and more.</li>
            </ul>
            
            <h2>Technology Stack</h2>
            <p>
              TabulaX is built on the MERN stack (MongoDB, Express.js, React, Node.js) and integrates with Google's
              Gemini 2.5 language model for intelligent transformation analysis. Our frontend uses Tailwind CSS for a
              clean, modern interface, while our backend provides RESTful APIs for LLM inference and transformation execution.
            </p>
            
            <h2>Use Cases</h2>
            <h3>Data Cleaning and Preparation</h3>
            <p>
              TabulaX shines in data preparation workflows, helping analysts understand how raw data should be transformed
              to meet target schemas. By learning from examples, it can generate reusable transformation logic.
            </p>
            
            <h3>ETL Process Automation</h3>
            <p>
              Extract, Transform, Load (ETL) processes often require complex transformation rules. TabulaX can analyze
              source and target tables to generate these rules automatically, saving hours of manual coding.
            </p>
            
            <h3>Data Integration</h3>
            <p>
              When combining data from multiple sources, TabulaX helps identify and apply the necessary transformations
              to make the data compatible, then provides powerful joining tools to merge the datasets.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              We're constantly improving TabulaX and would love to hear your feedback. If you have questions, suggestions,
              or want to report an issue, please contact us at <a href="mailto:info@tabulax.ai">info@tabulax.ai</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
