/**
 * @file report-snippets.tsx
 * @description Report snippet generation with copy-paste functionality for clinical workflow
 * @module components/clinical
 * 
 * Key responsibilities:
 * - Generate ready-to-use radiology report snippets
 * - One-click copy functionality for clinical workflow
 * - Multiple report formats (structured, narrative, teaching)
 * - Context-aware clinical recommendations
 * 
 * @author Claude Code
 * @created 2025-08-15
 */

"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  FileText, 
  Clipboard, 
  CheckCircle, 
  Download,
  Eye,
  Code,
  AlignLeft,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ReportFormat = 'structured' | 'narrative' | 'teaching' | 'impression' | 'recommendations';

export interface ClinicalFinding {
  location: string;
  description: string;
  size?: string;
  characteristics: string[];
  differential: string[];
  recommendations: string[];
}

export interface ReportSnippetData {
  clinicalContext: {
    patientAge?: number;
    patientSex?: 'M' | 'F';
    clinicalHistory?: string;
    indication?: string;
  };
  findings: ClinicalFinding[];
  impression: string[];
  recommendations: string[];
  differentialDiagnosis: {
    primary: string;
    alternative: string[];
    rationale: string;
  };
  followUp?: string;
  clinicalCorrelation?: string;
}

interface ReportSnippetsProps {
  data: ReportSnippetData;
  title: string;
  className?: string;
}

interface SnippetPreviewProps {
  format: ReportFormat;
  data: ReportSnippetData;
  isActive: boolean;
  onCopy: () => void;
  onPreview: () => void;
}

const FORMAT_CONFIG = {
  structured: {
    icon: Code,
    label: 'Structured Report',
    description: 'Traditional radiology format with clear sections',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  narrative: {
    icon: AlignLeft,
    label: 'Narrative Report',
    description: 'Flowing narrative style for complex cases',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  teaching: {
    icon: GraduationCap,
    label: 'Teaching Report',
    description: 'Educational format with differential reasoning',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  impression: {
    icon: Eye,
    label: 'Impression Only',
    description: 'Concise impression and recommendations',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  recommendations: {
    icon: Clipboard,
    label: 'Recommendations',
    description: 'Management and follow-up recommendations',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  }
} as const;

function generateReportText(format: ReportFormat, data: ReportSnippetData): string {
  const { clinicalContext, findings, impression, recommendations, differentialDiagnosis } = data;

  switch (format) {
    case 'structured':
      return `CLINICAL HISTORY: ${clinicalContext.indication || 'Clinical correlation requested.'}

FINDINGS:
${findings.map(finding => 
  `${finding.location}: ${finding.description}${finding.size ? ` measuring ${finding.size}` : ''}. ${finding.characteristics.join('. ')}.`
).join('\n\n')}

IMPRESSION:
${impression.map((imp, index) => `${index + 1}. ${imp}`).join('\n')}

RECOMMENDATIONS:
${recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}`;

    case 'narrative':
      return `${clinicalContext.indication ? `Given the clinical history of ${clinicalContext.indication.toLowerCase()}, ` : ''}the examination demonstrates ${findings.map(f => f.description.toLowerCase()).join(' and ')}.

The imaging findings are ${impression.length > 1 ? 'consistent with' : 'most consistent with'} ${impression[0].toLowerCase()}.${differentialDiagnosis.alternative.length > 0 ? ` The differential diagnosis includes ${differentialDiagnosis.alternative.join(', ')}.` : ''}

${differentialDiagnosis.rationale}

${recommendations.length > 0 ? `Clinical management should include ${recommendations.map(r => r.toLowerCase()).join(' and ')}.` : ''}`;

    case 'teaching':
      return `CASE ANALYSIS:

Clinical Presentation: ${clinicalContext.indication || 'Not specified'}
${clinicalContext.patientAge ? `Patient Age: ${clinicalContext.patientAge} years` : ''}
${clinicalContext.patientSex ? `Sex: ${clinicalContext.patientSex === 'M' ? 'Male' : 'Female'}` : ''}

Key Imaging Features:
${findings.map(finding => 
  `• ${finding.location}: ${finding.description}\n  - Characteristics: ${finding.characteristics.join(', ')}`
).join('\n')}

Differential Diagnosis Approach:
1. Most Likely: ${differentialDiagnosis.primary}
   Rationale: ${differentialDiagnosis.rationale}

${differentialDiagnosis.alternative.length > 0 ? 
  `Alternative Considerations:\n${differentialDiagnosis.alternative.map((alt, index) => `${index + 2}. ${alt}`).join('\n')}\n` : ''
}

Teaching Points:
${recommendations.map(rec => `• ${rec}`).join('\n')}`;

    case 'impression':
      return `IMPRESSION:
${impression.map((imp, index) => `${index + 1}. ${imp}`).join('\n')}

${recommendations.length > 0 ? 
  `RECOMMENDATIONS:\n${recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}` : ''
}`;

    case 'recommendations':
      return `CLINICAL RECOMMENDATIONS:

Immediate Actions:
${recommendations.filter(r => r.toLowerCase().includes('immediate') || r.toLowerCase().includes('urgent')).map(r => `• ${r}`).join('\n') || '• No immediate actions required'}

Follow-up:
${recommendations.filter(r => r.toLowerCase().includes('follow') || r.toLowerCase().includes('repeat')).map(r => `• ${r}`).join('\n') || '• Routine clinical follow-up as indicated'}

Additional Considerations:
${recommendations.filter(r => !r.toLowerCase().includes('immediate') && !r.toLowerCase().includes('urgent') && !r.toLowerCase().includes('follow')).map(r => `• ${r}`).join('\n')}

${data.clinicalCorrelation ? `Clinical Correlation: ${data.clinicalCorrelation}` : ''}`;

    default:
      return '';
  }
}

function SnippetPreview({ format, data, isActive, onCopy, onPreview }: SnippetPreviewProps) {
  const [copied, setCopied] = useState(false);
  const config = FORMAT_CONFIG[format];
  const Icon = config.icon;
  const text = generateReportText(format, data);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={cn(
      "border rounded-lg p-4 transition-all duration-200",
      isActive ? `${config.bgColor} ${config.borderColor}` : "bg-card border-border hover:border-primary/20"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Icon className={cn("w-5 h-5", isActive ? config.color : "text-muted-foreground")} />
          <div>
            <h4 className={cn("text-sm font-medium", isActive ? config.color : "text-white")}>
              {config.label}
            </h4>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPreview}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-white"
          >
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className={cn(
              "h-8 px-2 text-xs transition-colors",
              copied 
                ? "text-green-600 hover:text-green-600" 
                : "text-muted-foreground hover:text-white"
            )}
          >
            {copied ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
      
      {isActive && (
        <div className="mt-3 p-3 bg-white/50 border border-white/20 rounded text-xs font-mono text-gray-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
          {text}
        </div>
      )}
    </div>
  );
}

export function ReportSnippets({ data, title, className }: ReportSnippetsProps) {
  const [activeFormat, setActiveFormat] = useState<ReportFormat>('structured');
  const [copyCount, setCopyCount] = useState(0);

  const formats: ReportFormat[] = ['structured', 'narrative', 'teaching', 'impression', 'recommendations'];

  const handleCopy = () => {
    setCopyCount(prev => prev + 1);
  };

  const downloadReport = () => {
    const text = generateReportText(activeFormat, data);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${activeFormat}-report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report Snippets: {title}
          </h3>
          <p className="text-muted-foreground text-sm">
            Ready-to-use report templates for your clinical workflow
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {copyCount} copied
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadReport}
            className="text-xs text-muted-foreground hover:text-white"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-4">
        {formats.map((format) => (
          <SnippetPreview
            key={format}
            format={format}
            data={data}
            isActive={activeFormat === format}
            onCopy={handleCopy}
            onPreview={() => setActiveFormat(activeFormat === format ? 'structured' : format)}
          />
        ))}
      </div>

      {/* Usage Instructions */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3 text-sm">
          <Clipboard className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-white font-medium">Clinical Integration:</span>
            <p className="text-muted-foreground">
              Click "Copy" to copy report snippets directly into your radiology information system (RIS) 
              or electronic health record (EHR). All snippets maintain medical terminology standards 
              and professional formatting requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}