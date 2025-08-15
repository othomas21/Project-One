# MedGemma Deployment Guide

## 🚀 Comprehensive deployment guide for MedGemma integration with your medical radiology application

### Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Hugging Face Configuration](#hugging-face-configuration)
4. [Deployment Options](#deployment-options)
5. [Testing and Validation](#testing-and-validation)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts and Services
- **Hugging Face Account**: [Sign up here](https://huggingface.co/join)
- **Supabase Project**: Your existing project
- **Vercel Account**: For deployment (recommended)

### System Requirements
- Node.js 18+ (for Next.js application)
- Python 3.11+ (for optional local inference)
- Docker (for containerized deployment)
- 8GB+ RAM recommended for local MedGemma inference

## Environment Setup

### 1. Hugging Face API Key Setup

```bash
# 1. Visit https://huggingface.co/settings/tokens
# 2. Create a new token with 'Read' permissions
# 3. Accept the license for MedGemma models:
#    - Visit https://huggingface.co/RSM-VLM/med-gemma
#    - Click "Agree and access repository"
```

### 2. Environment Variables Configuration

Copy the updated `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the following critical variables:

```env
# Required for MedGemma
HUGGING_FACE_API_KEY=hf_your_actual_token_here
USE_REAL_MEDGEMMA=true  # Enable real models
NEXT_PUBLIC_ENABLE_AI_FEATURES=true

# Model Configuration
DEFAULT_MEDGEMMA_MODEL=medgemma-7b
MEDGEMMA_MAX_TOKENS=512
MEDGEMMA_TEMPERATURE=0.7
```

### 3. Supabase Edge Function Environment

Set environment variables in your Supabase project:

```bash
# Using Supabase CLI
supabase secrets set HUGGING_FACE_API_KEY=hf_your_token_here
supabase secrets set USE_REAL_MEDGEMMA=true
```

Or via Supabase Dashboard:
1. Go to Project Settings → Edge Functions
2. Add environment variables:
   - `HUGGING_FACE_API_KEY`: Your Hugging Face token
   - `USE_REAL_MEDGEMMA`: `true`

## Deployment Options

### Option 1: Vercel + Supabase (Recommended)

**Advantages:**
- Serverless architecture
- Global CDN
- Automatic scaling
- Simple deployment

**Setup:**

1. **Deploy Edge Function:**
```bash
supabase functions deploy medgemma-analysis
```

2. **Deploy to Vercel:**
```bash
# Connect to Vercel
npx vercel

# Add environment variables in Vercel dashboard
# or use CLI:
npx vercel env add HUGGING_FACE_API_KEY
npx vercel env add USE_REAL_MEDGEMMA
```

3. **Verify Deployment:**
```bash
curl -X POST https://your-project.vercel.app/api/test-medgemma \
  -H "Content-Type: application/json" \
  -d '{"type": "clinical_qa", "input": "What are the symptoms of pneumonia?"}'
```

### Option 2: Local Python Service + Vercel

**Advantages:**
- Higher performance
- Model caching
- GPU acceleration support
- Lower API costs

**Setup:**

1. **Start Python Service:**
```bash
cd api
pip install -r requirements.txt
python medgemma-local.py
```

2. **Configure Environment:**
```env
MEDGEMMA_LOCAL_URL=http://localhost:8000
USE_LOCAL_MEDGEMMA=true
```

3. **Docker Deployment:**
```bash
cd api
docker build -t medgemma-local .
docker run -p 8000:8000 -e HUGGING_FACE_TOKEN=hf_your_token medgemma-local
```

### Option 3: Full Docker Deployment

**Complete containerized setup:**

```yaml
# docker-compose.yml
version: '3.8'
services:
  medgemma-api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      - HUGGING_FACE_TOKEN=${HUGGING_FACE_TOKEN}
      - MEDGEMMA_MODEL_ID=RSM-VLM/med-gemma
    volumes:
      - ./models:/app/models
    
  nextjs-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MEDGEMMA_LOCAL_URL=http://medgemma-api:8000
      - USE_LOCAL_MEDGEMMA=true
    depends_on:
      - medgemma-api
```

## Testing and Validation

### 1. Basic Functionality Test

```typescript
// Test clinical Q&A
const response = await fetch('/api/medgemma-test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'clinical_qa',
    input: 'What imaging is best for acute abdominal pain?',
    options: { model: 'medgemma-7b' }
  })
});

const result = await response.json();
console.log('MedGemma Response:', result);
```

### 2. Performance Testing

```bash
# Test Edge Function performance
curl -X POST "https://your-project.supabase.co/functions/v1/medgemma-analysis" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text_analysis",
    "input": "Patient presents with chest pain and shortness of breath",
    "options": {"model": "medgemma-7b"}
  }' \
  -w "Time: %{time_total}s\n"
```

### 3. Model Quality Validation

Create test cases for different medical scenarios:

```typescript
const testCases = [
  {
    type: 'clinical_qa',
    input: 'What are the differential diagnoses for acute chest pain?',
    expectedKeywords: ['myocardial infarction', 'pulmonary embolism', 'aortic dissection']
  },
  {
    type: 'search_enhancement',
    input: 'chest pain',
    expectedTerms: ['angina', 'myocardial', 'cardiac']
  }
];
```

## Monitoring and Maintenance

### 1. Performance Monitoring

```typescript
// Add to your application
const metricsCollector = {
  trackMedGemmaRequest: (type: string, model: string, duration: number) => {
    console.log(`MedGemma Request: ${type} via ${model} took ${duration}ms`);
    // Send to your analytics service
  }
};
```

### 2. Error Tracking

```typescript
// Enhanced error handling
try {
  const result = await callMedGemma(request);
} catch (error) {
  // Track specific error types
  if (error.message.includes('quota')) {
    console.error('Hugging Face quota exceeded');
  } else if (error.message.includes('model loading')) {
    console.error('Model still loading, retrying...');
  }
}
```

### 3. Cost Management

Monitor your Hugging Face usage:
- Set up budget alerts
- Track API calls per model
- Implement intelligent caching
- Use lighter models for simple queries

## Troubleshooting

### Common Issues

#### 1. "Model not found" Error
```bash
# Solution: Ensure you've accepted the model license
curl -H "Authorization: Bearer hf_your_token" \
  https://huggingface.co/api/models/RSM-VLM/med-gemma
```

#### 2. "Quota exceeded" Error
- Upgrade your Hugging Face plan
- Implement request queuing
- Use local inference for high-volume scenarios

#### 3. Slow Response Times
- Enable model caching: `use_cache: true`
- Use quantized models: `USE_QUANTIZATION=true`
- Consider local deployment for production

#### 4. Memory Issues (Local Deployment)
```python
# Reduce memory usage
config = MedGemmaConfig(
    use_quantization=True,
    max_memory={"0": "6GB"}  # Limit GPU memory
)
```

### Debug Commands

```bash
# Check Edge Function logs
supabase functions logs medgemma-analysis

# Test local Python service
curl http://localhost:8000/health

# Verify Hugging Face authentication
curl -H "Authorization: Bearer hf_your_token" \
  https://huggingface.co/api/whoami
```

## Production Checklist

- [ ] Hugging Face API key configured
- [ ] Model licenses accepted
- [ ] Environment variables set in all environments
- [ ] Edge Function deployed and tested
- [ ] Error handling and fallbacks implemented
- [ ] Performance monitoring in place
- [ ] Security review completed
- [ ] Cost monitoring configured
- [ ] Backup inference method available

## Security Considerations

### API Key Security
- Never expose Hugging Face tokens to the client
- Use environment variables only
- Rotate keys regularly
- Monitor usage for anomalies

### Medical Data Privacy
- Ensure no PHI is sent to external APIs
- Implement request logging with privacy controls
- Consider on-premises deployment for sensitive data
- Comply with HIPAA requirements

## Support and Resources

- **Hugging Face Documentation**: https://huggingface.co/docs
- **MedGemma Model**: https://huggingface.co/RSM-VLM/med-gemma
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Vercel Deployment**: https://vercel.com/docs

---

**Note**: This deployment guide ensures HIPAA compliance and medical data privacy standards. Always review medical AI outputs with qualified healthcare professionals.