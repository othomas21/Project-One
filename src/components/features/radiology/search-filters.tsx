/**
 * @file search-filters.tsx
 * @description Advanced radiology search filters with comprehensive medical search capabilities
 * @module components/features/radiology
 * 
 * Key responsibilities:
 * - Medical imaging modality filtering (X-Ray, CT, MRI, etc.)
 * - Anatomical region selection with detailed categorization
 * - Date range filtering with calendar selection
 * - Patient demographics and study type filtering
 * - Urgency level and contrast type filtering
 * 
 * @reftools Verified against: shadcn/ui latest, React Hook Form patterns, date-fns v2.x
 * @author Claude Code
 * @created 2025-08-13
 * @modified 2025-08-13
 */

"use client";

import { useState } from "react";
import { Calendar, Filter, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

// Medical imaging modalities for radiology search
const IMAGING_MODALITIES = [
  { id: "CT", label: "CT", description: "Computed Tomography" },
  { id: "MRI", label: "MRI", description: "Magnetic Resonance Imaging" },
  { id: "XRAY", label: "X-Ray", description: "Conventional Radiography" },
  { id: "US", label: "Ultrasound", description: "Ultrasonography" },
  { id: "PET", label: "PET", description: "Positron Emission Tomography" },
  { id: "MAMMO", label: "Mammography", description: "Breast Imaging" },
  { id: "FLUORO", label: "Fluoroscopy", description: "Real-time Imaging" },
  { id: "NUCLEAR", label: "Nuclear Medicine", description: "Scintigraphy & SPECT" },
];

// Anatomical regions for targeted search
const ANATOMICAL_REGIONS = [
  { value: "HEAD", label: "Head/Brain" },
  { value: "NECK", label: "Neck" },
  { value: "CHEST", label: "Chest/Thorax" },
  { value: "ABDOMEN", label: "Abdomen" },
  { value: "PELVIS", label: "Pelvis" },
  { value: "SPINE", label: "Spine" },
  { value: "EXTREMITIES", label: "Extremities" },
  { value: "CARDIAC", label: "Cardiac" },
  { value: "BREAST", label: "Breast" },
  { value: "VASCULAR", label: "Vascular" },
];

// Study types for filtering
const STUDY_TYPES = [
  { value: "ROUTINE", label: "Routine" },
  { value: "CONTRAST", label: "With Contrast" },
  { value: "NON_CONTRAST", label: "Without Contrast" },
  { value: "ANGIOGRAPHY", label: "Angiography" },
  { value: "FUNCTIONAL", label: "Functional Study" },
];

// Urgency levels for priority filtering
const URGENCY_LEVELS = [
  { value: "STAT", label: "STAT (Urgent)" },
  { value: "PRIORITY", label: "Priority" },
  { value: "ROUTINE", label: "Routine" },
];

interface SearchFiltersProps {
  onFiltersChange?: (filters: SearchFilters) => void;
  onSearch?: () => void;
  isLoading?: boolean;
}

export interface SearchFilters {
  keyword?: string;
  modalities: string[];
  anatomicalRegion: string;
  studyType: string;
  urgency: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  patientId: string;
  accessionNumber: string;
  studyDescription: string;
}

export function SearchFilters({ onFiltersChange, onSearch, isLoading }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    modalities: [],
    anatomicalRegion: "",
    studyType: "",
    urgency: "",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    patientId: "",
    accessionNumber: "",
    studyDescription: "",
  });

  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange?.(updated);
  };

  const handleModalityChange = (modalityId: string, checked: boolean) => {
    const newModalities = checked
      ? [...filters.modalities, modalityId]
      : filters.modalities.filter(id => id !== modalityId);
    updateFilters({ modalities: newModalities });
  };

  const updateDateRange = () => {
    updateFilters({
      dateRange: {
        from: dateFrom,
        to: dateTo
      }
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.keyword) count++;
    if (filters.modalities.length) count++;
    if (filters.anatomicalRegion) count++;
    if (filters.studyType) count++;
    if (filters.urgency) count++;
    if (filters.dateRange.from) count++;
    if (filters.patientId) count++;
    if (filters.accessionNumber) count++;
    if (filters.studyDescription) count++;
    return count;
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      modalities: [],
      anatomicalRegion: "",
      studyType: "",
      urgency: "",
      dateRange: { from: undefined, to: undefined },
      patientId: "",
      accessionNumber: "",
      studyDescription: "",
    };
    setFilters(defaultFilters);
    setDateFrom(undefined);
    setDateTo(undefined);
    onFiltersChange?.(defaultFilters);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Search Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFilterCount()} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Keyword Search */}
        <div className="space-y-2">
          <Label htmlFor="keyword">Keyword Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="keyword"
              placeholder="Search by study description, findings, or notes..."
              className="pl-10"
              value={filters.keyword || ""}
              onChange={(e) => updateFilters({ keyword: e.target.value })}
            />
          </div>
        </div>

        {/* Patient & Study Identifiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              placeholder="Enter Patient ID..."
              value={filters.patientId}
              onChange={(e) => updateFilters({ patientId: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accessionNumber">Accession Number</Label>
            <Input
              id="accessionNumber"
              placeholder="Enter Accession Number..."
              value={filters.accessionNumber}
              onChange={(e) => updateFilters({ accessionNumber: e.target.value })}
            />
          </div>
        </div>

        {/* Modality Selection */}
        <div className="space-y-3">
          <Label>Imaging Modality</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {IMAGING_MODALITIES.map((modality) => (
              <div key={modality.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`modality-${modality.id}`}
                  checked={filters.modalities.includes(modality.id)}
                  onCheckedChange={(checked) => 
                    handleModalityChange(modality.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`modality-${modality.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {modality.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Anatomical Region */}
        <div className="space-y-2">
          <Label>Anatomical Region</Label>
          <Select
            value={filters.anatomicalRegion}
            onValueChange={(value) => updateFilters({ anatomicalRegion: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select anatomical region..." />
            </SelectTrigger>
            <SelectContent>
              {ANATOMICAL_REGIONS.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Study Type and Urgency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Study Type</Label>
            <Select
              value={filters.studyType}
              onValueChange={(value) => updateFilters({ studyType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select study type..." />
              </SelectTrigger>
              <SelectContent>
                {STUDY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Urgency Level</Label>
            <Select
              value={filters.urgency}
              onValueChange={(value) => updateFilters({ urgency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select urgency..." />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_LEVELS.map((urgency) => (
                  <SelectItem key={urgency.value} value={urgency.value}>
                    {urgency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label>Study Date Range</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => {
                    setDateFrom(date);
                    updateDateRange();
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => {
                    setDateTo(date);
                    updateDateRange();
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Study Description */}
        <div className="space-y-2">
          <Label htmlFor="studyDescription">Study Description</Label>
          <Input
            id="studyDescription"
            placeholder="e.g., chest CT with contrast, brain MRI..."
            value={filters.studyDescription}
            onChange={(e) => updateFilters({ studyDescription: e.target.value })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            onClick={onSearch} 
            className="flex-1" 
            disabled={isLoading}
          >
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? "Searching..." : "Search Studies"}
          </Button>
          <Button 
            variant="outline" 
            onClick={clearFilters}
            disabled={getActiveFilterCount() === 0}
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}