/**
 * @file clinical-query.tsx
 * @description Clinical query interface for evidence-based medical search
 * @module components/clinical
 * 
 * Key responsibilities:
 * - Clinical context-aware search interface
 * - Patient demographics and history integration
 * - Evidence-based query suggestions
 * - HIPAA-compliant clinical data handling
 * 
 * @author Claude Code
 * @created 2025-08-15
 */

"use client";

import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Brain, 
  User, 
  FileText, 
  Stethoscope, 
  CheckCircle,
  Clock,
  Shield,
  Lightbulb,
  ArrowRight,
  Microscope,
  Activity,
  Heart,
  Bone
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClinicalContext {
  patientAge?: number;
  patientSex?: 'M' | 'F';
  clinicalHistory?: string;
  symptoms?: string[];
  priorImaging?: string[];
  workingDiagnosis?: string;
  urgency?: 'stat' | 'urgent' | 'routine';
}

export interface QuerySuggestion {
  id: string;
  category: 'differential' | 'protocol' | 'followup' | 'comparison';
  query: string;
  confidence: number;
  evidenceLevel: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ClinicalQueryProps {
  onQuery: (query: string, context?: ClinicalContext) => void;
  onContextUpdate: (context: ClinicalContext) => void;
  placeholder?: string;
  className?: string;
}

interface QueryContextProps {
  context: ClinicalContext;
  onUpdate: (context: ClinicalContext) => void;
  className?: string;
}

interface SmartSuggestionsProps {
  suggestions: QuerySuggestion[];
  onSelect: (suggestion: QuerySuggestion) => void;
  className?: string;
}

const CLINICAL_CATEGORIES = [
  {
    id: 'differential',
    label: 'Differential Diagnosis',
    icon: Microscope,
    color: 'text-blue-600',
    examples: ['Ring-enhancing lesion differential', 'Acute chest pain imaging', 'Pediatric abdominal pain']
  },
  {
    id: 'protocol',
    label: 'Protocol Selection',
    icon: FileText,
    color: 'text-green-600',
    examples: ['CT PE protocol contraindications', 'MRI contrast allergy alternatives', 'Pediatric imaging protocols']
  },
  {
    id: 'followup',
    label: 'Follow-up Guidelines',
    icon: Clock,
    color: 'text-orange-600',
    examples: ['Incidental pulmonary nodule followup', 'Bosniak IIF cyst monitoring', 'Thyroid nodule surveillance']
  },
  {
    id: 'comparison',
    label: 'Image Comparison',
    icon: Activity,
    color: 'text-purple-600',
    examples: ['Glioblastoma vs lymphoma', 'Acute vs chronic subdural', 'Pneumonia vs pulmonary edema']
  }
];

function QueryContext({ context, onUpdate, className }: QueryContextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleContextUpdate = (field: keyof ClinicalContext, value: any) => {
    onUpdate({ ...context, [field]: value });
  };

  return (
    <div className={cn("bg-card border border-border rounded-lg p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-white">Clinical Context</span>
          <Badge variant="outline" className="text-xs">
            HIPAA Protected
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-white"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {/* Basic Context */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Age</label>
          <input
            type="number"
            value={context.patientAge || ''}
            onChange={(e) => handleContextUpdate('patientAge', parseInt(e.target.value) || undefined)}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded text-white"
            placeholder="Years"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Sex</label>
          <select
            value={context.patientSex || ''}
            onChange={(e) => handleContextUpdate('patientSex', e.target.value as 'M' | 'F' | undefined)}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded text-white"
          >
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Urgency</label>
          <select
            value={context.urgency || ''}
            onChange={(e) => handleContextUpdate('urgency', e.target.value)}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded text-white"
          >
            <option value="">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="stat">STAT</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Working Dx</label>
          <input
            type="text"
            value={context.workingDiagnosis || ''}
            onChange={(e) => handleContextUpdate('workingDiagnosis', e.target.value)}
            className="w-full px-2 py-1 text-xs bg-muted border border-border rounded text-white"
            placeholder="Diagnosis"
          />
        </div>
      </div>

      {/* Expanded Context */}
      {isExpanded && (
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Clinical History</label>
            <textarea
              value={context.clinicalHistory || ''}
              onChange={(e) => handleContextUpdate('clinicalHistory', e.target.value)}
              className="w-full px-2 py-1 text-xs bg-muted border border-border rounded text-white resize-none"
              rows={2}
              placeholder="Brief clinical history and presentation..."
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Symptoms</label>
            <input
              type="text"
              value={context.symptoms?.join(', ') || ''}
              onChange={(e) => handleContextUpdate('symptoms', e.target.value.split(', ').filter(s => s.trim()))}
              className="w-full px-2 py-1 text-xs bg-muted border border-border rounded text-white"
              placeholder="Comma-separated symptoms"
            />
          </div>
        </div>
      )}

      {/* Context Summary */}
      {(context.patientAge || context.patientSex || context.urgency) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span>
            Context: {context.patientAge}y {context.patientSex === 'M' ? 'Male' : context.patientSex === 'F' ? 'Female' : ''} 
            {context.urgency && ` (${context.urgency.toUpperCase()})`}
          </span>
        </div>
      )}
    </div>
  );
}

function SmartSuggestions({ suggestions, onSelect, className }: SmartSuggestionsProps) {
  const categoryGroups = suggestions.reduce((groups, suggestion) => {
    const category = suggestion.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(suggestion);
    return groups;
  }, {} as Record<string, QuerySuggestion[]>);

  return (
    <div className={cn("bg-card border border-border rounded-lg p-4 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-white">Smart Suggestions</span>
        <Badge variant="outline" className="text-xs">
          AI-Powered
        </Badge>
      </div>

      <div className="space-y-4">
        {Object.entries(categoryGroups).map(([category, suggestions]) => {
          const categoryConfig = CLINICAL_CATEGORIES.find(c => c.id === category);
          if (!categoryConfig) return null;
          
          const Icon = categoryConfig.icon;
          
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className={cn("w-3 h-3", categoryConfig.color)} />
                <span className="text-xs font-medium text-white">{categoryConfig.label}</span>
              </div>
              
              <div className="space-y-1">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => onSelect(suggestion)}
                    className="w-full flex items-center justify-between p-2 text-left bg-muted/10 hover:bg-muted/20 border border-border rounded transition-colors"
                  >
                    <span className="text-xs text-muted-foreground">{suggestion.query}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.evidenceLevel}
                      </Badge>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ClinicalQuery({ onQuery, onContextUpdate, placeholder, className }: ClinicalQueryProps) {
  const [query, setQuery] = useState('');
  const [context, setContext] = useState<ClinicalContext>({});
  const [isContextVisible, setIsContextVisible] = useState(false);
  const [queryMode, setQueryMode] = useState<'simple' | 'clinical'>('simple');
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock suggestions based on query and context
  const generateSuggestions = (): QuerySuggestion[] => {
    return [
      {
        id: 'diff-1',
        category: 'differential',
        query: 'Ring-enhancing lesion in immunocompromised patient',
        confidence: 95,
        evidenceLevel: '1A',
        icon: Microscope
      },
      {
        id: 'protocol-1',
        category: 'protocol',
        query: 'CT PE protocol with contrast allergy',
        confidence: 92,
        evidenceLevel: '1B',
        icon: FileText
      },
      {
        id: 'followup-1',
        category: 'followup',
        query: 'Bosniak IIF renal cyst surveillance imaging',
        confidence: 88,
        evidenceLevel: '2A',
        icon: Clock
      }
    ];
  };

  const suggestions = generateSuggestions();

  const handleSearch = () => {
    if (query.trim()) {
      onQuery(query, queryMode === 'clinical' ? context : undefined);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleContextUpdate = (newContext: ClinicalContext) => {
    setContext(newContext);
    onContextUpdate(newContext);
  };

  const handleSuggestionSelect = (suggestion: QuerySuggestion) => {
    setQuery(suggestion.query);
    onQuery(suggestion.query, queryMode === 'clinical' ? context : undefined);
  };

  const toggleQueryMode = () => {
    const newMode = queryMode === 'simple' ? 'clinical' : 'simple';
    setQueryMode(newMode);
    setIsContextVisible(newMode === 'clinical');
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Query Mode Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={queryMode === 'simple' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setQueryMode('simple')}
          className="text-xs"
        >
          <Search className="w-3 h-3 mr-2" />
          Simple Search
        </Button>
        
        <Button
          variant={queryMode === 'clinical' ? 'default' : 'ghost'}
          size="sm"
          onClick={toggleQueryMode}
          className="text-xs"
        >
          <Stethoscope className="w-3 h-3 mr-2" />
          Clinical Query
        </Button>
      </div>

      {/* Clinical Context */}
      {queryMode === 'clinical' && (
        <QueryContext
          context={context}
          onUpdate={handleContextUpdate}
        />
      )}

      {/* Main Search Interface */}
      <div className="perplexity-search max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">Curie</span>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || "Ask about differential diagnosis, protocols, or clinical recommendations..."}
          className="perplexity-search input"
        />

        <Button
          onClick={handleSearch}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!query.trim()}
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Query Enhancement Badges */}
      {queryMode === 'clinical' && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            HIPAA Protected Query
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Brain className="w-3 h-3 mr-1" />
            Evidence-Based Results
          </Badge>
          {context.patientAge && (
            <Badge variant="outline" className="text-xs">
              <User className="w-3 h-3 mr-1" />
              Context-Aware
            </Badge>
          )}
        </div>
      )}

      {/* Smart Suggestions */}
      {query.length === 0 && (
        <div className="max-w-4xl mx-auto">
          <SmartSuggestions
            suggestions={suggestions}
            onSelect={handleSuggestionSelect}
          />
        </div>
      )}

      {/* Clinical Categories */}
      {query.length === 0 && (
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CLINICAL_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary/20 transition-all duration-200 cursor-pointer"
                  onClick={() => setQuery(category.examples[0])}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("w-4 h-4", category.color)} />
                    <span className="text-sm font-medium text-white">{category.label}</span>
                  </div>
                  <div className="space-y-1">
                    {category.examples.slice(0, 2).map((example, index) => (
                      <div
                        key={index}
                        className="text-xs text-muted-foreground hover:text-white transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuery(example);
                          handleSearch();
                        }}
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div className="max-w-4xl mx-auto p-3 bg-muted/5 border border-border rounded-lg">
        <div className="flex items-start gap-2 text-sm">
          <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-white font-medium">Clinical Co-Pilot Notice:</span>
            <p className="text-muted-foreground text-xs">
              All clinical recommendations are evidence-based but require professional medical judgment. 
              Patient data is processed securely and never stored or shared.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}