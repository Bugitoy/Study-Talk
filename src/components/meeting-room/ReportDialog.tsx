import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { SECURITY_CONFIG, sanitizeInput, createRateLimiter } from './security-config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  participants: any[];
  callId?: string;
  reporterId?: string;
}

const ReportDialog = ({ isOpen, onClose, participants, callId, reporterId }: ReportDialogProps) => {
  const { toast } = useToast();
  const [reportReason, setReportReason] = React.useState('');
  const [selectedReportedId, setSelectedReportedId] = React.useState('');
  const [otherReportedName, setOtherReportedName] = React.useState('');
  const [reportType, setReportType] = React.useState('INAPPROPRIATE_BEHAVIOR');

  const reportRateLimiter = createRateLimiter(SECURITY_CONFIG.REPORT_RATE_LIMIT);

  const reportTypes = [
    { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Inappropriate Behavior' },
    { value: 'HARASSMENT', label: 'Harassment' },
    { value: 'SPAM', label: 'Spam' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleReportSubmit = async () => {
    // Rate limiting check
    if (!reportRateLimiter()) {
      toast({
        title: "Rate Limited",
        description: "Too many report attempts. Please wait before trying again.",
        variant: "destructive",
      });
      return;
    }

    const reportedId = selectedReportedId === 'other' ? otherReportedName : selectedReportedId;

    // Input validation
    if (!reporterId || !reportedId || !callId || !reportReason.trim()) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Sanitize inputs
    const sanitizedReason = sanitizeInput(reportReason, SECURITY_CONFIG.MAX_REPORT_LENGTH);
    const sanitizedReportedId = selectedReportedId === 'other' 
      ? sanitizeInput(otherReportedName, SECURITY_CONFIG.MAX_OTHER_NAME_LENGTH)
      : reportedId;

    // Validate sanitized input
    if (!sanitizedReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a valid description.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reporterId, 
          reportedId: sanitizedReportedId, 
          callId, 
          reason: sanitizedReason, 
          reportType 
        }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Report submitted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit report.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit report.",
        variant: "destructive",
      });
    }

    // Reset form
    onClose();
    setReportReason('');
    setSelectedReportedId('');
    setOtherReportedName('');
    setReportType('INAPPROPRIATE_BEHAVIOR');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-dialog-title"
      aria-describedby="report-dialog-description"
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-sm sm:max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="report-dialog-title" className="text-xl font-semibold mb-4 text-[#19232d]">Report Participant</h2>
        <p id="report-dialog-description" className="sr-only">
          Use this form to report inappropriate behavior by a participant
        </p>
        <div className="mb-4">
          <label className="block mb-2 text-[#19232d] font-medium" htmlFor="reported-participant">Who are you reporting?</label>
          <Select value={selectedReportedId} onValueChange={setSelectedReportedId}>
            <SelectTrigger className="w-full" id="reported-participant" aria-describedby="participant-help">
              <SelectValue placeholder="Select a participant" />
            </SelectTrigger>
            <SelectContent>
              {participants?.map((p: any) => (
                <SelectItem key={p.userId} value={p.userId}>
                  {p.name || p.user?.name || p.userId}
                </SelectItem>
              ))}
              <SelectItem value="other">Other (not in list)</SelectItem>
            </SelectContent>
          </Select>
          <div id="participant-help" className="sr-only">
            Choose the participant you want to report
          </div>
          {selectedReportedId === 'other' && (
            <input
              className="w-full border border-gray-300 rounded p-2 mt-2 text-black"
              placeholder="Enter name or details"
              value={otherReportedName}
              onChange={e => setOtherReportedName(e.target.value)}
              maxLength={SECURITY_CONFIG.MAX_OTHER_NAME_LENGTH}
              aria-label="Enter name or details for the person you're reporting"
            />
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-[#19232d] font-medium" htmlFor="report-type">Type of Report</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-full" id="report-type" aria-describedby="report-type-help">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map(rt => (
                <SelectItem key={rt.value} value={rt.value}>
                  {rt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div id="report-type-help" className="sr-only">
            Choose the type of inappropriate behavior you're reporting
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-[#19232d] font-medium" htmlFor="report-reason">Description</label>
          <textarea
            id="report-reason"
            className="w-full border border-gray-300 rounded p-2 mb-4 text-black"
            rows={4}
            placeholder="Describe the issue..."
            value={reportReason}
            onChange={e => setReportReason(e.target.value)}
            maxLength={SECURITY_CONFIG.MAX_REPORT_LENGTH}
            aria-describedby="report-reason-help"
          />
          <div id="report-reason-help" className="sr-only">
            Provide details about the inappropriate behavior you're reporting
          </div>
          <div className="text-xs text-gray-500 text-right">
            {reportReason.length}/{SECURITY_CONFIG.MAX_REPORT_LENGTH} characters
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black"
            onClick={onClose}
            aria-label="Cancel report submission"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={handleReportSubmit}
            disabled={(!selectedReportedId || (selectedReportedId === 'other' && !otherReportedName.trim()) || !reportReason.trim())}
            aria-label="Submit report"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDialog; 