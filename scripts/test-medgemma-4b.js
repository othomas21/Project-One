#!/usr/bin/env node
/**
 * @file test-medgemma-4b.js
 * @description Simple test script for MedGemma 4B integration
 * @module scripts
 * 
 * Tests the optimized MedGemma 4B model integration for free-tier usage
 * 
 * @reftools Verified against: Supabase Edge Functions, MedGemma 4B model
 * @author Claude Code
 * @created 2025-08-14
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(colors.green, `✅ ${message}`);
}

function logError(message) {
  log(colors.red, `❌ ${message}`);
}

function logInfo(message) {
  log(colors.blue, `ℹ️  ${message}`);
}

// Test cases optimized for MedGemma 4B
const testCases = [
  {
    type: 'clinical_qa',
    input: 'What is pneumonia?',
    description: 'Simple clinical question'
  },
  {
    type: 'text_analysis', 
    input: 'Patient has chest pain and fever',
    description: 'Basic symptom analysis'
  },
  {
    type: 'search_enhancement',
    input: 'chest x-ray',
    description: 'Medical search term enhancement'
  }
];

async function testMedGemma4B() {
  log(colors.bold, '🧪 Testing MedGemma 4B Integration\n');

  // Check environment setup
  logInfo('Checking environment configuration...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'HUGGING_FACE_API_KEY'
  ];

  let configValid = true;
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} configured`);
    } else {
      logError(`${varName} missing`);
      configValid = false;
    }
  }

  if (!configValid) {
    logError('Environment configuration incomplete');
    process.exit(1);
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  logInfo(`Default model: ${process.env.DEFAULT_MEDGEMMA_MODEL || 'medgemma-4b-it'}`);
  logInfo(`Use real MedGemma: ${process.env.USE_REAL_MEDGEMMA || 'false'}`);
  console.log('');

  // Run test cases
  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    logInfo(`Testing ${testCase.type}: "${testCase.input}"`);
    
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('medgemma-analysis', {
        body: {
          type: testCase.type,
          input: testCase.input,
          options: { 
            model: 'medgemma-4b-it',
            maxTokens: 200,
            temperature: 0.7
          }
        }
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        logError(`Test failed: ${error.message}`);
        continue;
      }

      if (data && data.success) {
        logSuccess(`${testCase.description} - ${responseTime}ms`);
        logInfo(`Model: ${data.model}`);
        logInfo(`Tokens: ${data.tokensUsed || 'N/A'}`);
        logInfo(`Response: ${data.result.substring(0, 100)}...`);
        passedTests++;
      } else {
        logError(`Test failed: ${data?.error || 'Unknown error'}`);
      }

    } catch (error) {
      logError(`Test failed: ${error.message}`);
    }
    
    console.log(''); // Add spacing between tests
  }

  // Summary
  console.log('='.repeat(50));
  log(colors.bold, 'MedGemma 4B Test Results');
  console.log('='.repeat(50));
  
  if (passedTests === totalTests) {
    logSuccess(`All ${totalTests} tests passed! 🎉`);
    logInfo('MedGemma 4B is ready for use');
  } else {
    log(colors.yellow, `${passedTests}/${totalTests} tests passed`);
    if (passedTests === 0) {
      logError('All tests failed. Check your configuration.');
    }
  }

  console.log('\nNext steps:');
  console.log('1. Test the AI features in your application UI');
  console.log('2. Monitor token usage for cost optimization');
  console.log('3. Scale up to MedGemma 27B if needed for complex cases');
}

// Simplified prompt test for direct API testing
async function testDirectAPI() {
  logInfo('Testing direct Hugging Face API connection...');
  
  const apiKey = process.env.HUGGING_FACE_API_KEY;
  if (!apiKey) {
    logError('HUGGING_FACE_API_KEY not found');
    return false;
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/google/medgemma-4b-it', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: '<start_of_turn>user\nWhat is pneumonia?<end_of_turn>\n<start_of_turn>model\n',
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      logSuccess('Direct API test successful');
      logInfo(`Response: ${JSON.stringify(result).substring(0, 100)}...`);
      return true;
    } else {
      const error = await response.text();
      logError(`Direct API test failed: ${response.status} - ${error}`);
      return false;
    }
  } catch (error) {
    logError(`Direct API test failed: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  try {
    // Test direct API first
    const directAPIWorking = await testDirectAPI();
    console.log('');
    
    if (directAPIWorking) {
      // Then test through Edge Function
      await testMedGemma4B();
    } else {
      logError('Skipping Edge Function tests due to API issues');
      console.log('\nTroubleshooting:');
      console.log('1. Verify your Hugging Face API key has proper permissions');
      console.log('2. Ensure you have accepted the MedGemma license at:');
      console.log('   https://huggingface.co/google/medgemma-4b-it');
      console.log('3. Check if the model is currently available (may be loading)');
    }
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  main();
}

module.exports = { testMedGemma4B, testDirectAPI };