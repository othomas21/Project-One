/**
 * @file medgemma-image-analyzer.tsx
 * @description MedGemma-powered medical image analysis component
 * @module components/medgemma
 * 
 * Key responsibilities:
 * - Upload medical images for MedGemma analysis
 * - Real-time AI analysis of radiology images
 * - Clinical findings extraction and interpretation
 * - Differential diagnosis suggestions
 * - Integration with MedGemma multimodal models
 * 
 * @reftools Verified against: React 18+ patterns, MedGemma Technical Report
 * @supabase Enhanced with MedGemma Edge Function integration
 * @author Claude Code
 * @created 2025-08-14
 */

"use client";

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Brain, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ImageIcon,
  Stethoscope,
  Eye,
  Zap
} from 'lucide-react';
import { useRadiologyImageAnalysis } from '@/hooks/use-medgemma';

interface AnalyzableImage {
  id: string;
  file: File;
  dataUrl: string;
  findings?: string;
  clinicalQuestion?: string;
  analysis?: string;
  isAnalyzing?: boolean;
  error?: string;
}

interface AnalysisOptions {
  model: 'medgemma-4b-it' | 'medgemma-27b-text-it';
  focusArea: 'general' | 'cardiovascular' | 'pulmonary' | 'neurological' | 'musculoskeletal' | 'gastrointestinal';
  urgency: 'routine' | 'urgent' | 'stat';
}

const FOCUS_AREAS = [
  { value: 'general', label: 'General Radiology' },
  { value: 'cardiovascular', label: 'Cardiovascular' },
  { value: 'pulmonary', label: 'Pulmonary' },
  { value: 'neurological', label: 'Neurological' },
  { value: 'musculoskeletal', label: 'Musculoskeletal' },
  { value: 'gastrointestinal', label: 'Gastrointestinal' }
];

const MODEL_OPTIONS = [
  { value: 'medgemma-4b-it', label: 'MedGemma 4B (Fast)', description: 'Quick analysis for routine cases' },
  { value: 'medgemma-27b-text-it', label: 'MedGemma 27B Text', description: 'Advanced text analysis with findings' }
];

export function MedGemmaImageAnalyzer() {
  const [images, setImages] = useState<AnalyzableImage[]>([]);
  const [analysisOptions, setAnalysisOptions] = useState<AnalysisOptions>({
    model: 'medgemma-4b-it',
    focusArea: 'general',
    urgency: 'routine'
  });
  const [isDragging, setIsDragging] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    analyze,
    isLoading,
    error: hookError
  } = useRadiologyImageAnalysis();

  /**
   * Convert file to base64 data URL
   */
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Validate if file is a supported image format
   */
  const isValidImageFile = (file: File): boolean => {
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/bmp',
      'image/webp',
      'application/dicom',
      'application/octet-stream'
    ];
    
    const validExtensions = ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp', '.webp', '.dcm', '.dicom'];
    
    return validTypes.includes(file.type) || 
           validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  /**
   * Handle file selection and processing
   */
  const handleFiles = useCallback(async (selectedFiles: FileList) => {
    const validFiles = Array.from(selectedFiles).filter(isValidImageFile);
    
    if (validFiles.length === 0) {
      alert('Please select valid image files (JPEG, PNG, TIFF, DICOM, etc.)');
      return;
    }

    const newImages: AnalyzableImage[] = [];
    
    for (const file of validFiles) {
      try {
        const dataUrl = await fileToDataUrl(file);
        const imageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const image: AnalyzableImage = {
          id: imageId,
          file,
          dataUrl,
          findings: '',
          clinicalQuestion: `Please analyze this ${analysisOptions.focusArea} image and provide clinical insights.`
        };
        
        newImages.push(image);
      } catch (error) {
        console.error('Failed to process file:', file.name, error);
      }
    }
    
    setImages(prev => [...prev, ...newImages]);
    
    // Auto-analyze if enabled
    if (autoAnalyze && newImages.length > 0) {
      for (const image of newImages) {
        await analyzeImage(image.id);
      }
    }
  }, [analysisOptions.focusArea, autoAnalyze]);

  /**
   * Analyze image with MedGemma
   */
  const analyzeImage = useCallback(async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    // Update image state to show analyzing
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, isAnalyzing: true, error: undefined }
        : img
    ));

    try {
      // Convert data URL to base64 (remove data:image/...;base64, prefix)
      const base64Data = image.dataUrl.split(',')[1];
      
      // Construct analysis prompt based on clinical question and findings
      let analysisPrompt = image.clinicalQuestion || 'Please analyze this medical image.';
      
      if (image.findings && image.findings.trim()) {
        analysisPrompt += `\n\nClinical findings: ${image.findings}`;
      }
      
      // Add focus area context
      if (analysisOptions.focusArea !== 'general') {
        analysisPrompt += `\n\nFocus on ${analysisOptions.focusArea} aspects.`;
      }
      
      // Add urgency context
      if (analysisOptions.urgency === 'urgent' || analysisOptions.urgency === 'stat') {
        analysisPrompt += `\n\nThis is a ${analysisOptions.urgency} case - please prioritize key findings.`;
      }

      const result = await analyze(
        analysisPrompt,
        base64Data,
        `Medical image analysis for ${analysisOptions.focusArea} radiology`,
        {
          model: analysisOptions.model,
          maxTokens: 512,
          temperature: 0.3
        }
      );

      // Update image with analysis result
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, isAnalyzing: false, analysis: result }
          : img
      ));

    } catch (error) {
      console.error('Analysis failed:', error);
      
      // Update image with error
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              isAnalyzing: false, 
              error: error instanceof Error ? error.message : 'Analysis failed'
            }
          : img
      ));
    }
  }, [images, analyze, analysisOptions]);

  /**
   * Remove image from analysis queue
   */
  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  /**
   * Update image metadata
   */
  const updateImage = (imageId: string, updates: Partial<AnalyzableImage>) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ));
  };

  /**
   * Handle drag and drop events
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  }, [handleFiles]);

  return (
    <div className="space-y-6">
      {/* Analysis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            MedGemma Image Analysis
          </CardTitle>
          <CardDescription>
            Upload medical images for AI-powered analysis using Google's MedGemma models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>AI Model</Label>
              <Select 
                value={analysisOptions.model} 
                onValueChange={(value) => setAnalysisOptions(prev => ({ 
                  ...prev, 
                  model: value as AnalysisOptions['model'] 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map(model => (
                    <SelectItem key={model.value} value={model.value}>
                      <div>
                        <div className="font-medium">{model.label}</div>
                        <div className="text-xs text-muted-foreground">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Focus Area</Label>
              <Select 
                value={analysisOptions.focusArea} 
                onValueChange={(value) => setAnalysisOptions(prev => ({ 
                  ...prev, 
                  focusArea: value as AnalysisOptions['focusArea'] 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOCUS_AREAS.map(area => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Urgency</Label>
              <Select 
                value={analysisOptions.urgency} 
                onValueChange={(value) => setAnalysisOptions(prev => ({ 
                  ...prev, 
                  urgency: value as AnalysisOptions['urgency'] 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">STAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-analyze"
              checked={autoAnalyze}
              onChange={(e) => setAutoAnalyze(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="auto-analyze" className="text-sm">
              Automatically analyze images after upload
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Image Drop Zone */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
      }`}>
        <CardContent 
          className="p-8 text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
                <Brain className="h-6 w-6 text-primary absolute -top-1 -right-1 bg-background rounded-full p-1" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Drop medical images for AI analysis</h3>
              <p className="text-muted-foreground">
                Supports DICOM, JPEG, PNG, TIFF and other medical image formats
              </p>
            </div>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Choose Images
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".dcm,.dicom,.jpg,.jpeg,.png,.tiff,.tif,.bmp,.webp"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Global Errors */}
      {hookError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{hookError}</AlertDescription>
        </Alert>
      )}

      {/* Image Analysis Results */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Analysis Results ({images.length})
            </h3>
            <Button
              onClick={() => images.forEach(img => !img.analysis && !img.isAnalyzing && analyzeImage(img.id))}
              disabled={isLoading || images.every(img => img.analysis || img.isAnalyzing)}
              size="sm"
              variant="outline"
            >
              <Brain className="h-4 w-4 mr-2" />
              Analyze All
            </Button>
          </div>
          
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image Preview */}
                <div className="relative bg-muted/50 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium truncate">{image.file.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {(image.file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(image.id)}
                      disabled={image.isAnalyzing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="aspect-square bg-background rounded-lg overflow-hidden mb-3">
                    <img
                      src={image.dataUrl}
                      alt={image.file.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Clinical Question Input */}
                  <div className="space-y-2">
                    <Label className="text-xs">Clinical Question</Label>
                    <Textarea
                      value={image.clinicalQuestion || ''}
                      onChange={(e) => updateImage(image.id, { clinicalQuestion: e.target.value })}
                      placeholder="What specific question do you want answered about this image?"
                      className="text-sm"
                      rows={2}
                      disabled={image.isAnalyzing}
                    />
                  </div>
                  
                  {/* Findings Input */}
                  <div className="space-y-2">
                    <Label className="text-xs">Clinical Findings (Optional)</Label>
                    <Textarea
                      value={image.findings || ''}
                      onChange={(e) => updateImage(image.id, { findings: e.target.value })}
                      placeholder="Enter any clinical findings or context..."
                      className="text-sm"
                      rows={2}
                      disabled={image.isAnalyzing}
                    />
                  </div>
                </div>
                
                {/* Analysis Results */}
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      AI Analysis
                    </h5>
                    <div className="flex items-center gap-2">
                      {image.isAnalyzing && (
                        <Badge variant="outline" className="gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Analyzing...
                        </Badge>
                      )}
                      {image.analysis && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Complete
                        </Badge>
                      )}
                      {!image.analysis && !image.isAnalyzing && (
                        <Button
                          onClick={() => analyzeImage(image.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Brain className="h-4 w-4 mr-1" />
                          Analyze
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {image.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {image.error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {image.analysis ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-2 mb-2">
                          <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                              MedGemma Analysis
                            </p>
                            <p className="text-blue-800 dark:text-blue-200 whitespace-pre-wrap leading-relaxed">
                              {image.analysis}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        Model: {MODEL_OPTIONS.find(m => m.value === analysisOptions.model)?.label}
                        <span>•</span>
                        <Eye className="h-3 w-3" />
                        Focus: {FOCUS_AREAS.find(a => a.value === analysisOptions.focusArea)?.label}
                      </div>
                    </div>
                  ) : image.isAnalyzing ? (
                    <div className="space-y-3">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        MedGemma is analyzing the image...
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Click "Analyze" to get AI insights</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}