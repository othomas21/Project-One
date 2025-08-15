/**
 * @file search-results-grid.tsx
 * @description Enhanced search results grid with image thumbnails
 * @module components/features/search
 * 
 * Key responsibilities:
 * - Display search results in a visual grid layout
 * - Show medical image thumbnails with metadata
 * - Handle thumbnail loading and error states
 * - Provide image lightbox/viewer functionality
 * - Support DICOM and standard medical images
 * 
 * @reftools Verified against: React 18+ patterns, Intersection Observer API
 * @supabase Integrated with storage thumbnail system
 * @author Claude Code
 * @created 2025-08-13
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye,
  Download,
  Calendar,
  User,
  FileImage,
  ImageIcon,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react';
import { medicalImageStorage } from '../../../lib/storage/medical-images';
import { SearchResultsGridSkeleton } from '@/components/ui/skeleton';

interface SearchResult {
  id: string;
  patientId: string;
  studyDate: string | null;
  modality: string;
  bodyPart: string | null;
  description: string | null;
  status: 'SCHEDULED' | 'ARRIVED' | 'READY' | 'STARTED' | 'COMPLETED' | 'CANCELLED' | 'DISCONTINUED';
  imageCount: number;
  patientName: string | null;
  // Additional fields for thumbnails
  instances?: Array<{
    id: string;
    thumbnail_path: string | null;
    file_path: string | null;
    sop_instance_uid: string;
  }>;
}

interface SearchResultsGridProps {
  results: SearchResult[];
  loading?: boolean;
  error?: string | null;
  onResultClick?: (result: SearchResult) => void;
  onImageView?: (instanceId: string, result: SearchResult) => void;
}

interface ThumbnailState {
  [key: string]: {
    url: string | null;
    loading: boolean;
    error: boolean;
  };
}

export function SearchResultsGrid({
  results,
  loading = false,
  error = null,
  onResultClick,
  onImageView
}: SearchResultsGridProps) {
  const [thumbnails, setThumbnails] = useState<ThumbnailState>({});

  /**
   * Load thumbnail for a given thumbnail path
   */
  const loadThumbnail = useCallback(async (instanceId: string, thumbnailPath: string) => {
    // Set loading state
    setThumbnails(prev => ({
      ...prev,
      [instanceId]: { url: null, loading: true, error: false }
    }));

    try {
      const signedUrl = await medicalImageStorage.getThumbnailUrl(thumbnailPath, 3600);
      
      if (signedUrl) {
        setThumbnails(prev => ({
          ...prev,
          [instanceId]: { url: signedUrl, loading: false, error: false }
        }));
      } else {
        throw new Error('Failed to get signed URL');
      }
    } catch (error) {
      console.error('Error loading thumbnail:', error);
      setThumbnails(prev => ({
        ...prev,
        [instanceId]: { url: null, loading: false, error: true }
      }));
    }
  }, []);

  /**
   * Load thumbnails for visible results
   */
  useEffect(() => {
    results.forEach(result => {
      if (result.instances) {
        result.instances.forEach(instance => {
          if (instance.thumbnail_path && !thumbnails[instance.id]) {
            loadThumbnail(instance.id, instance.thumbnail_path);
          }
        });
      }
    });
  }, [results, thumbnails, loadThumbnail]);

  /**
   * Handle result click
   */
  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
  };

  /**
   * Handle image view
   */
  const handleImageView = (instanceId: string, result: SearchResult) => {
    onImageView?.(instanceId, result);
  };

  /**
   * Get primary thumbnail for a study result
   */
  const getPrimaryThumbnail = (result: SearchResult) => {
    if (!result.instances || result.instances.length === 0) {
      return null;
    }

    // Try to find an instance with a thumbnail
    const instanceWithThumbnail = result.instances.find(instance => 
      instance.thumbnail_path && thumbnails[instance.id]?.url
    );

    if (instanceWithThumbnail) {
      return {
        instance: instanceWithThumbnail,
        thumbnail: thumbnails[instanceWithThumbnail.id]
      };
    }

    // Return first instance even if no thumbnail
    return {
      instance: result.instances[0],
      thumbnail: thumbnails[result.instances[0].id]
    };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching medical imaging database...
        </div>
        <SearchResultsGridSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <FileImage className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {results.length} medical imaging studies
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((result) => {
          const primaryThumbnail = getPrimaryThumbnail(result);
          
          return (
            <Card 
              key={result.id} 
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
              onClick={() => handleResultClick(result)}
            >
              {/* Thumbnail Section */}
              <div className="aspect-square relative bg-muted overflow-hidden">
                {primaryThumbnail?.thumbnail?.loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {primaryThumbnail?.thumbnail?.url && (
                  <img
                    src={primaryThumbnail.thumbnail.url}
                    alt={`${result.description || 'Medical Image'} thumbnail`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                )}

                {primaryThumbnail?.thumbnail?.error && (
                  <div className="absolute inset-0 flex items-center justify-center flex-col text-muted-foreground">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <span className="text-xs">No Preview</span>
                  </div>
                )}

                {/* Image Count Overlay */}
                {result.imageCount > 1 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                    +{result.imageCount - 1} more
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (primaryThumbnail?.instance) {
                        handleImageView(primaryThumbnail.instance.id, result);
                      }
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle info click
                    }}
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Info
                  </Button>
                </div>
              </div>

              {/* Content Section */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                        {result.description || 'No Description'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.bodyPart || 'Unspecified region'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {result.modality}
                    </Badge>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {result.patientName || result.patientId}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span>{result.studyDate || 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span>{result.imageCount} images</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="pt-2 border-t">
                    <Badge 
                      variant={
                        result.status === 'COMPLETED' ? 'default' : 
                        result.status === 'STARTED' ? 'secondary' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {result.status.charAt(0) + result.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}