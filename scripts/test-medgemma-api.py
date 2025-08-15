#!/usr/bin/env python3
"""
Test MedGemma via Hugging Face Inference API
Simplified approach using the HF API instead of local inference
"""

import os
import sys
import json
import time
import requests
from typing import Dict, Any, List

def test_hf_api_access():
    """Test basic Hugging Face API access"""
    print("🔑 Testing Hugging Face API Access")
    print("=" * 40)
    
    api_key = os.getenv('HUGGING_FACE_API_KEY', 'your_hugging_face_api_key_here')
    
    if not api_key:
        print("❌ HUGGING_FACE_API_KEY not found in environment")
        return False
    
    print(f"✅ API Key: {api_key[:10]}...")
    
    # Test with a simple model first
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    # Test basic API connectivity
    try:
        response = requests.get(
            'https://huggingface.co/api/whoami',
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            user_info = response.json()
            print(f"✅ Authenticated as: {user_info.get('name', 'Unknown')}")
            return True
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        return False

def test_model_access(model_name: str) -> Dict[str, Any]:
    """Test access to a specific model"""
    print(f"🧪 Testing model: {model_name}")
    
    api_key = os.getenv('HUGGING_FACE_API_KEY', 'your_hugging_face_api_key_here')
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    # First check model info
    try:
        info_response = requests.get(
            f'https://huggingface.co/api/models/{model_name}',
            headers=headers,
            timeout=10
        )
        
        if info_response.status_code == 200:
            model_info = info_response.json()
            print(f"  ✅ Model info accessible")
            print(f"     Downloads: {model_info.get('downloads', 'N/A')}")
            print(f"     Gated: {model_info.get('gated', 'Unknown')}")
        else:
            print(f"  ❌ Model info not accessible: {info_response.status_code}")
            return {"accessible": False, "reason": f"Info API returned {info_response.status_code}"}
            
    except Exception as e:
        print(f"  ❌ Model info error: {e}")
        return {"accessible": False, "reason": str(e)}
    
    # Test inference API
    medical_prompt = "<start_of_turn>user\\nWhat are the symptoms of pneumonia?<end_of_turn>\\n<start_of_turn>model\\n"
    
    payload = {
        'inputs': medical_prompt,
        'parameters': {
            'max_new_tokens': 100,
            'temperature': 0.7,
            'do_sample': True,
            'return_full_text': False
        },
        'options': {
            'wait_for_model': True,
            'use_cache': True
        }
    }
    
    try:
        print(f"  📤 Testing inference...")
        
        response = requests.post(
            f'https://api-inference.huggingface.co/models/{model_name}',
            headers=headers,
            json=payload,
            timeout=60
        )
        
        print(f"  📥 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"  ✅ Inference successful!")
            
            # Extract response text
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get('generated_text', 'No text generated')
                print(f"  🩺 Generated: {generated_text[:100]}...")
                
            return {
                "accessible": True,
                "inference_working": True,
                "response": result
            }
            
        elif response.status_code == 401:
            print(f"  ❌ Unauthorized - model may require license acceptance")
            return {"accessible": False, "reason": "Unauthorized - license required"}
            
        elif response.status_code == 403:
            print(f"  ❌ Forbidden - insufficient permissions")  
            return {"accessible": False, "reason": "Forbidden"}
            
        elif response.status_code == 503:
            print(f"  ⏳ Model is loading (503) - this is normal")
            return {"accessible": True, "inference_working": False, "reason": "Model loading"}
            
        else:
            print(f"  ❌ Inference failed: {response.status_code}")
            print(f"     Response: {response.text[:200]}")
            return {"accessible": False, "reason": f"HTTP {response.status_code}"}
            
    except Exception as e:
        print(f"  ❌ Inference error: {e}")
        return {"accessible": False, "reason": str(e)}

def test_medical_scenarios():
    """Test with specific medical scenarios"""
    print("\\n🏥 Testing Medical AI Scenarios")
    print("=" * 40)
    
    # Test cases
    scenarios = [
        {
            "name": "Clinical Q&A",
            "prompt": "<start_of_turn>user\\nWhat are the differential diagnoses for chest pain in a 45-year-old male?<end_of_turn>\\n<start_of_turn>model\\n",
            "expected_terms": ["myocardial infarction", "angina", "pulmonary embolism"]
        },
        {
            "name": "Medical Text Analysis", 
            "prompt": "<start_of_turn>user\\nAnalyze: 'Patient presents with acute dyspnea, bilateral crackles, and elevated JVP'<end_of_turn>\\n<start_of_turn>model\\n",
            "expected_terms": ["heart failure", "pulmonary edema", "cardiac"]
        },
        {
            "name": "Search Enhancement",
            "prompt": "<start_of_turn>user\\nConvert to medical terms: 'shortness of breath and chest tightness'<end_of_turn>\\n<start_of_turn>model\\n",
            "expected_terms": ["dyspnea", "chest pain", "respiratory distress"]
        }
    ]
    
    # Use the first working model we find
    working_model = None
    test_models = [
        'google/gemma-2b-it',  # Start with basic Gemma
        'google/gemma-7b-it',
        'google/medgemma-4b-it'
    ]
    
    for model in test_models:
        print(f"\\n🔍 Checking {model} for medical testing...")
        result = test_model_access(model)
        if result.get('accessible') and result.get('inference_working'):
            working_model = model
            print(f"✅ Will use {model} for medical scenarios")
            break
        elif result.get('accessible'):
            working_model = model
            print(f"⚠️  {model} is accessible but may be loading")
            break
    
    if not working_model:
        print("❌ No working model found for medical scenario testing")
        return
    
    # Test each scenario
    for i, scenario in enumerate(scenarios, 1):
        print(f"\\n📋 Scenario {i}: {scenario['name']}")
        print(f"Expected to mention: {', '.join(scenario['expected_terms'])}")
        
        # Would test with the working model here
        print("💡 Scenario defined - ready for testing with available model")

def main():
    """Main test function"""
    print("🏥 MedGemma Hugging Face API Test Suite")
    print("=" * 50)
    
    # Test API access first
    if not test_hf_api_access():
        print("\\n❌ Basic API access failed - cannot proceed")
        return
    
    print("\\n🧪 Testing Model Access")
    print("=" * 30)
    
    # Models to test in order of preference
    models_to_test = [
        'google/medgemma-4b-it',
        'google/medgemma-27b-it', 
        'google/medgemma-27b-text-it',
        'google/gemma-2b-it',  # Fallback
        'google/gemma-7b-it'   # Fallback
    ]
    
    results = {}
    working_models = []
    
    for model in models_to_test:
        result = test_model_access(model)
        results[model] = result
        
        if result.get('accessible'):
            working_models.append(model)
        
        print()  # Add spacing between tests
    
    # Summary
    print("\\n📊 Test Summary")
    print("=" * 20)
    
    print(f"✅ Models accessible: {len(working_models)}")
    print(f"❌ Models blocked: {len(models_to_test) - len(working_models)}")
    
    if working_models:
        print("\\n🎯 Recommended for production:")
        for model in working_models:
            if 'medgemma' in model:
                print(f"  🥇 {model} (MedGemma - specialized)")
            else:
                print(f"  🥈 {model} (Gemma - general)")
    
    print("\\n💡 Next Steps:")
    if not working_models:
        print("1. Accept model licenses at:")
        for model in models_to_test[:3]:  # Show first 3 MedGemma models
            print(f"   - https://huggingface.co/{model}")
        print("2. Re-run this test")
    else:
        print("1. Update .env.local with working model")
        print("2. Deploy Supabase Edge Function")
        print("3. Test full integration")
    
    # Test medical scenarios if we have working models
    if working_models:
        test_medical_scenarios()

if __name__ == "__main__":
    # Load environment variables
    if os.path.exists('.env.local'):
        with open('.env.local', 'r') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
    
    main()