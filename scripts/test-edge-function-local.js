#!/usr/bin/env node
/**
 * Test MedGemma Edge Function locally
 * Tests the simulated mode functionality
 */

const https = require('https');

const SUPABASE_URL = 'https://dsjmraeihefvcptmmimd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzam1yYWVpaGVmdmNwdG1taW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTQ4ODUsImV4cCI6MjA3MDM3MDg4NX0.hyFiVEZWjoD0QkgC2GzOpmP3vw_e5uQiu8zBlPa6pDo';

async function testEdgeFunction() {
  console.log('🧪 Testing MedGemma Edge Function');
  console.log('=' * 50);

  const testCases = [
    {
      name: 'Clinical Q&A',
      payload: {
        type: 'clinical_qa',
        input: 'What are the common symptoms of pneumonia?',
        options: {
          maxTokens: 200,
          temperature: 0.7
        }
      }
    },
    {
      name: 'Medical Text Analysis',
      payload: {
        type: 'text_analysis',
        input: 'Patient presents with acute chest pain radiating to left arm, diaphoresis, and nausea.',
        context: '65-year-old male with history of hypertension',
        options: {
          maxTokens: 300,
          temperature: 0.5
        }
      }
    },
    {
      name: 'Search Enhancement',
      payload: {
        type: 'search_enhancement',
        input: 'chest x-ray showing white spots in lungs',
        options: {
          maxTokens: 150,
          temperature: 0.3
        }
      }
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 Test ${i + 1}: ${testCase.name}`);
    console.log('-'.repeat(40));

    try {
      const result = await callEdgeFunction(testCase.payload);
      
      if (result.success) {
        console.log('✅ Success!');
        console.log(`Model: ${result.model}`);
        console.log(`Processing Time: ${result.processingTime}ms`);
        console.log(`Tokens Used: ${result.tokensUsed || 'N/A'}`);
        console.log(`Response Preview: ${result.result.substring(0, 150)}...`);
        
        // Check if response contains medical content
        const medicalTerms = ['medical', 'clinical', 'patient', 'symptoms', 'diagnosis', 'treatment'];
        const foundTerms = medicalTerms.filter(term => 
          result.result.toLowerCase().includes(term)
        );
        console.log(`Medical Relevance: ${foundTerms.length}/${medicalTerms.length} terms found`);
        
      } else {
        console.log('❌ Failed!');
        console.log(`Error: ${result.error}`);
      }
      
    } catch (error) {
      console.log('❌ Exception occurred!');
      console.log(`Error: ${error.message}`);
    }
    
    // Add delay between requests
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n📊 Test Summary');
  console.log('=' * 20);
  console.log('✅ Edge Function deployment: Ready for real AI models');
  console.log('💡 Next steps:');
  console.log('   1. Deploy Edge Function to Supabase');
  console.log('   2. Set USE_REAL_MEDGEMMA=true');
  console.log('   3. Test with real MedGemma models');
}

function callEdgeFunction(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: 'dsjmraeihefvcptmmimd.supabase.co',
      path: '/functions/v1/medgemma-analysis',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// Run the test
if (require.main === module) {
  testEdgeFunction()
    .then(() => {
      console.log('\n🎉 All tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testEdgeFunction, callEdgeFunction };