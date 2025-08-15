#!/usr/bin/env python3
"""
@file medgemma-local.py
@description Local MedGemma inference service using Hugging Face transformers
@module api
@requires transformers torch accelerate bitsandbytes

Key responsibilities:
- Local MedGemma model inference with quantization
- Direct integration with community MedGemma models
- Memory-optimized inference for production deployment
- REST API endpoint for Next.js frontend integration

@reftools Verified against: transformers v4.x, torch v2.x, Hugging Face Hub
@author Claude Code
@created 2025-08-14
"""

import os
import json
import torch
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    BitsAndBytesConfig,
    pipeline
)
from huggingface_hub import login
from flask import Flask, request, jsonify
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MedGemmaConfig:
    """Configuration for MedGemma models"""
    model_id: str = "RSM-VLM/med-gemma"
    use_quantization: bool = True
    device_map: str = "auto"
    max_memory: Optional[Dict[str, str]] = None
    torch_dtype: torch.dtype = torch.bfloat16

class MedGemmaInference:
    """
    MedGemma inference engine with optimizations
    @reftools Following HF transformers v4.x patterns for medical AI
    """
    
    def __init__(self, config: MedGemmaConfig):
        self.config = config
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self._load_model()
    
    def _setup_quantization(self) -> Optional[BitsAndBytesConfig]:
        """Setup 4-bit quantization for memory efficiency"""
        if not self.config.use_quantization:
            return None
            
        return BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=self.config.torch_dtype,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"
        )
    
    def _load_model(self):
        """Load MedGemma model and tokenizer"""
        try:
            # Setup Hugging Face authentication
            hf_token = os.getenv('HUGGING_FACE_TOKEN')
            if hf_token:
                login(token=hf_token)
                logger.info("Logged into Hugging Face Hub")
            
            quantization_config = self._setup_quantization()
            
            logger.info(f"Loading MedGemma model: {self.config.model_id}")
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.config.model_id,
                trust_remote_code=True
            )
            
            # Ensure tokenizer has a pad token
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Load model with optimizations
            self.model = AutoModelForCausalLM.from_pretrained(
                self.config.model_id,
                quantization_config=quantization_config,
                device_map=self.config.device_map,
                torch_dtype=self.config.torch_dtype,
                trust_remote_code=True,
                max_memory=self.config.max_memory
            )
            
            logger.info(f"Model loaded successfully on device: {self.model.device}")
            
        except Exception as e:
            logger.error(f"Failed to load MedGemma model: {e}")
            raise
    
    def format_medical_prompt(self, text: str, task_type: str = "general") -> str:
        """
        Format prompt for MedGemma with proper chat template
        @reftools Following RSM-VLM/med-gemma prompt formatting
        """
        task_prefixes = {
            "clinical_qa": "Answer this clinical question based on medical knowledge:",
            "text_analysis": "Analyze the following clinical text and provide insights:",
            "search_enhancement": "Convert this query to medical terminology:",
            "image_analysis": "Analyze this radiology finding:"
        }
        
        prefix = task_prefixes.get(task_type, "Provide medical assistance for:")
        
        # Use Gemma's chat template format
        prompt = f"<start_of_turn>user\n{prefix}\n\n{text}<end_of_turn>\n<start_of_turn>model\n"
        return prompt
    
    def generate_response(
        self,
        prompt: str,
        max_new_tokens: int = 512,
        temperature: float = 0.7,
        top_k: int = 50,
        top_p: float = 0.95,
        do_sample: bool = True
    ) -> Dict[str, Any]:
        """Generate response from MedGemma model"""
        if not self.model or not self.tokenizer:
            raise RuntimeError("Model not loaded")
        
        start_time = time.time()
        
        try:
            # Tokenize input
            inputs = self.tokenizer(
                prompt, 
                return_tensors="pt",
                truncation=True,
                max_length=2048
            ).to(self.model.device)
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_new_tokens,
                    temperature=temperature,
                    top_k=top_k,
                    top_p=top_p,
                    do_sample=do_sample,
                    pad_token_id=self.tokenizer.eos_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.1
                )
            
            # Decode response
            full_response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract only the generated part (remove input prompt)
            generated_text = full_response[len(self.tokenizer.decode(inputs['input_ids'][0], skip_special_tokens=True)):].strip()
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "result": generated_text,
                "model": self.config.model_id,
                "processing_time": processing_time,
                "tokens_generated": len(outputs[0]) - len(inputs['input_ids'][0])
            }
            
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "model": self.config.model_id,
                "processing_time": time.time() - start_time
            }

# Flask API application
app = Flask(__name__)

# Global model instance
medgemma_model = None

def initialize_model():
    """Initialize MedGemma model on startup"""
    global medgemma_model
    
    try:
        # Check for custom model ID from environment
        model_id = os.getenv('MEDGEMMA_MODEL_ID', 'RSM-VLM/med-gemma')
        use_quantization = os.getenv('USE_QUANTIZATION', 'true').lower() == 'true'
        
        config = MedGemmaConfig(
            model_id=model_id,
            use_quantization=use_quantization
        )
        
        medgemma_model = MedGemmaInference(config)
        logger.info("MedGemma model initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize MedGemma: {e}")
        medgemma_model = None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy" if medgemma_model else "unhealthy",
        "model_loaded": medgemma_model is not None,
        "model_id": medgemma_model.config.model_id if medgemma_model else None
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    """Main analysis endpoint"""
    if not medgemma_model:
        return jsonify({
            "success": False,
            "error": "MedGemma model not available"
        }), 503
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'input' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: input"
            }), 400
        
        # Extract parameters
        text = data['input']
        task_type = data.get('type', 'general')
        context = data.get('context', '')
        options = data.get('options', {})
        
        # Add context to input if provided
        if context:
            text = f"{context}\n\n{text}"
        
        # Format prompt for medical analysis
        prompt = medgemma_model.format_medical_prompt(text, task_type)
        
        # Generate response
        response = medgemma_model.generate_response(
            prompt=prompt,
            max_new_tokens=options.get('maxTokens', 512),
            temperature=options.get('temperature', 0.7),
            top_k=options.get('top_k', 50),
            top_p=options.get('top_p', 0.95)
        )
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List available models"""
    models = [
        {
            "id": "RSM-VLM/med-gemma",
            "name": "MedGemma 7B",
            "description": "Medical Gemma model fine-tuned for clinical tasks",
            "loaded": medgemma_model and medgemma_model.config.model_id == "RSM-VLM/med-gemma"
        },
        {
            "id": "google/gemma-7b-it",
            "name": "Gemma 7B Instruct",
            "description": "Base Gemma model suitable for medical fine-tuning",
            "loaded": False
        }
    ]
    
    return jsonify({
        "models": models,
        "current_model": medgemma_model.config.model_id if medgemma_model else None
    })

if __name__ == '__main__':
    # Initialize model on startup
    initialize_model()
    
    # Start Flask server
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    logger.info(f"Starting MedGemma service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)