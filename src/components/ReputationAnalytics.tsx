'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Shield, Bot, Activity } from 'lucide-react';

interface ReputationStats {
  totalUsers: number;
  flaggedUsers: number;
  suspiciousUsers: number;
  averageReputation: number;
  botDetectionRate: number;
  reputationDistribution: {
    legendary: number;
    expert: number;
    trusted: number;
    active: number;
    regular: number;
    new: number;
  };
  recentActivity: {
    newUsers: number;
    flaggedUsers: number;
    reputationChanges: number;
  };
}

export function ReputationAnalytics() {
  const [stats, setStats] = useState<ReputationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reputation/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < threshold) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.recentActivity.newUsers} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Reputation</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.averageReputation)}</div>
            <p className="text-xs text-muted-foreground">
              {getTrendIcon(stats.averageReputation, 200)}
              Platform health indicator
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.flaggedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {getTrendIcon(stats.recentActivity.flaggedUsers)}
              {stats.recentActivity.flaggedUsers} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Detection</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.botDetectionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.suspiciousUsers} suspicious users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reputation Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Reputation Distribution</CardTitle>
          <CardDescription>Breakdown of users by reputation level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.reputationDistribution.legendary}</div>
              <div className="text-sm text-gray-600">Legendary</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.reputationDistribution.expert}</div>
              <div className="text-sm text-gray-600">Expert</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.reputationDistribution.trusted}</div>
              <div className="text-sm text-gray-600">Trusted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.reputationDistribution.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.reputationDistribution.regular}</div>
              <div className="text-sm text-gray-600">Regular</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.reputationDistribution.new}</div>
              <div className="text-sm text-gray-600">New</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Platform activity in the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New Users</span>
              <Badge variant="secondary">{stats.recentActivity.newUsers}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Flagged Users</span>
              <Badge variant="destructive">{stats.recentActivity.flaggedUsers}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Reputation Changes</span>
              <Badge variant="outline">{stats.recentActivity.reputationChanges}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 