# MedGemma Integration Guide

## Overview

This guide explains how to integrate Google's MedGemma AI models into your Curie Radiology Search application using Supabase Edge Functions and Hugging Face API.

## Architecture

The MedGemma integration follows a secure, scalable architecture:

```
Frontend (React) → Client Service → Supabase Edge Function → Hugging Face API → MedGemma Models
```

## Setup Instructions

### 1. Get Hugging Face API Key

1. Visit [Hugging Face](https://huggingface.co/)
2. Create an account and go to Settings → Access Tokens
3. Create a new token with "Read" permissions
4. Accept the terms for MedGemma models:
   - [google/medgemma-4b-it](https://huggingface.co/google/medgemma-4b-it)
   - [google/medgemma-27b-text-it](https://huggingface.co/google/medgemma-27b-text-it)

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and add:

```bash
# Your existing Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Add Hugging Face API key for MedGemma
HUGGING_FACE_API_KEY=hf_your_api_key_here
```

### 3. Deploy Edge Function

Deploy the MedGemma Edge Function to your Supabase project:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Deploy the Edge Function
supabase functions deploy medgemma-analysis --no-verify-jwt
```

### 4. Set Environment Variables in Supabase

In your Supabase Dashboard:
1. Go to Settings → Edge Functions
2. Add environment variable: `HUGGING_FACE_API_KEY`
3. Set the value to your Hugging Face API key

## Features

### 1. Medical Text Analysis

Analyze medical reports, notes, and clinical text:

```typescript
import { useMedicalTextAnalysis } from '@/hooks/use-medgemma'

const { analyze, data, isLoading, error } = useMedicalTextAnalysis()

await analyze(
  "Chest X-ray shows bilateral lower lobe opacities...",
  "Patient presents with fever and cough"
)
```

### 2. Radiology Image Analysis

Analyze radiology images with clinical findings:

```typescript
import { useRadiologyImageAnalysis } from '@/hooks/use-medgemma'

const { analyze, data, isLoading, error } = useRadiologyImageAnalysis()

await analyze(
  "Chest X-ray shows bilateral lower lobe opacities",
  imageBase64Data,
  "Patient history of pneumonia"
)
```

### 3. Enhanced Search

Enhance search queries with medical terminology:

```typescript
import { useSearchEnhancement } from '@/hooks/use-medgemma'

const { enhance, data, isLoading, error } = useSearchEnhancement()

await enhance("chest pain")
// Returns: medical terms, radiology terms, ICD-10 codes
```

### 4. Clinical Q&A

Answer clinical questions with medical reasoning:

```typescript
import { useClinicalQA } from '@/hooks/use-medgemma'

const { ask, data, isLoading, error } = useClinicalQA()

await ask(
  "What are the differential diagnoses for bilateral lower lobe opacities?",
  "Patient with fever and productive cough"
)
```

## UI Components

### Medical Text Analyzer

```typescript
import { MedicalTextAnalyzer } from '@/components/medgemma/medical-text-analyzer'

<MedicalTextAnalyzer
  onAnalysisComplete={(analysis) => {
    console.log('Analysis:', analysis)
  }}
/>
```

### Medical Image Analyzer

```typescript
import { MedicalImageAnalyzer } from '@/components/medgemma/medical-image-analyzer'

<MedicalImageAnalyzer
  onAnalysisComplete={(analysis) => {
    console.log('Image Analysis:', analysis)
  }}
/>
```

### Enhanced Search

```typescript
import { EnhancedSearch } from '@/components/medgemma/enhanced-search'

<EnhancedSearch
  onSearch={(query, enhancedTerms) => {
    // Perform search with enhanced terms
    performSearch(query, enhancedTerms)
  }}
  autoEnhance={true}
  showEnhancementPanel={true}
/>
```

## Integration with Existing Search

To integrate MedGemma with your existing search functionality:

1. **Replace your search component** with `EnhancedSearch`:

```typescript
// Before
<input 
  type="text" 
  placeholder="Search..." 
  onChange={(e) => handleSearch(e.target.value)}
/>

// After
<EnhancedSearch
  onSearch={(query, enhancedTerms) => {
    // Use both original query and enhanced terms
    handleSearch(query, enhancedTerms)
  }}
  placeholder="Search radiology cases..."
/>
```

2. **Enhance search results** with MedGemma insights:

```typescript
const performSearch = async (query: string, enhancedTerms?: string[]) => {
  // Search with original query
  const results = await searchCases(query)
  
  // If enhanced terms available, also search with those
  if (enhancedTerms?.length) {
    const enhancedResults = await Promise.all(
      enhancedTerms.map(term => searchCases(term))
    )
    // Merge and deduplicate results
  }
  
  return results
}
```

## API Reference

### MedGemma Edge Function

**Endpoint:** `/functions/v1/medgemma-analysis`

**Request Body:**
```typescript
{
  type: 'text_analysis' | 'image_analysis' | 'search_enhancement' | 'clinical_qa',
  input: string,
  imageData?: string, // Base64 encoded
  context?: string,
  options?: {
    maxTokens?: number,
    temperature?: number,
    model?: 'medgemma-4b-it' | 'medgemma-27b-text-it'
  }
}
```

**Response:**
```typescript
{
  success: boolean,
  result?: string,
  error?: string,
  model: string,
  tokensUsed?: number,
  processingTime: number
}
```

## Model Selection

### MedGemma 4B (Recommended for most use cases)
- **Faster response times** (~2-5 seconds)
- **Lower cost** per request
- **Multimodal support** (text + images)
- **Good performance** on medical tasks

### MedGemma 27B (For complex analysis)
- **Higher accuracy** on complex medical reasoning
- **Better performance** on challenging cases
- **Text-only** currently
- **Slower response** (~5-15 seconds)

## Performance Optimization

### 1. Caching
The React hooks implement automatic caching with 5-minute TTL:

```typescript
// Results are cached automatically
const analysis1 = await analyze("chest pain") // API call
const analysis2 = await analyze("chest pain") // Cached result
```

### 2. Request Debouncing
Search enhancement is debounced by 1 second:

```typescript
// User types: "chest" → "chest p" → "chest pain"
// Only triggers enhancement after 1 second of no typing
```

### 3. Error Handling
Comprehensive error handling with fallbacks:

```typescript
const { data, error, isLoading } = useMedicalTextAnalysis({
  onError: (error) => {
    // Handle error gracefully
    toast({ title: "Analysis failed", description: error })
  }
})
```

## Cost Considerations

### Hugging Face Pricing
- **Free tier:** 30,000 characters per month
- **Pro tier:** $9/month for 10M characters
- **Enterprise:** Custom pricing

### Optimization Tips
1. **Use caching** to avoid duplicate requests
2. **Choose MedGemma 4B** for most use cases
3. **Limit token count** for shorter responses
4. **Debounce search** enhancement requests

## Security Considerations

### 1. API Key Security
- ✅ API key is stored in Supabase Edge Functions (server-side)
- ✅ Never exposed to client-side code
- ✅ Supabase provides secure environment variable storage

### 2. Data Privacy
- ⚠️ **Medical data is sent to Hugging Face** for processing
- ⚠️ **Review Hugging Face privacy policy** for compliance
- ✅ No data is stored permanently in the Edge Function

### 3. Rate Limiting
- Implement rate limiting in Edge Function if needed
- Monitor usage to prevent abuse

## Troubleshooting

### Common Issues

1. **"Model not found" error**
   - Ensure you've accepted the terms for MedGemma models on Hugging Face
   - Check your API key has proper permissions

2. **"Unauthorized" error**
   - Verify HUGGING_FACE_API_KEY is set correctly in Supabase
   - Check API key is valid and has not expired

3. **Slow responses**
   - Consider using MedGemma 4B instead of 27B
   - Reduce maxTokens in request options
   - Check Hugging Face service status

4. **Edge Function deployment fails**
   - Ensure Supabase CLI is latest version
   - Check project linking: `supabase link --project-ref your-id`
   - Verify function exists: `ls supabase/functions/`

### Debug Mode

Enable debug logging in development:

```typescript
// In your component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('MedGemma request:', request)
    console.log('MedGemma response:', response)
  }
}, [])
```

## Next Steps

1. **Test the integration** with sample medical text
2. **Deploy to production** after testing
3. **Monitor usage** and costs
4. **Consider upgrading** to MedGemma 27B for complex cases
5. **Integrate with your existing** radiology case database
6. **Add analytics** to track MedGemma usage effectiveness

## Support

For issues with:
- **Supabase Edge Functions:** [Supabase Documentation](https://supabase.com/docs/guides/functions)
- **Hugging Face API:** [Hugging Face Documentation](https://huggingface.co/docs/api-inference/index)
- **MedGemma Models:** [Google Health AI Documentation](https://developers.google.com/health-ai-developer-foundations/medgemma)

---

**⚠️ Important Medical Disclaimer**

MedGemma is a research model and is not clinical-grade. Always validate AI-generated content with qualified medical professionals before making clinical decisions. This integration is designed for educational and research purposes.