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

interface BanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  participants: any[];
  callId?: string;
  hostId?: string;
  onBanSubmit: (data: any) => void;
}

const BanDialog = ({ isOpen, onClose, participants, callId, hostId, onBanSubmit }: BanDialogProps) => {
  const { toast } = useToast();
  const [selectedBanUserId, setSelectedBanUserId] = React.useState('');
  const [banReason, setBanReason] = React.useState('');
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [confirmationData, setConfirmationData] = React.useState<any>(null);

  const banRateLimiter = createRateLimiter(SECURITY_CONFIG.BAN_RATE_LIMIT);

  const handleBanSubmit = async (confirmedData?: any) => {
    const data = confirmedData || confirmationData;
    
    // Rate limiting check
    if (!banRateLimiter()) {
      toast({
        title: "Rate Limited",
        description: "Too many ban attempts. Please wait before trying again.",
        variant: "destructive",
      });
      return;
    }

    if (!data?.selectedBanUserId || !callId) {
      toast({
        title: "Error",
        description: "Please select a user to ban.",
        variant: "destructive",
      });
      return;
    }

    // Sanitize ban reason
    const sanitizedBanReason = sanitizeInput(data.banReason, SECURITY_CONFIG.MAX_BAN_REASON_LENGTH);

    try {
      const res = await fetch('/api/room/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: data.selectedBanUserId, 
          callId: callId,
          hostId: hostId,
          reason: sanitizedBanReason.trim() || 'Banned by host'
        }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "User banned and removed from room immediately!",
        });
        
        // Also call the force remove endpoint as an additional measure
        try {
          const forceRemoveRes = await fetch('/api/room/force-remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: data.selectedBanUserId, callId: callId }),
          });
          
          if (forceRemoveRes.ok) {
            const forceRemoveData = await forceRemoveRes.json();
          }
        } catch (forceRemoveError) {
          console.error('Failed to call force remove:', forceRemoveError);
        }
        
        onBanSubmit(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to ban user from room.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to ban user from room.",
        variant: "destructive",
      });
    }

    // Reset form
    onClose();
    setSelectedBanUserId('');
    setBanReason('');
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  const handleBanClick = () => {
    if (!selectedBanUserId) {
      toast({
        title: "Error",
        description: "Please select a user to ban.",
        variant: "destructive",
      });
      return;
    }
    
    // Store data for confirmation
    setConfirmationData({
      selectedBanUserId,
      banReason,
    });
    
    // Show confirmation dialog
    setShowConfirmation(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ban-dialog-title"
      aria-describedby="ban-dialog-description"
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-sm sm:max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="ban-dialog-title" className="text-xl font-semibold mb-4 text-[#19232d]">Ban User from Room</h2>
        <p id="ban-dialog-description" className="sr-only">
          Use this form to ban a participant from this room (host only)
        </p>
        <div className="mb-4">
          <label className="block mb-2 text-[#19232d] font-medium" htmlFor="ban-participant">Who are you banning?</label>
          <Select value={selectedBanUserId} onValueChange={setSelectedBanUserId}>
            <SelectTrigger className="w-full" id="ban-participant" aria-describedby="ban-participant-help">
              <SelectValue placeholder="Select a participant" />
            </SelectTrigger>
            <SelectContent>
              {participants?.map((p: any) => (
                <SelectItem key={p.userId} value={p.userId}>
                  {p.name || p.user?.name || p.userId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div id="ban-participant-help" className="sr-only">
            Choose the participant you want to ban from this room
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-[#19232d] font-medium" htmlFor="ban-reason">Reason (optional)</label>
          <textarea
            id="ban-reason"
            className="w-full border border-gray-300 rounded p-2 text-black"
            rows={3}
            placeholder="Why are you banning this user?"
            value={banReason}
            onChange={e => setBanReason(e.target.value)}
            maxLength={SECURITY_CONFIG.MAX_BAN_REASON_LENGTH}
            aria-describedby="ban-reason-help"
          />
          <div id="ban-reason-help" className="sr-only">
            Provide a reason for banning this participant (optional)
          </div>
          <div className="text-xs text-gray-500 text-right">
            {banReason.length}/{SECURITY_CONFIG.MAX_BAN_REASON_LENGTH} characters
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black"
            onClick={onClose}
            aria-label="Cancel ban action"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={handleBanClick}
            disabled={!selectedBanUserId}
            aria-label="Ban selected user from room"
          >
            Ban User
          </button>
        </div>
      </div>
    </div>
  );
};

export default BanDialog; 