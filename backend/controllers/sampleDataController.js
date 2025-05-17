const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Dataset = require('../models/datasetModel');

// Generate a valid MongoDB ObjectId
const generateObjectId = () => new mongoose.Types.ObjectId();

// Sample data generator
const getSampleDatasets = asyncHandler(async (req, res) => {
  try {
    // First check if sample datasets already exist
    const existingSamples = await Dataset.find({
      name: { $regex: /^Sample Dataset - /i }
    });

    // If samples already exist, return them
    if (existingSamples.length >= 12) {
      console.log('Returning existing sample datasets');
      
      // Group them in pairs - source and target
      const groupedDatasets = {};
      existingSamples.forEach(dataset => {
        const type = dataset.datasetType;
        const index = dataset.name.slice(-1); // Extract the last character (the number)
        
        if (!groupedDatasets[index]) {
          groupedDatasets[index] = {};
        }
        groupedDatasets[index][type] = dataset._id;
      });
      
      // Format and return the sample datasets as expected by frontend
      const result = Object.keys(groupedDatasets).map(index => {
        const typeName = {
          '1': 'String-based',
          '2': 'Numerical',
          '3': 'Algorithmic',
          '4': 'Date Transformation',
          '5': 'Text Analysis',
          '6': 'Geographic Data'
        }[index] || 'General';
        
        const descriptors = {
          '1': 'Name and address formatting and normalization',
          '2': 'Currency conversions and financial ratios',
          '3': 'Product classification based on multiple attributes',
          '4': 'Date format conversions including Hijri-Gregorian transformations',
          '5': 'Text sentiment analysis and keyword extraction',
          '6': 'Geographic coordinate conversion and distance calculations'
        }[index] || 'General data transformation';
        
        return {
          id: `sample${index}`,
          name: {
            '1': 'Customer Data Transformation',
            '2': 'Financial Calculations',
            '3': 'Product Categorization',
            '4': 'Date Format Converter',
            '5': 'Text Analysis Tool',
            '6': 'Geographic Data Processor'
          }[index] || `Sample Dataset ${index}`,
          description: descriptors,
          sourceId: groupedDatasets[index].source ? groupedDatasets[index].source.toString() : null,
          targetId: groupedDatasets[index].target ? groupedDatasets[index].target.toString() : null,
          transformationType: typeName
        };
      });
      
      return res.status(200).json(result);
    }
    
    // Otherwise create new sample datasets
    const sampleDatasets = [
      {
        // Customer Data - Source
        _id: generateObjectId(),
        name: 'Sample Dataset - Source 1',
        filePath: 'samples/customer_source.csv',
        fileType: 'csv',
        rows: 5,
        columns: 3,
        columnNames: ['id', 'name', 'address'],
        sampleData: [
          { id: 'S1', name: 'john smith', address: '123 main st new york ny 10001' },
          { id: 'S2', name: 'mary jones', address: '456 park ave chicago il 60601' },
          { id: 'S3', name: 'robert brown', address: '789 broad st boston ma 02201' },
          { id: 'S4', name: 'patricia williams', address: '101 market st san francisco ca 94105' },
          { id: 'S5', name: 'michael davis', address: '202 elm st austin tx 78701' }
        ],
        datasetType: 'source'
      },
      {
        // Customer Data - Target
        _id: generateObjectId(),
        name: 'Sample Dataset - Target 1',
        filePath: 'samples/customer_target.csv',
        fileType: 'csv',
        rows: 5,
        columns: 3,
        columnNames: ['id', 'full_name', 'formatted_address'],
        sampleData: [
          { id: 'S1', full_name: 'John Smith', formatted_address: '123 Main St, New York, NY 10001' },
          { id: 'S2', full_name: 'Mary Jones', formatted_address: '456 Park Ave, Chicago, IL 60601' },
          { id: 'S3', full_name: 'Robert Brown', formatted_address: '789 Broad St, Boston, MA 02201' },
          { id: 'S4', full_name: 'Patricia Williams', formatted_address: '101 Market St, San Francisco, CA 94105' },
          { id: 'S5', full_name: 'Michael Davis', formatted_address: '202 Elm St, Austin, TX 78701' }
        ],
        datasetType: 'target'
      },
      {
        // Financial Data - Source
        _id: generateObjectId(),
        name: 'Sample Dataset - Source 2',
        filePath: 'samples/financial_source.csv',
        fileType: 'csv',
        rows: 5,
        columns: 3,
        columnNames: ['id', 'amount_usd', 'exchange_rate'],
        sampleData: [
          { id: 'F1', amount_usd: '100.00', exchange_rate: '0.85' },
          { id: 'F2', amount_usd: '250.50', exchange_rate: '0.85' },
          { id: 'F3', amount_usd: '500.75', exchange_rate: '0.85' },
          { id: 'F4', amount_usd: '1000.25', exchange_rate: '0.85' },
          { id: 'F5', amount_usd: '1500.60', exchange_rate: '0.85' }
        ],
        datasetType: 'source'
      },
      {
        // Financial Data - Target
        _id: generateObjectId(),
        name: 'Sample Dataset - Target 2',
        filePath: 'samples/financial_target.csv',
        fileType: 'csv',
        rows: 5,
        columns: 3,
        columnNames: ['id', 'amount_eur', 'conversion_factor'],
        sampleData: [
          { id: 'F1', amount_eur: '85.00', conversion_factor: '1.0' },
          { id: 'F2', amount_eur: '213.00', conversion_factor: '1.0' },
          { id: 'F3', amount_eur: '425.64', conversion_factor: '1.0' },
          { id: 'F4', amount_eur: '850.21', conversion_factor: '1.0' },
          { id: 'F5', amount_eur: '1275.51', conversion_factor: '1.0' }
        ],
        datasetType: 'target'
      },
      {
        // Product Data - Source
        _id: generateObjectId(),
        name: 'Sample Dataset - Source 3',
        filePath: 'samples/product_source.csv',
        fileType: 'csv',
        rows: 5,
        columns: 4,
        columnNames: ['id', 'name', 'description', 'price'],
        sampleData: [
          { id: 'P1', name: 'Laptop', description: '15-inch, 16GB RAM, 512GB SSD', price: '1299.99' },
          { id: 'P2', name: 'Smartphone', description: '6.5-inch, 128GB storage', price: '799.99' },
          { id: 'P3', name: 'Headphones', description: 'Wireless, noise-cancelling', price: '249.99' },
          { id: 'P4', name: 'Monitor', description: '27-inch, 4K resolution', price: '349.99' },
          { id: 'P5', name: 'Keyboard', description: 'Mechanical, RGB lighting', price: '129.99' }
        ],
        datasetType: 'source'
      },
      {
        // Product Data - Target
        _id: generateObjectId(),
        name: 'Sample Dataset - Target 3',
        filePath: 'samples/product_target.csv',
        fileType: 'csv',
        rows: 5,
        columns: 4,
        columnNames: ['id', 'product_name', 'category', 'price_range'],
        sampleData: [
          { id: 'P1', product_name: 'Laptop', category: 'Electronics - Computing', price_range: 'Premium' },
          { id: 'P2', product_name: 'Smartphone', category: 'Electronics - Mobile', price_range: 'High' },
          { id: 'P3', product_name: 'Headphones', category: 'Electronics - Audio', price_range: 'Medium' },
          { id: 'P4', product_name: 'Monitor', category: 'Electronics - Display', price_range: 'Medium' },
          { id: 'P5', product_name: 'Keyboard', category: 'Electronics - Input Devices', price_range: 'Low' }
        ],
        datasetType: 'target'
      },
      {
        // Date Data - Source
        _id: generateObjectId(),
        name: 'Sample Dataset - Source 4',
        filePath: 'samples/date_source.csv',
        fileType: 'csv',
        rows: 5,
        columns: 3,
        columnNames: ['id', 'date_gregorian', 'event_name'],
        sampleData: [
          { id: 'D1', date_gregorian: '2025-05-12', event_name: 'Conference' },
          { id: 'D2', date_gregorian: '2025-06-25', event_name: 'Workshop' },
          { id: 'D3', date_gregorian: '2025-07-08', event_name: 'Webinar' },
          { id: 'D4', date_gregorian: '2025-08-17', event_name: 'Meetup' },
          { id: 'D5', date_gregorian: '2025-09-23', event_name: 'Hackathon' }
        ],
        datasetType: 'source'
      },
      {
        // Date Data - Target
        _id: generateObjectId(),
        name: 'Sample Dataset - Target 4',
        filePath: 'samples/date_target.csv',
        fileType: 'csv',
        rows: 5,
        columns: 4,
        columnNames: ['id', 'date_hijri', 'formatted_date', 'event_name'],
        sampleData: [
          { id: 'D1', date_hijri: '1446-11-15', formatted_date: 'May 12, 2025', event_name: 'Conference' },
          { id: 'D2', date_hijri: '1446-12-29', formatted_date: 'June 25, 2025', event_name: 'Workshop' },
          { id: 'D3', date_hijri: '1447-01-12', formatted_date: 'July 8, 2025', event_name: 'Webinar' },
          { id: 'D4', date_hijri: '1447-02-22', formatted_date: 'August 17, 2025', event_name: 'Meetup' },
          { id: 'D5', date_hijri: '1447-03-29', formatted_date: 'September 23, 2025', event_name: 'Hackathon' }
        ],
        datasetType: 'target'
      },
      {
        // Text Analysis - Source
        _id: generateObjectId(),
        name: 'Sample Dataset - Source 5',
        filePath: 'samples/text_source.csv',
        fileType: 'csv',
        rows: 5,
        columns: 2,
        columnNames: ['id', 'review_text'],
        sampleData: [
          { id: 'T1', review_text: 'This product exceeded my expectations. The quality is outstanding and customer service was responsive.' },
          { id: 'T2', review_text: 'Disappointed with this purchase. It broke after a week and returns process was complicated.' },
          { id: 'T3', review_text: 'Average product that does what it claims. Nothing special but works fine for the price.' },
          { id: 'T4', review_text: 'I love this product! Best purchase I made this year. Highly recommend to everyone.' },
          { id: 'T5', review_text: 'The delivery was late and packaging was damaged, but the product itself seems ok.' }
        ],
        datasetType: 'source'
      },
      {
        // Text Analysis - Target
        _id: generateObjectId(),
        name: 'Sample Dataset - Target 5',
        filePath: 'samples/text_target.csv',
        fileType: 'csv',
        rows: 5,
        columns: 4,
        columnNames: ['id', 'sentiment', 'keywords', 'word_count'],
        sampleData: [
          { id: 'T1', sentiment: 'Positive', keywords: 'exceeded expectations, quality, responsive', word_count: '17' },
          { id: 'T2', sentiment: 'Negative', keywords: 'disappointed, broke, complicated', word_count: '14' },
          { id: 'T3', sentiment: 'Neutral', keywords: 'average, works fine, price', word_count: '13' },
          { id: 'T4', sentiment: 'Very Positive', keywords: 'love, best purchase, recommend', word_count: '14' },
          { id: 'T5', sentiment: 'Mixed', keywords: 'late, damaged, ok', word_count: '16' }
        ],
        datasetType: 'target'
      },
      {
        // Geographic Data - Source
        _id: generateObjectId(),
        name: 'Sample Dataset - Source 6',
        filePath: 'samples/geo_source.csv',
        fileType: 'csv',
        rows: 5,
        columns: 3,
        columnNames: ['id', 'city_name', 'coordinates'],
        sampleData: [
          { id: 'G1', city_name: 'New York', coordinates: '40.7128,-74.0060' },
          { id: 'G2', city_name: 'Los Angeles', coordinates: '34.0522,-118.2437' },
          { id: 'G3', city_name: 'Chicago', coordinates: '41.8781,-87.6298' },
          { id: 'G4', city_name: 'Houston', coordinates: '29.7604,-95.3698' },
          { id: 'G5', city_name: 'Phoenix', coordinates: '33.4484,-112.0740' }
        ],
        datasetType: 'source'
      },
      {
        // Geographic Data - Target
        _id: generateObjectId(),
        name: 'Sample Dataset - Target 6',
        filePath: 'samples/geo_target.csv',
        fileType: 'csv',
        rows: 5,
        columns: 4,
        columnNames: ['id', 'city_name', 'utc_offset', 'distance_from_nyc_km'],
        sampleData: [
          { id: 'G1', city_name: 'New York', utc_offset: 'UTC-4', distance_from_nyc_km: '0' },
          { id: 'G2', city_name: 'Los Angeles', utc_offset: 'UTC-7', distance_from_nyc_km: '3936' },
          { id: 'G3', city_name: 'Chicago', utc_offset: 'UTC-5', distance_from_nyc_km: '1148' },
          { id: 'G4', city_name: 'Houston', utc_offset: 'UTC-5', distance_from_nyc_km: '2282' },
          { id: 'G5', city_name: 'Phoenix', utc_offset: 'UTC-7', distance_from_nyc_km: '3455' }
        ],
        datasetType: 'target'
      }
    ];
    
    // Insert sample datasets to database
    await Dataset.insertMany(sampleDatasets);
    console.log('Created sample datasets');
    
    // Format and return the sample datasets
    const result = [
      {
        id: 'sample1',
        name: 'Customer Data Transformation',
        description: 'Name and address formatting and normalization',
        sourceId: sampleDatasets[0]._id.toString(),
        targetId: sampleDatasets[1]._id.toString(),
        transformationType: 'String-based'
      },
      {
        id: 'sample2',
        name: 'Financial Calculations',
        description: 'Currency conversions and financial ratios',
        sourceId: sampleDatasets[2]._id.toString(),
        targetId: sampleDatasets[3]._id.toString(),
        transformationType: 'Numerical'
      },
      {
        id: 'sample3',
        name: 'Product Categorization',
        description: 'Product classification based on multiple attributes',
        sourceId: sampleDatasets[4]._id.toString(),
        targetId: sampleDatasets[5]._id.toString(),
        transformationType: 'Algorithmic'
      },
      {
        id: 'sample4',
        name: 'Date Format Converter',
        description: 'Date format conversions including Hijri-Gregorian transformations',
        sourceId: sampleDatasets[6]._id.toString(),
        targetId: sampleDatasets[7]._id.toString(),
        transformationType: 'Date Transformation'
      },
      {
        id: 'sample5',
        name: 'Text Analysis Tool',
        description: 'Text sentiment analysis and keyword extraction',
        sourceId: sampleDatasets[8]._id.toString(),
        targetId: sampleDatasets[9]._id.toString(),
        transformationType: 'Text Analysis'
      },
      {
        id: 'sample6',
        name: 'Geographic Data Processor',
        description: 'Geographic coordinate conversion and distance calculations',
        sourceId: sampleDatasets[10]._id.toString(),
        targetId: sampleDatasets[11]._id.toString(),
        transformationType: 'Geographic Data'
      }
    ];
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error creating sample datasets:', error);
    res.status(500).json({ message: `Error creating sample datasets: ${error.message}` });
  }
});

module.exports = {
  getSampleDatasets
};
