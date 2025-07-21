'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import NextLayout from '@/components/NextLayout';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Eye, Shield, Clock, AlertTriangle } from 'lucide-react';

interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  callId?: string;
  confessionId?: string;
  reason: string;
  reportType: string;
  status: string;
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser?: {
    id: string;
    name: string;
    email: string;
    isBlocked: boolean;
  };
  confession?: {
    id: string;
    title: string;
    content: string;
    isAnonymous: boolean;
    createdAt: string;
    author: {
      id: string;
      name: string;
      email: string;
    };
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminReportsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!userLoading && (!user || !user.isAdmin)) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const fetchReports = async (page = 1, status = statusFilter) => {
    setLoadingReports(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(status !== 'ALL' && { status }),
      });
      
      const res = await fetch(`/api/report?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setReports(data.reports);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchReports(currentPage, statusFilter);
    }
  }, [user, currentPage, statusFilter]);

  const updateReportStatus = async (reportId: string, status: string, adminNotes?: string) => {
    try {
      const res = await fetch(`/api/report/${reportId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      });
      
      if (res.ok) {
        fetchReports(currentPage, statusFilter);
      }
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const blockUser = async (reportId: string) => {
    try {
      const res = await fetch(`/api/report/${reportId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (res.ok) {
        fetchReports(currentPage, statusFilter);
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      const res = await fetch('/api/user/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          unblockedBy: user?.id || 'admin' 
        }),
      });
      
      if (res.ok) {
        fetchReports(currentPage, statusFilter);
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'REVIEWED': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'RESOLVED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'DISMISSED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      REVIEWED: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      DISMISSED: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  if (userLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <NextLayout>
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Reports</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage user reports and take action on violations</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/reputation')}
              className="text-sm sm:text-base"
            >
              Reputation Management
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="DISMISSED">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => fetchReports(1, statusFilter)} disabled={loadingReports} className="w-full sm:w-auto">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loadingReports ? (
          <div className="text-center py-8">Loading reports...</div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No reports found</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      Report #{report.id.slice(-8)}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Reported by: {report.reporter.name || report.reporter.email} • {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(report.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Report Type Indicator */}
                  <div className="mb-4">
                    <Badge variant={
                      report.confessionId ? "default" : 
                      report.callId === 'TALK_CONVERSATION' ? "destructive" : 
                      "secondary"
                    } className="mb-2">
                      {report.confessionId ? "Confession Report" : 
                       report.callId === 'TALK_CONVERSATION' ? "Talk Report" : 
                       "Call Report"}
                    </Badge>
                  </div>
                  
                  {/* Confession Details */}
                  {report.confession && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="font-medium text-sm text-blue-700 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Reported Confession:
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-xs text-gray-600">Title:</p>
                          <p className="text-sm text-gray-800">{report.confession.title}</p>
                        </div>
                        <div>
                          <p className="font-medium text-xs text-gray-600">Content:</p>
                          <p className="text-sm text-gray-800 line-clamp-3">{report.confession.content}</p>
                          <button 
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            onClick={() => {
                              // Show full content in a modal or expand the content
                              const fullContent = report.confession?.content;
                              if (fullContent) {
                                alert(`Full confession content:\n\n${fullContent}`);
                              }
                            }}
                          >
                            View full content
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs text-gray-600">
                          <span>Author: {report.confession.isAnonymous ? "Anonymous" : report.confession.author.name}</span>
                          <span>Posted: {new Date(report.confession.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Talk Report Details */}
                  {report.callId === 'TALK_CONVERSATION' && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="font-medium text-sm text-red-700 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Talk Conversation Report:
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-xs text-gray-600">Reported User:</p>
                          <p className="text-sm text-gray-800">{report.reportedId}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs text-gray-600">
                          <span>Report Type: Talk Conversation</span>
                          <span>Reported: {new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium">Reported User:</p>
                    <p className="text-sm text-gray-600">
                      {report.confessionId && report.confession 
                        ? (report.confession.isAnonymous ? "Anonymous" : report.confession.author.name)
                        : report.reportedId
                      }
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Reason:</p>
                    <p className="text-sm text-gray-600">{report.reason}</p>
                  </div>
                  <div>
                    <p className="font-medium">Type:</p>
                    <p className="text-sm text-gray-600">{report.reportType}</p>
                  </div>
                  {report.adminNotes && (
                    <div>
                      <p className="font-medium">Admin Notes:</p>
                      <p className="text-sm text-gray-600">{report.adminNotes}</p>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    {/* Status management buttons */}
                    {report.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => updateReportStatus(report.id, 'REVIEWED')}
                        className="w-full sm:w-auto"
                      >
                        Mark Reviewed
                      </Button>
                    )}
                    {report.status === 'REVIEWED' && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'RESOLVED')}
                          className="w-full sm:w-auto"
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'DISMISSED')}
                          className="w-full sm:w-auto"
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                    
                    {/* Block/Unblock button - shows based on actual user status */}
                    {report.reportedUser && (
                      report.reportedUser.isBlocked ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unblockUser(report.reportedId)}
                          className="w-full sm:w-auto"
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Unblock User
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => blockUser(report.id)}
                          className="w-full sm:w-auto"
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Block User
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="w-full sm:w-auto"
            >
              Previous
            </Button>
            <span className="flex items-center px-2 sm:px-4 text-sm sm:text-base">
              Page {currentPage} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === pagination.pages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="w-full sm:w-auto"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
    </NextLayout>
  );
} 