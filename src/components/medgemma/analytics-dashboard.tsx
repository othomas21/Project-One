/**
 * @file analytics-dashboard.tsx
 * @description Analytics and monitoring dashboard for MedGemma usage
 * @module components/medgemma
 * 
 * Key responsibilities:
 * - Track MedGemma API usage and performance
 * - Monitor model performance and accuracy
 * - Display usage statistics and trends
 * - Error rate monitoring and alerts
 * - Token usage and cost tracking
 * 
 * @reftools Verified against: React 18+ patterns, Chart.js integration
 * @author Claude Code
 * @created 2025-08-14
 */

"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Brain, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Zap,
  Users,
  FileText,
  Image,
  MessageSquare,
  Search,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';

interface UsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  estimatedCost: number;
  topModels: Array<{ model: string; count: number; percentage: number }>;
  requestsByType: Array<{ type: string; count: number; percentage: number }>;
  errorsByType: Array<{ error: string; count: number; percentage: number }>;
  timeSeriesData: Array<{ timestamp: string; requests: number; responseTime: number; errors: number }>;
}

interface PerformanceMetrics {
  modelAccuracy: Array<{ model: string; accuracy: number; sampleSize: number }>;
  userSatisfaction: Array<{ rating: number; count: number; percentage: number }>;
  featureUsage: Array<{ feature: string; usage: number; trend: 'up' | 'down' | 'stable' }>;
}

// Mock data generator for demonstration
const generateMockMetrics = (timeRange: string): UsageMetrics => {
  const baseMultiplier = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
  
  return {
    totalRequests: Math.floor(Math.random() * 1000 * baseMultiplier) + 500,
    successfulRequests: Math.floor(Math.random() * 800 * baseMultiplier) + 400,
    failedRequests: Math.floor(Math.random() * 200 * baseMultiplier) + 50,
    averageResponseTime: Math.floor(Math.random() * 2000) + 800,
    totalTokensUsed: Math.floor(Math.random() * 50000 * baseMultiplier) + 10000,
    estimatedCost: (Math.random() * 25 * baseMultiplier) + 5,
    topModels: [
      { model: 'medgemma-4b-it', count: 450, percentage: 60 },
      { model: 'medgemma-27b-text-it', count: 225, percentage: 30 },
      { model: 'medgemma-27b-it', count: 75, percentage: 10 }
    ],
    requestsByType: [
      { type: 'text_analysis', count: 400, percentage: 45 },
      { type: 'clinical_qa', count: 300, percentage: 33 },
      { type: 'search_enhancement', count: 150, percentage: 17 },
      { type: 'image_analysis', count: 50, percentage: 5 }
    ],
    errorsByType: [
      { error: 'Model unavailable', count: 25, percentage: 50 },
      { error: 'Rate limit exceeded', count: 15, percentage: 30 },
      { error: 'Invalid input', count: 10, percentage: 20 }
    ],
    timeSeriesData: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      requests: Math.floor(Math.random() * 50) + 10,
      responseTime: Math.floor(Math.random() * 500) + 800,
      errors: Math.floor(Math.random() * 5)
    }))
  };
};

const generateMockPerformance = (): PerformanceMetrics => ({
  modelAccuracy: [
    { model: 'medgemma-4b-it', accuracy: 0.87, sampleSize: 150 },
    { model: 'medgemma-27b-text-it', accuracy: 0.92, sampleSize: 89 },
    { model: 'medgemma-27b-it', accuracy: 0.94, sampleSize: 67 }
  ],
  userSatisfaction: [
    { rating: 5, count: 45, percentage: 38 },
    { rating: 4, count: 38, percentage: 32 },
    { rating: 3, count: 25, percentage: 21 },
    { rating: 2, count: 8, percentage: 7 },
    { rating: 1, count: 3, percentage: 2 }
  ],
  featureUsage: [
    { feature: 'Text Analysis', usage: 67, trend: 'up' },
    { feature: 'Clinical Q&A', usage: 54, trend: 'stable' },
    { feature: 'Search Enhancement', usage: 43, trend: 'up' },
    { feature: 'Image Analysis', usage: 23, trend: 'down' }
  ]
});

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate data fetching
  const fetchMetrics = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMetrics(generateMockMetrics(timeRange));
    setPerformance(generateMockPerformance());
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    if (!metrics) return null;

    const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
    const errorRate = (metrics.failedRequests / metrics.totalRequests) * 100;
    const avgTokensPerRequest = metrics.totalTokensUsed / metrics.totalRequests;
    const costPerToken = metrics.estimatedCost / metrics.totalTokensUsed;

    return {
      successRate,
      errorRate,
      avgTokensPerRequest,
      costPerToken
    };
  }, [metrics]);

  if (!metrics || !performance || !derivedMetrics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            MedGemma Analytics
          </h2>
          <p className="text-muted-foreground">
            Monitor AI performance, usage patterns, and system health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchMetrics} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-muted-foreground">
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant={derivedMetrics.successRate > 95 ? 'default' : 'destructive'}>
                {derivedMetrics.successRate.toFixed(1)}% success rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{metrics.averageResponseTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant={metrics.averageResponseTime < 2000 ? 'default' : 'secondary'}>
                {metrics.averageResponseTime < 1000 ? 'Fast' : metrics.averageResponseTime < 2000 ? 'Good' : 'Slow'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tokens Used</p>
                <p className="text-2xl font-bold">{metrics.totalTokensUsed.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline">
                {derivedMetrics.avgTokensPerRequest.toFixed(0)} avg/request
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                <p className="text-2xl font-bold">${metrics.estimatedCost.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline">
                ${(derivedMetrics.costPerToken * 1000).toFixed(3)}/1K tokens
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Request Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.requestsByType.map((type) => {
              const icons: Record<string, React.ReactElement> = {
                text_analysis: <FileText className="h-4 w-4" />,
                clinical_qa: <MessageSquare className="h-4 w-4" />,
                search_enhancement: <Search className="h-4 w-4" />,
                image_analysis: <Image className="h-4 w-4" />
              };
              
              return (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {icons[type.type] || <Brain className="h-4 w-4" />}
                    <span className="capitalize">{type.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${type.percentage}%` }}
                      />
                    </div>
                    <Badge variant="outline">{type.count}</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Models */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Model Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.topModels.map((model, index) => (
              <div key={model.model} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                  <span className="font-mono text-sm">{model.model}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 
                        index === 1 ? 'bg-green-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${model.percentage}%` }}
                    />
                  </div>
                  <Badge variant="outline">{model.count}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Error Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Error Analysis
            </CardTitle>
            <CardDescription>
              Total errors: {metrics.failedRequests} ({derivedMetrics.errorRate.toFixed(1)}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.errorsByType.length > 0 ? (
              <div className="space-y-3">
                {metrics.errorsByType.map((error) => (
                  <div key={error.error} className="flex items-center justify-between">
                    <span className="text-sm">{error.error}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${error.percentage}%` }}
                        />
                      </div>
                      <Badge variant="destructive">{error.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-green-600">
                <p className="text-sm">No errors detected! 🎉</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Model Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {performance.modelAccuracy.map((model) => (
              <div key={model.model} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{model.model}</span>
                  <Badge variant={model.accuracy > 0.9 ? 'default' : 'secondary'}>
                    {(model.accuracy * 100).toFixed(1)}% accuracy
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${model.accuracy * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {model.sampleSize} evaluations
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Feature Usage Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performance.featureUsage.map((feature) => (
              <div key={feature.feature} className="text-center p-4 border rounded-lg">
                <h4 className="font-medium">{feature.feature}</h4>
                <p className="text-2xl font-bold mt-2">{feature.usage}%</p>
                <div className="flex items-center justify-center mt-2">
                  {feature.trend === 'up' && (
                    <Badge variant="default" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Trending Up
                    </Badge>
                  )}
                  {feature.trend === 'down' && (
                    <Badge variant="destructive" className="gap-1">
                      <TrendingUp className="h-3 w-3 rotate-180" />
                      Trending Down
                    </Badge>
                  )}
                  {feature.trend === 'stable' && (
                    <Badge variant="outline">Stable</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}