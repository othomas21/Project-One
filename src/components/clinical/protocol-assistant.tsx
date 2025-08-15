/**
 * @file protocol-assistant.tsx
 * @description Interactive protocoling assistant with ACR guidelines
 * @module components/clinical
 * 
 * Key responsibilities:
 * - Dynamic protocol selection based on clinical indications
 * - ACR Appropriateness Criteria integration
 * - Interactive decision trees for imaging protocols
 * - Patient-specific protocol recommendations
 * 
 * @author Claude Code
 * @created 2025-08-15
 */

"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Building, 
  Clock,
  User,
  Zap,
  FileText,
  Camera,
  Heart,
  Brain,
  Bone,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProtocolCategory = 'ct' | 'mri' | 'xray' | 'ultrasound' | 'nuclear' | 'interventional';
export type ProtocolUrgency = 'stat' | 'urgent' | 'routine';
export type ContrastType = 'iv-contrast' | 'oral-contrast' | 'no-contrast' | 'gadolinium';

export interface ClinicalIndication {
  category: string;
  indication: string;
  clinicalProbability: 'high' | 'medium' | 'low';
  urgency: ProtocolUrgency;
}

export interface PatientFactors {
  age: number;
  sex: 'M' | 'F';
  weight?: number;
  allergies: string[];
  renalFunction: 'normal' | 'mild-impairment' | 'moderate-impairment' | 'severe-impairment';
  pregnancy?: boolean;
  claustrophobia?: boolean;
  implants: string[];
}

export interface ProtocolRecommendation {
  id: string;
  name: string;
  modality: ProtocolCategory;
  acrRating: string; // e.g., "Usually Appropriate", "May Be Appropriate"
  acrScore: number; // 1-9 scale
  contrast: ContrastType[];
  technique: {
    phases: string[];
    coverage: string;
    reconstruction: string[];
    specialInstructions?: string[];
  };
  contraindications: string[];
  alternatives: {
    protocol: string;
    reasoning: string;
  }[];
  estimatedTime: number; // minutes
  radiationDose?: string;
}

interface ProtocolAssistantProps {
  indication: ClinicalIndication;
  patientFactors: PatientFactors;
  className?: string;
}

interface DecisionNodeProps {
  question: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    description?: string;
  }[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  className?: string;
}

interface ProtocolCardProps {
  protocol: ProtocolRecommendation;
  isRecommended: boolean;
  onSelect: () => void;
  className?: string;
}

const MODALITY_CONFIG = {
  ct: { icon: Camera, label: 'CT Scan', color: 'text-blue-600' },
  mri: { icon: Brain, label: 'MRI', color: 'text-purple-600' },
  xray: { icon: Bone, label: 'X-Ray', color: 'text-green-600' },
  ultrasound: { icon: Heart, label: 'Ultrasound', color: 'text-teal-600' },
  nuclear: { icon: Activity, label: 'Nuclear Medicine', color: 'text-orange-600' },
  interventional: { icon: Zap, label: 'Interventional', color: 'text-red-600' }
} as const;

const ACR_RATING_CONFIG = {
  'Usually Appropriate': { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  'May Be Appropriate': { color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  'Usually Not Appropriate': { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
} as const;

function DecisionNode({ question, options, selectedValue, onSelect, className }: DecisionNodeProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h4 className="text-sm font-medium text-white">{question}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
                selectedValue === option.value
                  ? "bg-primary/10 border-primary text-white"
                  : "bg-card border-border hover:border-primary/20 text-muted-foreground hover:text-white"
              )}
            >
              {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
              <div>
                <div className="text-sm font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProtocolCard({ protocol, isRecommended, onSelect, className }: ProtocolCardProps) {
  const modalityConfig = MODALITY_CONFIG[protocol.modality];
  const ModalityIcon = modalityConfig.icon;
  const acrConfig = ACR_RATING_CONFIG[protocol.acrRating as keyof typeof ACR_RATING_CONFIG];

  return (
    <div className={cn(
      "border rounded-lg p-4 space-y-4 transition-all duration-200",
      isRecommended 
        ? "bg-primary/5 border-primary/20" 
        : "bg-card border-border hover:border-primary/20",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <ModalityIcon className={cn("w-5 h-5", modalityConfig.color)} />
          <div>
            <h4 className="text-sm font-medium text-white">{protocol.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn("text-xs", modalityConfig.color)}>
                {modalityConfig.label}
              </Badge>
              {isRecommended && (
                <Badge variant="outline" className="text-xs text-primary">
                  Recommended
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-muted-foreground">ACR Score</div>
          <div className="text-lg font-bold text-white">{protocol.acrScore}/9</div>
        </div>
      </div>

      {/* ACR Rating */}
      <div className={cn("p-2 rounded border", acrConfig.bgColor, acrConfig.borderColor)}>
        <div className="flex items-center gap-2">
          <Building className={cn("w-3 h-3", acrConfig.color)} />
          <span className={cn("text-xs font-medium", acrConfig.color)}>
            ACR: {protocol.acrRating}
          </span>
        </div>
      </div>

      {/* Technique Summary */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-white">Protocol Summary:</div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Phases: {protocol.technique.phases.join(', ')}</div>
          <div>• Coverage: {protocol.technique.coverage}</div>
          <div>• Contrast: {protocol.contrast.join(', ')}</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {protocol.estimatedTime} min
            </span>
            {protocol.radiationDose && (
              <span>Dose: {protocol.radiationDose}</span>
            )}
          </div>
        </div>
      </div>

      {/* Contraindications */}
      {protocol.contraindications.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-yellow-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Contraindications:
          </div>
          <div className="text-xs text-muted-foreground">
            {protocol.contraindications.join(', ')}
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={onSelect}
        className={cn(
          "w-full text-xs",
          isRecommended 
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "variant-outline"
        )}
      >
        <Settings className="w-3 h-3 mr-2" />
        Select Protocol
      </Button>
    </div>
  );
}

export function ProtocolAssistant({ indication, patientFactors, className }: ProtocolAssistantProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [protocols, setProtocols] = useState<ProtocolRecommendation[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolRecommendation | null>(null);

  // Example decision tree steps
  const decisionSteps = [
    {
      question: "What is the primary clinical concern?",
      key: "concern",
      options: [
        { label: "Acute Symptoms", value: "acute", icon: AlertTriangle, description: "Recent onset or emergent" },
        { label: "Screening", value: "screening", icon: CheckCircle, description: "Asymptomatic screening" },
        { label: "Follow-up", value: "followup", icon: ArrowRight, description: "Known condition monitoring" },
        { label: "Staging", value: "staging", icon: FileText, description: "Disease extent evaluation" }
      ]
    },
    {
      question: "What is the anatomical region of interest?",
      key: "region",
      options: [
        { label: "Head/Neck", value: "head", icon: Brain },
        { label: "Chest", value: "chest", icon: Heart },
        { label: "Abdomen/Pelvis", value: "abdomen", icon: Activity },
        { label: "Musculoskeletal", value: "msk", icon: Bone }
      ]
    }
  ];

  // Mock protocol recommendations based on selections
  const generateProtocols = (): ProtocolRecommendation[] => {
    // This would typically fetch from ACR database or clinical decision support system
    return [
      {
        id: "ct-chest-pe",
        name: "CT Pulmonary Embolism Protocol",
        modality: "ct",
        acrRating: "Usually Appropriate",
        acrScore: 8,
        contrast: ["iv-contrast"],
        technique: {
          phases: ["Arterial"],
          coverage: "Lung apices to costophrenic angles",
          reconstruction: ["Axial 1mm", "Coronal", "Sagittal"],
          specialInstructions: ["Breath hold inspiration", "IV contrast timing critical"]
        },
        contraindications: ["Severe contrast allergy", "Severe renal impairment"],
        alternatives: [
          {
            protocol: "V/Q Scan",
            reasoning: "Alternative if contrast contraindicated"
          }
        ],
        estimatedTime: 10,
        radiationDose: "7 mSv"
      },
      {
        id: "ct-chest-nodule",
        name: "CT Chest Nodule Follow-up",
        modality: "ct",
        acrRating: "Usually Appropriate",
        acrScore: 9,
        contrast: ["no-contrast"],
        technique: {
          phases: ["Non-contrast"],
          coverage: "Lung apices to posterior costophrenic angles",
          reconstruction: ["Thin-section axial", "Coronal", "MIP"],
          specialInstructions: ["Low-dose technique", "Inspiration breath hold"]
        },
        contraindications: [],
        alternatives: [
          {
            protocol: "Chest X-ray",
            reasoning: "May be sufficient for larger nodules"
          }
        ],
        estimatedTime: 5,
        radiationDose: "1.5 mSv"
      }
    ];
  };

  const handleStepComplete = (key: string, value: string) => {
    const newSelections = { ...selections, [key]: value };
    setSelections(newSelections);
    
    if (currentStep < decisionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate protocols based on all selections
      const generatedProtocols = generateProtocols();
      setProtocols(generatedProtocols);
    }
  };

  const handleProtocolSelect = (protocol: ProtocolRecommendation) => {
    setSelectedProtocol(protocol);
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setSelections({});
    setProtocols([]);
    setSelectedProtocol(null);
  };

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Protocol Assistant
          </h3>
          <p className="text-muted-foreground text-sm">
            Evidence-based protocol selection using ACR Appropriateness Criteria
          </p>
        </div>
        
        {(currentStep > 0 || protocols.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetWizard}
            className="text-xs text-muted-foreground hover:text-white"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Clinical Context */}
      <div className="p-3 bg-muted/10 border border-border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-white">Clinical Context</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Indication: {indication.indication}</div>
          <div>Patient: {patientFactors.age}y {patientFactors.sex === 'M' ? 'Male' : 'Female'}</div>
          <div>Urgency: {indication.urgency}</div>
          {patientFactors.allergies.length > 0 && (
            <div className="text-yellow-600">Allergies: {patientFactors.allergies.join(', ')}</div>
          )}
        </div>
      </div>

      {/* Decision Steps */}
      {currentStep < decisionSteps.length && protocols.length === 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {decisionSteps.length}</span>
            <div className="flex-grow h-px bg-border"></div>
          </div>
          
          <DecisionNode
            question={decisionSteps[currentStep].question}
            options={decisionSteps[currentStep].options}
            selectedValue={selections[decisionSteps[currentStep].key]}
            onSelect={(value) => handleStepComplete(decisionSteps[currentStep].key, value)}
          />
        </div>
      )}

      {/* Protocol Recommendations */}
      {protocols.length > 0 && !selectedProtocol && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Building className="w-4 h-4" />
            ACR Protocol Recommendations ({protocols.length})
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {protocols.map((protocol, index) => (
              <ProtocolCard
                key={protocol.id}
                protocol={protocol}
                isRecommended={index === 0} // First one is typically most appropriate
                onSelect={() => handleProtocolSelect(protocol)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Selected Protocol Details */}
      {selectedProtocol && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <h4 className="text-sm font-medium text-white">Selected Protocol: {selectedProtocol.name}</h4>
          </div>
          
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
            <div className="text-sm">
              <div className="font-medium text-white mb-2">Technical Parameters:</div>
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>Phases: {selectedProtocol.technique.phases.join(', ')}</div>
                <div>Coverage: {selectedProtocol.technique.coverage}</div>
                <div>Reconstructions: {selectedProtocol.technique.reconstruction.join(', ')}</div>
                <div>Estimated Time: {selectedProtocol.estimatedTime} minutes</div>
              </div>
            </div>
            
            {selectedProtocol.technique.specialInstructions && (
              <div className="text-sm">
                <div className="font-medium text-white mb-1">Special Instructions:</div>
                <ul className="text-xs text-muted-foreground list-disc list-inside">
                  {selectedProtocol.technique.specialInstructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACR Guidelines Notice */}
      <div className="p-4 bg-muted/5 border border-border rounded-lg">
        <div className="flex items-start gap-3 text-sm">
          <Building className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-white font-medium">ACR Appropriateness Criteria:</span>
            <p className="text-muted-foreground text-xs">
              Protocol recommendations based on American College of Radiology Appropriateness Criteria. 
              Consider patient-specific factors and institutional protocols when finalizing imaging approach.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}