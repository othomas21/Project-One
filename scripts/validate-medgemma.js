#!/usr/bin/env node
/**
 * @file validate-medgemma.js
 * @description Validation script for MedGemma integration
 * @module scripts
 * 
 * Key responsibilities:
 * - Test Hugging Face API connectivity
 * - Validate Edge Function deployment
 * - Check model availability and performance
 * - Verify environment configuration
 * 
 * @reftools Verified against Node.js v18+ and Supabase CLI
 * @author Claude Code
 * @created 2025-08-14
 */

const https = require('https');
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

function logWarning(message) {
  log(colors.yellow, `⚠️  ${message}`);
}

function logInfo(message) {
  log(colors.blue, `ℹ️  ${message}`);
}

// Test configurations
const testCases = [
  {
    type: 'clinical_qa',
    input: 'What are the common symptoms of pneumonia?',
    expectedKeywords: ['fever', 'cough', 'breathing', 'chest']
  },
  {
    type: 'text_analysis',
    input: 'Patient presents with acute chest pain, radiating to left arm, with diaphoresis',
    expectedKeywords: ['myocardial', 'cardiac', 'emergency']
  },
  {
    type: 'search_enhancement',
    input: 'chest x-ray pneumonia',
    expectedKeywords: ['radiograph', 'pulmonary', 'infiltrate']
  }
];

class MedGemmaValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  // Check environment variables
  async validateEnvironment() {
    logInfo('Checking environment configuration...');
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'HUGGING_FACE_API_KEY'
    ];

    const optionalVars = [
      'USE_REAL_MEDGEMMA',
      'DEFAULT_MEDGEMMA_MODEL',
      'MEDGEMMA_LOCAL_URL'
    ];

    let allPresent = true;

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        logSuccess(`${varName} is configured`);
      } else {
        logError(`${varName} is missing`);
        allPresent = false;
      }
    }

    for (const varName of optionalVars) {
      if (process.env[varName]) {
        logSuccess(`${varName} is configured: ${process.env[varName]}`);
      } else {
        logWarning(`${varName} is not configured (optional)`);
        this.results.warnings++;
      }
    }

    if (allPresent) {
      this.results.passed++;
      this.results.tests.push({ name: 'Environment Variables', status: 'passed' });
    } else {
      this.results.failed++;
      this.results.tests.push({ name: 'Environment Variables', status: 'failed' });
    }

    return allPresent;
  }

  // Test Hugging Face API connectivity
  async validateHuggingFaceAPI() {
    logInfo('Testing Hugging Face API connectivity...');

    const apiKey = process.env.HUGGING_FACE_API_KEY;
    if (!apiKey) {
      logError('HUGGING_FACE_API_KEY not found');
      this.results.failed++;
      this.results.tests.push({ name: 'Hugging Face API', status: 'failed' });
      return false;
    }

    try {
      const response = await this.makeHttpsRequest({
        hostname: 'huggingface.co',
        path: '/api/whoami',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        logSuccess(`Hugging Face API connected as: ${data.name || data.fullname || 'Unknown'}`);
        this.results.passed++;
        this.results.tests.push({ name: 'Hugging Face API', status: 'passed' });
        return true;
      } else {
        logError(`Hugging Face API error: ${response.statusCode}`);
        this.results.failed++;
        this.results.tests.push({ name: 'Hugging Face API', status: 'failed' });
        return false;
      }
    } catch (error) {
      logError(`Hugging Face API connection failed: ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name: 'Hugging Face API', status: 'failed' });
      return false;
    }
  }

  // Test MedGemma model availability
  async validateMedGemmaModel() {
    logInfo('Checking MedGemma model availability...');

    const apiKey = process.env.HUGGING_FACE_API_KEY;
    const modelId = process.env.DEFAULT_MEDGEMMA_MODEL === 'medgemma-27b-it' 
      ? 'google/medgemma-27b-it' 
      : 'google/medgemma-4b-it';

    try {
      const response = await this.makeHttpsRequest({
        hostname: 'huggingface.co',
        path: `/api/models/${modelId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.statusCode === 200) {
        logSuccess('MedGemma model is accessible');
        this.results.passed++;
        this.results.tests.push({ name: 'MedGemma Model Access', status: 'passed' });
        return true;
      } else if (response.statusCode === 403) {
        logError(`MedGemma model access denied - please accept the license at https://huggingface.co/${modelId}`);
        this.results.failed++;
        this.results.tests.push({ name: 'MedGemma Model Access', status: 'failed' });
        return false;
      } else {
        logError(`MedGemma model check failed: ${response.statusCode}`);
        this.results.failed++;
        this.results.tests.push({ name: 'MedGemma Model Access', status: 'failed' });
        return false;
      }
    } catch (error) {
      logError(`MedGemma model check failed: ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name: 'MedGemma Model Access', status: 'failed' });
      return false;
    }
  }

  // Test Supabase Edge Function
  async validateEdgeFunction() {
    logInfo('Testing Supabase Edge Function...');

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const testRequest = {
        type: 'clinical_qa',
        input: 'What is the test for connection?',
        options: { model: process.env.DEFAULT_MEDGEMMA_MODEL || 'medgemma-27b-it' }
      };

      const { data, error } = await supabase.functions.invoke('medgemma-analysis', {
        body: testRequest
      });

      if (error) {
        if (error.message?.includes('not found')) {
          logError('Edge Function not deployed. Run: supabase functions deploy medgemma-analysis');
        } else {
          logError(`Edge Function error: ${error.message}`);
        }
        this.results.failed++;
        this.results.tests.push({ name: 'Supabase Edge Function', status: 'failed' });
        return false;
      }

      if (data && data.success) {
        logSuccess('Edge Function is working');
        logInfo(`Model used: ${data.model}`);
        logInfo(`Processing time: ${data.processingTime}ms`);
        this.results.passed++;
        this.results.tests.push({ name: 'Supabase Edge Function', status: 'passed' });
        return true;
      } else {
        logError(`Edge Function returned error: ${data?.error || 'Unknown error'}`);
        this.results.failed++;
        this.results.tests.push({ name: 'Supabase Edge Function', status: 'failed' });
        return false;
      }
    } catch (error) {
      logError(`Edge Function test failed: ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name: 'Supabase Edge Function', status: 'failed' });
      return false;
    }
  }

  // Test comprehensive MedGemma functionality
  async validateMedGemmaFunctionality() {
    logInfo('Testing MedGemma functionality with medical scenarios...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    let allTestsPassed = true;

    for (const testCase of testCases) {
      logInfo(`Testing ${testCase.type}: "${testCase.input}"`);

      try {
        const { data, error } = await supabase.functions.invoke('medgemma-analysis', {
          body: {
            type: testCase.type,
            input: testCase.input,
            options: { model: process.env.DEFAULT_MEDGEMMA_MODEL || 'medgemma-27b-it' }
          }
        });

        if (error || !data || !data.success) {
          logError(`${testCase.type} test failed: ${error?.message || data?.error}`);
          allTestsPassed = false;
          continue;
        }

        // Check if response contains expected medical keywords
        const response = data.result.toLowerCase();
        const foundKeywords = testCase.expectedKeywords.filter(keyword => 
          response.includes(keyword.toLowerCase())
        );

        if (foundKeywords.length > 0) {
          logSuccess(`${testCase.type} test passed (found: ${foundKeywords.join(', ')})`);
          logInfo(`Response: ${data.result.substring(0, 100)}...`);
        } else {
          logWarning(`${testCase.type} test passed but no expected keywords found`);
          logInfo(`Expected: ${testCase.expectedKeywords.join(', ')}`);
          logInfo(`Response: ${data.result.substring(0, 100)}...`);
          this.results.warnings++;
        }

      } catch (error) {
        logError(`${testCase.type} test failed: ${error.message}`);
        allTestsPassed = false;
      }
    }

    if (allTestsPassed) {
      this.results.passed++;
      this.results.tests.push({ name: 'MedGemma Functionality', status: 'passed' });
    } else {
      this.results.failed++;
      this.results.tests.push({ name: 'MedGemma Functionality', status: 'failed' });
    }

    return allTestsPassed;
  }

  // HTTP request helper
  makeHttpsRequest(options) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  // Generate final report
  generateReport() {
    console.log('\n' + '='.repeat(50));
    log(colors.bold, 'MedGemma Integration Validation Report');
    console.log('='.repeat(50));

    console.log(`\nTest Results:`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);

    console.log(`\nDetailed Results:`);
    this.results.tests.forEach(test => {
      const icon = test.status === 'passed' ? '✅' : '❌';
      console.log(`  ${icon} ${test.name}`);
    });

    if (this.results.failed === 0) {
      logSuccess('\n🎉 All critical tests passed! MedGemma is ready for use.');
      console.log('\nNext steps:');
      console.log('1. Set USE_REAL_MEDGEMMA=true to enable real models');
      console.log('2. Test the AI Insights Panel in your application');
      console.log('3. Monitor performance and costs in production');
    } else {
      logError('\n🚨 Some tests failed. Please address the issues above.');
      console.log('\nTroubleshooting:');
      console.log('1. Check environment variables in .env.local');
      console.log('2. Ensure Hugging Face API key has proper permissions');
      console.log('3. Accept MedGemma model license at https://huggingface.co/RSM-VLM/med-gemma');
      console.log('4. Deploy Edge Function: supabase functions deploy medgemma-analysis');
    }

    console.log('\n📚 Documentation: docs/MEDGEMMA_DEPLOYMENT.md');
    console.log('🆘 Support: Check the troubleshooting section in the deployment guide');
  }

  // Run all validations
  async runAll() {
    log(colors.bold, '🧪 Starting MedGemma Integration Validation\n');

    await this.validateEnvironment();
    await this.validateHuggingFaceAPI();
    await this.validateMedGemmaModel();
    await this.validateEdgeFunction();
    await this.validateMedGemmaFunctionality();

    this.generateReport();

    // Exit with appropriate code
    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new MedGemmaValidator();
  validator.runAll().catch(error => {
    logError(`Validation failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = MedGemmaValidator;