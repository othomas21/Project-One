/**
 * @file index.ts
 * @description Clinical co-pilot components export barrel
 * @module components/clinical
 * 
 * @author Claude Code
 * @created 2025-08-15
 */

export { EvidenceHierarchy, EvidenceBadge } from './evidence-hierarchy';
export { ClinicalConsensus, ConsensusIndicator } from './clinical-consensus';
export { SourceValidation, TrustIndicator, ValidationSummary } from './source-validation';
export { ReportSnippets } from './report-snippets';
export { ProtocolAssistant } from './protocol-assistant';
export { ClinicalQuery } from './clinical-query';
export { PathologyComparison } from './pathology-comparison';

export type { EvidenceLevel, EvidenceStrength, EvidenceSource } from './evidence-hierarchy';
export type { ConsensusLevel, ConsensusPoint } from './clinical-consensus';
export type { ValidationStatus, SourceQuality, PeerReviewStatus, SourceValidation as SourceValidationType } from './source-validation';
export type { ReportFormat, ClinicalFinding, ReportSnippetData } from './report-snippets';
export type { ProtocolCategory, ProtocolUrgency, ContrastType, ClinicalIndication, PatientFactors, ProtocolRecommendation } from './protocol-assistant';
export type { ClinicalContext, QuerySuggestion } from './clinical-query';
export type { ComparisonMode, AnnotationType, ImageType, PathologyImage, Annotation } from './pathology-comparison';