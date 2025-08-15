/**
 * @file medgemma-config.ts
 * @description Configuration and settings for MedGemma AI integration
 * @module lib
 * 
 * Key responsibilities:
 * - Model configuration and selection
 * - API endpoints and rate limits
 * - Performance optimization settings
 * - Security and compliance settings
 * - Error handling configuration
 * 
 * @reftools Verified against: Google MedGemma Technical Report
 * @author Claude Code
 * @created 2025-08-14
 */

// Available MedGemma models with their specifications
export const MEDGEMMA_MODELS = {
  'medgemma-4b-it': {
    id: 'medgemma-4b-it',
    name: 'MedGemma 4B Instruction-Tuned',
    description: 'Fast medical analysis optimized for clinical workflows',
    huggingFaceId: 'google/medgemma-4b-it',
    maxTokens: 8192,
    contextLength: 128000,
    multimodal: false,
    recommended: true,
    useCases: ['text_analysis', 'clinical_qa', 'search_enhancement'],
    averageLatency: 800, // ms
    costTier: 'standard'
  },
  'medgemma-4b-pt': {
    id: 'medgemma-4b-pt',
    name: 'MedGemma 4B Pre-trained',
    description: 'Pre-trained model for fine-tuning and research',
    huggingFaceId: 'google/medgemma-4b-pt',
    maxTokens: 8192,
    contextLength: 128000,
    multimodal: false,
    recommended: false,
    useCases: ['research', 'fine_tuning'],
    averageLatency: 750,
    costTier: 'standard'
  },
  'medgemma-27b-it': {
    id: 'medgemma-27b-it',
    name: 'MedGemma 27B Multimodal',
    description: 'Advanced multimodal model for complex medical analysis',
    huggingFaceId: 'google/medgemma-27b-it',
    maxTokens: 8192,
    contextLength: 128000,
    multimodal: true,
    recommended: true,
    useCases: ['image_analysis', 'multimodal_analysis', 'complex_reasoning'],
    averageLatency: 2500,
    costTier: 'premium'
  },
  'medgemma-27b-text-it': {
    id: 'medgemma-27b-text-it',
    name: 'MedGemma 27B Text-Only',
    description: 'Text-only model optimized for medical reasoning',
    huggingFaceId: 'google/medgemma-27b-text-it',
    maxTokens: 8192,
    contextLength: 128000,
    multimodal: false,
    recommended: true,
    useCases: ['text_analysis', 'clinical_qa', 'complex_reasoning'],
    averageLatency: 2200,
    costTier: 'premium'
  }
} as const;

// Fallback models when MedGemma is unavailable
export const FALLBACK_MODELS = {
  'gemma-2b-it': {
    id: 'gemma-2b-it',
    name: 'Gemma 2B Instruction-Tuned',
    huggingFaceId: 'google/gemma-2b-it',
    maxTokens: 2048,
    contextLength: 8192,
    multimodal: false,
    averageLatency: 600,
    costTier: 'low'
  },
  'gemma-7b-it': {
    id: 'gemma-7b-it',
    name: 'Gemma 7B Instruction-Tuned',
    huggingFaceId: 'google/gemma-7b-it',
    maxTokens: 4096,
    contextLength: 32768,
    multimodal: false,
    averageLatency: 1200,
    costTier: 'standard'
  }
} as const;

// Vision models for multimodal analysis
export const VISION_MODELS = {
  'paligemma-3b-pt-896': {
    id: 'paligemma-3b-pt-896',
    name: 'PaliGemma 3B (896px)',
    huggingFaceId: 'google/paligemma-3b-pt-896',
    maxTokens: 2048,
    imageResolution: 896,
    multimodal: true,
    averageLatency: 1800,
    costTier: 'standard'
  },
  'paligemma-3b-pt-224': {
    id: 'paligemma-3b-pt-224',
    name: 'PaliGemma 3B (224px)',
    huggingFaceId: 'google/paligemma-3b-pt-224',
    maxTokens: 2048,
    imageResolution: 224,
    multimodal: true,
    averageLatency: 1200,
    costTier: 'standard'
  }
} as const;

// Default configuration
export const DEFAULT_CONFIG = {
  models: {
    default: 'medgemma-4b-it',
    multimodal: 'medgemma-27b-it',
    fallback: ['medgemma-4b-it', 'medgemma-27b-text-it', 'gemma-7b-it', 'gemma-2b-it']
  },
  api: {
    baseUrl: 'https://api-inference.huggingface.co/models',
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000 // 1 second base delay
  },
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100 // Maximum cached responses
  },
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    tokensPerDay: 100000
  },
  performance: {
    maxTokensDefault: 512,
    temperatureDefault: 0.7,
    topPDefault: 0.95,
    topKDefault: 50,
    repetitionPenaltyDefault: 1.1
  },
  security: {
    requireConsent: true,
    logRequests: true,
    sanitizeInputs: true,
    maxImageSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/tiff', 'image/bmp', 'image/webp', 'application/dicom']
  }
} as const;

// Medical specialties and their focus areas
export const MEDICAL_SPECIALTIES = {
  radiology: {
    name: 'Radiology',
    icon: 'activity',
    modalities: ['CT', 'MRI', 'X-ray', 'Ultrasound', 'PET', 'Nuclear Medicine'],
    bodyParts: ['chest', 'abdomen', 'head', 'spine', 'extremities', 'pelvis'],
    commonFindings: ['normal', 'abnormal', 'mass', 'fluid', 'fracture', 'inflammation']
  },
  cardiology: {
    name: 'Cardiology',
    icon: 'heart',
    modalities: ['ECG', 'Echocardiogram', 'Cardiac CT', 'Cardiac MRI', 'Angiography'],
    bodyParts: ['heart', 'coronary arteries', 'aorta', 'pulmonary vessels'],
    commonFindings: ['normal', 'ischemia', 'infarction', 'arrhythmia', 'stenosis', 'regurgitation']
  },
  neurology: {
    name: 'Neurology',
    icon: 'brain',
    modalities: ['Head CT', 'Brain MRI', 'EEG', 'EMG', 'Nerve Conduction'],
    bodyParts: ['brain', 'spinal cord', 'peripheral nerves', 'muscles'],
    commonFindings: ['normal', 'stroke', 'hemorrhage', 'tumor', 'seizure', 'neuropathy']
  },
  orthopedics: {
    name: 'Orthopedics',
    icon: 'bone',
    modalities: ['X-ray', 'MRI', 'CT', 'Bone Scan', 'Ultrasound'],
    bodyParts: ['spine', 'joints', 'bones', 'soft tissue', 'extremities'],
    commonFindings: ['normal', 'fracture', 'arthritis', 'dislocation', 'tear', 'inflammation']
  },
  pulmonology: {
    name: 'Pulmonology',
    icon: 'wind',
    modalities: ['Chest X-ray', 'Chest CT', 'PFT', 'Bronchoscopy'],
    bodyParts: ['lungs', 'bronchi', 'pleura', 'mediastinum'],
    commonFindings: ['normal', 'pneumonia', 'pneumothorax', 'effusion', 'nodule', 'atelectasis']
  }
} as const;

// Analysis types and their configurations
export const ANALYSIS_TYPES = {
  text_analysis: {
    name: 'Text Analysis',
    description: 'Analyze clinical text for insights and recommendations',
    icon: 'file-text',
    defaultModel: 'medgemma-4b-it',
    maxTokens: 512,
    temperature: 0.5,
    systemPrompt: 'You are an expert medical AI assistant. Analyze the following clinical text and provide insights, differential diagnoses, and recommendations.',
    examples: [
      'Patient presents with chest pain and shortness of breath',
      'Fever, cough, and fatigue for 3 days',
      'Acute abdominal pain in right lower quadrant'
    ]
  },
  clinical_qa: {
    name: 'Clinical Q&A',
    description: 'Answer medical questions with evidence-based responses',
    icon: 'message-square',
    defaultModel: 'medgemma-4b-it',
    maxTokens: 512,
    temperature: 0.4,
    systemPrompt: 'You are a knowledgeable medical assistant. Provide accurate, evidence-based answers to clinical questions.',
    examples: [
      'What are the indications for CT scan in head trauma?',
      'How do you differentiate bacterial from viral pneumonia?',
      'What are the treatment options for acute myocardial infarction?'
    ]
  },
  search_enhancement: {
    name: 'Search Enhancement',
    description: 'Enhance medical search queries with professional terminology',
    icon: 'search',
    defaultModel: 'medgemma-4b-it',
    maxTokens: 256,
    temperature: 0.3,
    systemPrompt: 'Convert lay medical terms to professional terminology and suggest related medical concepts.',
    examples: [
      'heart attack',
      'broken bone',
      'difficulty breathing'
    ]
  },
  image_analysis: {
    name: 'Image Analysis',
    description: 'Analyze medical images with AI-powered interpretation',
    icon: 'image',
    defaultModel: 'medgemma-27b-it',
    maxTokens: 512,
    temperature: 0.3,
    systemPrompt: 'You are an expert radiologist. Analyze this medical image and provide a detailed interpretation.',
    examples: [
      'Chest X-ray showing possible pneumonia',
      'CT scan with suspected appendicitis',
      'MRI brain with stroke protocol'
    ]
  }
} as const;

// Error codes and their handling
export const ERROR_CODES = {
  MODEL_UNAVAILABLE: {
    code: 'MODEL_UNAVAILABLE',
    message: 'MedGemma model is currently unavailable',
    action: 'Falling back to alternative model',
    retryable: true
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'API rate limit exceeded',
    action: 'Please wait before making another request',
    retryable: true
  },
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    message: 'Invalid input provided',
    action: 'Please check your input and try again',
    retryable: false
  },
  API_KEY_MISSING: {
    code: 'API_KEY_MISSING',
    message: 'Hugging Face API key not configured',
    action: 'Please configure HUGGING_FACE_API_KEY environment variable',
    retryable: false
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network connection failed',
    action: 'Please check your internet connection',
    retryable: true
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    message: 'Request timed out',
    action: 'Please try again with a shorter input',
    retryable: true
  }
} as const;

// Utility functions
export const getModelById = (modelId: string) => {
  return (MEDGEMMA_MODELS as any)[modelId] || (FALLBACK_MODELS as any)[modelId] || (VISION_MODELS as any)[modelId];
};

export const getRecommendedModel = (analysisType: keyof typeof ANALYSIS_TYPES, multimodal = false) => {
  if (multimodal) {
    return MEDGEMMA_MODELS['medgemma-27b-it'];
  }
  
  const typeConfig = ANALYSIS_TYPES[analysisType];
  return MEDGEMMA_MODELS[typeConfig.defaultModel];
};

export const getModelFallbackChain = (preferredModel: string) => {
  const model = getModelById(preferredModel);
  if (!model) return DEFAULT_CONFIG.models.fallback;
  
  if (model.multimodal) {
    return ['medgemma-27b-it', 'medgemma-4b-it', 'gemma-7b-it', 'gemma-2b-it'];
  }
  
  return ['medgemma-4b-it', 'medgemma-27b-text-it', 'gemma-7b-it', 'gemma-2b-it'];
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > DEFAULT_CONFIG.security.maxImageSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }
  
  if (!DEFAULT_CONFIG.security.allowedImageTypes.includes(file.type as any)) {
    return { valid: false, error: 'Unsupported file type' };
  }
  
  return { valid: true };
};

export const sanitizeInput = (input: string): string => {
  if (!DEFAULT_CONFIG.security.sanitizeInputs) return input;
  
  // Remove potential script tags and other dangerous content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const estimateTokenCount = (text: string): number => {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
};

export const estimateCost = (tokens: number, model: string): number => {
  // Rough cost estimation in USD (placeholder values)
  const costPerToken = {
    'medgemma-4b-it': 0.0001,
    'medgemma-27b-it': 0.0005,
    'medgemma-27b-text-it': 0.0004,
    'gemma-7b-it': 0.0002,
    'gemma-2b-it': 0.00005
  };
  
  return tokens * ((costPerToken as any)[model] || 0.0001);
};