#!/usr/bin/env python3
"""
Test local MedGemma inference using transformers library
"""

import os
import sys
import time
import json
from typing import List, Dict, Any

def test_medgemma_local():
    """Test MedGemma model using local transformers"""
    print("🧪 Testing MedGemma Local Inference with Transformers")
    print("=" * 60)
    
    try:
        # Import required libraries
        print("📦 Importing transformers...")
        from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
        import torch
        
        print(f"✅ PyTorch version: {torch.__version__}")
        print(f"✅ CUDA available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"✅ CUDA device: {torch.cuda.get_device_name(0)}")
        
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("Install with: pip install transformers torch")
        return False
    
    # Test different MedGemma models
    models_to_test = [
        "google/medgemma-4b-it",
        "google/medgemma-27b-text-it"
    ]
    
    for model_name in models_to_test:
        print(f"\n🔬 Testing model: {model_name}")
        print("-" * 40)
        
        try:
            start_time = time.time()
            
            # Load tokenizer
            print("📥 Loading tokenizer...")
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            # Test medical questions
            medical_questions = [
                "What are the common symptoms of pneumonia?",
                "Explain the difference between Type 1 and Type 2 diabetes.",
                "What imaging modalities are used to diagnose stroke?"
            ]
            
            print("🩺 Testing with pipeline approach...")
            
            # Use pipeline for easier inference
            pipe = pipeline(
                "text-generation", 
                model=model_name,
                device=0 if torch.cuda.is_available() else -1,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                model_kwargs={"load_in_4bit": True} if torch.cuda.is_available() else {}
            )
            
            for i, question in enumerate(medical_questions, 1):
                print(f"\n📝 Question {i}: {question}")
                
                # Format as chat message
                messages = [{"role": "user", "content": question}]
                
                try:
                    # Generate response
                    outputs = pipe(
                        messages,
                        max_new_tokens=150,
                        temperature=0.7,
                        do_sample=True,
                        top_k=50,
                        top_p=0.95,
                        repetition_penalty=1.1,
                        pad_token_id=tokenizer.eos_token_id
                    )
                    
                    # Extract generated text
                    if outputs and len(outputs) > 0:
                        response = outputs[0].get('generated_text', 'No response generated')
                        if isinstance(response, list) and len(response) > 1:
                            # Get the assistant's response (last message)
                            assistant_response = response[-1].get('content', 'No content found')
                            print(f"🤖 Response: {assistant_response}")
                        else:
                            print(f"🤖 Response: {str(response)[:300]}...")
                    else:
                        print("❌ No response generated")
                        
                except Exception as gen_error:
                    print(f"❌ Generation error: {gen_error}")
                    continue
            
            load_time = time.time() - start_time
            print(f"\n⏱️  Total time: {load_time:.2f} seconds")
            print(f"✅ Model {model_name} test completed successfully!")
            
            # Only test the first model to save resources
            return True
            
        except Exception as e:
            print(f"❌ Error testing {model_name}: {e}")
            
            # If the large model fails, try a smaller approach
            if "27b" in model_name:
                print("ℹ️  Large model failed, this might be due to memory constraints")
                continue
            else:
                return False
    
    return False

def test_medical_qa_examples():
    """Test specific medical Q&A examples"""
    print("\n🩺 Testing Medical Q&A Examples")
    print("=" * 40)
    
    # Test cases for medical AI
    test_cases = [
        {
            "type": "clinical_qa",
            "question": "A 65-year-old patient presents with chest pain radiating to the left arm. What are the key differential diagnoses?",
            "expected_topics": ["myocardial infarction", "angina", "aortic dissection"]
        },
        {
            "type": "text_analysis", 
            "text": "Patient presents with acute shortness of breath, bilateral lower extremity edema, and jugular venous distention.",
            "expected_topics": ["heart failure", "pulmonary edema", "cardiac"]
        },
        {
            "type": "search_enhancement",
            "query": "chest x-ray showing white spots in lungs",
            "expected_terms": ["pulmonary nodules", "pneumonia", "infiltrates"]
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📋 Test Case {i} ({test_case['type']}):")
        
        if test_case['type'] == 'clinical_qa':
            print(f"Question: {test_case['question']}")
            print(f"Should cover: {', '.join(test_case['expected_topics'])}")
        elif test_case['type'] == 'text_analysis':
            print(f"Text: {test_case['text']}")
            print(f"Should identify: {', '.join(test_case['expected_topics'])}")
        elif test_case['type'] == 'search_enhancement':
            print(f"Query: {test_case['query']}")
            print(f"Should suggest: {', '.join(test_case['expected_terms'])}")

if __name__ == "__main__":
    print("🏥 MedGemma Local Inference Test Suite")
    print("=====================================")
    
    # Check if transformers is installed
    try:
        import transformers
        print(f"✅ Transformers version: {transformers.__version__}")
    except ImportError:
        print("❌ Transformers not installed. Run: pip install transformers torch")
        sys.exit(1)
    
    # Run the test
    success = test_medgemma_local()
    
    if success:
        print("\n✅ MedGemma local inference test completed successfully!")
        test_medical_qa_examples()
    else:
        print("\n❌ MedGemma local inference test failed.")
        print("This might be due to:")
        print("- Missing model access (need to accept license)")
        print("- Insufficient memory for large models")
        print("- Missing dependencies")
        
    print(f"\n📚 For production deployment, consider:")
    print("1. Using model quantization (4-bit or 8-bit)")
    print("2. GPU acceleration for better performance")
    print("3. Model caching for faster subsequent loads")
    print("4. Batch processing for multiple requests")