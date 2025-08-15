/**
 * @file perplexity-search.tsx
 * @description Perplexity-style search interface for medical queries
 * @module components/features/search
 * 
 * Key responsibilities:
 * - Dark-themed search interface with rounded design
 * - Medical AI search capabilities
 * - Icon-based action buttons
 * - Category shortcuts for medical specialties
 * 
 * @author Claude Code
 * @created 2025-08-15
 */

"use client";

import { useState, useRef } from 'react';
import { 
  Search, 
  Brain, 
  Lightbulb, 
  Globe, 
  Paperclip, 
  Mic,
  Play,
  Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerplexitySearchProps {
  onSearch?: (query: string) => void;
  onModeChange?: (mode: 'search' | 'ai' | 'suggestions') => void;
  className?: string;
}

interface CategoryShortcut {
  id: string;
  label: string;
  icon?: React.ReactNode;
  searchQuery: string;
}

export function PerplexitySearch({ onSearch, onModeChange, className }: PerplexitySearchProps) {
  const [query, setQuery] = useState('');
  const [activeMode, setActiveMode] = useState<'search' | 'ai' | 'suggestions'>('search');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const categoryShortcuts: CategoryShortcut[] = [
    { id: 'diagnostics', label: 'Diagnostics', searchQuery: 'diagnostic imaging techniques' },
    { id: 'cardiology', label: 'Cardiology', searchQuery: 'cardiac imaging studies' },
    { id: 'neurology', label: 'Neurology', searchQuery: 'brain MRI analysis' },
    { id: 'orthopedics', label: 'Orthopedics', searchQuery: 'bone fracture imaging' },
    { id: 'oncology', label: 'Oncology', searchQuery: 'tumor detection CT scan' },
    { id: 'emergency', label: 'Emergency', searchQuery: 'emergency radiology cases' },
    { id: 'pediatrics', label: 'Pediatrics', searchQuery: 'pediatric imaging protocols' },
    { id: 'women-health', label: 'Women\'s Health', searchQuery: 'mammography screening' }
  ];

  const handleSearch = (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (queryToSearch.trim()) {
      onSearch?.(queryToSearch);
    }
  };

  const handleModeClick = (mode: 'search' | 'ai' | 'suggestions') => {
    setActiveMode(mode);
    onModeChange?.(mode);
    inputRef.current?.focus();
  };

  const handleCategoryClick = (category: CategoryShortcut) => {
    setQuery(category.searchQuery);
    handleSearch(category.searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  return (
    <div className={cn("flex flex-col items-center w-full max-w-4xl mx-auto", className)}>
      {/* Logo */}
      <div className="perplexity-logo flex items-center gap-3 mb-12">
        <Stethoscope className="w-8 h-8 text-primary" />
        <span>curie</span>
      </div>

      {/* Search Bar */}
      <div className="perplexity-search mb-8">
        {/* Left side action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleModeClick('search')}
            className={cn(
              "perplexity-icon-button",
              activeMode === 'search' && "active"
            )}
            title="Search Mode"
          >
            <Search className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleModeClick('ai')}
            className={cn(
              "perplexity-icon-button",
              activeMode === 'ai' && "active"
            )}
            title="AI Analysis Mode"
          >
            <Brain className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleModeClick('suggestions')}
            className={cn(
              "perplexity-icon-button",
              activeMode === 'suggestions' && "active"
            )}
            title="Suggestions Mode"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about medical imaging, diagnostics, or clinical cases..."
          className="perplexity-search input"
        />

        {/* Right side action buttons */}
        <div className="flex items-center gap-2">
          <button
            className="perplexity-icon-button"
            title="Web Search"
          >
            <Globe className="w-4 h-4" />
          </button>
          
          <button
            className="perplexity-icon-button"
            title="Attach Files"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleRecording}
            className={cn(
              "perplexity-icon-button",
              isRecording && "active"
            )}
            title="Voice Input"
          >
            <Mic className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleSearch()}
            className="w-10 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center"
            title="Search"
          >
            <Play className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Shortcuts */}
      <div className="flex flex-wrap justify-center gap-3 max-w-3xl">
        {categoryShortcuts.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className="perplexity-pill group"
          >
            <span className="group-hover:text-primary transition-colors duration-200">
              {category.label}
            </span>
          </button>
        ))}
      </div>

      {/* Mode-specific help text */}
      {activeMode === 'ai' && (
        <div className="mt-6 text-center text-muted-foreground text-sm max-w-md">
          <Brain className="w-5 h-5 mx-auto mb-2 text-primary" />
          AI mode activated. Ask clinical questions for intelligent medical analysis.
        </div>
      )}
      
      {activeMode === 'suggestions' && (
        <div className="mt-6 text-center text-muted-foreground text-sm max-w-md">
          <Lightbulb className="w-5 h-5 mx-auto mb-2 text-primary" />
          Get smart suggestions for medical imaging queries and clinical research.
        </div>
      )}
    </div>
  );
}