#!/usr/bin/env node
/**
 * Prepare MedGemma Edge Function for manual deployment
 * Outputs the function code ready to copy-paste into Supabase dashboard
 */

const fs = require('fs');
const path = require('path');

function prepareDeployment() {
  console.log('🚀 Preparing MedGemma Edge Function for Manual Deployment');
  console.log('=' * 60);

  // Read the Edge Function code
  const functionPath = path.join(__dirname, '../supabase/functions/medgemma-analysis/index.ts');
  
  try {
    const functionCode = fs.readFileSync(functionPath, 'utf8');
    
    console.log('\n📋 COPY THIS CODE TO SUPABASE DASHBOARD:');
    console.log('─'.repeat(80));
    console.log(functionCode);
    console.log('─'.repeat(80));
    
    console.log('\n🔧 ENVIRONMENT VARIABLES TO SET:');
    console.log('─'.repeat(40));
    console.log('HUGGING_FACE_API_KEY=your_hugging_face_api_key_here');
    console.log('USE_REAL_MEDGEMMA=true');
    console.log('DEFAULT_MEDGEMMA_MODEL=medgemma-4b-it');
    console.log('─'.repeat(40));
    
    console.log('\n📊 DEPLOYMENT CHECKLIST:');
    console.log('□ 1. Go to https://supabase.com/dashboard/project/dsjmraeihefvcptmmimd/functions');
    console.log('□ 2. Create new function named "medgemma-analysis"');
    console.log('□ 3. Copy the code above into the editor');
    console.log('□ 4. Set the environment variables listed above');
    console.log('□ 5. Deploy the function');
    console.log('□ 6. Run: npm run validate:medgemma');
    
    console.log('\n🎯 EXPECTED RESULTS AFTER DEPLOYMENT:');
    console.log('✅ Edge Function will be accessible at:');
    console.log('   https://dsjmraeihefvcptmmimd.supabase.co/functions/v1/medgemma-analysis');
    console.log('✅ Smart fallback system: MedGemma → Gemma → Simulated');
    console.log('✅ Medical AI capabilities: Clinical Q&A, Text Analysis, Search Enhancement');
    console.log('✅ Performance monitoring and error handling');
    
    // Also create a deployment-ready version without comments
    const minifiedCode = functionCode
      .replace(/\/\*\*[\s\S]*?\*\//g, '') // Remove JSDoc comments
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/^\s*\n/gm, '') // Remove empty lines
      .trim();
    
    const deploymentFile = path.join(__dirname, '../DEPLOYMENT_READY.ts');
    fs.writeFileSync(deploymentFile, functionCode);
    
    console.log(`\n💾 Full code also saved to: ${deploymentFile}`);
    console.log('\n🚀 Ready for deployment!');
    
  } catch (error) {
    console.error('❌ Error reading function code:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  prepareDeployment();
}

module.exports = { prepareDeployment };