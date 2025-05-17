# TabulaX Grok Integration Guide

This guide explains how to use the new Grok integration for improved transformation functionality in the TabulaX application.

## What's Been Added

1. **New Backend Controller**: `grokController.js` - Handles all Grok API interactions
2. **New API Routes**: `/api/grok/*` endpoints for classification, transformation, and explanation
3. **New Frontend Service**: `grokService.js` - For connecting to Grok API endpoints

## Setup Instructions

### 1. Update Your Environment Variables

Add your Grok API key to your `.env` file:

```
# Existing variables
NODE_ENV=development
PORT=5002
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
GEMINI_API_KEY=...

# Add this new line
GROK_API_KEY=your_grok_api_key_here
```

### 2. How to Get a Grok API Key

1. Visit the Grok API developer portal at https://www.grok.x/api
2. Sign up for API access
3. Create a new API key with appropriate permissions
4. Copy the API key to your `.env` file

### 3. Switching Between Models

You can now choose which model to use in your application. There are two options:

#### Option 1: Modify a specific page to use Grok

Open any page that uses the LLM (like TransformationAnalysis.js) and replace:

```javascript
import { classifyTransformation, generateTransformationFunction, explainTransformation } from '../services/llmService';
```

With:

```javascript
import { classifyTransformation, generateTransformationFunction, explainTransformation } from '../services/grokService';
```

#### Option 2: Create a configuration option

Add a model selection dropdown in your UI settings and dynamically choose which service to use.

## Benefits of Using Grok

Grok may provide better results for:
- Complex date transformations (like Hijri/Gregorian conversions)
- Advanced string manipulations
- Pattern recognition in data
- Generated functions with better error handling

## Troubleshooting

If you encounter issues with Grok:

1. Verify your API key is correct and has sufficient quota
2. Check server logs for API error messages
3. Try a simpler transformation to test the connection
4. You can always switch back to the Gemini API if needed

## Testing Your Integration

To verify the integration is working:

1. Start your backend server
2. In the browser console, test a simple API call:
   ```javascript
   fetch('/api/grok/classify', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       sourceDatasetId: 'your_source_dataset_id',
       targetDatasetId: 'your_target_dataset_id'
     })
   }).then(r => r.json()).then(console.log)
   ```

## Need Help?

If you encounter any issues with the Grok integration, check the server logs for detailed error messages.
