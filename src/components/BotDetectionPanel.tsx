import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Users, Activity, Bot } from 'lucide-react';

interface BotDetectionStats {
  totalUsers: number;
  suspiciousUsers: number;
  criticalUsers: number;
  averageProbability: number;
}

interface BotDetectionResult {
  probability: number;
  indicators: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
}

interface BotDetectionPanelProps {
  onRefresh?: () => void;
}

export function BotDetectionPanel({ onRefresh }: BotDetectionPanelProps) {
  const [stats, setStats] = useState<BotDetectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBotDetectionStats();
  }, []);

  const fetchBotDetectionStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bot-detection/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Failed to fetch bot detection statistics');
      }
    } catch (error) {
      setError('Error loading bot detection statistics');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4" />;
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4" />;
      case 'MEDIUM':
        return <Shield className="w-4 h-4" />;
      case 'LOW':
        return <Shield className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Bot Detection System
            </CardTitle>
            <CardDescription>
              Monitoring and analyzing user behavior for automated activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No bot detection data available</AlertDescription>
      </Alert>
    );
  }

  const criticalPercentage = stats.totalUsers > 0 ? (stats.criticalUsers / stats.totalUsers * 100).toFixed(1) : '0';
  const suspiciousPercentage = stats.totalUsers > 0 ? (stats.suspiciousUsers / stats.totalUsers * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Bot Detection Overview
          </CardTitle>
          <CardDescription>
            Real-time monitoring of automated user behavior and suspicious activity patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">Suspicious Users</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.suspiciousUsers} ({suspiciousPercentage}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">Critical Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.criticalUsers} ({criticalPercentage}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Activity className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Avg Bot Probability</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.averageProbability.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detection Methods</CardTitle>
          <CardDescription>
            Multi-layered approach to identify automated behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Activity Pattern Analysis</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Excessive daily activity detection</li>
                <li>• Activity burst analysis</li>
                <li>• Consistent pattern recognition</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Content Analysis</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Repetitive content detection</li>
                <li>• Generic/bot-like content patterns</li>
                <li>• Content length analysis</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Timing Analysis</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Regular interval detection</li>
                <li>• 24/7 activity monitoring</li>
                <li>• Timezone inconsistency checks</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Engagement Analysis</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Low engagement despite high activity</li>
                <li>• One-sided interaction detection</li>
                <li>• Social graph analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Levels</CardTitle>
          <CardDescription>
            Classification system for bot detection results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-100 text-red-800 border-red-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                CRITICAL
              </Badge>
              <span className="text-sm text-gray-600">80%+ bot probability - Immediate action required</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                HIGH
              </Badge>
              <span className="text-sm text-gray-600">60-79% bot probability - Enhanced monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Shield className="w-3 h-3 mr-1" />
                MEDIUM
              </Badge>
              <span className="text-sm text-gray-600">30-59% bot probability - Regular monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Shield className="w-3 h-3 mr-1" />
                LOW
              </Badge>
              <span className="text-sm text-gray-600">0-29% bot probability - Normal activity</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 