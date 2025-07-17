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
  callId: string;
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Reports</h1>
        <p className="text-gray-600">Manage user reports and take action on violations</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
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
          <Button onClick={() => fetchReports(1, statusFilter)} disabled={loadingReports}>
            Refresh
          </Button>
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
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      Report #{report.id.slice(-8)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Reported by: {report.reporter.name || report.reporter.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(report.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Reported User:</p>
                    <p className="text-sm text-gray-600">{report.reportedId}</p>
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
                  <div className="flex gap-2 pt-2">
                    {report.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateReportStatus(report.id, 'REVIEWED')}
                        >
                          Mark Reviewed
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => blockUser(report.id)}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Block User
                        </Button>
                      </>
                    )}
                    {report.status === 'REVIEWED' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'RESOLVED')}
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'DISMISSED')}
                        >
                          Dismiss
                        </Button>
                      </>
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
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === pagination.pages}
              onClick={() => setCurrentPage(currentPage + 1)}
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