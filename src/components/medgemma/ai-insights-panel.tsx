/**
 * @file ai-insights-panel.tsx
 * @description AI insights panel showing MedGemma analysis and clinical information
 * @module components/medgemma
 * 
 * Key responsibilities:
 * - Display clinical insights and AI analysis
 * - Show differential diagnoses and recommendations
 * - Medical terminology explanations
 * - Interactive medical question answering
 * - Integration with search results context
 * 
 * @reftools Verified against: React 18+ patterns, Lucide icons
 * @supabase Enhanced with MedGemma clinical Q&A
 * @author Claude Code
 * @created 2025-08-13
 */

"use client";

import { useState, useCallback } from "react";
import { 
  Brain, 
  MessageSquare, 
  Send, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb,
  Stethoscope,
  AlertCircle,
  BookOpen,
  Settings,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useClinicalQA, useMedicalTextAnalysis } from "@/hooks/use-medgemma";

interface AIInsightsPanelProps {
  searchQuery?: string;
  searchResults?: any[];
  selectedCaseId?: string;
  className?: string;
}

interface QAHistory {
  question: string;
  answer: string;
  timestamp: Date;
  model: string;
  processingTime?: number;
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
  recommended?: boolean;
}

const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'medgemma-4b-it',
    name: 'MedGemma 4B Instruct',
    description: 'Optimized for clinical analysis, fast inference',
    recommended: true
  },
  {
    id: 'medgemma-27b-it',
    name: 'MedGemma 27B Multimodal',
    description: 'Advanced multimodal model for complex analysis',
  },
  {
    id: 'medgemma-27b-text-it',
    name: 'MedGemma 27B Text-Only',
    description: 'Text-only model optimized for medical reasoning',
  },
  {
    id: 'medgemma-4b-pt',
    name: 'MedGemma 4B Pre-trained',
    description: 'Pre-trained model for fine-tuning workflows',
  }
];

export function AIInsightsPanel({
  searchQuery,
  searchResults,
  className = "",
}: AIInsightsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [qaHistory, setQAHistory] = useState<QAHistory[]>([]);
  const [analysisText, setAnalysisText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState("medgemma-4b-it");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);
  const [realTimeMode, setRealTimeMode] = useState(false);

  const {
    ask,
    data: currentAnswer,
    isLoading: isAsking,
    error: qaError
  } = useClinicalQA();

  const {
    analyze,
    data: textAnalysis,
    isLoading: isAnalyzingText,
    error: analysisError
  } = useMedicalTextAnalysis();

  const handleAskQuestion = useCallback(async () => {
    if (!currentQuestion.trim()) return;

    try {
      const context = searchQuery 
        ? `User is searching for: ${searchQuery}. ${searchResults?.length ? `Found ${searchResults.length} results.` : ''}`
        : undefined;

      const startTime = Date.now();
      const answer = await ask(currentQuestion, context, {
        model: selectedModel as any,
        temperature,
        maxTokens
      });
      
      if (answer) {
        const processingTime = Date.now() - startTime;
        setQAHistory(prev => [
          {
            question: currentQuestion,
            answer,
            timestamp: new Date(),
            model: selectedModel,
            processingTime,
          },
          ...prev
        ]);
        setCurrentQuestion("");
      }
    } catch (error) {
      console.error("Failed to ask question:", error);
    }
  }, [currentQuestion, searchQuery, searchResults, ask]);

  const handleAnalyzeText = useCallback(async () => {
    if (!analysisText.trim()) return;

    setIsAnalyzing(true);
    try {
      await analyze(analysisText, `Context: Radiology search interface analysis`, {
        model: selectedModel as any,
        temperature,
        maxTokens
      });
    } catch (error) {
      console.error("Failed to analyze text:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [analysisText, analyze]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <Card className={className}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Medical Insights
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Model Selection and Settings */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  AI Model Configuration
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="model-select" className="text-xs">Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select MedGemma model" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                            {model.recommended && (
                              <Badge variant="secondary" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.description}
                  </p>
                </div>

                {showAdvancedSettings && (
                  <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="temperature" className="text-xs">Temperature: {temperature}</Label>
                      <input
                        type="range"
                        id="temperature"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Controls response creativity</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="tokens" className="text-xs">Max Tokens: {maxTokens}</Label>
                      <input
                        type="range"
                        id="tokens"
                        min="128"
                        max="1024"
                        step="64"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Maximum response length</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="real-time"
                        checked={realTimeMode}
                        onCheckedChange={setRealTimeMode}
                      />
                      <Label htmlFor="real-time" className="text-xs">Real-time Analysis</Label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Search Context */}
            {searchQuery && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Current Search Context
                </h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{searchQuery}</p>
                  {searchResults && searchResults.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {searchResults.length} results found
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Clinical Q&A Section */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Ask MedGemma
              </h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a clinical question..."
                    disabled={isAsking}
                  />
                  <Button
                    onClick={handleAskQuestion}
                    disabled={!currentQuestion.trim() || isAsking}
                    size="sm"
                  >
                    {isAsking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {qaError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{qaError}</AlertDescription>
                  </Alert>
                )}

                {/* Current Answer */}
                {currentAnswer && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap">
                      {currentAnswer}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Q&A History */}
            {qaHistory.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Recent Questions
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {qaHistory.slice(0, 5).map((item, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium">{item.question}</p>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="outline" className="text-xs">
                            {AVAILABLE_MODELS.find(m => m.id === item.model)?.name || item.model}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Badge>
                          {item.processingTime && (
                            <Badge variant="secondary" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              {item.processingTime}ms
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Text Analysis Section */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Analyze Medical Text
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <textarea
                    value={analysisText}
                    onChange={(e) => setAnalysisText(e.target.value)}
                    placeholder="Paste clinical findings, reports, or medical text for AI analysis..."
                    className="w-full min-h-[100px] p-3 border rounded-lg resize-none text-sm"
                    disabled={isAnalyzingText || isAnalyzing}
                  />
                  <Button
                    onClick={handleAnalyzeText}
                    disabled={!analysisText.trim() || isAnalyzingText || isAnalyzing}
                    size="sm"
                    className="w-full"
                  >
                    {(isAnalyzingText || isAnalyzing) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Analyze Text
                      </>
                    )}
                  </Button>
                </div>

                {analysisError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{analysisError}</AlertDescription>
                  </Alert>
                )}

                {textAnalysis && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-medium mb-2 text-green-900 dark:text-green-100">
                      AI Analysis Results
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                      {textAnalysis}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Clinical Questions */}
            <div>
              <h3 className="text-sm font-medium mb-3">Quick Questions</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "What imaging modalities are best for this condition?",
                  "What are the differential diagnoses?",
                  "What follow-up is recommended?",
                  "What are the key radiological signs?",
                ].map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentQuestion(question)}
                    className="justify-start text-left h-auto p-2 text-xs"
                    disabled={isAsking}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}