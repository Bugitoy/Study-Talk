'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserReputationBadge } from '@/components/UserReputationBadge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, AlertTriangle, Bot, TrendingUp, Activity, Calendar, BarChart3, Clock, Eye, User, Mail, MapPin, Crown, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import NextLayout from '@/components/NextLayout';
import { BotDetectionPanel } from '@/components/BotDetectionPanel';
import { useRouter } from 'next/navigation';

interface UserReputation {
  id: string;
  name: string;
  email: string;
  reputationScore: number;
  activityScore: number;
  qualityScore: number;
  trustScore: number;
  botProbability: number;
  verificationLevel: string;
  isFlagged: boolean;
  isBlocked: boolean;
  reputationLevel: string;
  lastActivityAt: string;
  confessionCount: number;
  voteCount: number;
  commentCount: number;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  reputationScore: number;
  activityScore: number;
  qualityScore: number;
  trustScore: number;
  botProbability: number;
  verificationLevel: string;
  isFlagged: boolean;
  reputationLevel: string;
  lastActivityAt: string;
  confessionCount: number;
  voteCount: number;
  commentCount: number;
  university?: string;
  universityVerifiedAt?: string;
  createdAt: string;
  botDetectionInfo?: {
    riskLevel: string;
    indicators: string[];
    recommendations: string[];
    probability: number;
  };
  reputationHistory?: Array<{
    id: string;
    changeType: string;
    changeAmount: number;
    reason: string;
    createdAt: string;
  }>;
  confessions?: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    votes: Array<{
      id: string;
      voteType: 'BELIEVE' | 'DOUBT';
    }>;
    comments: Array<{
      id: string;
      content: string;
      createdAt: string;
    }>;
  }>;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    confession: {
      id: string;
      title: string;
    };
  }>;
}

export default function ReputationAdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserReputation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    flaggedUsers: 0,
    suspiciousUsers: 0,
    averageReputation: 0,
    botDetectionRate: 0,
  });
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/reputation');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user reputation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/reputation/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefreshAll = async () => {
    try {
      setLoading(true);
      // Refresh both user data and stats simultaneously
      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    }
  };

  const handleFlagUser = async (userId: string, action: 'flag' | 'unflag') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error('Failed to update user flag');

      toast({
        title: "Success",
        description: `User ${action === 'flag' ? 'flagged' : 'unflagged'} successfully`,
      });

      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Error updating user flag:', error);
      toast({
        title: "Error",
        description: "Failed to update user flag",
        variant: "destructive",
      });
    }
  };

  const handleBlockUser = async (userId: string, action: 'block' | 'unblock') => {
    try {
      const response = await fetch('/api/user/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          action,
          blockedBy: 'admin',
          reason: action === 'block' ? 'Blocked by admin from reputation management' : 'Unblocked by admin'
        }),
      });

      if (!response.ok) throw new Error('Failed to update user block status');

      toast({
        title: "Success",
        description: `User ${action === 'block' ? 'blocked' : 'unblocked'} successfully`,
      });

      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Error updating user block status:', error);
      toast({
        title: "Error",
        description: "Failed to update user block status",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (user: UserReputation) => {
    try {
      setLoadingUserDetails(true);
      setIsDetailsModalOpen(true);
      
      // Fetch detailed user information
      const [userDetailsResponse, botDetectionResponse, reputationHistoryResponse, confessionsResponse, commentsResponse] = await Promise.all([
        fetch(`/api/user?userId=${user.id}`),
        fetch(`/api/admin/bot-detection/${user.id}`),
        fetch(`/api/admin/users/${user.id}/reputation-history`),
        fetch(`/api/admin/users/${user.id}/confessions`),
        fetch(`/api/admin/users/${user.id}/comments`)
      ]);

      const userDetails = await userDetailsResponse.json();
      const botDetectionInfo = botDetectionResponse.ok ? await botDetectionResponse.json() : null;
      const reputationHistory = reputationHistoryResponse.ok ? await reputationHistoryResponse.json() : null;
      const confessions = confessionsResponse.ok ? await confessionsResponse.json() : null;
      const comments = commentsResponse.ok ? await commentsResponse.json() : null;

      setSelectedUser({
        ...user,
        ...userDetails,
        botDetectionInfo,
        reputationHistory,
        confessions,
        comments
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || 
      (filter === 'flagged' && user.isFlagged) ||
      (filter === 'blocked' && user.isBlocked) ||
      (filter === 'suspicious' && user.botProbability > 50) ||
      (filter === 'trusted' && user.verificationLevel === 'TRUSTED');
    
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getReputationColor = (level: string) => {
    switch (level) {
      case 'LEGENDARY': return 'text-purple-600 bg-purple-100';
      case 'EXPERT': return 'text-blue-600 bg-blue-100';
      case 'TRUSTED': return 'text-green-600 bg-green-100';
      case 'ACTIVE': return 'text-yellow-600 bg-yellow-100';
      case 'REGULAR': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <NextLayout>
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reputation Management</h1>
          <p className="text-gray-600">Monitor user reputation and bot detection</p>
        </div>
        <div className="flex items-center gap-5">
          <Button onClick={handleRefreshAll} disabled={loading} className="bg-orange-300 text-white hover:bg-orange-400">
            Refresh Data
          </Button>
          <Button onClick={() => router.push("/admin/reports")} className="bg-thanodi-blue text-white hover:bg-blue-300">
            Back to Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.flaggedUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Users</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspiciousUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Reputation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.averageReputation)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Detection Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.botDetectionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Bot Detection Panel */}
      <BotDetectionPanel onRefresh={handleRefreshAll} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="flagged">Flagged Users</SelectItem>
            <SelectItem value="blocked">Blocked Users</SelectItem>
            <SelectItem value="suspicious">Suspicious Users</SelectItem>
            <SelectItem value="trusted">Trusted Users</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Reputation Data</CardTitle>
          <CardDescription>
            {filteredUsers.length} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Reputation</TableHead>
                  <TableHead>Bot Probability</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getReputationColor(user.reputationLevel)}>
                            {user.reputationLevel}
                          </Badge>
                          <span className="text-sm font-medium">
                            {user.reputationScore}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          A: {user.activityScore} | Q: {user.qualityScore} | T: {user.trustScore}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              user.botProbability > 70 ? 'bg-red-500' :
                              user.botProbability > 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${user.botProbability}%` }}
                          />
                        </div>
                        <span className="text-sm">{user.botProbability}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>Posts: {user.confessionCount}</div>
                        <div>Votes: {user.voteCount}</div>
                        <div>Comments: {user.commentCount}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={user.isFlagged ? "destructive" : "secondary"}>
                            {user.isFlagged ? "Flagged" : "Active"}
                          </Badge>
                          {user.isBlocked && (
                            <Badge variant="destructive">
                              Blocked
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.verificationLevel}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-row gap-2">
                        <Button
                          size="sm"
                          variant={user.isFlagged ? "outline" : "destructive"}
                          onClick={() => handleFlagUser(user.id, user.isFlagged ? 'unflag' : 'flag')}
                        >
                          {user.isFlagged ? "Unflag" : "Flag"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant={user.isBlocked ? "outline" : "destructive"}
                          onClick={() => handleBlockUser(user.id, user.isBlocked ? 'unblock' : 'block')}
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(user)}
                        >
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive user information and activity analysis
            </DialogDescription>
          </DialogHeader>
          
          {loadingUserDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading user details...</p>
              </div>
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Name:</span>
                      <span>{selectedUser.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                    {selectedUser.university && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">University:</span>
                        <span>{selectedUser.university}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Joined:</span>
                      <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Last Activity:</span>
                      <span>{selectedUser.lastActivityAt ? new Date(selectedUser.lastActivityAt).toLocaleDateString() : 'Never'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Verification:</span>
                      <Badge variant="outline">{selectedUser.verificationLevel}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reputation Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Reputation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Overall Reputation:</span>
                        <div className="flex items-center gap-2">
                          <Badge className={getReputationColor(selectedUser.reputationLevel)}>
                            {selectedUser.reputationLevel}
                          </Badge>
                          <span className="font-bold text-lg">{selectedUser.reputationScore}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Activity Score:</span>
                          <span className="font-medium">{selectedUser.activityScore}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Quality Score:</span>
                          <span className="font-medium">{selectedUser.qualityScore}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Trust Score:</span>
                          <span className="font-medium">{selectedUser.trustScore}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Activity Summary:</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Confessions:</span>
                          <span className="font-medium">{selectedUser.confessionCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Votes Cast:</span>
                          <span className="font-medium">{selectedUser.voteCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Comments:</span>
                          <span className="font-medium">{selectedUser.commentCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bot Detection Analysis */}
              {selectedUser.botDetectionInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      Bot Detection Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Bot Probability:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full ${
                                selectedUser.botProbability > 70 ? 'bg-red-500' :
                                selectedUser.botProbability > 50 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${selectedUser.botProbability}%` }}
                            />
                          </div>
                          <span className="font-bold">{selectedUser.botProbability}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Risk Level:</span>
                        <Badge className={getRiskLevelColor(selectedUser.botDetectionInfo.riskLevel)}>
                          {selectedUser.botDetectionInfo.riskLevel}
                        </Badge>
                      </div>
                      
                      {selectedUser.botDetectionInfo.indicators.length > 0 && (
                        <div>
                          <span className="font-medium block mb-2">Detection Indicators:</span>
                          <div className="space-y-1">
                            {selectedUser.botDetectionInfo.indicators.map((indicator: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                <span>{indicator}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedUser.botDetectionInfo.recommendations.length > 0 && (
                        <div>
                          <span className="font-medium block mb-2">Recommendations:</span>
                          <div className="space-y-1">
                            {selectedUser.botDetectionInfo.recommendations.map((rec: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Shield className="w-4 h-4 text-blue-500" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reputation History */}
              {selectedUser.reputationHistory && selectedUser.reputationHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Reputation History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedUser.reputationHistory.map((history) => (
                        <div key={history.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{history.changeType}</span>
                              <Badge variant={history.changeAmount > 0 ? "default" : "destructive"}>
                                {history.changeAmount > 0 ? '+' : ''}{history.changeAmount}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{history.reason}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(history.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Confessions and Comments */}
              {selectedUser.confessions && selectedUser.confessions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Recent Confessions ({selectedUser.confessions.length})
                    </CardTitle>
                    <CardDescription>
                      Latest confessions posted by this user
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {selectedUser.confessions.map((confession) => {
                        const believeVotes = confession.votes.filter(v => v.voteType === 'BELIEVE').length;
                        const doubtVotes = confession.votes.filter(v => v.voteType === 'DOUBT').length;
                        const totalVotes = confession.votes.length;
                        
                        return (
                          <div key={confession.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{confession.title}</h4>
                              <span className="text-xs text-gray-500">
                                {new Date(confession.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3 line-clamp-3">{confession.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3 text-green-600" />
                                <span>{believeVotes} believe</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsDown className="w-3 h-3 text-red-600" />
                                <span>{doubtVotes} doubt</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-blue-600" />
                                <span>{confession.comments.length} comments</span>
                              </div>
                              {totalVotes > 0 && (
                                <div className="text-xs">
                                  <span className={`font-medium ${believeVotes > doubtVotes ? 'text-green-600' : 'text-red-600'}`}>
                                    {Math.round((believeVotes / totalVotes) * 100)}% positive
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedUser.comments && selectedUser.comments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Recent Comments ({selectedUser.comments.length})
                    </CardTitle>
                    <CardDescription>
                      Latest comments posted by this user
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {selectedUser.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 mb-2">"{comment.content}"</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>On confession: <span className="font-medium">{comment.confession.title}</span></span>
                                <span>• {new Date(comment.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Content Analysis Summary */}
              {(selectedUser.confessions && selectedUser.confessions.length > 0) || (selectedUser.comments && selectedUser.comments.length > 0) ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Content Analysis Summary
                    </CardTitle>
                    <CardDescription>
                      Analysis of user's content patterns and engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedUser.confessions && selectedUser.confessions.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Confession Analysis:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Confessions:</span>
                              <span className="font-medium">{selectedUser.confessions.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Average Content Length:</span>
                              <span className="font-medium">
                                {Math.round(selectedUser.confessions.reduce((sum, c) => sum + c.content.length, 0) / selectedUser.confessions.length)} chars
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Votes Received:</span>
                              <span className="font-medium">
                                {selectedUser.confessions.reduce((sum, c) => sum + c.votes.length, 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Comments Received:</span>
                              <span className="font-medium">
                                {selectedUser.confessions.reduce((sum, c) => sum + c.comments.length, 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedUser.comments && selectedUser.comments.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Comment Analysis:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Comments:</span>
                              <span className="font-medium">{selectedUser.comments.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Average Comment Length:</span>
                              <span className="font-medium">
                                {Math.round(selectedUser.comments.reduce((sum, c) => sum + c.content.length, 0) / selectedUser.comments.length)} chars
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Unique Confessions Commented On:</span>
                              <span className="font-medium">
                                {new Set(selectedUser.comments.map(c => c.confession.id)).size}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Content Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No confessions or comments found for this user.</p>
                      <p className="text-sm">This user may be new or inactive.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Alerts */}
      {stats.flaggedUsers > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {stats.flaggedUsers} users are currently flagged for review. 
            Please review their activity and take appropriate action.
          </AlertDescription>
        </Alert>
        )}
      </div>
    </NextLayout>
  );
} 