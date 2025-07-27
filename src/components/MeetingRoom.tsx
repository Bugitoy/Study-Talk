'use client';
import React, { useEffect, useState } from 'react';
import {
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, SquarePlus, Handshake, MessageSquareText, Hourglass, Flag, Shield } from 'lucide-react';


import Loader from './Loader';
import EndCallButton from './StudyEndCallButton';
import { cn } from '@/lib/utils';
import { useRoomSettingByCallId } from '@/hooks/useRoomSettings';
import StudyCallControls from './StudyCallControls';
import { useStreamStudyTimeTracker } from '@/hooks/useStreamStudyTimeTracker';
import { StudyTimeProgress } from './StudyTimeProgress';
import { MobileStudyTimeProgress } from './MobileStudyTimeProgress';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

// Security configuration
const SECURITY_CONFIG = {
  MAX_REPORT_LENGTH: 1000,
  MAX_BAN_REASON_LENGTH: 500,
  MAX_OTHER_NAME_LENGTH: 100,
  REPORT_RATE_LIMIT: {
    MAX_ATTEMPTS: 30,
    WINDOW_MS: 60000, // 1 minute
  },
  BAN_RATE_LIMIT: {
    MAX_ATTEMPTS: 25,
    WINDOW_MS: 300000, // 5 minutes
  },
  FORBIDDEN_CHARS: /[<>\"'&]/g,
  ALLOWED_CHARS: /^[a-zA-Z0-9\s\-_.,!?()@#$%*+=:;()[\]{}|\\/]+$/,
};

// Input sanitization utility
const sanitizeInput = (input: string, maxLength: number): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove forbidden characters
  let sanitized = input.replace(SECURITY_CONFIG.FORBIDDEN_CHARS, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

// Rate limiting utility
const createRateLimiter = (config: typeof SECURITY_CONFIG.REPORT_RATE_LIMIT) => {
  let attempts = 0;
  let lastReset = Date.now();
  
  return () => {
    const now = Date.now();
    if (now - lastReset > config.WINDOW_MS) {
      attempts = 0;
      lastReset = now;
    }
    
    if (attempts >= config.MAX_ATTEMPTS) {
      return false;
    }
    
    attempts++;
    return true;
  };
};

// Audit logging utility - DISABLED for performance
const logSecurityEvent = async (event: string, data: any) => {
  // Audit logging disabled to prevent performance impact
  // In production, this would be re-enabled with proper logging service
};

const goals = [
  { key: 'join', label: 'Join', icon: SquarePlus },
  { key: 'befriend', label: 'Make a friend', icon: Handshake },
  { key: 'message', label: 'Write a message', icon: MessageSquareText },
  { key: 'stay', label: 'Stay 30 minutes', icon: Hourglass },
];

const MeetingGoalsBar = ({ completedGoals = [] }: { completedGoals: string[] }) => (
  <div className="w-full max-w-3xl mx-auto flex flex-col items-center" role="progressbar" aria-label="Meeting goals progress" aria-valuenow={completedGoals.length} aria-valuemin={0} aria-valuemax={4}>
    <div className="flex items-center w-full justify-between">
      {goals.map((goal, idx) => {
        const Icon = goal.icon;
        const isCompleted = completedGoals.includes(goal.key);
        return (
          <React.Fragment key={goal.key}>
            <div className="flex flex-col items-center w-16 sm:w-24">
              <div 
                className={`w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center z-10 bg-white rounded-[8px] border-2 ${isCompleted ? 'border-yellow-400' : 'border-gray-300'}`}
                aria-label={`${goal.label} goal ${isCompleted ? 'completed' : 'not completed'}`}
              >
                <Icon className={`w-5 h-5 sm:w-8 sm:h-8 ${isCompleted ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-[#19232d] font-medium text-center w-full">
                {goal.label}
              </span>
            </div>
            {idx < goals.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-300 mx-1" aria-hidden="true" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const groupName = searchParams.get('name') || 'Study Group';
  const router = useRouter();
  const call = useCall();
  const { startTracking, endTracking, isTracking, dailyHours } = useStreamStudyTimeTracker(call?.id);
  const { toast } = useToast();
  const [layout, setLayout] = useState<CallLayoutType>('grid');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedReportedId, setSelectedReportedId] = useState('');
  const [otherReportedName, setOtherReportedName] = useState('');
  const { useCallCallingState } = useCallStateHooks();
  const roomSettings = useRoomSettingByCallId(call?.id);
  const [reportType, setReportType] = useState('INAPPROPRIATE_BEHAVIOR');
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [selectedBanUserId, setSelectedBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [showBanConfirmation, setShowBanConfirmation] = useState(false);
  const [banConfirmationData, setBanConfirmationData] = useState<any>(null);

  // Rate limiters
  const reportRateLimiter = createRateLimiter(SECURITY_CONFIG.REPORT_RATE_LIMIT);
  const banRateLimiter = createRateLimiter(SECURITY_CONFIG.BAN_RATE_LIMIT);

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

  // Get current user and host id
  const hostId = call?.state.createdBy?.id;
  const localParticipant = call?.state.localParticipant;
  const currentUserId = localParticipant?.userId;
  const isHost = currentUserId && hostId && currentUserId === hostId;

  // Access is already checked before joining the call, so we can skip this check
  useEffect(() => {
    if (currentUserId && call?.id) {
      setIsCheckingAccess(false);
    }
  }, [currentUserId, call?.id]);

  // Mock completed goals for now
  const [completedGoals, setCompletedGoals] = useState<string[]>(['join']);

  // Start tracking when call is joined
  useEffect(() => {
    if (callingState === CallingState.JOINED && call?.id) {
      startTracking();
      
      // Update streak when user joins a meeting room
      if (currentUserId) {
        fetch('/api/user/streak', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: currentUserId }),
        }).catch(error => {
          console.error('Failed to update streak:', error);
        });
      }
      
      // Access is already checked before joining, so we just start tracking
    }
  }, [callingState, call?.id, startTracking, currentUserId]);

  // End tracking when component unmounts or call ends
  useEffect(() => {
    return () => {
      if (isTracking) {
        endTracking();
      }
    };
  }, []);

  useEffect(() => {
    if (!call) return;
    const handler = async (e: any) => {
      const leftId = e.participant?.userId || e.participant?.user?.id;
      if (leftId === hostId) {
        try {
          // End tracking before call cleanup
          await endTracking();
          // Don't try to delete the call - let the webhook handle room cleanup
          // The webhook will end the room when all participants leave
        } catch (err) {
          console.error('Failed to handle host leaving', err);
        }
      }
    };
    const unsub = call.on('participantLeft', handler);
    return () => {
      unsub?.();
    };
  }, [call, hostId]);

  useEffect(() => {
    if (!call) return;

    // Handler for when the user is removed from the call
    const handleCallEnded = (event: any) => {
      toast({
        title: 'Removed from call',
        description: 'You have been removed from this room by the host.'
      });
      router.push('/meetups/study-groups');
    };

    // Handler for when the user is removed/kicked
    const handleRemoved = (event: any) => {
      toast({
        title: 'Removed from call',
        description: 'You have been removed from this room by the host.'
      });
      router.push('/meetups/study-groups');
    };

    // Handler for when the call state changes
    const handleCallStateChanged = (event: any) => {
      if (event.state === 'ended' || event.state === 'disconnected') {
        toast({
          title: 'Removed from call',
          description: 'You have been removed from this room by the host.',
        });
        router.push('/meetups/study-groups');
      }
    };

    // Handler for when participants are removed
    const handleParticipantLeft = (event: any) => {
      const leftUserId = event.participant?.userId || event.participant?.user?.id;
      
      // Check if the current user was removed
      if (leftUserId === currentUserId) {
        toast({
          title: 'Removed from call',
          description: 'You have been removed from this room by the host.',
        });
        router.push('/meetups/study-groups');
      } else {
        // Another participant left the call
        if (isHost) {
          toast({
            title: 'Participant left',
            description: `A participant has left the call.`,
          });
        }
      }
    };

    // Handler for when call custom state changes (for forced disconnection)
    const handleCallCustomChanged = (custom: any) => {
      if (custom.forceUserDisconnect && custom.forceUserDisconnect === currentUserId) {
        toast({
          title: 'Banned from call',
          description: 'You have been banned from this room by the host.',
          variant: 'destructive',
        });
        // Force the user to leave the call
        call.leave();
        router.push('/meetups/study-groups');
      }
    };

    // Listen for multiple events
    call.on('callEnded', handleCallEnded);
    call.on('participantLeft', handleParticipantLeft);
    
    // Listen for custom state changes
    const customSubscription = call.state.custom$.subscribe(handleCallCustomChanged);

    return () => {
      call.off('callEnded', handleCallEnded);
      call.off('participantLeft', handleParticipantLeft);
      customSubscription?.unsubscribe();
    };
  }, [call, router, toast, currentUserId]);

  // Keep event listeners for when user is removed during the call
  useEffect(() => {
    if (!call || !currentUserId) return;

    const checkUserInCall = async () => {
      // Only check if user is still in the call (for cases where they're removed during the call)
      const participants = call.state.participants || [];
      const userStillInCall = participants.some((p: any) => 
        (p.userId || p.user?.id) === currentUserId
      );

      if (!userStillInCall) {
        toast({
          title: 'Removed from call',
          description: 'You have been removed from this room.',
          variant: 'destructive',
        });
        router.push('/meetups/study-groups');
      }
    };

    // Check every 1 second for more responsive removal detection
    const interval = setInterval(checkUserInCall, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [call, currentUserId, router, toast]);

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  const reportTypes = [
    { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Inappropriate Behavior' },
    { value: 'HARASSMENT', label: 'Harassment' },
    { value: 'SPAM', label: 'Spam' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
    { value: 'OTHER', label: 'Other' },
  ];

  // Handle report submission with security measures
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

    const reporterId = call?.state.localParticipant?.userId;
    const reportedId = selectedReportedId === 'other' ? otherReportedName : selectedReportedId;
    const callId = call?.id;

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
      // Log security event (disabled for performance)
      // await logSecurityEvent('report_submitted', {
      //   reporterId,
      //   reportedId: sanitizedReportedId,
      //   callId,
      //   reportType,
      //   reasonLength: sanitizedReason.length,
      // });

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
    setShowReportDialog(false);
    setReportReason('');
    setSelectedReportedId('');
    setOtherReportedName('');
    setReportType('INAPPROPRIATE_BEHAVIOR');
  };

  // Handle ban submission with security measures
  const handleBanSubmit = async (confirmedData?: any) => {
    const data = confirmedData || banConfirmationData;
    
    // Rate limiting check
    if (!banRateLimiter()) {
      toast({
        title: "Rate Limited",
        description: "Too many ban attempts. Please wait before trying again.",
        variant: "destructive",
      });
      return;
    }

    if (!data?.selectedBanUserId || !call?.id) {
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
      // Log security event (disabled for performance)
      // await logSecurityEvent('ban_submitted', {
      //   hostId: currentUserId,
      //   bannedUserId: data.selectedBanUserId,
      //   callId: call.id,
      //   reasonLength: sanitizedBanReason.length,
      // });

      const res = await fetch('/api/room/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: data.selectedBanUserId, 
          callId: call.id,
          hostId: currentUserId,
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
            body: JSON.stringify({ userId: data.selectedBanUserId, callId: call.id }),
          });
          
          if (forceRemoveRes.ok) {
            const forceRemoveData = await forceRemoveRes.json();
          }
        } catch (forceRemoveError) {
          console.error('Failed to call force remove:', forceRemoveError);
        }
        
        // Force a refresh of call participants to update the UI
        if (call) {
          try {
            // Try to force the user to leave by updating call state
            await call.update({
              custom: { 
                ...call.state.custom, 
                bannedUser: data.selectedBanUserId,
                banTimestamp: Date.now()
              }
            });
            
            // Also try to remove the user directly from the call state
            const participants = call.state.participants || [];
            const targetParticipant = participants.find((p: any) => 
              (p.userId || p.user?.id) === data.selectedBanUserId
            );
            
            if (targetParticipant) {
              // Try to force a participant list refresh
              setTimeout(() => {
                call.update({ 
                  custom: { 
                    ...call.state.custom, 
                    forceRefresh: Date.now(),
                    bannedUser: data.selectedBanUserId
                  } 
                });
              }, 500);
            }
            
            // Note: We don't end the call as it would remove all users
            // Instead, we rely on the webhook to prevent banned users from rejoining
            
            // Set up continuous monitoring to ensure user is removed
            const monitorInterval = setInterval(async () => {
              try {
                const participants = call.state.participants || [];
                const bannedUserStillInCall = participants.some((p: any) => 
                  (p.userId || p.user?.id) === data.selectedBanUserId
                );
                
                if (bannedUserStillInCall) {
                  // Call force remove endpoint
                  const forceRemoveRes = await fetch('/api/room/force-remove', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: data.selectedBanUserId, callId: call.id }),
                  });
                  
                  if (forceRemoveRes.ok) {
                    const forceRemoveData = await forceRemoveRes.json();
                  }
                } else {
                  clearInterval(monitorInterval);
                }
              } catch (monitorError) {
                console.error('Failed to monitor user removal:', monitorError);
              }
            }, 5000); // Check every 5 seconds
            
            // Stop monitoring after 30 seconds
            setTimeout(() => {
              clearInterval(monitorInterval);
            }, 30000);
            
            // Check if the banned user is still in the call after 3 seconds
            setTimeout(async () => {
              try {
                const participants = call.state.participants || [];
                const bannedUserStillInCall = participants.some((p: any) => 
                  (p.userId || p.user?.id) === data.selectedBanUserId
                );
                
                if (bannedUserStillInCall) {
                  // Call the force remove endpoint again
                  const forceRemoveRes = await fetch('/api/room/force-remove', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: data.selectedBanUserId, callId: call.id }),
                  });
                  
                  if (forceRemoveRes.ok) {
                    const forceRemoveData = await forceRemoveRes.json();
                  }
                  
                  // Additional attempt: try to force the user to leave by updating call state
                  try {
                    await call.update({
                      custom: { 
                        ...call.state.custom, 
                        forceUserLeave: data.selectedBanUserId,
                        forceLeaveTimestamp: Date.now()
                      }
                    });
                  } catch (updateError) {
                    console.error('Failed to force call update:', updateError);
                  }
                }
              } catch (checkError) {
                console.error('Failed to check if banned user is still in call:', checkError);
              }
            }, 3000);
            
          } catch (updateError) {
            console.error('Failed to update call after ban:', updateError);
          }
        }
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
    setShowBanDialog(false);
    setShowBanConfirmation(false);
    setSelectedBanUserId('');
    setBanReason('');
    setBanConfirmationData(null);
  };

  return (
    <>
      {callingState !== CallingState.JOINED || isCheckingAccess ? (
        <Loader />
      ) : (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white" role="main" aria-label="Study group meeting room">
      {/* Overlay: Group name title and MeetingGoalsBar */}
      <div className="absolute top-0 left-0 w-full flex flex-col items-center z-20 p-3 sm:p-6 pointer-events-none">
        <div className="backdrop-blur-sm rounded-xl p-3 sm:p-6 shadow-md pointer-events-auto rounded-[8px]">
          <h1 className="text-2xl sm:text-4xl font-semibold text-[#19232d] mb-[1.5rem] sm:mb-[3rem] text-center">
            Group Name: {groupName}
          </h1>
          <MeetingGoalsBar completedGoals={completedGoals} />
        </div>
      </div>
      
      {/* Vertical Study Progress Widget - Right Side (Desktop Only) */}
      <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 z-30 pointer-events-none hidden 2xl:block">
        <StudyTimeProgress 
          dailyHours={dailyHours} 
          isTracking={isTracking}
          className="w-25"
        />
      </div>
      
      <div className="relative flex size-full items-center justify-center pb-60 sm:pb-56 md:pb-52">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        {/* Background overlay for small screens and tablets */}
        {showParticipants && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowParticipants(false)}
            aria-hidden="true"
          />
        )}
        
        <div
          className={cn('h-[calc(100vh-86px)] hidden', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      
      {/* Mobile Study Progress Widget - Above Call Controls (Small Screens and Tablets) */}
      <div className="block 2xl:hidden absolute bottom-52 sm:bottom-48 md:bottom-44 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
        <MobileStudyTimeProgress 
          dailyHours={dailyHours} 
          isTracking={isTracking}
          className="w-80 sm:w-96 md:w-[90vw]"
        />
      </div>
      {/* video layout and call controls */}
      <div className="fixed bottom-0 left-0 right-0 rounded-t-xl flex w-full items-center justify-center gap-3 sm:gap-5 flex-nowrap sm:flex-wrap p-2 sm:p-4 bg-black/20 backdrop-blur-sm" role="toolbar" aria-label="Meeting controls">
         <StudyCallControls
          onLeave={async () => {
            await endTracking();
            router.push(`/meetups/study-groups`);
          }}
          showMic={roomSettings?.mic === 'flexible'}
          showCamera={roomSettings?.camera === 'flexible'}
          roomSettings={roomSettings}
        />

        <div className="hidden sm:block">
          <CallStatsButton />
        </div>
        <button 
          onClick={() => setShowParticipants((prev) => !prev)}
          aria-label={showParticipants ? "Hide participants list" : "Show participants list"}
          aria-pressed={showParticipants}
          aria-describedby="participants-help"
        >
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-[#4c535b]">
            <Users size={16} className="sm:w-5 text-white" />
          </div>
        </button>
        <div id="participants-help" className="sr-only">
          Click to view or hide the list of participants in this meeting
        </div>
        
        {/* Report Button */}
        <button 
          onClick={() => setShowReportDialog(true)}
          aria-label="Report a participant"
          aria-describedby="report-help"
        >
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-red-600">
            <Flag size={16} className="sm:w-5 text-white" />
          </div>
        </button>
        <div id="report-help" className="sr-only">
          Click to report inappropriate behavior by a participant
        </div>
        
        {/* Ban User Button (only for host) */}
        {isHost && (
          <>
            <button 
              onClick={() => setShowBanDialog(true)}
              aria-label="Ban a participant from the room"
              aria-describedby="ban-help"
            >
              <div className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-red-600">
                <Shield size={16} className="sm:w-5 text-white" />
              </div>
            </button>
            <div id="ban-help" className="sr-only">
              Click to ban a participant from this room (host only)
            </div>
          </>
        )}
       
        {isHost && <EndCallButton />}
      </div>
      {/* Report Dialog */}
      {showReportDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => {
            setShowReportDialog(false);
            setReportReason('');
            setSelectedReportedId('');
            setOtherReportedName('');
            setReportType('INAPPROPRIATE_BEHAVIOR');
          }}
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
                  {call?.state.participants?.map((p: any) => (
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
                onClick={() => {
                  setShowReportDialog(false);
                  setReportReason('');
                  setSelectedReportedId('');
                  setOtherReportedName('');
                  setReportType('INAPPROPRIATE_BEHAVIOR');
                }}
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
      )}

      {/* Ban User Dialog */}
      {showBanDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => {
            setShowBanDialog(false);
            setSelectedBanUserId('');
            setBanReason('');
          }}
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
                  {call?.state.participants?.map((p: any) => (
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
                onClick={() => {
                  setShowBanDialog(false);
                  setSelectedBanUserId('');
                  setBanReason('');
                }}
                aria-label="Cancel ban action"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => {
                  if (!selectedBanUserId) {
                    toast({
                      title: "Error",
                      description: "Please select a user to ban.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  // Store data for confirmation
                  setBanConfirmationData({
                    selectedBanUserId,
                    banReason,
                  });
                  
                  // Show confirmation dialog
                  setShowBanConfirmation(true);
                  setShowBanDialog(false);
                }}
                disabled={!selectedBanUserId}
                aria-label="Ban selected user from room"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Confirmation Dialog */}
      {showBanConfirmation && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => {
            setShowBanConfirmation(false);
            setBanConfirmationData(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ban-confirmation-title"
          aria-describedby="ban-confirmation-description"
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-sm sm:max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="ban-confirmation-title" className="text-xl font-semibold mb-4 text-[#19232d]">Confirm Ban</h2>
            <p id="ban-confirmation-description" className="sr-only">
              Confirm that you want to ban this user from the room
            </p>
            <div className="mb-4">
              <p className="text-[#19232d] mb-2">
                Are you sure you want to ban this user from the room?
              </p>
              <p className="text-sm text-gray-600 mb-4">
                This action cannot be undone. The user will be immediately removed and prevented from rejoining.
              </p>
              {banConfirmationData && (
                <div className="bg-gray-100 p-3 rounded mb-4">
                  <p className="text-sm font-medium text-[#19232d]">User to ban:</p>
                  <p className="text-sm text-gray-700">
                    {(() => {
                      const participant = call?.state.participants?.find((p: any) => p.userId === banConfirmationData.selectedBanUserId);
                      return participant?.name || (participant as any)?.user?.name || banConfirmationData.selectedBanUserId;
                    })()}
                  </p>
                  {banConfirmationData.banReason && (
                    <>
                      <p className="text-sm font-medium text-[#19232d] mt-2">Reason:</p>
                      <p className="text-sm text-gray-700">{banConfirmationData.banReason}</p>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black"
                onClick={() => {
                  setShowBanConfirmation(false);
                  setBanConfirmationData(null);
                }}
                aria-label="Cancel ban confirmation"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => handleBanSubmit()}
                aria-label="Confirm ban action"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
      )}
    </>
  );
};

export default MeetingRoom;
