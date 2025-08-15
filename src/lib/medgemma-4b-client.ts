/**
 * @file medgemma-4b-client.ts
 * @description Simplified client for MedGemma 4B optimized for free-tier usage
 * @module lib
 * 
 * Key responsibilities:
 * - Lightweight API calls optimized for MedGemma 4B
 * - Automatic parameter optimization for free-tier usage
 * - Simple error handling and fallbacks
 * - Minimal token usage for cost efficiency
 * 
 * @reftools Verified against: Supabase Edge Functions, MedGemma 4B model specs
 * @author Claude Code
 * @created 2025-08-14
 */

import { createClient } from '@/lib/supabase/client';

// Optimized request type for MedGemma 4B
interface MedGemma4BRequest {
  prompt?: string;
  type?: 'clinical_qa' | 'text_analysis' | 'search_enhancement';
  context?: string;
}

interface MedGemma4BResponse {
  success: boolean;
  result: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  error?: string;
}

/**
 * Simplified MedGemma 4B client optimized for free-tier usage
 */
export class MedGemma4BClient {
  private supabase = createClient();

  /**
   * Send a simple prompt to MedGemma 4B with optimized parameters
   * @param prompt The medical question or text to analyze
   * @param options Optional configuration
   */
  async query(prompt: string, options: MedGemma4BRequest = {}): Promise<MedGemma4BResponse> {
    try {
      const { data, error } = await this.supabase.functions.invoke('medgemma-analysis', {
        body: {
          type: options.type || 'clinical_qa',
          input: prompt,
          context: options.context,
          options: {
            model: 'medgemma-4b-it', // Always use 4B for efficiency
            maxTokens: 200, // Optimized for free-tier
            temperature: 0.7
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Analysis failed');
      }

      return {
        success: true,
        result: data.result,
        model: data.model,
        tokensUsed: data.tokensUsed,
        processingTime: data.processingTime
      };
    } catch (error) {
      return {
        success: false,
        result: '',
        model: 'medgemma-4b-it',
        processingTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Analyze medical text with MedGemma 4B
   */
  async analyzeText(text: string, context?: string): Promise<MedGemma4BResponse> {
    return this.query(text, {
      type: 'text_analysis',
      context
    });
  }

  /**
   * Answer clinical questions with MedGemma 4B
   */
  async answerQuestion(question: string, context?: string): Promise<MedGemma4BResponse> {
    return this.query(question, {
      type: 'clinical_qa',
      context
    });
  }

  /**
   * Enhance search terms with medical terminology
   */
  async enhanceSearch(searchTerm: string): Promise<MedGemma4BResponse> {
    return this.query(searchTerm, {
      type: 'search_enhancement'
    });
  }
}

/**
 * Simple hook for MedGemma 4B integration
 */
export function useMedGemma4B() {
  const client = new MedGemma4BClient();

  return {
    /**
     * Quick medical question answering
     */
    askMedical: async (question: string): Promise<string> => {
      const response = await client.answerQuestion(question);
      if (!response.success) {
        throw new Error(response.error || 'Failed to get response');
      }
      return response.result;
    },

    /**
     * Analyze medical text/symptoms
     */
    analyzeSymptoms: async (symptoms: string, patientContext?: string): Promise<string> => {
      const response = await client.analyzeText(symptoms, patientContext);
      if (!response.success) {
        throw new Error(response.error || 'Failed to analyze symptoms');
      }
      return response.result;
    },

    /**
     * Enhance medical search terms
     */
    enhanceSearch: async (searchTerm: string): Promise<string[]> => {
      const response = await client.enhanceSearch(searchTerm);
      if (!response.success) {
        return [searchTerm]; // Fallback to original term
      }
      
      try {
        // Try to parse JSON response for enhanced terms
        const parsed = JSON.parse(response.result);
        return parsed.medicalTerms || parsed.enhancedTerms || [searchTerm];
      } catch {
        // If not JSON, return the raw response split by common delimiters
        return response.result.split(/[,\n|]/).map(term => term.trim()).filter(Boolean);
      }
    },

    // Direct access to the client for advanced usage
    client
  };
}

/**
 * Simple utility function for basic medical queries
 * @param prompt Medical question or text to analyze
 * @returns Promise with the AI response
 */
export async function queryMedGemma4B(prompt: string): Promise<string> {
  const client = new MedGemma4BClient();
  const response = await client.query(prompt);
  
  if (!response.success) {
    throw new Error(response.error || 'MedGemma query failed');
  }
  
  return response.result;
}

export default MedGemma4BClient;