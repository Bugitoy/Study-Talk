'use client';
import React from 'react';
import { CallParticipantsList, CallingState } from '@stream-io/video-react-sdk';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { StudyTimeProgress } from './StudyTimeProgress';
import { MobileStudyTimeProgress } from './MobileStudyTimeProgress';
import Loader from './Loader';

// Import split components
import MeetingGoalsBar from './meeting-room/MeetingGoalsBar';
import ReportDialog from './meeting-room/ReportDialog';
import BanDialog from './meeting-room/BanDialog';
import BanConfirmationDialog from './meeting-room/BanConfirmationDialog';
import CallLayout from './meeting-room/CallLayout';
import MeetingControls from './meeting-room/MeetingControls';
import { useMeetingRoom } from '@/hooks/useMeetingRoom';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';



const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const groupName = searchParams.get('name') || 'Study Group';
  
  // Use the custom hook for all meeting room logic
  const {
    layout,
    setLayout,
    showParticipants,
    setShowParticipants,
    showReportDialog,
    setShowReportDialog,
    showBanDialog,
    setShowBanDialog,
    showBanConfirmation,
    setShowBanConfirmation,
    banConfirmationData,
    setBanConfirmationData,
    isCheckingAccess,
    completedGoals,
    call,
    callingState,
    currentUserId,
    isHost,
    participants,
    roomSettings,
    dailyHours,
    isTracking,
    handleBanSubmit,
    endTracking,
  } = useMeetingRoom();

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
              <CallLayout layout={layout} />
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
          
          {/* Meeting Controls */}
          <MeetingControls
            showParticipants={showParticipants}
            setShowParticipants={setShowParticipants}
            onLeave={async () => {
              await endTracking();
              // Navigation will be handled by the hook
            }}
            showMic={roomSettings?.mic === 'flexible'}
            showCamera={roomSettings?.camera === 'flexible'}
            roomSettings={roomSettings}
            isHost={isHost || false}
            onReportClick={() => setShowReportDialog(true)}
            onBanClick={() => setShowBanDialog(true)}
          />
          
          {/* Report Dialog */}
          <ReportDialog
            isOpen={showReportDialog}
            onClose={() => setShowReportDialog(false)}
            participants={participants}
            callId={call?.id}
            reporterId={currentUserId}
          />
          
          {/* Ban Dialog */}
          <BanDialog
            isOpen={showBanDialog}
            onClose={() => setShowBanDialog(false)}
            participants={participants}
            callId={call?.id}
            hostId={currentUserId}
            onBanSubmit={handleBanSubmit}
          />
          
          {/* Ban Confirmation Dialog */}
          <BanConfirmationDialog
            isOpen={showBanConfirmation}
            onClose={() => setShowBanConfirmation(false)}
            confirmationData={banConfirmationData}
            participants={participants}
            onConfirm={handleBanSubmit}
          />
        </section>
      )}
    </>
  );
};

export default MeetingRoom;
